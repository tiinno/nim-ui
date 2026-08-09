/**
 * Fail a release *before* upload if a packed tarball is not publishable.
 *
 * The release workflow packs with pnpm and uploads with npm, because neither
 * tool can do both halves here: pnpm 9.15.4 has no OIDC support, so it cannot
 * do trusted publishing, and npm does not understand pnpm's workspace protocol
 * and ships those specifiers verbatim to the registry. `npm publish <tarball>`
 * reads the manifest out of the tarball rather than off disk — so a tarball
 * that pnpm produced carries a correct manifest through an npm upload. That is
 * the whole basis of the workflow, and this script is what stops it from being
 * a belief. It reads the artifact, never the workspace: a check that resolved
 * anything through `packages/*` would be measuring the layout that hides the
 * bug, which is exactly how NIMUI-93 shipped a broken server to every consumer.
 *
 * Usage: node scripts/assert-packed-tarball.mjs <tarball.tgz> [...]
 *
 * Three failures it catches, all of which have real history behind them:
 *
 *   1. A surviving workspace specifier. Measured on this tree: `npm pack` in
 *      packages/ui leaves `"@nim-ui/tailwind-config": "workspace:*"` in the
 *      manifest, naming a `private: true` package that will never exist on the
 *      registry. It is a devDependency, so no consumer install resolves it —
 *      but the manifest on the registry is wrong and anything reading it is
 *      wrong with it.
 *   2. A tarball with no manifest at all. Asserted first, and separately, so a
 *      bug in the tar walk below cannot fall through into a silent pass — the
 *      first-assertion pattern from packaged-layout.test.ts.
 *   3. An artifact that ships without its data. `npm pack --dry-run` reports
 *      which files ship and never whether the shipped code can find them;
 *      @nim-ui/mcp-server's `dist/sources/` is copied in by a post-tsup step
 *      that a stale or partial build silently skips, and the resulting server
 *      throws on startup for every consumer. So the required entries below are
 *      checked against the real entry list, not against a build log.
 *
 * The tar walk is hand-rolled on node:zlib rather than pulled from a dependency
 * on purpose: this runs in a release job between pack and publish, where an
 * extra package to resolve is one more thing that can be unavailable at the
 * worst moment.
 */
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { basename } from 'node:path';

const BLOCK = 512;

// The specifier that must never reach the registry, assembled rather than
// written whole so this file's own prose cannot be mistaken for the thing it
// is looking for by a future grep-based guard.
const WORKSPACE_SPECIFIER = 'workspace' + ':';

/**
 * Exact-set pins, one per publishable package. An unknown package name is a
 * failure, not a pass: the day a third package is published, this guard must
 * say it does not know what that package owes rather than wave it through.
 */
const REQUIRED_ENTRIES = {
  '@nim-ui/components': {
    files: [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/styles.css',
      'src/registry/index.json',
    ],
    trees: [],
  },
  '@nim-ui/mcp-server': {
    files: ['dist/index.js'],
    // The NIMUI-93 tree. 94 component sources at the time of writing; the pin
    // is "not empty" rather than a count, because adding a component is
    // routine and this guard is about the copy step having run at all.
    trees: [{ prefix: 'dist/sources/', minimum: 1 }],
  },
};

const decoder = new TextDecoder();

/** Read a NUL-padded fixed-width header field as a trimmed string. */
function readField(header, offset, length) {
  const raw = header.subarray(offset, offset + length);
  const terminator = raw.indexOf(0);
  return decoder.decode(terminator === -1 ? raw : raw.subarray(0, terminator)).trim();
}

/** Walk the ustar records of an uncompressed tar buffer. */
function* readEntries(tar) {
  let offset = 0;
  while (offset + BLOCK <= tar.length) {
    const header = tar.subarray(offset, offset + BLOCK);
    // Two zero blocks end the archive; one is enough to stop on.
    if (header.every((byte) => byte === 0)) {
      return;
    }

    const name = readField(header, 0, 100);
    const size = Number.parseInt(readField(header, 124, 12) || '0', 8);
    const typeflag = readField(header, 156, 1) || '0';
    const prefix = readField(header, 345, 155);
    const body = tar.subarray(offset + BLOCK, offset + BLOCK + size);

    offset += BLOCK + Math.ceil(size / BLOCK) * BLOCK;

    // x and g are pax metadata, L and K are GNU long name/link records: each
    // describes the *next* entry rather than being a file that ships. 5 is a
    // directory. Counting any of them as a shipped file would let an empty
    // directory satisfy a non-empty tree pin.
    if ('xgLK5'.includes(typeflag)) {
      continue;
    }

    yield { path: prefix ? `${prefix}/${name}` : name, body };
  }
}

/** Every string value anywhere in the manifest, with the path that reached it. */
function* walkStrings(value, path = []) {
  if (typeof value === 'string') {
    yield { path: path.join('.'), value };
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      yield* walkStrings(child, [...path, key]);
    }
  }
}

async function inspect(tarballPath) {
  const problems = [];
  const gzip = await readFile(tarballPath);
  const entries = new Map();
  for (const entry of readEntries(gunzipSync(gzip))) {
    entries.set(entry.path, entry.body);
  }

  // First assertion, on purpose. If the walk above ever stops finding entries,
  // every check after this one would go green against an empty map.
  const manifestBody = entries.get('package/package.json');
  if (!manifestBody) {
    return {
      name: null,
      version: null,
      entryCount: entries.size,
      problems: [
        `no package/package.json among ${entries.size} entries — the tarball is not an npm package, or the tar walk is broken`,
      ],
    };
  }

  const manifestText = decoder.decode(manifestBody);
  const manifest = JSON.parse(manifestText);

  // The raw-text scan is the real guard: it sees fields this script has never
  // heard of. The parsed walk exists only to name the offenders usefully.
  if (manifestText.includes(WORKSPACE_SPECIFIER)) {
    const offenders = [];
    for (const { path, value } of walkStrings(manifest)) {
      if (value.startsWith(WORKSPACE_SPECIFIER)) {
        offenders.push(`${path} = ${value}`);
      }
    }
    problems.push(
      offenders.length > 0
        ? `manifest still carries the pnpm workspace protocol:\n      ${offenders.join('\n      ')}`
        : `manifest text contains the pnpm workspace protocol somewhere this script could not name`
    );
  }

  if (manifest.private === true) {
    problems.push('manifest is marked private and must never be published');
  }

  if (manifest.publishConfig?.access !== 'public') {
    problems.push(
      'scoped package without publishConfig.access = public — the publish errors rather than merely looking wrong'
    );
  }

  const required = REQUIRED_ENTRIES[manifest.name];
  if (!required) {
    problems.push(
      `no required-entry pin for ${manifest.name} — add one to REQUIRED_ENTRIES rather than publishing unchecked`
    );
  } else {
    for (const file of required.files) {
      if (!entries.has(`package/${file}`)) {
        problems.push(`missing ${file}`);
      }
    }
    for (const { prefix, minimum } of required.trees) {
      const count = [...entries.keys()].filter((path) =>
        path.startsWith(`package/${prefix}`)
      ).length;
      if (count < minimum) {
        problems.push(
          `${prefix} holds ${count} files, expected at least ${minimum} — the build's copy step did not run`
        );
      }
    }
  }

  return { name: manifest.name, version: manifest.version, entryCount: entries.size, problems };
}

const tarballs = process.argv.slice(2);
if (tarballs.length === 0) {
  console.error('usage: node scripts/assert-packed-tarball.mjs <tarball.tgz> [...]');
  process.exit(2);
}

let failed = false;
for (const tarball of tarballs) {
  const { name, version, entryCount, problems } = await inspect(tarball);
  const label = name ? `${name}@${version}` : basename(tarball);
  if (problems.length > 0) {
    failed = true;
    console.error(`assert-packed-tarball: FAIL ${label} (${basename(tarball)})`);
    for (const problem of problems) {
      console.error(`    - ${problem}`);
    }
  } else {
    console.log(`assert-packed-tarball: ok   ${label} — ${entryCount} entries, no ${WORKSPACE_SPECIFIER} refs`);
  }
}

if (failed) {
  console.error('assert-packed-tarball: refusing to publish');
  process.exit(1);
}
