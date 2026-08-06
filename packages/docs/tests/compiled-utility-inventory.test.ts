import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, relative, resolve } from 'path';
import { extractStringLiterals } from '../../ui/src/test/class-scan';

/**
 * The docs-site counterpart of `packages/ui/src/compiled-utility-inventory.test.ts`:
 * a rule compiled into the site's stylesheet that no class string on the site
 * ever asks for.
 *
 * ## Why this package needed its own (NIMUI-56)
 *
 * `packages/ui` has had this guard since NIMUI-44. This package did not, and the
 * gap is not academic — it was demonstrated by the commit that fixed the other
 * half of this ticket. A draft of `guides/accessibility.mdx` wrote a bare
 * utility name in a prose sentence, and the shipped bundle grew from 184805 to
 * 184842: exactly the 37 bytes of the rule that name compiles, applied to
 * nothing. Nothing failed. It surfaced only because that work happened to be
 * diffing the bundle by hand, and the file being edited was the one *explaining*
 * that Tailwind v4 reads prose. `packages/ui` would have failed the build on the
 * identical mistake.
 *
 * The docs bundle is compiled separately from `app/global.css`, so it inherits
 * neither the ui package's scan scoping nor its guards. Everything either
 * package learned about this failure mode has had to be learned twice.
 *
 * ## What is scanned, and therefore what can leak
 *
 * `app/global.css` does NOT use `source(none)`, so Tailwind's automatic
 * detection walks this whole package — MDX content included, prose included —
 * plus two explicit sources: `fumadocs-ui/dist/**\/*.js` and the Nim component
 * sources. Two `@source not` lines carve directories back out: `../tests`,
 * which is why this file can hold utility names at all, and `../e2e`, the
 * Playwright accessibility suite (NIMUI-68), which selects on class names.
 * Both exclusions are asserted below, because if either were dropped the file
 * behind it would start minting the very rules this guard reports on — and
 * would simultaneously start counting as a user, which hides the evidence.
 *
 * ## What counts as a user
 *
 * Four groups, one per thing Tailwind actually reads:
 *
 * - **Docs sources** (`app`, `components`, `lib`, `scripts`, the config files) —
 *   string literals, via the same scanner the ui guards use
 *   (`packages/ui/src/test/class-scan.ts`, imported rather than copied so the
 *   two cannot drift).
 * - **Nim component sources** — same scanner. These are `@source`d by
 *   `global.css` because Radix portals render outside the React tree.
 * - **fumadocs-ui dist** — same scanner, over minified JS. It yields ~1700
 *   tokens across 117 files; two files legitimately contain no literals at all,
 *   so unlike the ui guard this one cannot assert "every file yields
 *   something". It asserts a per-group token floor instead.
 * - **MDX** — the value of every `class`/`className` attribute, including the
 *   braced form. An MDX page has no string literals in the TS sense; the
 *   attribute is the equivalent, and restricting users to it is the entire
 *   reason a utility named in prose or in markdown inline code shows up here.
 *
 * ### The weakenings, stated
 *
 * - A `className` inside a ```` ```tsx ```` fence counts as a user even though a
 *   fence renders as text and applies nothing. Removing that allowance would
 *   report every documented example, on every component page, forever.
 * - `<LivePlayground code={`…`}>` IS evaluated in the browser, so its classes
 *   are live. They are caught only when they sit in a `className` attribute —
 *   which is every case today. A future playground that builds classes through
 *   a `cva()` map would be reported here as an arrival; pin it, or move the
 *   class into a `className`.
 * - Prose inside a quoted string vouches for a utility, and a JS string that is
 *   not a class at all vouches just as well. Two English-word rules are dead
 *   and this guard cannot say so, because a dependency inside fumadocs passes
 *   their names as an event name and a `visibility` value — see the note at the
 *   top of the pin. Same trade the ui guard makes for test literals, and the
 *   reason the pin is a record of what is *known* dead, not a complete one.
 *
 * ## What the pin looks like and why it is stable
 *
 * 42 entries out of 1545 compiled utilities, and the shape of them is the
 * argument for pinning rather than rewording: **the 91 component pages
 * contributed no novel utility at all.** Every hit from them is an ordinary
 * English word that Tailwind also knows, and once such a word is pinned the
 * next page to use it costs nothing.
 *
 * The rest: **32 from two guide pages that exist to print class names** — 17
 * from the spacing scale reference and 15 from the consumer-override examples —
 * **2 from a configuration and an installation page**, and **2 from the Nim
 * component sources this site scans**, one a JSDoc `@example` height and one a
 * negated prop that reads as the legacy important prefix. With the 6 English
 * words above, 42.
 *
 * That first figure read 35 until this commit, and the drift is worth naming
 * because it is the shape this file warns about everywhere else: the number was
 * right when written, then two tickets removed pins without touching the
 * sentence that counted them — NIMUI-61 turned two spacing entries into real
 * users, NIMUI-82 deleted the prose that minted a third — and the two
 * configuration entries were never added to it at all. The assertions stayed
 * honest throughout; only the prose describing them went stale. A count in a
 * comment has no guard, which is the argument for stating buckets that a reader
 * can re-derive rather than a total they must trust.
 *
 * None of the 32 should be reworded. An off-palette brand button is the entire
 * point of the example it appears in, and a spacing table that does not name
 * the spacing utilities documents nothing.
 *
 * So the flow, not the stock, is what makes this affordable: new component
 * pages add nothing, and new guide pages are rare.
 *
 * ## Why the entries are encoded anyway
 *
 * `@source not '../tests'` already keeps this file out of the scan — verified
 * against tailwindcss 4.3.1 with a probe class in the sibling suite, which did
 * not reach the bundle. The `~` marker is the second lock, exactly as in the ui
 * guard: it is what would catch that exclusion being dropped, and it costs one
 * character per entry. The marker has to leave BOTH fragments meaningless to
 * Tailwind, which is asserted rather than eyeballed.
 */

const docsRoot = resolve(__dirname, '..');
const uiComponentsDir = resolve(docsRoot, '../ui/src/components');
const chunkDir = resolve(docsRoot, 'out/_next/static/chunks');
const globalCssPath = resolve(docsRoot, 'app/global.css');

/** Inserted mid-name, so a pin entry cannot be a Tailwind candidate. */
const SENTINEL = '~';

/**
 * Every utility compiled into the docs stylesheet that no class string on the
 * site asks for, encoded.
 *
 * Two ways to answer a new arrival:
 *
 * 1. Reword the prose so the token stops looking like a utility. Preferred —
 *    the bundle gets smaller. Naming a CSS property rather than the utility
 *    that sets it is usually enough.
 * 2. Add it here, deliberately, in the same commit, with a note saying why the
 *    wording has to stay. The diff is the point.
 */
const KNOWN_UNUSED = [
  // --- Ordinary English words that Tailwind also knows as utilities ---------
  // Every one of these is a word the documentation has to be able to use: pages
  // describe a decorative ring, a card's shadow, a width transition, columns
  // that collapse, a sticky container, and — in a statically exported site —
  // the word "static". Rewording any of them would cost more in clarity than
  // the rule costs in bytes.
  //
  // Two more English-word rules ship for the same reason and are NOT here,
  // because a user vouches for them and the departure guard would reject the
  // entry: an image-zoom dependency inside fumadocs passes both as ordinary JS
  // strings — an event name and a `visibility` value. Neither is a class, so
  // both rules are dead in exactly the way this pin exists to record, and this
  // guard cannot say so. That is the over-vouching weakening in the docblock,
  // with names on it.
  'c~ollapse',
  'c~ontainer',
  'r~ing',
  's~hadow',
  's~tatic',
  't~ransition',
  // Cross-package: `textarea.tsx` negates a boolean prop of the same name, and
  // Tailwind reads the negation as the legacy important prefix. `global.css`
  // `@source`s the component sources, so this package compiles it too. Already
  // pinned, for the same reason, in the ui guard. Marked mid-word there and
  // here: the obvious placement would leave a live utility after the marker.
  '!re~size',

  // --- design-system/spacing.mdx: the spacing scale reference ---------------
  // A table and a plain-text scale mapping every spacing token to the utilities
  // that apply it. The padding and gap steps the kit itself uses are real users
  // and do not appear here; what is left is the margin column, the two largest
  // padding/gap steps, and one responsive example. A spacing reference that
  // does not name the utilities is not a reference.
  'm~-0.5',
  'm~-1',
  'm~-1.5',
  'm~-2',
  'm~-3',
  'm~-4',
  'm~-5',
  'm~-6',
  'm~-8',
  'm~-10',
  'm~-12',
  'm~-16',
  'p~-10',
  // `p-12` and `p-16` left this list in NIMUI-61: the spacing page's preview
  // used to show a block of `--spacing-*` declarations that do not exist, and
  // replacing it with the Tailwind classes it actually documents turned both
  // into real users. Exactly the departure this guard exists to force.
  'g~ap-12',
  'g~ap-16',
  'm~d:p-8',
  'l~g:p-12',

  // --- guides/customization.mdx ---------------------------------------------
  // Consumer-override examples in `tsx` fences. They are deliberately OFF the
  // Ink + Muted Steel palette: the page is showing a consumer how to escape the
  // kit's vocabulary, and a brand button rendered in the kit's own neutrals
  // would demonstrate nothing. `hover:bg-neutral-300` is on-palette but pairs
  // with a `bg-neutral-200` fill the kit never ships.
  //
  // `f~rom-blue-500` used to be pinned here too (NIMUI-82). Its sole textual
  // source was a `bg-gradient-to-br` gradient (two colour-stop utilities, one
  // this one) `@apply`d in getting-started/configuration.mdx's "Custom
  // Component Styles" section, onto an invented `.custom-card` hook nothing in
  // the kit renders. That section is gone, so if a fresh build still compiles
  // `f~rom-blue-500` the vacuity guard below will report it as a departure —
  // one line to delete, not a redesign.
  // The gradient's other stop, `t~o-purple-600`, was never pinned and was not
  // seen in a build at the time of this edit either, but that check was
  // against a `packages/docs/out` that may already have been stale (not
  // rebuilt for this change) — so treat it as unverified rather than
  // confirmed dead, and expect the same guard to report it too if it turns out
  // to have been live.
  'b~g-gray-900',
  'b~g-green-500',
  'b~g-indigo-600',
  'b~g-red-500',
  'b~g-sky-500',
  's~hadow-primary-500/25',
  's~hadow-red-500',
  'h~over:bg-gray-800',
  'h~over:bg-indigo-700',
  'h~over:bg-neutral-300',
  'h~over:bg-sky-600',
  'h~over:shadow-primary-500/40',
  'd~ark:bg-white',
  'd~ark:text-gray-900',
  'd~ark:hover:bg-gray-100',

  // --- getting-started/configuration.mdx + installation.mdx (NIMUI-62) -----
  // The two utilities the v4 setup warning names. Under the v3 `@tailwind`
  // directives these are exactly what stops being generated while `p-4` and
  // `text-primary-600` keep working, which is what makes that failure silent —
  // so the warning has to name them to be checkable, and the spacing page uses
  // `p-18` again to show that a multiple needs no declaration. Rewording to "a
  // large padding step" would save two rules and cost the reader the fact.
  'p~-18',
  'r~ounded-4xl',

  // --- Cross-package, from a JSDoc @example --------------------------------
  // `resizable.tsx`'s first `@example` gives its demo a height. `global.css`
  // `@source`s the component sources, so this site compiles it; the ui
  // package's own guard does not report it because a test literal there
  // vouches for it, which is the weakening that guard documents.
  //
  // This is the one entry whose justification depends on scanner behaviour
  // rather than on the sources: NIMUI-60 changes what `extractStringLiterals`
  // reads, so re-check this entry when that lands.
  'h~-96',
];

/** Strip the sentinel to recover the real class name. */
function decode(entry: string): string {
  return entry.replace(SENTINEL, '');
}

// ---------------------------------------------------------------------------
// The compiled inventory
// ---------------------------------------------------------------------------

/** Body of the balanced `{ … }` that opens at or after `from`. */
function balancedBody(css: string, from: number): { start: number; end: number } | null {
  const braceStart = css.indexOf('{', from);
  if (braceStart === -1) return null;
  let depth = 0;
  for (let i = braceStart; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return { start: braceStart + 1, end: i };
    }
  }
  return null;
}

/**
 * Preludes of the top-level rules of a section body, recursing through at-rules
 * only — same shape as the ui guard, and for the same reason: a nested
 * `&:hover` is that utility's own business, not a separate entry.
 */
function topLevelPreludes(body: string): string[] {
  const preludes: string[] = [];
  let i = 0;
  let preludeStart = 0;

  while (i < body.length) {
    const c = body[i];

    // A backslash consumes what follows it before the quote check. Tailwind
    // escapes a quote INSIDE a selector — `after:content-['']` compiles to one
    // — and reading that as a string opener resynchronises the walk at some
    // arbitrary later quote, skipping every rule in between. That cost the ui
    // guard 163 of its 944 rules, silently, until NIMUI-59.
    if (c === '\\') {
      i += 2;
      continue;
    }

    if (c === '"' || c === "'") {
      for (let j = i + 1; j < body.length; j++) {
        if (body[j] === '\\') j++;
        else if (body[j] === c) {
          i = j;
          break;
        }
      }
      i++;
      continue;
    }

    if (c === '{') {
      const prelude = body.slice(preludeStart, i).replace(/\s+/g, ' ').trim();
      const inner = balancedBody(body, preludeStart);
      if (inner === null) break;
      if (prelude.startsWith('@')) {
        preludes.push(...topLevelPreludes(body.slice(inner.start, inner.end)));
      } else {
        preludes.push(prelude);
      }
      i = inner.end + 1;
      preludeStart = i;
      continue;
    }

    if (c === '}' || c === ';') preludeStart = i + 1;
    i++;
  }

  return preludes;
}

/** Split a prelude on its top-level (unescaped) commas. */
function splitSelectorList(prelude: string): string[] {
  const parts: string[] = [];
  let current = '';
  for (let i = 0; i < prelude.length; i++) {
    const c = prelude[i];
    if (c === '\\') {
      current += c + (prelude[i + 1] ?? '');
      i++;
      continue;
    }
    if (c === ',') {
      parts.push(current);
      current = '';
      continue;
    }
    current += c;
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * The class name a selector starting with `.` is keyed on, un-escaped.
 *
 * Tailwind escapes every character outside `[A-Za-z0-9_-]`, so `.w-1\/2` is the
 * class `w-1/2` and `.\!resize` is a class whose first character is `!`.
 */
function headClass(selector: string): string | null {
  if (!selector.startsWith('.')) return null;
  let name = '';
  let i = 1;
  while (i < selector.length) {
    const c = selector[i];
    if (c === undefined) break;
    if (c === '\\') {
      name += selector[i + 1] ?? '';
      i += 2;
      continue;
    }
    // Unescaped: the class name has ended and the rest is combinators,
    // pseudo-classes, attribute matchers or a second class.
    if (/[\s:,>+~.[\]()]/.test(c)) break;
    name += c;
    i++;
  }
  return name.length > 0 ? name : null;
}

/**
 * The utilities a compiled selector is keyed on.
 *
 * Unlike the ui package's stylesheet, this one is compiled with fumadocs, and
 * two of its rule shapes put the keyed class somewhere other than the head of
 * the selector:
 *
 * - `space-y-*` is emitted as `:where(.space-y-2>:not(:last-child))`
 * - fumadocs' `layout:` variant as `:is(#nd-docs-layout:has(.layout\:…), …)`
 *
 * Both are ordinary utilities, so a walk that only reads the head of a selector
 * silently omits them from the inventory — 45 rules' worth, which is not noise
 * but a blind spot exactly the size of the thing being guarded. Functional
 * pseudo-classes are therefore descended into, and the FIRST class found wins,
 * so a descendant combinator still cannot smuggle a second name in.
 */
function keyedClasses(selector: string): string[] {
  const found: string[] = [];
  let i = 0;
  while (i < selector.length) {
    const c = selector[i];
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (c === '.') {
      const name = headClass(selector.slice(i));
      if (name !== null) found.push(name);
      break;
    }
    if (c === ':') {
      const fn = /^:{1,2}[a-z-]+\(/.exec(selector.slice(i));
      if (fn !== null) {
        let depth = 0;
        let end = -1;
        for (let j = i + fn[0].length - 1; j < selector.length; j++) {
          if (selector[j] === '\\') {
            j++;
            continue;
          }
          if (selector[j] === '(') depth++;
          else if (selector[j] === ')') {
            depth--;
            if (depth === 0) {
              end = j;
              break;
            }
          }
        }
        if (end !== -1) {
          const inner = splitSelectorList(selector.slice(i + fn[0].length, end)).flatMap(keyedClasses);
          if (inner.length > 0) {
            found.push(...inner);
            break;
          }
          i = end + 1;
          continue;
        }
      }
    }
    i++;
  }
  return found;
}

// ---------------------------------------------------------------------------
// The users
// ---------------------------------------------------------------------------

function walk(dir: string, match: RegExp, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, match, acc);
    else if (match.test(entry.name)) acc.push(path);
  }
  return acc;
}

function tokensFromSources(files: string[]): Set<string> {
  const tokens = new Set<string>();
  for (const file of files) {
    for (const literal of extractStringLiterals(readFileSync(file, 'utf-8'))) {
      for (const token of literal.split(/\s+/)) if (token) tokens.add(token);
    }
  }
  return tokens;
}

/**
 * The values of every `class` / `className` attribute in an MDX source.
 *
 * Handles the quoted form and the braced form; from a braced expression it takes
 * every quoted string, so `className={cn('a', condition && 'b')}` yields both.
 */
function classAttributeValues(source: string): string[] {
  const values: string[] = [];
  const attr = /\bclass(?:Name)?\s*=\s*/g;
  let m: RegExpExecArray | null;

  while ((m = attr.exec(source)) !== null) {
    let i = m.index + m[0].length;
    const opener = source[i];

    if (opener === '"' || opener === "'") {
      const close = source.indexOf(opener, i + 1);
      if (close !== -1) values.push(source.slice(i + 1, close));
      continue;
    }

    if (opener === '{') {
      let depth = 0;
      let end = -1;
      for (let j = i; j < source.length; j++) {
        if (source[j] === '{') depth++;
        else if (source[j] === '}') {
          depth--;
          if (depth === 0) {
            end = j;
            break;
          }
        }
      }
      if (end === -1) continue;
      const expression = source.slice(i + 1, end);
      for (const q of expression.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g)) {
        values.push(q[1] ?? q[2] ?? q[3] ?? '');
      }
    }
  }

  return values;
}

const docsSourceFiles = [
  ...walk(join(docsRoot, 'app'), /\.(tsx?|mjs)$/),
  ...walk(join(docsRoot, 'components'), /\.(tsx?|mjs)$/),
  ...walk(join(docsRoot, 'lib'), /\.(tsx?|mjs)$/),
  ...walk(join(docsRoot, 'scripts'), /\.(tsx?|mjs)$/),
  join(docsRoot, 'source.config.ts'),
  join(docsRoot, 'next.config.mjs'),
  join(docsRoot, 'postcss.config.mjs'),
].filter((f) => existsSync(f));

const uiComponentFiles = walk(uiComponentsDir, /\.tsx$/).filter((f) => !/\.test\.tsx$/.test(f));
const fumadocsFiles = walk(join(docsRoot, 'node_modules/fumadocs-ui/dist'), /\.js$/);
const mdxFiles = walk(join(docsRoot, 'content'), /\.mdx$/);

const mdxTokens = new Set<string>();
for (const file of mdxFiles) {
  for (const value of classAttributeValues(readFileSync(file, 'utf-8'))) {
    for (const token of value.split(/\s+/)) if (token) mdxTokens.add(token);
  }
}

/** Each group carries the floor its own vacuity guard checks. */
const userGroups = [
  { name: 'docs sources', files: docsSourceFiles.length, tokens: tokensFromSources(docsSourceFiles), floor: 800 },
  { name: 'ui component sources', files: uiComponentFiles.length, tokens: tokensFromSources(uiComponentFiles), floor: 1400 },
  { name: 'fumadocs-ui dist', files: fumadocsFiles.length, tokens: tokensFromSources(fumadocsFiles), floor: 1200 },
  { name: 'MDX class attributes', files: mdxFiles.length, tokens: mdxTokens, floor: 200 },
];

const users = new Set(userGroups.flatMap((g) => [...g.tokens]));

/**
 * Where a token appears in source, as `<file>:<line>`, capped.
 *
 * An arrival is by definition absent from every class attribute and every string
 * literal, so whatever this finds is prose, a comment or an identifier — i.e.
 * the thing to reword. Flanking characters are checked so `m-1` does not match
 * inside `m-16`.
 */
function provenance(token: string, limit = 3): string[] {
  const hits: string[] = [];
  const searched = [...mdxFiles, ...docsSourceFiles, ...uiComponentFiles];
  for (const file of searched) {
    const lines = readFileSync(file, 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      let at = -1;
      let matched = false;
      while ((at = line.indexOf(token, at + 1)) !== -1) {
        const before = line[at - 1] ?? ' ';
        const after = line[at + token.length] ?? ' ';
        if (/[A-Za-z0-9_\-:/.]/.test(before)) continue;
        if (/[A-Za-z0-9_\-:/]/.test(after)) continue;
        matched = true;
        break;
      }
      if (matched) {
        hits.push(`${relative(docsRoot, file).replace(/\\/g, '/')}:${i + 1}`);
        break;
      }
    }
    if (hits.length >= limit) break;
  }
  return hits;
}

// ---------------------------------------------------------------------------

describe('the exported docs stylesheet — no compiled utility without a user', () => {
  let compiled: string[];
  let unkeyedPreludes: string[];
  let sections: number;

  beforeAll(() => {
    if (!existsSync(chunkDir)) {
      throw new Error(
        `The static export is missing at ${chunkDir}.\n` +
          'This suite compares the BUILT stylesheet against the class strings the site ships, ' +
          'which is the only place the defect is visible: a candidate Tailwind picked up out of ' +
          'MDX prose produces a perfectly valid rule that no other test can see. ' +
          'Run `pnpm --filter @nim-ui/docs build` first — turbo already declares that dependency.'
      );
    }

    const names = new Set<string>();
    unkeyedPreludes = [];
    sections = 0;

    for (const file of readdirSync(chunkDir).filter((f) => f.endsWith('.css'))) {
      const css = readFileSync(join(chunkDir, file), 'utf-8');
      let cursor = 0;
      while (cursor < css.length) {
        const match = /@layer\s+utilities\s*\{/.exec(css.slice(cursor));
        if (match === null) break;
        sections++;
        const body = balancedBody(css, cursor + match.index);
        if (body === null) throw new Error(`Unbalanced \`@layer utilities\` section in ${file}.`);
        for (const prelude of topLevelPreludes(css.slice(body.start, body.end))) {
          const found = splitSelectorList(prelude).flatMap(keyedClasses);
          if (found.length === 0) unkeyedPreludes.push(prelude);
          for (const name of found) names.add(name);
        }
        cursor = body.end;
      }
    }

    compiled = [...names].sort();
  });

  // ---- vacuity guards -----------------------------------------------------
  // Both halves of the comparison are produced by hand-written parsers over
  // build output. A regression in either yields a comparison that measures
  // nothing: an empty compiled set makes every assertion below pass on air, and
  // a collapsed user set makes every utility an arrival — loud, but for the
  // wrong reason.

  it('finds the utilities layer in the exported CSS', () => {
    expect(
      sections,
      'No `@layer utilities` section in any exported CSS chunk. This suite reads its inventory ' +
        'out of that section precisely because everything Tailwind emits STRUCTURALLY — ' +
        'preflight, `@property` registrations, the theme custom properties, fumadocs\' base ' +
        'layer — sits outside it. If the output changed shape, re-derive the scope before ' +
        'trusting this guard again.'
    ).toBeGreaterThan(0);
  });

  it('reads a plausible number of compiled utilities out of the stylesheet', () => {
    expect(
      compiled.length,
      'Fewer compiled utilities than this site ships (1545 at the time of writing). A DROP is ' +
        'the signal, not just emptiness: the ui guard sat at a floor of 500 while its walk was ' +
        'silently skipping 163 of 944 rules, and a short inventory only ever loses arrivals, so ' +
        'nothing failed. Keep this just under the real count.'
    ).toBeGreaterThan(1450);
  });

  // The same fragment the ui guard pins, for the same reason: a walk that reads
  // the `\'` in a selector as a string opener resynchronises at some later
  // quote and drops everything in between, and the only symptom is a slightly
  // shorter inventory.
  //
  // The expectation here deliberately differs from the ui guard's: this export
  // is MINIFIED, which puts `::after` in the prelude, while the unminified
  // bundle nests it inside the rule. So the prelude read here carries `:after`
  // and the ui one does not — `keyedClasses` drops it either way, at the first
  // unescaped `:`. Do not "fix" one to match the other.
  it('reads past a selector that contains an escaped quote', () => {
    const fragment =
      ".after\\:content-\\[\\'\\'\\]:after{--tw-content:\"\"}" +
      '.probe-after-the-quote{color:red}';

    expect(topLevelPreludes(fragment)).toEqual([
      ".after\\:content-\\[\\'\\'\\]:after",
      '.probe-after-the-quote',
    ]);
  });

  it('keys every top-level rule in the section on a class', () => {
    expect(
      unkeyedPreludes,
      'Top-level rules in `@layer utilities` that are not keyed on a class. Tailwind emits one ' +
        'rule per candidate here, so this should be empty; if it is not, a rule shape arrived ' +
        'that `keyedClasses()` cannot read, and every utility behind it is missing from the ' +
        'inventory this guard builds.'
    ).toEqual([]);
  });

  it('reads a plausible number of tokens out of every user group', () => {
    const starved = userGroups
      .filter((g) => g.tokens.size < g.floor)
      .map((g) => `${g.name}: ${g.tokens.size} tokens from ${g.files} files (floor ${g.floor})`);

    expect(
      starved,
      'A source group collapsed. Each of these is something `app/global.css` actually scans, so ' +
        'a group that stops yielding tokens — a moved directory, a renamed dependency path, a ' +
        'scanner regression — turns utilities that ARE used into reported arrivals.'
    ).toEqual([]);
  });

  it('keeps this suite out of the Tailwind scan', () => {
    const css = readFileSync(globalCssPath, 'utf-8');
    const excluded = /@source\s+not\s+['"]\.\.\/tests['"]/.test(css);

    expect(
      excluded,
      '`app/global.css` no longer excludes `../tests` from the Tailwind scan. This file names ' +
        'utilities on purpose, so without that line it MINTS the rules it claims to merely ' +
        'tolerate: the pin below could never shrink, and a genuine leak by the same name would ' +
        'be waved through. Restore the `@source not` line, or drop the pin.'
    ).toBe(true);
  });

  it('keeps the browser accessibility suite out of the Tailwind scan too', () => {
    const css = readFileSync(globalCssPath, 'utf-8');
    const excluded = /@source\s+not\s+['"]\.\.\/e2e['"]/.test(css);

    expect(
      excluded,
      '`app/global.css` no longer excludes `../e2e` from the Tailwind scan. That suite selects on ' +
        'class names and names classes in its failure messages, and this package does not use ' +
        '`source(none)` — so automatic detection reaches it and every one of those literals ' +
        'becomes a live rule in the exported stylesheet, applied to nothing. It would also start ' +
        'counting as a USER here, which would mask genuine departures. Restore the line.'
    ).toBe(true);
  });

  // ---- the pin itself -----------------------------------------------------

  it('keeps the pin encoded, so the pin cannot mint what it tolerates', () => {
    const plain = KNOWN_UNUSED.filter((entry) => !entry.includes(SENTINEL));

    expect(
      plain,
      `These KNOWN_UNUSED entries are missing the "${SENTINEL}" marker. The scan exclusion above ` +
        'is the first lock and this is the second; an unmarked entry is a live Tailwind candidate ' +
        'the moment that exclusion is undone. Put the marker somewhere inside the name.'
    ).toEqual([]);
  });

  it('has no duplicate pin entries', () => {
    const decoded = KNOWN_UNUSED.map(decode);
    expect(decoded).toEqual([...new Set(decoded)]);
  });

  it('leaves no live utility on either side of the marker', () => {
    const inventory = new Set(compiled);
    const leaking = KNOWN_UNUSED.flatMap((entry) =>
      entry
        .split(SENTINEL)
        .filter((fragment) => fragment.length > 0 && inventory.has(fragment))
        .map((fragment) => `${entry} -> the fragment "${fragment}" is itself a compiled utility`)
    );

    expect(
      leaking,
      'A pin entry splits into something Tailwind knows, so this file would be a candidate source ' +
        'for it the moment the scan exclusion is undone. Move the marker further into the name.'
    ).toEqual([]);
  });

  // ---- the guard ----------------------------------------------------------

  it('compiles no utility that nothing on the site asks for', () => {
    const expected = new Set(KNOWN_UNUSED.map(decode));
    const arrivals = compiled.filter((name) => !users.has(name) && !expected.has(name));

    expect(
      arrivals.map((name) => `${name}   <- ${provenance(name).join(', ') || 'no textual source found'}`),
      'The exported stylesheet gained rules that NO class attribute and no string literal on this ' +
        'site asks for.\n' +
        'Tailwind v4 scans this package as TEXT — MDX prose, markdown inline code, JSDoc, `//` ' +
        'notes — so a bare word that happens to name a utility compiles a real rule into the ' +
        'bundle, applied to nothing. Every visitor downloads it. This has happened: a draft of ' +
        '`guides/accessibility.mdx` wrote one utility name in a sentence and shipped 37 bytes of ' +
        'dead CSS, in the very page explaining that Tailwind reads prose.\n' +
        'The locations above are where each token appears; by construction it is NOT in any class ' +
        'attribute, so it is prose or an identifier.\n' +
        'Two ways to answer it:\n' +
        '  1. Reword, so the token stops looking like a utility — name the CSS property rather ' +
        'than the utility that sets it. The bundle gets smaller. Prefer this.\n' +
        '  2. If the wording has to stay (an English word, a documented example, a reference ' +
        'table), add it to KNOWN_UNUSED — ENCODED, marker mid-name — in this same commit, with a ' +
        'note saying why.\n' +
        'Do NOT write the class plainly anywhere in this file.'
    ).toEqual([]);
  });

  it('pins nothing that has stopped being compiled or has found a user', () => {
    const compiledSet = new Set(compiled);
    const departures = KNOWN_UNUSED.map(decode)
      .filter((name) => !compiledSet.has(name) || users.has(name))
      .map((name) =>
        compiledSet.has(name)
          ? `${name}   <- now used by a class attribute; drop the pin entry`
          : `${name}   <- no longer compiled; drop the pin entry and enjoy the smaller bundle`
      );

    expect(
      departures,
      'KNOWN_UNUSED holds entries that are no longer unused dead rules. A stale entry is not ' +
        'harmless: it is the pin quietly authorising something that is not happening any more, ' +
        'and next time a rule by that name really does leak, this guard would wave it through. ' +
        'Remove them in the commit that made them stale.'
    ).toEqual([]);
  });
});
