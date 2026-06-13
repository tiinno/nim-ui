// Mirror Next.js static export (out/) → dist/ so the Cloudflare Pages project
// (output directory: packages/docs/dist, inherited from the previous Astro build)
// keeps working without a dashboard change.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, 'out');
const dist = join(root, 'dist');

if (!existsSync(out)) {
  console.error('[finalize-export] out/ not found — did `next build` run with output: "export"?');
  process.exit(1);
}

rmSync(dist, { recursive: true, force: true });
cpSync(out, dist, { recursive: true });
console.log('[finalize-export] copied out/ → dist/');
