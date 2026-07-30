import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Guards against a specific class of invalid markup that only exists in the
 * BUILT export: a block-level element nested inside a phrasing-only element.
 *
 * The authoring mistake that produces it is documented in CLAUDE.md — a JSX
 * text child written on its own line inside a `<ComponentPreview>` demo:
 *
 *     <Button>
 *       Click me
 *     </Button>
 *
 * MDX treats an own-line child as a markdown paragraph and wraps it, so the
 * shipped HTML is `<button><p>Click me</p></button>`. `<button>` accepts
 * phrasing content; `<p>` is flow content. The MDX source looks completely
 * ordinary, which is exactly why 39 of these shipped across five pages.
 *
 * This test therefore reads `out/`, not `content/`. Checking the MDX source is
 * what let the defect ship in the first place: the wrapping is introduced by
 * the MDX compiler and is observable nowhere else.
 *
 * Like `packages/ui/src/styles.test.ts` and `motion-reduce.test.ts`, it has a
 * hard dependency on the built artifact and throws in `beforeAll` when it is
 * missing rather than skipping — a skipped test here is the same silent
 * failure mode the test exists to eliminate.
 *
 * ## Why a raw tag scanner instead of cheerio
 *
 * We deliberately do NOT parse into a DOM. Both of cheerio's parsers apply the
 * HTML "implied end tag" rule for `<p>`, so a literal `<p><div>x</div></p>` in
 * the file is silently re-parented to `<p></p><div>x</div><p></p>` and the
 * violation disappears before any assertion can see it — verified against
 * cheerio 1.2.0 with parse5 (default) and with `_useHtmlParser2: true`, which
 * both return the same normalised tree. Since the bug IS the literal serialised
 * markup React emitted, the scanner below walks tags as written. The
 * `<p><div>` positive control at the bottom of this file fails loudly if that
 * property is ever lost.
 *
 * That reasoning applies verbatim to the table content-model rule below. Tables
 * have the *strictest* repair behaviour in the whole parser: a `<div>` as a
 * direct child of `<tbody>` is **foster-parented** — lifted out of the table
 * and inserted immediately before it — so the placeholder renders above the
 * table, and under SSR React's hydration walk finds a node where the server
 * said something else was. A DOM parser hands us the already-repaired tree and
 * the violation is gone before any assertion can see it; the raw scanner sees
 * what React actually serialised.
 */

const outDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '../out');

/** Elements whose content model is phrasing content — a block child is invalid. */
const PHRASING_ONLY = new Set([
  'button',
  'label',
  'span',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'em',
  'strong',
  'small',
  's',
  'cite',
  'q',
  'code',
  'sub',
  'sup',
  'i',
  'b',
  'u',
  'mark',
  'abbr',
  'dfn',
  'time',
  'kbd',
  'var',
  'samp',
  'legend',
  'option',
]);

/**
 * Elements with a *transparent* content model: they inherit the content model
 * of their own parent, so `<div><a><p>…</p></a></div>` is valid HTML while
 * `<p><a><div/></a></p>` is not. Skipping past these (rather than treating
 * them as phrasing-only) is what keeps the 209 legitimate fumadocs
 * previous/next page cards — `<a>` wrapping a `<p>` inside a `<div>` — out of
 * the results. Their real content model is decided by the next ancestor up.
 */
const TRANSPARENT = new Set(['a', 'ins', 'del', 'map', 'object', 'slot', 'video', 'audio', 'canvas']);

/** Flow-content elements that may not appear inside phrasing content. */
const BLOCK = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'dd',
  'details',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
]);

/**
 * The table content model, as an allow-list of *immediate* children.
 *
 * Unlike the phrasing rule above this is not about block vs. inline at all —
 * `<td>` takes flow content, so `<td><div>…</div></td>` (and therefore
 * `<DataTableCell><Skeleton /></DataTableCell>`) is perfectly valid. What is
 * invalid is anything other than a row in a section, or anything other than a
 * cell in a row, and that is the case the parser repairs by foster-parenting.
 *
 * `script` and `template` are the script-supporting elements, permitted
 * everywhere in this model. `script` matters in practice: Next.js injects
 * inline scripts into streamed markup, and the scanner reports raw-text
 * elements as leaves but still *yields their open tag*, so leaving it out of
 * the allow-list would turn every such injection into a false failure.
 *
 * `<table>`'s own children (`caption`, `colgroup`, the sections) are
 * deliberately not modelled: the parser tolerates far more there, nothing in
 * this repo renders into that slot, and an over-tight rule that fires on
 * fumadocs-generated markup would get switched off rather than fixed.
 */
const TABLE_CONTENT_MODEL = new Map<string, Set<string>>([
  ['thead', new Set(['tr', 'script', 'template'])],
  ['tbody', new Set(['tr', 'script', 'template'])],
  ['tfoot', new Set(['tr', 'script', 'template'])],
  ['tr', new Set(['td', 'th', 'script', 'template'])],
]);

const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/** Elements whose children are raw text, not markup — never scan inside them. */
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title']);

interface Tag {
  kind: 'open' | 'close';
  name: string;
  /** Raw attribute text, used only by the quarantine signatures below. */
  attrs: string;
  /** True for void elements and `<x />`, which can never become a parent. */
  leaf: boolean;
}

/**
 * Walk the tags of an HTML document exactly as they are written — no tree
 * construction, no implied end tags, no reparenting. Comments, doctypes and
 * the bodies of raw-text elements are skipped, and `>` inside a quoted
 * attribute value does not end a tag.
 */
function* scanTags(html: string): Generator<Tag> {
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) return;

    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }
    if (html.startsWith('<!', lt) || html.startsWith('<?', lt)) {
      const end = html.indexOf('>', lt);
      i = end === -1 ? html.length : end + 1;
      continue;
    }

    const isClose = html[lt + 1] === '/';
    const nameStart = lt + (isClose ? 2 : 1);
    const nameMatch = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(html.slice(nameStart, nameStart + 64));
    if (!nameMatch) {
      i = lt + 1;
      continue;
    }
    const name = nameMatch[0].toLowerCase();

    let j = nameStart + nameMatch[0].length;
    let quote: string | null = null;
    while (j < html.length) {
      const c = html[j];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === '>') {
        break;
      }
      j++;
    }
    const attrs = html.slice(nameStart + nameMatch[0].length, j);

    if (isClose) {
      yield { kind: 'close', name, attrs: '', leaf: false };
      i = j + 1;
      continue;
    }

    const selfClosing = html[j - 1] === '/';
    const rawText = RAW_TEXT.has(name) && !selfClosing;
    // Raw-text elements are reported as leaves: their body is text, so they
    // can never legitimately parent an element and we jump past it entirely.
    yield { kind: 'open', name, attrs, leaf: selfClosing || VOID.has(name) || rawText };

    if (rawText) {
      const closer = new RegExp(`</${name}\\s*>`, 'i').exec(html.slice(j + 1));
      i = closer ? j + 1 + closer.index + closer[0].length : html.length;
      continue;
    }
    i = j + 1;
  }
}

interface Violation {
  /**
   * Which content model was broken. The two need different failure advice:
   * `phrasing` is almost always the MDX own-line-child mistake, while `table`
   * is a placeholder or wrapper put directly into a section or a row.
   */
  rule: 'phrasing' | 'table';
  parent: string;
  child: string;
  parentAttrs: string;
}

function findViolations(html: string): Violation[] {
  const stack: Array<{ name: string; attrs: string }> = [];
  const violations: Violation[] = [];

  for (const tag of scanTags(html)) {
    if (tag.kind === 'close') {
      const idx = stack.map((e) => e.name).lastIndexOf(tag.name);
      if (idx !== -1) stack.length = idx;
      continue;
    }

    if (BLOCK.has(tag.name)) {
      for (let i = stack.length - 1; i >= 0; i--) {
        const ancestor = stack[i];
        if (TRANSPARENT.has(ancestor.name)) continue;
        if (PHRASING_ONLY.has(ancestor.name)) {
          violations.push({
            rule: 'phrasing',
            parent: ancestor.name,
            child: tag.name,
            parentAttrs: ancestor.attrs,
          });
        }
        break;
      }
    }

    // The table model is about the IMMEDIATE parent only — no ancestor walk and
    // no transparent-element skipping. Both would be wrong here: a `<div>` in a
    // `<td>` in a `<tr>` is valid, so looking past the cell would flag exactly
    // the pattern the kit prescribes.
    const parent = stack[stack.length - 1];
    if (parent) {
      const allowed = TABLE_CONTENT_MODEL.get(parent.name);
      if (allowed && !allowed.has(tag.name)) {
        violations.push({
          rule: 'table',
          parent: parent.name,
          child: tag.name,
          parentAttrs: parent.attrs,
        });
      }
    }

    if (!tag.leaf) stack.push({ name: tag.name, attrs: tag.attrs });
  }

  return violations;
}

/**
 * One known violation is produced by code this package does not own: fumadocs'
 * own search trigger renders `<button data-search-full><div>…`. It comes from
 * `node_modules/fumadocs-ui` and appears on every page. It is matched by
 * structural signature, never by count, so neither a new docs page nor a fix
 * landing upstream turns this suite red for the wrong reason.
 *
 * A second signature used to live here — the Nim RadioGroupIndicator rendering
 * its dot as a `<div>` inside Radix's `<span data-state>` indicator. That was
 * ours, not upstream, and it was fixed in `packages/ui/src/components/radio.tsx`
 * rather than excused; `<span data-state><div>` is a hard failure again.
 *
 * This signature cannot be produced by the MDX own-line-child mistake this
 * suite exists to catch: MDX only ever inserts a bare `<p>`.
 */
function isKnownUpstream(v: Violation): boolean {
  if (v.parent === 'button' && v.child === 'div' && /\bdata-search-/.test(v.parentAttrs)) return true;
  return false;
}

function htmlFilesIn(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...htmlFilesIn(full));
    else if (entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

const MISSING_EXPORT = `packages/docs/out does not exist at ${outDir}.
This suite asserts the BUILT static export, not the MDX source, because the invalid
nesting it looks for is introduced by the MDX compiler and is invisible in source.
Run \`pnpm --filter @nim-ui/docs build\` first — turbo's test:run task already
declares dependsOn: ["build"], so \`pnpm test\` from the repo root does it for you.`;

// Read at collection time so every page becomes its own named test case.
// `it.each` needs the list up front; the beforeAll below is what turns a
// missing export into a loud failure instead of an empty, vacuously green run.
const pages = existsSync(outDir) ? htmlFilesIn(outDir).sort() : [];

beforeAll(() => {
  if (!existsSync(outDir)) throw new Error(MISSING_EXPORT);
});

const pageNames = pages.map((p) => relative(outDir, p).replace(/\\/g, '/'));
const DATA_TABLE_PAGE = 'components/data-display/data-table/index.html';

describe('static export — invalid nesting the parser silently repairs', () => {
  // Anti-vacuity: if the scan ever yields (nearly) nothing, every per-file
  // assertion below passes for free. 109 pages ship today.
  it('scans the whole export', () => {
    expect(pages.length).toBeGreaterThanOrEqual(100);
  });

  it('includes the page the original defect shipped on', () => {
    expect(pageNames).toContain('components/primitives/button/index.html');
  });

  // Anti-vacuity for the table content-model rule specifically: it can only
  // report anything on pages that actually ship table sections. 91 of the 109
  // pages do today (every PropsTable is a real table).
  it('scans pages that actually contain table sections', () => {
    const withSections = pages.filter((p) => /<tbody[\s>]/.test(readFileSync(p, 'utf-8')));
    expect(withSections.length).toBeGreaterThanOrEqual(50);
  });

  // ...and specifically on a table rendered in its LOADING state, which is the
  // surface where a placeholder is most likely to be put straight into a
  // <tbody> or a <tr>. Without a demo that exports one, the rule above scans no
  // instance of the pattern it exists to police and passes for the wrong reason.
  it('includes a table exported in its loading state', () => {
    expect(pageNames).toContain(DATA_TABLE_PAGE);
    const html = readFileSync(join(outDir, DATA_TABLE_PAGE), 'utf-8');
    expect(html).toMatch(/<table[^>]*\baria-busy="true"/);
    // The placeholders must sit in cells. Matched by Skeleton's `aria-hidden`
    // rather than by its class, because Tailwind source-scans this file (see
    // the note above the positive controls).
    expect(html).toMatch(/<td[^>]*>\s*<div[^>]*aria-hidden="true"/);
  });

  it.each(pages.length > 0 ? pages : ['<no static export found>'])('%s', (file) => {
    if (!existsSync(file)) throw new Error(MISSING_EXPORT);
    const violations = findViolations(readFileSync(file, 'utf-8')).filter((v) => !isKnownUpstream(v));

    const summary = violations
      .map((v) => `  [${v.rule}] <${v.parent}${v.parentAttrs.trim() ? ' …' : ''}> contains <${v.child}>`)
      .join('\n');

    // The two rules need different advice, and the wrong advice is worse than
    // none: "keep the text on one line" is an actively misleading diagnosis for
    // a placeholder dropped into a <tbody>.
    const advice: string[] = [];
    if (violations.some((v) => v.rule === 'phrasing')) {
      advice.push(
        'phrasing: almost always an MDX text child written on its own line — markdown ' +
          'wraps it in a <p>. Keep the text on the opening tag\'s line:\n' +
          '  <Button>Click me</Button>   not   <Button>\\n    Click me\\n  </Button>',
      );
    }
    if (violations.some((v) => v.rule === 'table')) {
      advice.push(
        'table: only <tr> may be a direct child of a section, and only <td>/<th> of a row. ' +
          'The parser foster-parents anything else OUT of the table, so it renders above it ' +
          'and breaks hydration. Put the content in a cell:\n' +
          '  <DataTableRow><DataTableCell><Skeleton /></DataTableCell></DataTableRow>',
      );
    }

    expect(
      violations,
      `${relative(outDir, file).replace(/\\/g, '/')} ships markup the HTML parser will ` +
        `silently repair:\n${summary}\n\n${advice.join('\n\n')}`,
    ).toEqual([]);
  });
});

/**
 * Positive controls for the detector itself. Without these the suite could go
 * green because the scanner stopped detecting anything at all.
 *
 * The fixtures below carry no `class` attributes on purpose: Tailwind v4
 * source-scans this file, so a class name written here would compile a real
 * (dead) rule into the docs stylesheet.
 */
describe('the detector actually detects', () => {
  const flagged: Array<[string, string]> = [
    ['<div><button><p>x</p></button></div>', 'the original defect: <p> inside <button>'],
    ['<div><h3><p>x</p></h3></div>', '<p> inside a heading'],
    ['<div><span><p>x</p></span></div>', '<p> inside <span>'],
    ['<div><label><div>x</div></label></div>', '<div> inside <label>'],
    // The reason this file uses a raw tag scanner: every HTML tree builder
    // (parse5 AND htmlparser2) rewrites this to siblings before assertion.
    ['<div><p><div>x</div></p></div>', '<div> inside <p>, which DOM parsers silently reparent'],
    ['<p><a><div>x</div></a></p>', 'transparent <a> inheriting a phrasing context'],
    // The table content model. Every one of these is repaired by the parser
    // (foster-parented out of the table), so it is invisible to any tree-based
    // check and to jsdom, which never runs the parser at all.
    ['<table><tbody><div>x</div></tbody></table>', 'a placeholder <div> directly inside <tbody>'],
    ['<table><thead><div>x</div></thead></table>', '<div> directly inside <thead>'],
    ['<table><tfoot><div>x</div></tfoot></table>', '<div> directly inside <tfoot>'],
    ['<table><tbody><tr><div>x</div></tr></tbody></table>', '<div> directly inside <tr>'],
    ['<table><tbody><tr><span>x</span></tr></tbody></table>', 'even phrasing content is invalid in <tr>'],
    ['<table><tbody><p>x</p></tbody></table>', 'an MDX-wrapped <p> inside <tbody>'],
  ];

  it.each(flagged)('flags %s — %s', (html) => {
    expect(findViolations(html).length).toBeGreaterThan(0);
  });

  const allowed: Array<[string, string]> = [
    ['<div><a><p>x</p></a></div>', '<a> is transparent: in flow context this is valid'],
    ['<div><p>x</p></div>', 'a paragraph in a flow container'],
    ['<div><button><span>x</span></button></div>', 'phrasing inside phrasing'],
    ['<ul><li><div>x</div></li></ul>', '<li> takes flow content'],
    ['<div><button data-x="a>b"><span>x</span></button></div>', 'a quoted attribute containing >'],
    ['<div><script>var a = "<p><div>x</div></p>";</script></div>', 'markup inside a raw-text element'],
    ['<div><!-- <button><p>x</p></button> --></div>', 'markup inside a comment'],
    // The pattern the whole DataTable loading contract rests on: cells take
    // flow content, so a Skeleton inside a cell is valid and hydrates cleanly.
    [
      '<table><tbody><tr><td><div>x</div></td></tr></tbody></table>',
      '<td> takes flow content — a placeholder in a cell is the correct shape',
    ],
    [
      '<table><thead><tr><th><div>x</div></th></tr></thead></table>',
      '<th> takes flow content too',
    ],
    [
      '<table><tbody><template><tr><td>x</td></tr></template></tbody></table>',
      '<template> is a script-supporting element, allowed in a section',
    ],
    [
      '<table><tbody><script>var a = 1;</script><tr><td>x</td></tr></tbody></table>',
      'so is <script> — Next.js injects them into streamed markup',
    ],
  ];

  it.each(allowed)('does not flag %s — %s', (html) => {
    expect(findViolations(html)).toEqual([]);
  });

  it('quarantines only the one known upstream signature', () => {
    // Each case asserts the violation count FIRST. `[].every(...)` is true and
    // `[].some(...)` is false, so a detector that regressed to finding nothing
    // would satisfy every quarantine assertion below for free — the length
    // check is what stops this test passing over a broken scanner.
    const searchTrigger = findViolations('<div><button data-search-full=""><div>x</div></button></div>');
    expect(searchTrigger).toHaveLength(1);
    expect(searchTrigger.every(isKnownUpstream)).toBe(true);

    // Radix's own indicator span is no longer excused: the Nim dot inside it is
    // a <span> now, so a <div> there means the fix was reverted.
    const radixIndicator = findViolations('<div><span data-state="checked"><div>x</div></span></div>');
    expect(radixIndicator).toHaveLength(1);
    expect(radixIndicator.some(isKnownUpstream)).toBe(false);

    // A plain button/span with a div child is still a failure.
    const plainButton = findViolations('<div><button><div>x</div></button></div>');
    expect(plainButton).toHaveLength(1);
    expect(plainButton.some(isKnownUpstream)).toBe(false);

    const plainSpan = findViolations('<div><span><div>x</div></span></div>');
    expect(plainSpan).toHaveLength(1);
    expect(plainSpan.some(isKnownUpstream)).toBe(false);

    // Nothing in the table model is ever excused, and it must not be reported
    // under the phrasing rule — the failure advice branches on `rule`.
    const fosterParented = findViolations('<table><tbody><div>x</div></tbody></table>');
    expect(fosterParented).toHaveLength(1);
    expect(fosterParented[0].rule).toBe('table');
    expect(fosterParented.some(isKnownUpstream)).toBe(false);
  });

  it('labels each rule, so the failure message gives the right advice', () => {
    expect(findViolations('<div><button><p>x</p></button></div>').map((v) => v.rule)).toEqual([
      'phrasing',
    ]);
    expect(findViolations('<table><tbody><tr><span>x</span></tr></tbody></table>').map((v) => v.rule)).toEqual([
      'table',
    ]);
    // A <p> in a <tr> breaks only the table model: <tr> is not phrasing-only,
    // so the phrasing walk correctly stays silent and there is exactly one hit.
    expect(findViolations('<table><tbody><tr><p>x</p></tr></tbody></table>')).toHaveLength(1);
  });
});
