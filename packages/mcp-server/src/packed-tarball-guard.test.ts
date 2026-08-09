import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * `scripts/assert-packed-tarball.mjs` is the last thing between `pnpm pack` and
 * the registry — `.github/workflows/release.yml` runs it, and nothing else does.
 * It had never been tested: two hand runs and one real release, so every failure
 * branch it declares was a claim.
 *
 * **Why this file lives in `packages/mcp-server/src` and not next to the script.**
 * `pnpm-workspace.yaml` lists only `packages/*` and the root `test` script is
 * `turbo test:run`, which only sees workspace packages, so a test under
 * `scripts/` would never run — locally or in CI. That is the NIMUI-93 failure
 * class exactly: a green suite measuring the layout instead of the code. This
 * package already reaches `REPO_ROOT` to assert repo-level policy
 * (`supply-chain-policy.test.ts`), and it owns the tree pin the guard checks, so
 * it is the honest home. `scripts/vitest.config.js` — which looked like it ran
 * tests and was invoked by nothing — was deleted with this change so the trap is
 * not left armed.
 *
 * **Fixtures, and how they sit with the real-artifact checks.** The tarballs
 * below are built here, byte by byte, rather than shelled out to `pnpm pack`:
 * the interesting half of the script is a hand-rolled ustar reader, and the
 * records that break it — pax metadata, GNU long-name records, bare directory
 * entries, a name split across `prefix`/`name`, a NUL typeflag — are records a
 * normally-packed tarball simply does not contain. Fixtures are the only way to
 * reach them, and they are hermetic and fast. They do not replace the
 * real-artifact check: what a fixture cannot prove is that the guard's pins
 * still describe what `pnpm pack` actually emits for *this* tree, which is why
 * CLAUDE.md keeps the `npm pack` / `pnpm pack` comparison and why the release
 * job runs the guard against the artifact it is about to upload.
 *
 * The script is a CLI that calls `process.exit`, so it is driven the way
 * release.yml drives it — `node scripts/assert-packed-tarball.mjs <tgz>` — and
 * asserted on exit code, stdout and stderr. Nothing about it is imported, and
 * nothing about it was changed to make it testable.
 */

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '../..');
const GUARD = join(REPO_ROOT, 'scripts', 'assert-packed-tarball.mjs');

// Assembled rather than written whole, mirroring the script's own reasoning: a
// future grep-based guard must not mistake this file's fixtures for a real
// surviving specifier.
const WORKSPACE = 'workspace' + ':';

const BLOCK = 512;

interface TarEntry {
  /** The `name` field (offset 0). Joined to `prefix` by the reader under test. */
  name: string;
  /** The `prefix` field (offset 345). Empty for every entry a small tar writes. */
  prefix?: string;
  body?: string;
  /**
   * The `typeflag` byte (offset 156). `'0'` is a regular file; `'\0'` is also a
   * regular file and is what several real writers emit.
   */
  typeflag?: string;
}

/** A ustar header: real magic, real checksum, so the fixture is a valid tar. */
function tarHeader(entry: TarEntry, size: number): Buffer {
  const header = Buffer.alloc(BLOCK, 0);
  const octal = (value: number, width: number) =>
    `${value.toString(8).padStart(width - 1, '0')}\0`;

  header.write(entry.name, 0, 100, 'utf8');
  header.write(octal(0o644, 8), 100, 8, 'utf8'); // mode
  header.write(octal(0, 8), 108, 8, 'utf8'); // uid
  header.write(octal(0, 8), 116, 8, 'utf8'); // gid
  header.write(octal(size, 12), 124, 12, 'utf8');
  header.write(octal(0, 12), 136, 12, 'utf8'); // mtime
  header.write('        ', 148, 8, 'utf8'); // checksum field is spaces while summing
  header.write(entry.typeflag ?? '0', 156, 1, 'binary');
  header.write('ustar\0', 257, 6, 'utf8');
  header.write('00', 263, 2, 'utf8');
  header.write(entry.prefix ?? '', 345, 155, 'utf8');

  let checksum = 0;
  for (const byte of header) checksum += byte;
  header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'utf8');

  return header;
}

/** gzip a tar built from `entries`, terminated by the two zero blocks. */
function makeTarball(entries: TarEntry[]): Buffer {
  const blocks: Buffer[] = [];
  for (const entry of entries) {
    const body = Buffer.from(entry.body ?? '', 'utf8');
    blocks.push(tarHeader(entry, body.length));
    if (body.length > 0) {
      const padded = Buffer.alloc(Math.ceil(body.length / BLOCK) * BLOCK, 0);
      body.copy(padded);
      blocks.push(padded);
    }
  }
  blocks.push(Buffer.alloc(BLOCK * 2, 0));
  return gzipSync(Buffer.concat(blocks));
}

let fixtureDir: string;
let counter = 0;

/** Write a fixture tarball outside the repo — `*.tgz` here is not gitignored. */
function tarballFile(entries: TarEntry[]): string {
  const path = join(fixtureDir, `fixture-${(counter += 1)}.tgz`);
  writeFileSync(path, makeTarball(entries));
  return path;
}

interface GuardRun {
  status: number | null;
  stdout: string;
  stderr: string;
  /** The `    - ` problem lines, continuation lines folded back in. */
  problems: string[];
}

function runGuard(...tarballs: string[]): GuardRun {
  const result = spawnSync(process.execPath, [GUARD, ...tarballs], { encoding: 'utf-8' });
  const problems: string[] = [];
  for (const line of result.stderr.split(/\r?\n/)) {
    const started = /^ {4}- (.*)$/.exec(line);
    if (started) {
      problems.push(started[1]!);
      continue;
    }
    const continued = /^ {6}(.*)$/.exec(line);
    if (continued && problems.length > 0) {
      problems[problems.length - 1] += `\n${continued[1]!}`;
    }
  }
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, problems };
}

/**
 * One base fixture per publishable package, mutated in exactly one place per
 * failure case. Anything less and a fixture fails for several reasons at once
 * and proves none of them — hence the exact-set assertions on `problems`, in the
 * house style of `EXPECTED_ACTIONS` and `KNOWN_UNPAIRED`.
 */
function manifestWith(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  const manifest: Record<string, unknown> = { ...base, ...overrides };
  // An explicit `undefined` override drops the key, which is how the
  // "publishConfig missing entirely" case differs from "access is wrong".
  for (const [key, value] of Object.entries(manifest)) {
    if (value === undefined) delete manifest[key];
  }
  return manifest;
}

function componentsManifest(overrides: Record<string, unknown> = {}) {
  return manifestWith(
    {
      name: '@nim-ui/components',
      version: '1.2.3',
      publishConfig: { access: 'public' },
      dependencies: { 'class-variance-authority': '^0.7.1' },
      devDependencies: { '@nim-ui/tailwind-config': '0.0.0' },
    },
    overrides
  );
}

function componentsEntries(manifest: unknown = componentsManifest()): TarEntry[] {
  return [
    { name: 'package/package.json', body: JSON.stringify(manifest, null, 2) },
    { name: 'package/README.md', body: '# components\n' },
    { name: 'package/dist/index.js', body: 'export {};\n' },
    { name: 'package/dist/index.d.ts', body: 'export {};\n' },
    { name: 'package/dist/styles.css', body: '.x{color:red}\n' },
    { name: 'package/src/registry/index.json', body: '[]\n' },
  ];
}

function mcpManifest(overrides: Record<string, unknown> = {}) {
  return manifestWith(
    {
      name: '@nim-ui/mcp-server',
      version: '4.5.6',
      publishConfig: { access: 'public' },
      dependencies: { zod: '^3.24.1' },
    },
    overrides
  );
}

const SOURCE_FILE: TarEntry = {
  name: 'package/dist/sources/button.tsx',
  body: 'export const buttonVariants = null;\n',
};

function mcpEntries(sources: TarEntry[] = [SOURCE_FILE]): TarEntry[] {
  return [
    { name: 'package/package.json', body: JSON.stringify(mcpManifest(), null, 2) },
    { name: 'package/dist/index.js', body: '#!/usr/bin/env node\n' },
    ...sources,
  ];
}

beforeAll(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), 'nim-tarball-guard-'));
});

afterAll(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

describe('assert-packed-tarball, driven the way release.yml drives it', () => {
  it('accepts a well-formed @nim-ui/components tarball', () => {
    const run = runGuard(tarballFile(componentsEntries()));

    expect(run.problems).toEqual([]);
    expect(run.stderr).toBe('');
    expect(run.stdout).toMatch(/^assert-packed-tarball: ok\s+@nim-ui\/components@1\.2\.3/m);
    expect(run.status).toBe(0);
  });

  it('accepts a well-formed @nim-ui/mcp-server tarball', () => {
    const run = runGuard(tarballFile(mcpEntries()));

    expect(run.problems).toEqual([]);
    expect(run.stdout).toMatch(/^assert-packed-tarball: ok\s+@nim-ui\/mcp-server@4\.5\.6/m);
    expect(run.status).toBe(0);
  });

  it('reads regular files whose typeflag byte is NUL rather than "0"', () => {
    // `readField` returns '' for a NUL typeflag and the script's `|| '0'` is
    // what turns that back into a regular file. Without it, `'xgLK5'.includes('')`
    // is true and *every* file is skipped, so a perfectly good tarball reports
    // "no package/package.json". Several real writers emit 0x00 here.
    const run = runGuard(
      tarballFile(mcpEntries().map((entry) => ({ ...entry, typeflag: '\0' })))
    );

    expect(run.problems).toEqual([]);
    expect(run.status).toBe(0);
  });

  it('names every surviving workspace specifier', () => {
    const run = runGuard(
      tarballFile(
        componentsEntries(
          componentsManifest({
            devDependencies: {
              '@nim-ui/tailwind-config': `${WORKSPACE}*`,
              '@nim-ui/components': `${WORKSPACE}^1.0.0`,
            },
          })
        )
      )
    );

    expect(run.problems).toEqual([
      'manifest still carries the pnpm workspace protocol:\n' +
        `devDependencies.@nim-ui/tailwind-config = ${WORKSPACE}*\n` +
        `devDependencies.@nim-ui/components = ${WORKSPACE}^1.0.0`,
    ]);
    expect(run.stderr).toContain('assert-packed-tarball: refusing to publish');
    expect(run.status).toBe(1);
  });

  it('refuses a tarball with no manifest, and reports nothing else', () => {
    // The first-assertion pattern: if the tar walk breaks, this must be the one
    // problem reported, never a silent pass through the checks that follow.
    const run = runGuard(
      tarballFile([
        { name: 'package/dist/index.js', body: 'export {};\n' },
        { name: 'package/README.md', body: '# nothing\n' },
      ])
    );

    expect(run.problems).toEqual([
      'no package/package.json among 2 entries — the tarball is not an npm package, or the tar walk is broken',
    ]);
    expect(run.status).toBe(1);
  });

  it('refuses a manifest marked private', () => {
    const run = runGuard(
      tarballFile(componentsEntries(componentsManifest({ private: true })))
    );

    expect(run.problems).toEqual(['manifest is marked private and must never be published']);
    expect(run.status).toBe(1);
  });

  const accessCases: Array<[string, Record<string, unknown>]> = [
    ['publishConfig missing entirely', { publishConfig: undefined }],
    ['publishConfig without access', { publishConfig: {} }],
    ['access set to restricted', { publishConfig: { access: 'restricted' } }],
  ];

  it.each(accessCases)('refuses a manifest with %s', (_label, overrides) => {
    const run = runGuard(tarballFile(componentsEntries(componentsManifest(overrides))));

    expect(run.problems).toEqual([
      'scoped package without publishConfig.access = public — the publish errors rather than merely looking wrong',
    ]);
    expect(run.status).toBe(1);
  });

  it('refuses a package name it holds no required-entry pin for', () => {
    const run = runGuard(
      tarballFile(componentsEntries(componentsManifest({ name: '@nim-ui/charts' })))
    );

    expect(run.problems).toEqual([
      'no required-entry pin for @nim-ui/charts — add one to REQUIRED_ENTRIES rather than publishing unchecked',
    ]);
    expect(run.status).toBe(1);
  });

  it('refuses a tarball missing a required file', () => {
    const run = runGuard(
      tarballFile(componentsEntries().filter((entry) => !entry.name.endsWith('styles.css')))
    );

    expect(run.problems).toEqual(['missing dist/styles.css']);
    expect(run.status).toBe(1);
  });

  it('refuses an mcp-server tarball whose dist/sources tree is empty', () => {
    const run = runGuard(tarballFile(mcpEntries([])));

    expect(run.problems).toEqual([
      "dist/sources/ holds 0 files, expected at least 1 — the build's copy step did not run",
    ]);
    expect(run.status).toBe(1);
  });

  describe('records that describe an entry rather than being one', () => {
    /**
     * Each of these sits under `dist/sources/` and must not count towards the
     * tree pin — a directory record alone is exactly how an empty
     * `dist/sources/` could look like a populated one. They are placed *before*
     * the manifest on purpose: pax and GNU records carry a body, so a wrong
     * body-skip would swallow the manifest and the run would fail with the
     * no-manifest message instead, which is a different assertion failing.
     */
    const decoys: Array<[string, TarEntry]> = [
      ['a directory record', { name: 'package/dist/sources/', typeflag: '5' }],
      [
        'pax extended header metadata',
        {
          name: 'package/dist/sources/PaxHeaders/button.tsx',
          typeflag: 'x',
          body: '30 mtime=1700000000.000000000\n',
        },
      ],
      [
        'pax global header metadata',
        {
          name: 'package/dist/sources/pax_global_header',
          typeflag: 'g',
          body: '30 mtime=1700000000.000000000\n',
        },
      ],
      [
        // Adversarial by design: real GNU tar puts './@LongLink' here. A name
        // that looks like a shipped source is what proves the skip is by
        // typeflag and not by path.
        'a GNU long-name record',
        { name: 'package/dist/sources/button.tsx', typeflag: 'L', body: 'package/dist/sources/button.tsx\0' },
      ],
      [
        'a GNU long-link record',
        { name: 'package/dist/sources/button.tsx', typeflag: 'K', body: 'package/dist/sources/button.tsx\0' },
      ],
    ];

    it.each(decoys)('does not count %s as a shipped source', (_label, decoy) => {
      const run = runGuard(tarballFile([decoy, ...mcpEntries([])]));

      expect(run.problems).toEqual([
        "dist/sources/ holds 0 files, expected at least 1 — the build's copy step did not run",
      ]);
      expect(run.status).toBe(1);
    });

    it('still refuses when every entry under dist/sources is one of them', () => {
      const run = runGuard(tarballFile([...decoys.map(([, decoy]) => decoy), ...mcpEntries([])]));

      // The manifest was still found — the label proves the walk stepped over
      // five bodies correctly rather than losing its place.
      expect(run.stderr).toContain('assert-packed-tarball: FAIL @nim-ui/mcp-server@4.5.6');
      expect(run.problems).toEqual([
        "dist/sources/ holds 0 files, expected at least 1 — the build's copy step did not run",
      ]);
      expect(run.status).toBe(1);
    });

    it('accepts a real source file sitting beside them', () => {
      const run = runGuard(
        tarballFile([...decoys.map(([, decoy]) => decoy), ...mcpEntries([SOURCE_FILE])])
      );

      expect(run.problems).toEqual([]);
      expect(run.status).toBe(0);
    });
  });

  it('joins the prefix and name fields of a deep path', () => {
    // A path long enough to cross the 100-byte `name` field is written split by
    // some tar writers, and `dist/sources/components/...` is where this package
    // gets there. If the join were dropped, `dist/index.js` would read as
    // missing and the sources tree would read as empty — so a clean pass here
    // is the assertion.
    const run = runGuard(
      tarballFile([
        {
          prefix: 'package',
          name: 'package.json',
          body: JSON.stringify(mcpManifest(), null, 2),
        },
        { prefix: 'package/dist', name: 'index.js', body: '#!/usr/bin/env node\n' },
        {
          prefix: 'package/dist/sources/components/data-display',
          name: 'record-inspector.tsx',
          body: 'export const recordInspectorVariants = null;\n',
        },
      ])
    );

    expect(run.problems).toEqual([]);
    expect(run.stdout).toMatch(/^assert-packed-tarball: ok\s+@nim-ui\/mcp-server@4\.5\.6/m);
    expect(run.status).toBe(0);
  });

  it('fails the whole run when one tarball of several is bad', () => {
    // release.yml passes a glob, so a single bad artifact has to sink the batch.
    const good = tarballFile(componentsEntries());
    const bad = tarballFile(mcpEntries([]));
    const run = runGuard(good, bad);

    expect(run.stdout).toMatch(/^assert-packed-tarball: ok\s+@nim-ui\/components@1\.2\.3/m);
    expect(run.stderr).toContain('assert-packed-tarball: FAIL @nim-ui/mcp-server@4.5.6');
    expect(run.stderr).toContain('assert-packed-tarball: refusing to publish');
    expect(run.status).toBe(1);
  });

  it('exits 2 with usage when given no tarball at all', () => {
    const run = runGuard();

    expect(run.stderr.trim()).toBe(
      'usage: node scripts/assert-packed-tarball.mjs <tarball.tgz> [...]'
    );
    expect(run.status).toBe(2);
  });

  it('pins the exact set of files that name the guard', () => {
    // `release.yml` is the guard's only caller, so if it ever stops naming the
    // script the guard is dead and nothing else would say so.
    //
    // This measures *mentions*, not calls — `CLAUDE.md` is in the set because it
    // documents the guard — and that limit is real and unfixed.
    //
    // The cache limit that used to sit here is not. `packages/mcp-server/turbo.json`
    // (NIMUI-98) adds `.github/workflows/**`, `scripts/**` and `CLAUDE.md` to this
    // package's `test:run` inputs, so editing any of them re-runs this suite instead
    // of replaying a green that measured the previous content. Measured: a one-line
    // edit to `release.yml` turns `@nim-ui/mcp-server:test:run` into a cache miss
    // while every other package still replays. What remains is narrower — the `git
    // grep` below scans the whole repo, so a *new* file elsewhere naming the guard
    // changes this result without touching an input. Declaring the repo an input
    // would trade caching away entirely for that one case.
    const callers = execFileSync(
      'git',
      ['grep', '-l', 'assert-packed-tarball', '--', ':!packages/mcp-server/src'],
      { cwd: REPO_ROOT, encoding: 'utf-8' }
    )
      .split(/\r?\n/)
      .filter(Boolean)
      .sort();

    expect(callers).toEqual(['.github/workflows/release.yml', 'CLAUDE.md', 'scripts/assert-packed-tarball.mjs']);
  });
});
