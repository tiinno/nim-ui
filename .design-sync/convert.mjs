import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as cheerio from 'cheerio';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function loadConfig() {
  const raw = await readFile(join(ROOT, '.design-sync/config.json'), 'utf8');
  return JSON.parse(raw);
}

export async function assembleSharedCss(config) {
  const outDir = join(ROOT, config.source.docsExport);
  const sample = join(outDir, 'components/primitives/button/index.html');
  if (!existsSync(sample)) {
    throw new Error(`Docs export missing (${sample}). Run: pnpm --filter docs build`);
  }
  const $ = cheerio.load(await readFile(sample, 'utf8'));
  const hrefs = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.endsWith('.css') && !hrefs.includes(href)) hrefs.push(href);
  });
  if (hrefs.length === 0) throw new Error('No stylesheet links found in docs export');
  let css = '';
  for (const href of hrefs) {
    const cssPath = join(outDir, href.replace(/^\//, ''));
    if (!existsSync(cssPath)) throw new Error(`Missing CSS chunk: ${cssPath}`);
    css += `/* ${href} */\n${await readFile(cssPath, 'utf8')}\n`;
  }
  const dest = join(ROOT, config.output.dir, config.output.sharedCss);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, css, 'utf8');
  return css.length;
}

export function extractCard(html, { group }) {
  const $ = cheerio.load(html);
  const blocks = $('div.not-prose.my-8');
  if (blocks.length === 0) return null;
  blocks.find('details').remove(); // drop the "View Code" disclosure
  const title = ($('h1').first().text() || 'Component').trim();
  let body = '';
  blocks.each((_, el) => { body += `${$.html(el)}\n`; });
  return `<!-- @dsCard group="${group}" -->
<link rel="stylesheet" href="../_shared/nim-ui.css">
<main class="bg-white dark:bg-neutral-950" style="max-width:56rem;margin:0 auto;padding:2rem">
<h1 style="font:600 1.5rem/1.2 system-ui;margin:0 0 1.5rem">${title}</h1>
${body}</main>
`;
}
