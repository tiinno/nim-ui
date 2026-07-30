import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join, relative } from 'path';
import { extractStringLiterals } from './test/class-scan';

/**
 * Guards the MIRROR of what `styles.test.ts` guards: a compiled rule that no
 * class string in the kit ever asks for.
 *
 * ## The failure mode (NIMUI-44)
 *
 * Tailwind v4 reads its sources as TEXT, not code: JSDoc, `//` notes and
 * identifiers in expression position are all candidate sources. Any bare word
 * that happens to name a utility therefore ships as a real rule in the
 * published stylesheet, applied to nothing.
 *
 * `src/styles.css` states its scan explicitly (NIMUI-52) — `source(none)`, one
 * `@source` for `../src`, and `@source not` for every test file and the
 * `src/test` helpers. That closed one whole class of this defect: 32 rules that
 * existed only because a `.test.tsx` assertion or a throwaway size in a render
 * call named them. What is still scanned, and still leaks this way, is every
 * shipped source file — comments included — plus `registry/index.json`.
 *
 * Three of these have actually happened:
 *
 * - A rebuild came back 239 bytes heavier because a sentence in a new
 *   `.test.ts` used an English word that Tailwind also knows as an image-filter
 *   utility. The sentence was about reversing an assertion. Rewording it to
 *   "flip" returned the bundle to its previous byte count. (That particular
 *   route is closed now — test files are no longer scanned at all — but the
 *   identical mistake in a component's own JSDoc still lands.)
 * - 958 bytes of dead property-list utilities compiled out of prose that
 *   *described the syntax* of one.
 * - Two layout keywords that are also ordinary English words — and also public
 *   variant values on four components, and also an HTML element name — still
 *   ship today. They are NOT in KNOWN_UNUSED and this guard does not report
 *   them: a string literal vouches for each (see the limitation below), and
 *   neither can be removed without a breaking API change anyway.
 *
 * Every one was caught only because that work happened to be diffing
 * `dist/styles.css` byte for byte. No test failed, no lint rule fired; the
 * bundle simply grew.
 *
 * ## Why this shape and not the alternatives
 *
 * - **Not a full inventory pin of all 777 rules.** 768 of them are traceable to
 *   a class string the kit actually ships, so they would each need a pin entry
 *   that changes on every restyle — churn proportional to the WORK. Here the pin
 *   holds only the 9 that nothing asks for.
 *
 *   That is not zero churn, and it should not be sold as such: a new component
 *   ships two or three JSDoc `@example`s, and an example that reaches for a
 *   sizing class the kit does not otherwise use will fail this guard and need a
 *   pin entry. Six of the nine arrived exactly that way. The friction is the
 *   price of making dead CSS visible at all, and it is one line per case.
 * - **Not a selector count against a pinned number.** It reports "one more
 *   than yesterday" without saying which, and it stays green when one arrival
 *   cancels one departure.
 * - **Not "every rule must have a user", unqualified.** That is this test with
 *   an empty pin, and it would be noisy enough to learn to ignore: JSDoc
 *   `@example` code legitimately names widths the kit itself never uses.
 *   Those are pinned, individually, so the cost is stated and deliberate.
 *
 * The scope is the top-level rules of the single `@layer utilities` section,
 * which is what makes the signal clean: preflight, `@property` registrations
 * and the theme custom properties all sit OUTSIDE it, so none of the
 * structural noise a naive scan would trip on reaches this comparison.
 *
 * ## What counts as a user, and what this therefore does NOT catch
 *
 * A user is a whitespace-delimited token of a string literal in any `.ts` or
 * `.tsx` file under `src`, recursively — the same notion of "the class strings a
 * component ships" the sibling guards use, read through the same scanner
 * (`test/class-scan.ts`, shared so it cannot drift). Comments are
 * skipped by `extractStringLiterals`, which is the entire point: prose is
 * exactly where the leaks come from.
 *
 * Test files count as users. Their literals are not shipped, so this is a
 * deliberate weakening, and it has a cost worth stating: any PROSE inside a
 * string literal vouches for a utility. A test title such as
 * `it('allows … by default')`, or a `getByRole` argument, or a public variant
 * value passed in a render call, is indistinguishable from a class token — so
 * the two English-word keywords in KNOWN_UNUSED would be vouched for even if
 * their pin entries were removed.
 *
 * Since NIMUI-52 the weakening is one-directional and much cheaper: Tailwind no
 * longer READS those files, so a test literal can vouch for a rule but can no
 * longer mint one. The remaining hole is a rule some shipped file mints while a
 * test literal happens to vouch for it. Restricting users to literals in
 * `className` / `cn()` / `cva()` position would close that hole, but it needs a
 * context parser, it would misjudge composed strings, and the utilities it
 * would newly flag are unremovable anyway (they are public variant values and
 * an HTML element name). Not worth the false positives.
 *
 * It also cannot see WHY a candidate exists — only that nothing uses it. The
 * failure message therefore locates the token in source for you.
 *
 * One more blind spot worth knowing before you trust an arrival: the user scan
 * reads `.ts` and `.tsx` only. If one of the three stylesheets under `src` ever
 * used `@apply`, the utilities it applies would be real users this guard cannot
 * see, and it would report them as arrivals. None does today.
 *
 * ## Why the pin is encoded
 *
 * A pin entry written plainly used to be a live candidate: this file was scanned
 * like any other, so the pin MINTED the rule it claims to merely tolerate. The
 * bundle could then never get smaller when the real source is cleaned, and the
 * entry would be frozen in forever — and a byte-for-byte rebuild diff cannot
 * notice, because a name already in the bundle costs zero further bytes.
 *
 * NIMUI-52 took test files out of the scan, so the encoding is now the second
 * lock rather than the first. It stays, and so do the assertions below: they are
 * what would catch a revert of that scoping quietly re-arming this file, and
 * they cost one character per entry.
 *
 * So every entry carries a `~`, stripped at load. The marker goes wherever it
 * takes to leave BOTH fragments meaningless to Tailwind: `w~-96` splits into `w`
 * and `-96`, neither of which is a utility. That is not a matter of taste — it
 * is asserted below against the compiled inventory itself, because a marker put
 * after the first character of a word that is ITSELF a utility leaves that
 * utility whole on one side of the marker, and the pin starts minting again. The
 * last entry in the list is placed mid-word for exactly that reason.
 *
 * This file is also excluded from the user set. It vouches for nothing, so if
 * its own prose ever mints a rule — which now takes the scoping in
 * `src/styles.css` being undone first — that rule shows up here as an arrival
 * and this guard fails on itself.
 */

const distStylesPath = resolve(__dirname, '../dist/styles.css');
const srcDir = __dirname;

/** This file, excluded from the user scan — see the docblock. */
const SELF = 'compiled-utility-inventory.test.ts';

/** Inserted mid-name, so a pin entry cannot be a Tailwind candidate. */
const SENTINEL = '~';

/**
 * Every compiled utility nothing in the kit's class strings asks for, encoded.
 *
 * Each entry is a real rule in the published stylesheet that no component
 * applies. They are tolerated, not endorsed — an entry is a small piece of dead
 * CSS a consumer downloads. Two ways to answer a new arrival:
 *
 * 1. Reword the prose (or rename the local identifier) so the token stops
 *    looking like a utility. Preferred — the bundle gets smaller.
 * 2. Add it here, deliberately, in the same commit. The diff is the point.
 *
 * Removing the last source of an entry is expected to fail this guard too, as a
 * departure: clean the entry out in the same commit and the bundle gets smaller.
 */
const KNOWN_UNUSED = [
  // Widths, a height and a column count named only inside JSDoc `@example`
  // code, which shows a consumer how to lay out a demo. Legitimate
  // documentation; the rules are still dead weight in the bundle.
  'g~rid-cols-3',
  'h~-40',
  'w~-28',
  'w~-48',
  'w~-96',
  'w~-max',
  // registry/index.json ships `code` snippets and search keywords for the MCP
  // server and the docs site. Data, not class strings, so it is not scanned as a
  // user — but Tailwind reads it all the same. `c~ollapse` is one of Accordion's
  // search keywords; rewording it would make the component harder to find for
  // the word a consumer is most likely to type.
  'c~ollapse',
  's~pace-x-4',
  // textarea.tsx negates a boolean prop of the same name in expression
  // position, and Tailwind reads the negation as the legacy important prefix.
  // Renaming a public prop to save one small rule is not worth it. Marked
  // mid-word: the obvious placement would leave a live utility after the marker.
  '!re~size',
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
 * only.
 *
 * At-rules are followed because a future Tailwind release could enclose
 * responsive utilities in a top-level `@media` again instead of nesting the
 * query inside the rule as v4 does; nested SELECTORS are not followed, because
 * `&:hover` and `&:is(…)` inside a utility are that utility's own business, not
 * separate entries.
 */
function topLevelPreludes(body: string): string[] {
  const preludes: string[] = [];
  let i = 0;
  let preludeStart = 0;

  while (i < body.length) {
    const c = body[i];

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
 * The class name a compiled selector is keyed on, un-escaped, or `null` if the
 * selector is not keyed on a class at all.
 *
 * The inverse of `toSelector()` in `test/class-scan.ts`: Tailwind escapes every
 * character outside `[A-Za-z0-9_-]`, so `.w-1\/2` is the class `w-1/2` and
 * `.\!resize` is a class whose first character is an exclamation mark.
 */
function classOfSelector(selector: string): string | null {
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

// ---------------------------------------------------------------------------
// The users
// ---------------------------------------------------------------------------

function walkSource(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkSource(path, acc);
    else if (/\.tsx?$/.test(entry.name) && entry.name !== SELF) acc.push(path);
  }
  return acc;
}

const sourceFiles = walkSource(srcDir).sort();

interface ScannedFile {
  /** Path relative to `src/`, POSIX-separated. */
  file: string;
  literals: number;
  tokens: string[];
}

const scanned: ScannedFile[] = sourceFiles.map((path) => {
  const literals = extractStringLiterals(readFileSync(path, 'utf-8'));
  return {
    file: relative(srcDir, path).replace(/\\/g, '/'),
    literals: literals.length,
    tokens: literals.flatMap((text) => text.split(/\s+/).filter(Boolean)),
  };
});

const users = new Set(scanned.flatMap((s) => s.tokens));

/**
 * Where a token appears in source, as `<file>:<line>`, capped.
 *
 * Every arrival is by definition absent from every string literal, so whatever
 * this finds is prose, an identifier or JSDoc — i.e. the thing to reword.
 * Matched on raw text with `indexOf`, so no token needs escaping.
 */
function provenance(token: string, limit = 4): string[] {
  const hits: string[] = [];
  for (const path of [...sourceFiles, join(srcDir, SELF)]) {
    const lines = readFileSync(path, 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if ((lines[i] ?? '').includes(token)) {
        hits.push(`${relative(srcDir, path).replace(/\\/g, '/')}:${i + 1}`);
        if (hits.length >= limit) return hits;
        break;
      }
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------

describe('dist/styles.css — no compiled utility without a user', () => {
  let compiled: string[];
  let unkeyedPreludes: string[];

  beforeAll(() => {
    if (!existsSync(distStylesPath)) {
      throw new Error(
        `packages/ui/dist/styles.css does not exist at ${distStylesPath}.\n` +
          'This suite compares the BUILT stylesheet against the class strings the kit ships, ' +
          'which is the only place the defect is visible: a candidate Tailwind picked up out ' +
          'of a comment produces a perfectly valid rule that no test and no lint rule can see. ' +
          'Run `pnpm --filter @nim-ui/components build` first.'
      );
    }
    const css = readFileSync(distStylesPath, 'utf-8');

    const layerAt = css.indexOf('@layer utilities {');
    if (layerAt === -1) {
      throw new Error(
        'No `@layer utilities` section in dist/styles.css. This suite reads its inventory out ' +
          'of that section precisely because everything Tailwind emits STRUCTURALLY — preflight, ' +
          '`@property` registrations, the theme custom properties — sits outside it. If the ' +
          'output changed shape, re-derive the scope before trusting this guard again.'
      );
    }
    const layer = balancedBody(css, layerAt);
    if (layer === null) throw new Error('The `@layer utilities` section in dist/styles.css is unbalanced.');

    const names = new Set<string>();
    unkeyedPreludes = [];
    for (const prelude of topLevelPreludes(css.slice(layer.start, layer.end))) {
      const found = splitSelectorList(prelude)
        .map(classOfSelector)
        .filter((name): name is string => name !== null);
      if (found.length === 0) unkeyedPreludes.push(prelude);
      for (const name of found) names.add(name);
    }
    compiled = [...names].sort();
  });

  // ---- vacuity guards -----------------------------------------------------
  // Both halves of the comparison are produced by hand-written parsers. A
  // regression in either yields a comparison that measures nothing: an empty
  // compiled set makes every assertion below pass on air, and an empty user set
  // makes every utility an arrival (loud, but for the wrong reason).

  it('reads a plausible number of compiled utilities out of the stylesheet', () => {
    expect(
      compiled.length,
      'Fewer compiled utilities than this package could possibly ship. The selector walk ' +
        'regressed, or the stylesheet is truncated — either way the comparison below is blind.'
    ).toBeGreaterThan(500);
  });

  it('keys every top-level rule in the section on a class', () => {
    expect(
      unkeyedPreludes,
      'Top-level rules in `@layer utilities` that are not keyed on a class. Tailwind emits one ' +
        'rule per candidate here, so this should be empty; if it is not, the output changed ' +
        'shape and the inventory this guard builds is incomplete.'
    ).toEqual([]);
  });

  it('reads a plausible number of class-string tokens out of source', () => {
    expect(
      users.size,
      'Far fewer tokens than the kit ships class strings for — extractStringLiterals() ' +
        'regressed, and utilities that ARE used would be reported as unused.'
    ).toBeGreaterThan(2000);
  });

  it('extracts string literals from every source file it scans', () => {
    const empty = scanned.filter((s) => s.literals === 0).map((s) => s.file);

    expect(
      empty,
      'These files yielded ZERO string literals, so the scanner bailed early on them and the ' +
        'class strings they ship do not count as users. Utilities only they use would be ' +
        'reported as unused.'
    ).toEqual([]);
  });

  // ---- the pin itself -----------------------------------------------------

  it('keeps the pin encoded, so the pin cannot mint what it tolerates', () => {
    const plain = KNOWN_UNUSED.filter((entry) => !entry.includes(SENTINEL));

    expect(
      plain,
      `These KNOWN_UNUSED entries are missing the "${SENTINEL}" marker, so they are live ` +
        'Tailwind candidates: this file would COMPILE the very rules it claims to merely ' +
        'tolerate, and the bundle could never get smaller when the real source is cleaned up. ' +
        'Put the marker somewhere inside the name.'
    ).toEqual([]);
  });

  it('has no duplicate pin entries', () => {
    const decoded = KNOWN_UNUSED.map(decode);
    expect(decoded).toEqual([...new Set(decoded)]);
  });

  // The marker only helps if it leaves nothing usable on either side of it.
  // Tailwind's extractor splits on characters it cannot use, so an entry marked
  // right after its first character keeps the rest of a one-word utility intact
  // and the pin compiles it after all — silently, because a rule already in the
  // bundle costs no extra bytes and a rebuild diff shows nothing.
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
      'A pin entry splits into something Tailwind knows, so this file is a candidate source ' +
        'for it: the rule would be compiled from HERE even once the real source is cleaned up. ' +
        'Move the marker further into the name.'
    ).toEqual([]);
  });

  // ---- the guard ----------------------------------------------------------

  it('compiles no utility that nothing in the kit asks for', () => {
    const expected = new Set(KNOWN_UNUSED.map(decode));
    const arrivals = compiled.filter((name) => !users.has(name) && !expected.has(name));

    expect(
      arrivals.map((name) => `${name}   <- ${provenance(name).join(', ') || 'no textual source found'}`),
      'The published stylesheet gained rules that NO class string in this package asks for.\n' +
        'Tailwind v4 scans the shipped sources as TEXT — JSDoc, `//` notes, `registry/index.json` ' +
        'data, even a negated identifier — so a bare word that happens to name a utility compiles a real ' +
        'rule into the bundle, applied to nothing. Every consumer downloads it. Nothing else ' +
        'in the repo reports it.\n' +
        'The locations above are where each token appears; by construction it is NOT in any ' +
        'class string, so it is prose or an identifier.\n' +
        'Two ways to answer it:\n' +
        '  1. Reword, so the token stops looking like a utility. The bundle gets smaller. ' +
        'Prefer this. Naming a value without its namespace works too — see the convention in ' +
        '`transition-property.test.ts`.\n' +
        '  2. If the wording has to stay (a public variant value, an HTML element name, a ' +
        'documented example), add it to KNOWN_UNUSED — ENCODED, marker mid-name — in this same ' +
        'commit, with a note saying why.\n' +
        'Do NOT write the class plainly anywhere in this file: that mints the rule and this ' +
        'guard would then be tolerating its own output.'
    ).toEqual([]);
  });

  it('pins nothing that has stopped being compiled or has found a user', () => {
    const compiledSet = new Set(compiled);
    const departures = KNOWN_UNUSED.map(decode)
      .filter((name) => !compiledSet.has(name) || users.has(name))
      .map((name) =>
        compiledSet.has(name)
          ? `${name}   <- now used by a class string; drop the pin entry`
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
