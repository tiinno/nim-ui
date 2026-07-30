import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { declaredProperties, extractStringLiterals } from './test/class-scan';

/**
 * Guards against a transition that names a property **nothing on the component
 * sets** — a declaration that reads as an animation in review and can never run
 * in a browser.
 *
 * ## The defect this exists for (NIMUI-48)
 *
 * `card.tsx` shipped a hand-written property list naming `transform`, and moved
 * its hoverable variant with a negative vertical translate utility. In Tailwind
 * v3 that utility wrote the combined `transform` property, so the pairing was
 * correct. **Tailwind v4 routes translate, scale and rotate through the
 * independent longhands instead** — the compiled rule sets `translate`, and
 * nothing on that element has set `transform` since the v4 migration. The
 * transition therefore had nothing to interpolate and the lift snapped, for
 * every user, for the whole life of the class. `product-card.tsx` named
 * `transform` too, on a root that carries no movement utility at all.
 *
 * Nothing caught either one. Class-string tests assert the transition class is
 * present; `motion-reduce.test.ts` asserts its reduced-motion counterpart
 * compiles and wins. Both were green and both were true. Neither can see that
 * the named property is one no utility on that component ever declares.
 *
 * Note how thin the difference looks in source and how total it is in the
 * browser: Tailwind's own named transform transition compiles to a property list
 * enumerating all four of the transform-family properties, precisely because
 * they are separate in v4. A hand-written bracketed list gets no such expansion
 * — you get exactly the properties you typed.
 *
 * ## What this asserts, and what it cannot
 *
 * For every hand-written bracketed property list in `src/components/*.tsx`:
 * every property it names must be declared by **some** compiled utility rule
 * belonging to a class the same component ships. Both sides are read out of the
 * built `dist/styles.css`, so neither can rot against a Tailwind upgrade — if a
 * future release moves a property again, the utility's compiled declarations
 * move with it and this guard follows.
 *
 * **Scoped per FILE, not per class string, and that is deliberate.** The obvious
 * tighter scope — require the property to be set by a utility in the *same*
 * class string — cannot see this defect at all: `cva` puts the transition in the
 * base literal and the lift in the `hoverable` variant literal, two different
 * strings. A group-scoped check would have stayed green on the exact bug that
 * prompted the guard.
 *
 * So this is a **necessary, not sufficient** condition. It catches "no utility
 * anywhere in this component sets the property you promised to transition",
 * which is what both real defects were. It cannot catch "a sibling element sets
 * it, but not the one carrying the transition". Closing that gap needs a real
 * understanding of which classes land on which element, which this repo has no
 * way to derive from source; a check that pretended to have it would be a test
 * people learn to ignore.
 *
 * ## Why only the bracketed lists
 *
 * The named values (`all`, the transform-family list, colours, opacity, shadow)
 * are Tailwind's own and expand correctly by construction, so the only way to
 * misname a property is to type the list yourself. An unused named transition is
 * merely redundant; a hand-written list that names the wrong property looks
 * exactly like a working animation, which is the whole problem.
 *
 * Every property name in this file is written bare, never as a utility: Tailwind
 * scans test files exactly like component files, and NIMUI-30 shipped 43 class
 * names that compiled to nothing while a full utility written in a comment
 * compiled 958 bytes of dead CSS into the published stylesheet.
 */

const componentsDir = resolve(__dirname, 'components');
const distStylesPath = resolve(__dirname, '../dist/styles.css');

const componentFiles = readdirSync(componentsDir)
  .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
  .sort();

/** One hand-written bracketed transition property list, as written in source. */
interface PropertyList {
  /** Source file it was found in. */
  file: string;
  /** Full class as written, brackets and any variant prefix included. */
  className: string;
  /** Variant chain including its trailing colon. Empty when unmodified. */
  prefix: string;
  /** The properties named inside the brackets, lower-cased and trimmed. */
  properties: string[];
  /** `<file>: <properties>`, the pinned-inventory form. Never a utility. */
  label: string;
}

interface ScannedFile {
  file: string;
  /** Every whitespace-delimited token from every string literal in the file. */
  tokens: string[];
  /** Number of string literals found — a vacuity signal, see below. */
  literals: number;
  lists: PropertyList[];
}

const scanned: ScannedFile[] = componentFiles.map((file) => {
  const literals = extractStringLiterals(readFileSync(join(componentsDir, file), 'utf-8'));
  const tokens = [...new Set(literals.flatMap((text) => text.split(/\s+/).filter(Boolean)))];
  const lists: PropertyList[] = [];

  for (const token of tokens) {
    const match = /(?:^|:)transition-\[([^\]]*)\]$/.exec(token);
    if (!match) continue;
    const inner = match[1];
    if (inner === undefined) continue;

    const properties = inner
      .split(',')
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);
    const prefix = token.slice(0, token.length - `transition-[${inner}]`.length);

    lists.push({
      file,
      className: token,
      prefix,
      properties,
      label: `${file}${prefix ? ` (${prefix.replace(/:$/, '')})` : ''}: ${properties.join(', ')}`,
    });
  }

  return { file, tokens, literals: literals.length, lists };
});

const allLists = scanned.flatMap((s) => s.lists);

/**
 * Exact inventory of the hand-written property lists the library ships, as
 * `<file>[ (<variant>)]: <properties>`.
 *
 * Pinned exactly rather than as a floor, the same way `motion-reduce.test.ts`
 * pins its inventories and for the same reason: a floor stays green when the
 * scan silently stops seeing a subset, which is the quiet degradation these
 * guards exist to prevent. Adding or changing a list is fine — update this in
 * the same commit, so the change is visible in review.
 *
 * Recorded as bare property names rather than as the class, on purpose. The
 * class form would be a live Tailwind candidate and would keep the rule alive in
 * `dist/styles.css` after a component stopped emitting it, which is exactly how
 * a compiled-CSS assertion comes to pass over a reverted fix.
 */
const EXPECTED_PROPERTY_LISTS = [
  'card.tsx: box-shadow, translate, border-color, background-color',
  'card.tsx (motion-reduce): box-shadow, border-color, background-color',
  'checkbox.tsx: background-color, border-color',
  'input.tsx: border-color, box-shadow',
  'tabs.tsx: background-color, box-shadow, color',
  'tags-input.tsx: border-color, box-shadow',
  'textarea.tsx: border-color, box-shadow',
];

describe('hand-written transition property lists name properties something actually sets', () => {
  let distCss: string;

  beforeAll(() => {
    if (!existsSync(distStylesPath)) {
      throw new Error(
        `packages/ui/dist/styles.css does not exist at ${distStylesPath}.\n` +
          'This suite reads BOTH sides of the comparison out of the built stylesheet — the ' +
          'property list a transition declares, and the properties the movement and colour ' +
          'utilities on the same component compile to. Source alone cannot answer the second ' +
          'one, which is why the original defect survived every class-string test. ' +
          'Run `pnpm --filter @nim-ui/components build` first.'
      );
    }
    distCss = readFileSync(distStylesPath, 'utf-8');
  });

  // Same vacuity guards as the other suites: the scanner walks all ~91
  // components and hand-parses strings, comments and regex literals. A file it
  // trips on yields fewer literals silently, and a file with no bracketed list
  // fires no assertion — so assert the scan itself found something everywhere.
  it('found component source files to scan', () => {
    expect(componentFiles.length).toBeGreaterThan(20);
  });

  it('extracts class strings from every component file', () => {
    const empty = scanned.filter((s) => s.literals === 0).map((s) => s.file);

    expect(
      empty,
      'These component files yielded ZERO string literals, so extractStringLiterals() bailed ' +
        'early on them and any transition they declare is invisible to this guard.'
    ).toEqual([]);
  });

  it('detects exactly the known inventory of hand-written property lists', () => {
    const found = allLists.map((l) => l.label).sort();

    expect(
      found,
      'The set of hand-written transition property lists drifted from ' +
        'EXPECTED_PROPERTY_LISTS.\n' +
        '- FEWER than expected usually means the scan regressed and the per-list assertions ' +
        'below are now passing vacuously over the ones it stopped seeing. Fix the scan.\n' +
        '- MORE (or different) means a component gained or changed a list. Update this ' +
        'inventory in the same commit so the change is visible in review.'
    ).toEqual([...EXPECTED_PROPERTY_LISTS].sort());
  });

  // If the dist lookup were broken — wrong path, changed output shape, a
  // selector-escaping mismatch — every token would resolve to `null`, the union
  // below would be empty and every property would be reported as unset. That
  // fails loudly, but with N confusing failures instead of one clear one. This
  // is the one clear one.
  it.each(
    [...new Set(allLists.map((l) => l.file))].sort().map((file) => [file] as const)
  )('%s resolves compiled utility rules out of dist/styles.css', (file) => {
    const entry = scanned.find((s) => s.file === file)!;
    const resolved = entry.tokens.filter((t) => declaredProperties(distCss, t) !== null);

    expect(
      resolved.length,
      `No token in ${file} matched a compiled rule in dist/styles.css. Either the stylesheet ` +
        'is stale (rebuild the package) or the selector escaping this suite relies on no ' +
        'longer matches what Tailwind emits — in which case every assertion below is ' +
        'measuring nothing.'
    ).toBeGreaterThan(5);
  });

  it.each(allLists.map((l) => [l.label, l] as const))(
    '%s — every property named is set by some utility on the component',
    (_label, list) => {
      const entry = scanned.find((s) => s.file === list.file)!;

      const set = new Set<string>();
      for (const token of entry.tokens) {
        // The transition utilities themselves declare `transition-property`, not
        // the properties they name, so they cannot satisfy their own list. No
        // filtering needed — that is already true of what they compile to.
        for (const property of declaredProperties(distCss, token) ?? []) set.add(property);
      }

      const inert = list.properties.filter((property) => !set.has(property));

      expect(
        inert,
        `${list.file} declares a transition over ${inert.join(', ')}, but no utility class ` +
          'anywhere in that component compiles to a rule declaring it. The transition has ' +
          'nothing to interpolate, so whatever it was meant to smooth snaps instead — ' +
          'silently, and for everyone.\n' +
          'The usual cause is a property that moved between Tailwind majors. In v4 the ' +
          'movement utilities write the independent longhands (translate, scale, rotate) and ' +
          'no longer write the combined one, so a list carried over from v3 names a property ' +
          'nothing sets. Name what the utility actually sets — check the compiled rule in ' +
          'dist/styles.css rather than guessing — or drop the entry if it was always inert.\n' +
          'Note the scope: this is a per-COMPONENT check, so it can only tell you nothing in ' +
          'the file sets the property. It cannot tell you the right ELEMENT sets it.'
      ).toEqual([]);
    }
  );
});
