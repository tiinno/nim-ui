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

async function subdirs(path) {
  const ents = await readdir(path, { withFileTypes: true });
  return ents.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function buildExtractedCards(config) {
  const outDir = join(ROOT, config.source.docsExport);
  const buildDir = join(ROOT, config.output.dir);
  const summary = { written: 0, skipped: [] };
  const jobs = [];

  const compRoot = join(outDir, 'components');
  for (const cat of await subdirs(compRoot)) {
    const group = config.groups[cat] || cat;
    for (const slug of await subdirs(join(compRoot, cat))) {
      jobs.push({ src: join(compRoot, cat, slug, 'index.html'), dir: cat, slug, group });
    }
  }
  for (const slug of ['typography', 'spacing', 'dark-mode']) {
    jobs.push({ src: join(outDir, 'design-system', slug, 'index.html'), dir: 'foundations', slug, group: 'Foundations' });
  }
  for (const slug of await subdirs(join(outDir, 'patterns'))) {
    jobs.push({ src: join(outDir, 'patterns', slug, 'index.html'), dir: 'patterns', slug, group: 'Patterns' });
  }

  for (const job of jobs) {
    if (!existsSync(job.src)) { summary.skipped.push(`${job.slug} (missing)`); continue; }
    const card = extractCard(await readFile(job.src, 'utf8'), { group: job.group });
    if (!card) { summary.skipped.push(`${job.slug} (no blocks)`); continue; }
    const dest = join(buildDir, job.dir, `${job.slug}.html`);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, card, 'utf8');
    summary.written++;
  }
  return summary;
}

export async function buildColorsCard(config) {
  const tokens = await readFile(join(ROOT, config.source.tokens), 'utf8');
  const re = /--color-(primary|neutral|success|error|warning|info)-(\d+):\s*(oklch\([^)]*\))/g;
  const scales = {};
  let mm;
  while ((mm = re.exec(tokens))) { (scales[mm[1]] ||= []).push({ shade: mm[2], value: mm[3] }); }
  const order = ['primary', 'neutral', 'success', 'warning', 'error', 'info'];
  let sections = '';
  for (const name of order) {
    const shades = scales[name];
    if (!shades) continue;
    let sw = '';
    for (const s of shades) {
      sw += `<div style="display:flex;flex-direction:column;gap:4px"><div style="height:56px;border-radius:8px;border:1px solid rgba(0,0,0,.08);background:${s.value}"></div><span style="font:500 11px ui-monospace,monospace">${s.shade}</span><span style="font:10px ui-monospace,monospace;color:#6b7280">${s.value}</span></div>`;
    }
    sections += `<section style="margin-bottom:28px"><h2 style="font:600 14px system-ui;margin:0 0 12px;text-transform:capitalize">${name}</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:12px">${sw}</div></section>`;
  }
  const card = `<!-- @dsCard group="Foundations" -->
<main style="max-width:56rem;margin:0 auto;padding:2rem;background:#fff">
<h1 style="font:600 1.5rem/1.2 system-ui;margin:0 0 4px">Colors</h1>
<p style="font:14px system-ui;color:#6b7280;margin:0 0 24px">Ink + Muted Steel — OKLCH scales, mirrored from tokens.css</p>
${sections}</main>
`;
  const dest = join(ROOT, config.output.dir, 'foundations', 'colors.html');
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, card, 'utf8');
  return dest;
}

export async function buildOverviewCard(config) {
  const context = await readFile(join(ROOT, config.source.context), 'utf8');
  const langMatch = context.match(/## Language([\s\S]*?)\n## /);
  const langRaw = langMatch ? langMatch[1] : '';
  const entries = [...langRaw.matchAll(/\*\*(.+?)\*\*:\s*\n([^\n]+)/g)].map((e) => ({ term: e[1], desc: e[2].trim() }));
  let items = '';
  for (const e of entries) {
    items += `<li style="margin-bottom:12px"><strong style="font:600 15px system-ui">${e.term}</strong><br><span style="font:14px system-ui;color:#4b5563">${e.desc}</span></li>`;
  }
  const tokens = await readFile(join(ROOT, config.source.tokens), 'utf8');
  const radius = (tokens.match(/--radius-md:\s*([^;]+)/) || [])[1] || '0.5rem';
  const card = `<!-- @dsCard group="Overview" -->
<main style="max-width:48rem;margin:0 auto;padding:2rem;background:#fff">
<h1 style="font:600 1.75rem/1.2 system-ui;margin:0 0 8px">Nim UI</h1>
<p style="font:15px/1.6 system-ui;color:#374151;margin:0 0 24px">Quiet, accessible React UI kit for dashboards, backoffice, and commerce operations.</p>
<h2 style="font:600 16px system-ui;margin:0 0 12px">Design language</h2>
<ul style="list-style:none;padding:0;margin:0 0 24px">${items}</ul>
<h2 style="font:600 16px system-ui;margin:0 0 8px">Foundations</h2>
<p style="font:13px ui-monospace,monospace;color:#4b5563;margin:0">Component radius: ${radius.trim()} · Elevation: soft layered graphite · 75 components / 8 categories</p>
</main>
`;
  const dest = join(ROOT, config.output.dir, 'overview', 'overview.html');
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, card, 'utf8');
  return dest;
}

export async function main() {
  const config = await loadConfig();
  const cssBytes = await assembleSharedCss(config);
  const extracted = await buildExtractedCards(config);
  await buildColorsCard(config);
  await buildOverviewCard(config);
  console.log(`shared CSS: ${(cssBytes / 1024).toFixed(0)} KiB`);
  console.log(`extracted: ${extracted.written} written, ${extracted.skipped.length} skipped`);
  if (extracted.skipped.length) console.log(`  skipped: ${extracted.skipped.join(', ')}`);
  console.log('generated: colors, overview');
  console.log(`total cards: ${extracted.written + 2}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
