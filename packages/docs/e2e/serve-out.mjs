/**
 * A static server for `packages/docs/out`, and nothing else.
 *
 * The a11y suite needs the exported site over HTTP: Next emits absolute
 * `/_next/...` URLs, so `file://` loads the HTML and then fails every asset,
 * which means no hydration and no toggle to click.
 *
 * Written here rather than pulled in as a dependency for two reasons, both of
 * them recorded costs in this repo:
 *
 * - `npx serve` holds a handle on `out/`, and the next `pnpm build` fails with
 *   EBUSY. It also spawns a child, so killing the wrapper leaves the listener
 *   alive (see CLAUDE.md and the dev-gotchas memory).
 * - Playwright's `webServer` kills exactly one PID. One process, one handle,
 *   released when Playwright tears it down.
 *
 * Paths resolve from this file's own location, not from `cwd`, so it does not
 * care where Playwright launches it.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../out');
const port = Number(process.argv[2] ?? process.env.PORT ?? 4319);

if (!existsSync(root)) {
  console.error(`[serve-out] ${root} does not exist — run \`pnpm --filter @nim-ui/docs build\` first.`);
  process.exit(1);
}

/**
 * Content types matter here, they are not decoration: Chromium refuses a module
 * script served as anything but a JavaScript type, and refusing it silently
 * costs hydration — which is the one thing this suite needs.
 */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** The file a request resolves to, or null if it escapes `out/` or is absent. */
function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }

  const candidate = resolve(root, `.${normalize(decoded)}`);
  // Traversal guard. The suite is local and the tree is a build artifact, but a
  // server that serves the whole disk is not a thing to leave lying in a repo.
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;

  const attempts = decoded.endsWith('/')
    ? [join(candidate, 'index.html')]
    : [candidate, join(candidate, 'index.html'), `${candidate}.html`];

  for (const attempt of attempts) {
    if (existsSync(attempt) && statSync(attempt).isFile()) return attempt;
  }
  return null;
}

const server = createServer((request, response) => {
  const file = resolveFile(request.url ?? '/');

  if (file === null) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(`Not found: ${request.url}`);
    return;
  }

  response.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    // The export is immutable per run and the suite reloads pages repeatedly; a
    // stale cache would be indistinguishable from a passing assertion.
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[serve-out] ${root} on http://127.0.0.1:${port}/`);
});
