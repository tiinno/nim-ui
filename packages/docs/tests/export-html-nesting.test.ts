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
          violations.push({ parent: ancestor.name, child: tag.name, parentAttrs: ancestor.attrs });
        }
        break;
      }
    }

    if (!tag.leaf) stack.push({ name: tag.name, attrs: tag.attrs });
  }

  return violations;
}

/**
 * Two known violations are produced by code this package does not own. They
 * are matched by structural signature, never by count, so neither a new docs
 * page nor a fix landing upstream turns this suite red for the wrong reason.
 *
 *  1. fumadocs' own search trigger renders `<button data-search-full><div>…`.
 *     It comes from `node_modules/fumadocs-ui` and appears on every page.
 *  2. The Nim RadioGroupIndicator renders its dot as a `<div>` inside Radix's
 *     `<span data-state>` indicator (`packages/ui/src/components/radio.tsx`).
 *     That is a library fix, not a docs fix — tracked separately.
 *
 * Neither signature can be produced by the MDX own-line-child mistake this
 * suite exists to catch: MDX only ever inserts a bare `<p>`.
 */
function isKnownUpstream(v: Violation): boolean {
  if (v.parent === 'button' && v.child === 'div' && /\bdata-search-/.test(v.parentAttrs)) return true;
  if (v.parent === 'span' && v.child === 'div' && /\bdata-state=/.test(v.parentAttrs)) return true;
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

describe('static export — no block-level element inside phrasing content', () => {
  // Anti-vacuity: if the scan ever yields (nearly) nothing, every per-file
  // assertion below passes for free. 109 pages ship today.
  it('scans the whole export', () => {
    expect(pages.length).toBeGreaterThanOrEqual(100);
  });

  it('includes the page the original defect shipped on', () => {
    const names = pages.map((p) => relative(outDir, p).replace(/\\/g, '/'));
    expect(names).toContain('components/primitives/button/index.html');
  });

  it.each(pages.length > 0 ? pages : ['<no static export found>'])('%s', (file) => {
    if (!existsSync(file)) throw new Error(MISSING_EXPORT);
    const violations = findViolations(readFileSync(file, 'utf-8')).filter((v) => !isKnownUpstream(v));

    const summary = violations
      .map((v) => `  <${v.parent}${v.parentAttrs.trim() ? ' …' : ''}> contains <${v.child}>`)
      .join('\n');

    expect(
      violations,
      `${relative(outDir, file).replace(/\\/g, '/')} ships block-level content inside a ` +
        `phrasing-only element:\n${summary}\n\n` +
        'This is almost always an MDX text child written on its own line — markdown ' +
        'wraps it in a <p>. Keep the text on the opening tag\'s line:\n' +
        '  <Button>Click me</Button>   not   <Button>\\n    Click me\\n  </Button>',
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
  ];

  it.each(allowed)('does not flag %s — %s', (html) => {
    expect(findViolations(html)).toEqual([]);
  });

  it('quarantines only the two known upstream signatures', () => {
    expect(findViolations('<div><button data-search-full=""><div>x</div></button></div>').every(isKnownUpstream)).toBe(
      true,
    );
    expect(findViolations('<div><span data-state="checked"><div>x</div></span></div>').every(isKnownUpstream)).toBe(
      true,
    );
    // A plain button/span with a div child is still a failure.
    expect(findViolations('<div><button><div>x</div></button></div>').some(isKnownUpstream)).toBe(false);
    expect(findViolations('<div><span><div>x</div></span></div>').some(isKnownUpstream)).toBe(false);
  });
});
