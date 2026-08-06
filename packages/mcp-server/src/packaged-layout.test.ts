import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, rmSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { StdioClient } from './stdio-client.js';

/**
 * The server as a consumer gets it, not as this workspace holds it.
 *
 * NIMUI-93: the published package was dead on arrival. `loadData` read its
 * registry, its tokens and its component sources through paths relative to
 * `__dirname` — `../../ui/src/registry/index.json`,
 * `../../tailwind-config/src/tokens.js`, `../../ui/src/<file>`. From
 * `packages/mcp-server/dist` those land on `packages/ui` and
 * `packages/tailwind-config` and everything works. From
 * `node_modules/@nim-ui/mcp-server/dist` they land on `node_modules/@nim-ui/ui`
 * — a package that exists under no name — and on a `private: true` package that
 * will never be on the registry. The server threw and exited 1, every time, for
 * everyone.
 *
 * **`server.integration.test.ts` could not have caught it, and still cannot.**
 * It spawns `../dist/index.js` from inside the monorepo, which is precisely the
 * layout that makes the bug invisible; it passed throughout. Nor could
 * `npm pack --dry-run`, which reports which files ship and never whether the
 * shipped code can find its data. This file is the missing check.
 *
 * It reconstructs the installed layout from `npm pack --dry-run --json` — the
 * real `files` allowlist, so a file dropped from the package fails here — and
 * copies it to `node_modules/.packaged-smoke/@nim-ui/mcp-server/`. That
 * location is doing the work: from there `../../ui/src` resolves to
 * `.packaged-smoke/@nim-ui/ui/src`, which does not exist, exactly as it does
 * not exist under a consumer's `node_modules`. Sitting inside a `node_modules`
 * tree also lets Node resolve `@modelcontextprotocol/sdk` and `zod` by walking
 * up, so this needs no network and no second install.
 *
 * Copying the allowlist rather than extracting a tarball keeps it hermetic and
 * cross-platform (no `tar`, no registry round-trip). What it therefore does not
 * cover is tarball creation itself — but `files` and path resolution are the
 * two things that broke.
 */

const PACKAGE_ROOT = resolve(__dirname, '..');
// Removed as a whole on teardown — deleting only the package directory would
// leave the `@nim-ui` scaffold behind on every run.
const SMOKE_ROOT = join(PACKAGE_ROOT, 'node_modules', '.packaged-smoke');
const FAKE_INSTALL = join(SMOKE_ROOT, '@nim-ui', 'mcp-server');
const ENTRY = join(FAKE_INSTALL, 'dist', 'index.js');

let client: StdioClient;
let packedFiles: string[] = [];

beforeAll(async () => {
  expect(
    existsSync(join(PACKAGE_ROOT, 'dist', 'index.js')),
    'The built server is missing. `test:run` declares `dependsOn: ["build"]`, so if this fails ' +
      'the pipeline changed and every assertion below would have been skipped.'
  ).toBe(true);

  rmSync(SMOKE_ROOT, { recursive: true, force: true });

  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: PACKAGE_ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: process.platform === 'win32',
    })
  ) as Array<{ files: Array<{ path: string }> }>;

  packedFiles = (packed[0]?.files ?? []).map((file) => file.path);
  expect(packedFiles.length, 'npm pack reported no files at all.').toBeGreaterThan(0);

  for (const file of packedFiles) {
    const destination = join(FAKE_INSTALL, file);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(join(PACKAGE_ROOT, file), destination);
  }

  client = new StdioClient(ENTRY);
  await client.handshake();
}, 60_000);

afterAll(() => {
  client?.kill();
  rmSync(SMOKE_ROOT, { recursive: true, force: true });
});

describe('the packaged server, run from an installed layout', () => {
  it('cannot reach the workspace packages it used to read from', () => {
    // If this ever passes, the harness has stopped reproducing an install and
    // every assertion below would go green against workspace files instead.
    for (const escaped of ['../../ui/src', '../../tailwind-config/src']) {
      expect(
        existsSync(resolve(FAKE_INSTALL, 'dist', escaped)),
        `${escaped} resolves from the fake install. This test is no longer testing anything.`
      ).toBe(false);
    }
  });

  it('starts and completes the handshake, reporting its real version', async () => {
    const fresh = new StdioClient(ENTRY);
    try {
      const response = await fresh.handshake();
      expect(response.result?.serverInfo?.name).toBe('nim-ui-mcp');
      // The constructor used to hardcode 0.0.0 and went stale at the first
      // release; a client sees this string, so it is worth pinning.
      expect(response.result?.serverInfo?.version).toBe(
        (JSON.parse(
          execFileSync('node', ['-p', 'JSON.stringify(require("./package.json"))'], {
            cwd: PACKAGE_ROOT,
            encoding: 'utf-8',
          })
        ) as { version: string }).version
      );
    } finally {
      fresh.kill();
    }
  }, 30_000);

  it('serves component source, which only ships if the copy step ran', async () => {
    const output = await client.call('ui_get_component', { name: 'button' });

    expect(output).toContain('# Button');
    expect(
      output,
      'The source fence is empty. Startup succeeding only proves the registry inlined — this is ' +
        'the assertion that proves `dist/sources/` shipped and is readable from the install.'
    ).toContain('buttonVariants');
  });

  it('ships a source file for every component the registry advertises', async () => {
    const all = await client.call('ui_list_components', {});
    const advertised = [...all.matchAll(/^- \*\*File\*\*: (.+)$/gm)].map((match) => match[1]?.trim());

    expect(advertised.length, 'No component files were advertised at all.').toBeGreaterThan(0);
    const missing = advertised.filter((file) => !packedFiles.includes(join('dist', 'sources', file!).replace(/\\/g, '/')));

    expect(
      missing,
      `The registry advertises ${missing.length} component(s) whose source is not in the package. ` +
        '`ui_get_component` answers ENOENT for each of them.'
    ).toEqual([]);
  });

  it('serves tokens, which are inlined rather than read from a private package', async () => {
    const all = await client.call('ui_get_tokens', { tokenType: 'all' });

    expect(all).toContain('## Colors');
    expect(
      all,
      'The colour values are gone. @nim-ui/tailwind-config is `private: true`, so if these ever ' +
        'stop being inlined at build time there is nothing to read them from once published.'
    ).toMatch(/oklch\(/);
  });
});
