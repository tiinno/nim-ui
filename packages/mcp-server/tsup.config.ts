import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// This file is build tooling, not part of the `src` TypeScript program —
// tsconfig pins `rootDir: "./src"` and `include: ["src/**/*"]` — so, unlike
// `src/index.ts`, it can read `package.json` freely. NIMUI-96: the version
// reported in the MCP handshake was hand-kept in `src/index.ts` and went
// stale through two releases (`0.0.0`, then `0.1.0` during the `v0.1.1`
// release) before `packaged-layout.test.ts` caught it. That test still reads
// `package.json` itself and compares it against the live handshake, so it
// keeps working unchanged — this only has to make the binary agree.
const packageRoot = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf-8')) as {
  version?: unknown;
};

if (typeof pkg.version !== 'string' || pkg.version.length === 0) {
  throw new Error(
    'packages/mcp-server/package.json has no usable "version" — refusing to build a server ' +
      'that cannot report one in the MCP handshake.'
  );
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Textually replaces every reference to this identifier in the bundled
  // output with the literal version string, so `dist/index.js` embeds it at
  // build time and never reads `package.json` (or anything else outside
  // `dist/`) at runtime.
  //
  // A bare identifier rather than `process.env.SOMETHING` on purpose. Both are
  // substituted the same way, but they fail differently when the substitution
  // does not happen — a typo on either side, someone bundling this file with
  // other tooling. An unsubstituted `process.env.X` is a legal runtime read
  // that yields whatever the environment holds, so a stray variable of that
  // name would be reported as the server's version. An unsubstituted bare
  // identifier is a ReferenceError at module load: impossible to spoof from
  // the environment, and impossible to miss.
  define: {
    __NIM_MCP_VERSION__: JSON.stringify(pkg.version),
  },
});
