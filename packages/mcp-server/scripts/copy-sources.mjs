/**
 * Copy the component sources this server serves into the package itself.
 *
 * `ui_get_component` returns a component's real source. Until NIMUI-93 it read
 * that source through `__dirname/../../ui/src/<file>`, which is only
 * `packages/ui/src` because of where this package sits in the workspace.
 * Installed from the registry the same path is
 * `node_modules/@nim-ui/ui/src/...` — a package that exists under no name — so
 * the server died on startup for every consumer. Measured, not inferred: packed
 * the tarball, installed it into a clean project, ran the binary, got ENOENT.
 *
 * The registry and the tokens object are single imports, so tsup inlines those.
 * Sources cannot be: they are 94 arbitrary `.tsx` files, and a 457 kB string
 * blob inside `dist/index.js` would be parsed into the heap on every start to
 * serve one file at a time. They ship as data instead, and this copies them.
 *
 * Taking the file list from the registry rather than globbing `*.tsx` is
 * deliberate — the registry's `file` field is the only thing `renderComponent`
 * will ever ask for, so this copies exactly the reachable set and throws if an
 * entry points at a file that is not there. A glob would silently ship extras
 * and silently omit nothing it should have caught.
 *
 * Runs after `tsup`, never before: tsup is configured `clean: true` and would
 * delete the copied tree.
 */
import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const UI_SRC = resolve(here, '../../ui/src');
const OUT = resolve(here, '../dist/sources');

const registry = JSON.parse(await readFile(join(UI_SRC, 'registry/index.json'), 'utf-8'));

// Two registry entries could name one file; copy each file once.
const files = [...new Set(registry.components.map((component) => component.file))];

for (const file of files) {
  const destination = join(OUT, file);
  await mkdir(dirname(destination), { recursive: true });
  // copyFile rejects with ENOENT when the registry names a file that moved,
  // which is the failure worth stopping the build for — the alternative is a
  // published server that answers "not found" for a component it advertises.
  await copyFile(join(UI_SRC, file), destination);
}

console.log(`copy-sources: ${files.length} component sources -> dist/sources`);
