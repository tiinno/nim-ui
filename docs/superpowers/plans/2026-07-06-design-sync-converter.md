# Design Sync Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build local tooling that packages the Nim UI docs export into ~83 standalone Claude Design "cards" ready for the `DesignSync` upload (which happens later, in an authorized session).

**Architecture:** A single Node ESM module `.design-sync/convert.mjs` with small named-export functions, driven by `.design-sync/config.json`. It reads the already-built docs static export (`packages/docs/out/**`), extracts each `ComponentPreview` block with cheerio, and writes one HTML card per unit under `.design-sync/build/`. Two cards (Colors, Overview) are generated directly from `tokens.css` / `CONTEXT.md` instead of extracted.

**Tech Stack:** Node 22 ESM, cheerio (HTML parsing), pnpm workspace. No test framework — per the spec this is internal one-off tooling; each task verifies by running the function via `node` and asserting on output/filesystem.

## Global Constraints

- Every card's **first line** is exactly `<!-- @dsCard group="<Display Name>" -->` (drives the Design System pane index).
- Extracted cards link the shared stylesheet via **relative** `../_shared/nim-ui.css` (all cards live at uniform depth `build/<dir>/<slug>.html`).
- The **Colors card is generated from `packages/ui/src/tokens.css`**, never extracted from the docs page (that page's palette is being fixed separately and must not be a source here).
- Output dir `.design-sync/build/` is already gitignored (matches `.gitignore` `build`). Only `config.json`, `convert.mjs`, `CONVENTIONS.md` get committed.
- Fail fast with an actionable message if `packages/docs/out` is missing (tell the user to run `pnpm --filter docs build`); skip (warn, don't crash) a page that yields zero preview blocks.
- Group display names come from `config.groups`: primitives→Primitives, layout→Layout, data-display→Data Display, commerce→Commerce, landing→Landing, forms→Forms, feedback→Feedback, navigation→Navigation. Foundations→"Foundations", patterns→"Patterns", overview→"Overview".
- No AI attribution / Co-Authored-By lines in commits (repo convention: conventional-commit subject, bullet body).

---

## File Structure

- Create `.design-sync/config.json` — pinned paths + group map (project id/name null until authorized session).
- Create `.design-sync/convert.mjs` — the converter (named exports + main guard).
- Create `.design-sync/CONVENTIONS.md` — conventions header, how-to-run, close-out/upload notes.
- Generated (gitignored) `.design-sync/build/_shared/nim-ui.css`, `build/<dir>/<slug>.html`.
- Modify root `package.json` — add `cheerio` devDependency.

---

### Task 1: Scaffold config + cheerio dependency

**Files:**
- Create: `.design-sync/config.json`
- Modify: `package.json` (root devDependencies)

- [ ] **Step 1: Write `.design-sync/config.json`**

```json
{
  "name": "@nim-ui/design-sync",
  "version": "0.0.0",
  "project": { "id": null, "name": null },
  "source": {
    "docsExport": "packages/docs/out",
    "tokens": "packages/ui/src/tokens.css",
    "context": "CONTEXT.md"
  },
  "output": { "dir": ".design-sync/build", "sharedCss": "_shared/nim-ui.css" },
  "groups": {
    "primitives": "Primitives", "layout": "Layout", "data-display": "Data Display",
    "commerce": "Commerce", "landing": "Landing", "forms": "Forms",
    "feedback": "Feedback", "navigation": "Navigation"
  }
}
```

- [ ] **Step 2: Add cheerio devDependency**

Run: `pnpm add -D -w cheerio`
Expected: `package.json` root devDependencies now lists `cheerio`; `pnpm-lock.yaml` updated; exit 0.

- [ ] **Step 3: Verify cheerio loads**

Run: `node -e "import('cheerio').then(c => console.log(typeof c.load))"`
Expected: prints `function`

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml .design-sync/config.json
git commit -m "chore(design-sync): scaffold config and add cheerio"
```

---

### Task 2: Config loader + shared CSS assembler

**Files:**
- Create: `.design-sync/convert.mjs`

**Interfaces:**
- Produces: `loadConfig(): Promise<Config>`, `assembleSharedCss(config): Promise<number>` (returns byte length of the written shared CSS), and module constant `ROOT` (repo root absolute path).

- [ ] **Step 1: Create `.design-sync/convert.mjs` with imports, ROOT, loadConfig, assembleSharedCss**

```js
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
```

- [ ] **Step 2: Run the assembler and verify output**

Run: `node -e "import('./.design-sync/convert.mjs').then(async m => { const c = await m.loadConfig(); console.log('bytes', await m.assembleSharedCss(c)); })"`
Expected: prints `bytes` followed by a number > 150000 (the two Tailwind chunks concatenated).

- [ ] **Step 3: Verify the shared file exists and is non-trivial**

Run: `node -e "const {statSync}=require('fs'); console.log(statSync('.design-sync/build/_shared/nim-ui.css').size)"`
Expected: a number > 150000.

- [ ] **Step 4: Commit**

```bash
git add .design-sync/convert.mjs
git commit -m "feat(design-sync): add config loader and shared CSS assembler"
```

---

### Task 3: Preview extractor

**Files:**
- Modify: `.design-sync/convert.mjs`

**Interfaces:**
- Consumes: cheerio.
- Produces: `extractCard(html: string, { group: string }): string | null`. Returns a full card HTML string whose first line is the `@dsCard` marker, or `null` when the page has zero `div.not-prose.my-8` blocks. Title is the page's first `<h1>` text.

- [ ] **Step 1: Add `extractCard` to `.design-sync/convert.mjs`**

```js
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
```

- [ ] **Step 2: Verify extraction on the button page**

Run:
```bash
node -e "import('./.design-sync/convert.mjs').then(async m => { const {readFile}=await import('node:fs/promises'); const html=await readFile('packages/docs/out/components/primitives/button/index.html','utf8'); const card=m.extractCard(html,{group:'Primitives'}); console.log(card.split(String.fromCharCode(10))[0]); console.log('has-details:', card.includes('View Code')); console.log('len:', card.length); })"
```
Expected: first line is exactly `<!-- @dsCard group="Primitives" -->`; `has-details: false`; `len:` a number > 2000.

- [ ] **Step 3: Verify null on a page with no preview blocks**

Run:
```bash
node -e "import('./.design-sync/convert.mjs').then(m => console.log(m.extractCard('<html><body><p>no blocks</p></body></html>', {group:'X'})))"
```
Expected: prints `null`.

- [ ] **Step 4: Commit**

```bash
git add .design-sync/convert.mjs
git commit -m "feat(design-sync): add ComponentPreview extractor"
```

---

### Task 4: Extracted-card writer (components + foundations + patterns)

**Files:**
- Modify: `.design-sync/convert.mjs`

**Interfaces:**
- Consumes: `extractCard`, config.
- Produces: `buildExtractedCards(config): Promise<{ written: number, skipped: string[] }>`. Writes cards to `build/<dir>/<slug>.html` where dir is the category (components), `foundations`, or `patterns`.

- [ ] **Step 1: Add `buildExtractedCards` to `.design-sync/convert.mjs`**

```js
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
```

- [ ] **Step 2: Run and verify counts**

Run: `node -e "import('./.design-sync/convert.mjs').then(async m => { const c=await m.loadConfig(); console.log(await m.buildExtractedCards(c)); })"`
Expected: `{ written: 81, skipped: [...] }` — 75 components + 3 foundations (typography, spacing, dark-mode) + 3 patterns = 81. `skipped` should be empty; if a component slug is listed there, that doc page genuinely has no `ComponentPreview` block and warrants a look.

- [ ] **Step 3: Verify a component card first line + a pattern card exist**

Run:
```bash
node -e "const {readFileSync,existsSync}=require('fs'); console.log(readFileSync('.design-sync/build/data-display/data-table.html','utf8').split(String.fromCharCode(10))[0]); console.log('pattern:', existsSync('.design-sync/build/patterns/backoffice-dashboard.html'))"
```
Expected: `<!-- @dsCard group="Data Display" -->` and `pattern: true`.

- [ ] **Step 4: Commit**

```bash
git add .design-sync/convert.mjs
git commit -m "feat(design-sync): write component/foundation/pattern cards"
```

---

### Task 5: Colors card generated from tokens.css

**Files:**
- Modify: `.design-sync/convert.mjs`

**Interfaces:**
- Consumes: config (`source.tokens`).
- Produces: `buildColorsCard(config): Promise<string>` (returns the written path). Card is self-contained (inline-styled swatches, no shared-CSS dependency) so it can never render a stale palette.

- [ ] **Step 1: Add `buildColorsCard` to `.design-sync/convert.mjs`**

```js
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
```

- [ ] **Step 2: Run and verify the muted-steel primary is present**

Run:
```bash
node -e "import('./.design-sync/convert.mjs').then(async m => { const c=await m.loadConfig(); await m.buildColorsCard(c); const {readFileSync}=require('fs'); const h=readFileSync('.design-sync/build/foundations/colors.html','utf8'); console.log('first:', h.split(String.fromCharCode(10))[0]); console.log('steel-500:', h.includes('oklch(0.534 0.030 248.2)')); console.log('no-sky:', !h.includes('#0ea5e9')); })"
```
Expected: `first: <!-- @dsCard group="Foundations" -->`, `steel-500: true`, `no-sky: true`.

- [ ] **Step 3: Commit**

```bash
git add .design-sync/convert.mjs
git commit -m "feat(design-sync): generate Colors card from tokens.css"
```

---

### Task 6: Overview card from CONTEXT.md + tokens

**Files:**
- Modify: `.design-sync/convert.mjs`

**Interfaces:**
- Consumes: config (`source.context`, `source.tokens`).
- Produces: `buildOverviewCard(config): Promise<string>` (returns written path). Self-contained, group "Overview".

- [ ] **Step 1: Add `buildOverviewCard` to `.design-sync/convert.mjs`**

```js
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
```

- [ ] **Step 2: Run and verify design-language terms are present**

Run:
```bash
node -e "import('./.design-sync/convert.mjs').then(async m => { const c=await m.loadConfig(); await m.buildOverviewCard(c); const {readFileSync}=require('fs'); const h=readFileSync('.design-sync/build/overview/overview.html','utf8'); console.log('first:', h.split(String.fromCharCode(10))[0]); console.log('has-lang:', h.includes('Premium Operations Minimal') && h.includes('Ink + Muted Steel')); })"
```
Expected: `first: <!-- @dsCard group="Overview" -->`, `has-lang: true`.

- [ ] **Step 3: Commit**

```bash
git add .design-sync/convert.mjs
git commit -m "feat(design-sync): generate Overview card from CONTEXT.md"
```

---

### Task 7: main() orchestration, full run, verify, docs

**Files:**
- Modify: `.design-sync/convert.mjs`
- Create: `.design-sync/CONVENTIONS.md`

**Interfaces:**
- Consumes: all prior functions.
- Produces: `main(): Promise<void>` and a CLI main-guard so `node .design-sync/convert.mjs` runs the full pipeline.

- [ ] **Step 1: Append `main` + CLI guard to `.design-sync/convert.mjs`**

```js
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
```

- [ ] **Step 2: Run the full pipeline**

Run: `node .design-sync/convert.mjs`
Expected: prints `shared CSS: ~180 KiB`, `extracted: 81 written, N skipped`, `generated: colors, overview`, `total cards: 83`.

- [ ] **Step 3: Verify total card count on disk and every card's @dsCard first line**

Run:
```bash
find .design-sync/build -name '*.html' | wc -l
for f in $(find .design-sync/build -name '*.html'); do head -1 "$f" | grep -q '^<!-- @dsCard group="' || echo "BAD FIRST LINE: $f"; done
echo "done"
```
Expected: count is `83` (81 extracted + colors + overview); no `BAD FIRST LINE` output before `done`.

- [ ] **Step 4: Browser spot-check three cards**

Start a static server for the build dir and open a component card, the generated Colors card, and a pattern card. Use the preview tooling (`preview_start` a static server rooted at `.design-sync/build`, then `preview_screenshot`). Confirm: component renders styled (not unstyled HTML), Colors shows muted steel not bright blue, pattern renders composed layout.
Expected: three screenshots showing correctly-styled cards.

- [ ] **Step 5: Write `.design-sync/CONVENTIONS.md`**

```markdown
# Design Sync — conventions & runbook

Local prep that packages the docs export into Claude Design cards. Upload is a
separate, auth-gated step (see below).

## Card conventions
- One card per unit at `build/<dir>/<slug>.html`; first line is
  `<!-- @dsCard group="<Display Name>" -->` (drives the Design System pane).
- Groups: Overview, Foundations, Primitives, Layout, Data Display, Commerce,
  Landing, Forms, Feedback, Navigation, Patterns.
- Extracted cards link `../_shared/nim-ui.css`; Colors and Overview are
  self-contained (inline styles) and generated from source, not extracted.

## Regenerate
1. `pnpm --filter docs build`   # refresh packages/docs/out
2. `node .design-sync/convert.mjs`   # rebuild .design-sync/build

## Upload (authorized session only)
`DesignSync` needs Claude Design authorization (interactive login), so it cannot
run in a non-interactive session. In an authorized session:
1. `list_projects` → pick the target design-system project, or `create_project`.
   Pin its id/name into `config.json` `project`.
2. `finalize_plan` with `localDir` = `.design-sync/build`, writes = `**/*.html`,
   `**/_shared/*.css`.
3. `write_files` (localPath uploads, ≤256 per call — split across calls).
   Cards are indexed from their `@dsCard` first line; no manual register needed.

## Close-out
- `build/` is gitignored (regenerable). Commit only config.json, convert.mjs,
  this file.
- Colors is generated from tokens.css on purpose; the docs colors page is a
  separate concern.
```

- [ ] **Step 6: Verify build dir is gitignored (not staged)**

Run: `git status --short .design-sync`
Expected: shows `.design-sync/CONVENTIONS.md` (and any tracked source), but **no** `.design-sync/build/...` entries.

- [ ] **Step 7: Commit**

```bash
git add .design-sync/convert.mjs .design-sync/CONVENTIONS.md
git commit -m "feat(design-sync): add pipeline entrypoint and runbook"
```

---

## Notes for the executor
- If `node .design-sync/convert.mjs` errors with "Docs export missing", run `pnpm --filter docs build` first (Task 7 Step 2 depends on the export existing — it does today).
- The `total cards: 83` figure = 81 extracted (75 components + 3 foundations [typography, spacing, dark-mode] + 3 patterns) + Colors + Overview. This matches the spec's inventory table exactly.
