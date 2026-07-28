import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Guards the kit's `prefers-reduced-motion` contract: every entrance/exit
 * animation a component applies must be switched off for users who ask for
 * reduced motion, with **zero consumer code**.
 *
 * Two independent halves, because either one alone passes vacuously:
 *
 * 1. **Source scan** — every `animate-*` in `src/components/*.tsx` must be
 *    paired with a `motion-reduce:animate-none` carrying the *same variant
 *    prefix*. This is what makes a future component that forgets it fail CI.
 *
 * 2. **Compiled-CSS assertion** — the paired class must emit a real rule
 *    inside an `@media (prefers-reduced-motion: reduce)` block in
 *    `dist/styles.css`, *after* the rule it is meant to beat. jsdom does not
 *    evaluate media queries and Tailwind only emits utilities it actually
 *    finds, so a class-string test proves nothing about the compiled result —
 *    NIMUI-30 shipped 43 class names that compiled to nothing while every
 *    class-string test stayed green.
 *
 * ## Why the prefix has to match
 *
 * Tailwind compiles `data-[state=open]:animate-fade-in` to
 * `.data-\[state\=open\]\:animate-fade-in { &[data-state="open"] { … } }` —
 * specificity (0,2,0). A bare `.motion-reduce\:animate-none` is (0,1,0) and
 * therefore **loses**, media query or not; media queries add no specificity.
 * The counterpart must carry the same `data-[…]` modifier to reach (0,2,0),
 * and must be emitted later in the stylesheet to win the tie. Both facts are
 * asserted below against the built artifact rather than assumed.
 *
 * This is a separate file from `styles.test.ts` on purpose: that file guards
 * a different invariant (custom `@theme` tokens that compile to dead
 * utilities), and this one needs its own hard-failing `beforeAll` plus
 * failure messages that name the offending component and prefix.
 */

const componentsDir = resolve(__dirname, 'components');
const distStylesPath = resolve(__dirname, '../dist/styles.css');

/**
 * Animation names deliberately EXEMPT from the reduced-motion pairing.
 *
 * - `spin` / `pulse` — loading spinners and skeletons. Removing the animation
 *   outright removes the only signal that something is in flight, which is a
 *   product decision, not an accessibility one, and is being made separately.
 * - `ping` / `bounce` — Tailwind's built-in attention loops. Same reasoning;
 *   listed pre-emptively so adding one does not silently trip this guard with
 *   an unrelated failure message.
 * - `none` — this is the counterpart itself (`motion-reduce:animate-none`).
 *   Without it the scan would demand a counterpart for every counterpart.
 */
const EXEMPT_ANIMATIONS = new Set(['none', 'spin', 'pulse', 'ping', 'bounce']);

const componentFiles = readdirSync(componentsDir)
  .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
  .sort();

interface AnimationUsage {
  /** Source file the class was found in. */
  file: string;
  /** Full class as written, e.g. `data-[state=open]:animate-fade-in`. */
  className: string;
  /** Variant chain including its trailing colon, e.g. `data-[state=open]:`. Empty when unmodified. */
  prefix: string;
  /** Animation name, e.g. `fade-in`. */
  animation: string;
  /** The class that must accompany it, e.g. `data-[state=open]:motion-reduce:animate-none`. */
  counterpart: string;
}

/** One string literal from a source file, treated as one class-string group. */
interface ClassGroup {
  /** The literal's contents, for failure messages. */
  text: string;
  /** Every whitespace-delimited token in that literal. */
  tokens: Set<string>;
  /** Entrance/exit animations used in that literal. */
  usages: AnimationUsage[];
}

/**
 * Characters/keywords after which a `/` starts a regex literal rather than a
 * division. Needed because `hero.tsx` contains `replace(/"/g, '\\"')` — a
 * regex holding an unbalanced quote, which walks a naive string scanner
 * straight off the rails.
 */
const REGEX_ALLOWED_AFTER =
  /(^|[=(,:[!&|?{};+\-*%<>~^]|\b(?:return|typeof|case|in|of|new|delete|void|do|else|yield|await))\s*$/;

/**
 * Split a TSX source into its string literals, skipping comments and regex
 * literals.
 *
 * Comments are skipped on purpose: a JSDoc `@example` mentioning
 * `motion-reduce:animate-none` must NOT satisfy the pairing requirement — only
 * a class that actually reaches the DOM counts.
 *
 * Template-literal interpolations (`${…}`) are blanked out rather than parsed;
 * no component builds a class string that way today, and if one ever does the
 * worst case is that the group splits early and the guard asks for a
 * counterpart it can already see.
 */
function extractStringLiterals(source: string): string[] {
  const literals: string[] = [];
  let i = 0;

  while (i < source.length) {
    const c = source[i];

    if (c === '/' && source[i + 1] === '/') {
      const nl = source.indexOf('\n', i);
      i = nl === -1 ? source.length : nl + 1;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    if (c === '/' && REGEX_ALLOWED_AFTER.test(source.slice(Math.max(0, i - 12), i))) {
      let j = i + 1;
      let inClass = false;
      while (j < source.length) {
        const d = source[j];
        if (d === '\\') j += 2;
        else if (d === '[') { inClass = true; j++; }
        else if (d === ']') { inClass = false; j++; }
        else if (d === '/' && !inClass) break;
        else if (d === '\n') break;
        else j++;
      }
      i = j + 1;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      let j = i + 1;
      let body = '';
      while (j < source.length) {
        const d = source[j];
        if (d === '\\') { body += ' '; j += 2; continue; }
        if (d === quote) break;
        // Unterminated single/double-quoted string — bail at the newline
        // rather than swallowing the rest of the file.
        if (d === '\n' && quote !== '`') break;
        body += d;
        j++;
      }
      literals.push(body.replace(/\$\{[\s\S]*?\}/g, ' '));
      i = j + 1;
      continue;
    }
    i++;
  }

  return literals;
}

/**
 * Pull every `animate-*` class out of a source file, grouped by the string
 * literal it lives in.
 *
 * **The grouping is the point.** A per-FILE check is not good enough: a
 * component with several independently-classed elements (drawer's `left` /
 * `right` / overlay, alert-dialog's overlay + content, modal's overlay +
 * content) would satisfy a file-wide check as soon as ONE element carried a
 * counterpart, and a newly added `side: 'top'` variant with no counterpart
 * would sail through green. Requiring the counterpart in the same class string
 * as the animation is what makes that fail.
 *
 * Tokens are split on whitespace only. Parens are deliberately preserved, so
 * the `animate-(--custom-prop)` form survives tokenisation intact.
 *
 * Known limitation, shared with `styles.test.ts`: the directory read is
 * non-recursive, so a component added under `src/components/<subdir>/` would
 * not be scanned. Kept consistent with the existing suite rather than
 * diverging; revisit if the flat layout ever changes.
 */
function extractClassGroups(file: string, source: string): ClassGroup[] {
  return extractStringLiterals(source).map((text) => {
    const tokenList = text.split(/\s+/).filter(Boolean);
    const usages: AnimationUsage[] = [];

    for (const token of tokenList) {
      // Must END in `animate-<name>` and the segment must start the class or
      // follow a variant colon — this skips e.g. `no-animate-foo`.
      //
      // Three animation forms are recognised, so a component cannot slip past
      // the guard by reaching for Tailwind v4's escape hatches:
      //   - named token      animate-fade-in
      //   - arbitrary value  animate-[wiggle_1s_ease-in-out]
      //   - custom property  animate-(--my-animation)
      // The latter two never match EXEMPT_ANIMATIONS, so they always require a
      // counterpart — deliberately strict.
      const match = /(?:^|:)animate-(\[[^\]]*\]|\(--[^)]*\)|[a-z][a-z0-9-]*)$/.exec(token);
      if (!match) continue;

      const animation = match[1];
      // `noUncheckedIndexedAccess` — the capture group is always present when
      // the regex matched, but narrow it explicitly rather than asserting.
      if (animation === undefined || EXEMPT_ANIMATIONS.has(animation)) continue;

      const prefix = token.slice(0, token.length - `animate-${animation}`.length);
      usages.push({
        file,
        className: token,
        prefix,
        animation,
        counterpart: `${prefix}motion-reduce:animate-none`,
      });
    }

    return { text, tokens: new Set(tokenList), usages };
  });
}

const scanned = componentFiles.map((file) => ({
  file,
  groups: extractClassGroups(file, readFileSync(join(componentsDir, file), 'utf-8')),
}));

const allUsages = scanned.flatMap((s) => s.groups.flatMap((g) => g.usages));

/**
 * Exact inventory of the entrance/exit animations the library ships, as
 * `<file>: <class>`.
 *
 * Pinned exactly rather than as a floor: a floor of "at least 20" would stay
 * green if a tokeniser regression silently stopped detecting a third of the
 * usages, which is precisely the quiet degradation this suite exists to
 * prevent. If you legitimately add or remove an animation, update this list in
 * the same commit — the diff is the point.
 */
const EXPECTED_ANIMATION_USAGES = [
  'accordion.tsx: data-[state=closed]:animate-accordion-up',
  'accordion.tsx: data-[state=open]:animate-accordion-down',
  'alert-dialog.tsx: data-[state=closed]:animate-fade-out',
  'alert-dialog.tsx: data-[state=closed]:animate-fade-out',
  'alert-dialog.tsx: data-[state=open]:animate-fade-in',
  'alert-dialog.tsx: data-[state=open]:animate-fade-in',
  'badge.tsx: animate-scale-in',
  'collapsible.tsx: data-[state=closed]:animate-accordion-up',
  'collapsible.tsx: data-[state=open]:animate-accordion-down',
  'combobox.tsx: data-[state=closed]:animate-fade-out',
  'combobox.tsx: data-[state=open]:animate-fade-in',
  'drawer.tsx: data-[state=closed]:animate-fade-out',
  'drawer.tsx: data-[state=closed]:animate-slide-out-to-left',
  'drawer.tsx: data-[state=closed]:animate-slide-out-to-right',
  'drawer.tsx: data-[state=open]:animate-fade-in',
  'drawer.tsx: data-[state=open]:animate-slide-in-from-left',
  'drawer.tsx: data-[state=open]:animate-slide-in-from-right',
  'dropdown-menu.tsx: data-[state=closed]:animate-fade-out',
  'dropdown-menu.tsx: data-[state=open]:animate-fade-in',
  'modal.tsx: data-[state=closed]:animate-fade-out',
  'modal.tsx: data-[state=closed]:animate-scale-out',
  'modal.tsx: data-[state=open]:animate-fade-in',
  'modal.tsx: data-[state=open]:animate-scale-in',
  'popover.tsx: data-[state=closed]:animate-fade-out',
  'popover.tsx: data-[state=open]:animate-fade-in',
  'select.tsx: data-[state=closed]:animate-scale-out',
  'select.tsx: data-[state=open]:animate-scale-in',
  'toast.tsx: data-[state=closed]:animate-fade-out',
  'toast.tsx: data-[state=open]:animate-slide-in-from-right',
  'toast.tsx: data-[swipe=end]:animate-slide-out-to-right',
  'tooltip.tsx: data-[state=closed]:animate-fade-out',
  'tooltip.tsx: data-[state=delayed-open]:animate-fade-in',
];

describe('every entrance/exit animation is paired with motion-reduce:animate-none', () => {
  // Sanity checks on the scan itself. Without these, a broken split or a
  // regex typo yields zero usages and every per-file assertion below passes
  // vacuously — the exact failure mode this suite exists to prevent.
  it('found component source files to scan', () => {
    expect(componentFiles.length).toBeGreaterThan(20);
  });

  // The scanner walks ALL ~91 components, not just the animated ones, and it
  // hand-parses strings/comments/regex literals. If it trips on a file it
  // simply yields fewer literals — silently, because a file with no animations
  // fires no assertion. `hero.tsx` in particular contains `replace(/"/g, …)`,
  // a regex holding an unbalanced quote. Assert every file yields something,
  // so a parse failure surfaces as a failure instead of as blindness.
  it('extracts class strings from every component file', () => {
    const empty = scanned.filter((s) => s.groups.length === 0).map((s) => s.file);

    expect(
      empty,
      'These component files yielded ZERO string literals. Every Nim component has at ' +
        'least one class string, so this means extractStringLiterals() bailed early on ' +
        'them — probably a regex literal, template literal, or escape it mis-parsed. ' +
        'Until it is fixed, any animation added to these files is invisible to this guard.'
    ).toEqual([]);
  });

  it('detects exactly the known inventory of entrance/exit animations', () => {
    const found = allUsages.map((u) => `${u.file}: ${u.className}`).sort();

    expect(
      found,
      'The set of detected animations drifted from EXPECTED_ANIMATION_USAGES.\n' +
        '- FEWER than expected usually means the tokeniser regressed and this suite is ' +
        'now passing vacuously over the ones it stopped seeing. Fix the scan.\n' +
        '- MORE (or different) means a component gained or changed an animation. That is ' +
        'fine — update the list in the same commit, deliberately, so the change is visible ' +
        'in review.'
    ).toEqual([...EXPECTED_ANIMATION_USAGES].sort());
  });

  it.each(componentFiles)('%s pairs each animate-* with a reduced-motion counterpart', (file) => {
    const entry = scanned.find((s) => s.file === file)!;

    // Scoped to the SAME class string, not the file. A counterpart on a
    // sibling element (drawer's `left` variant) must not excuse an animation
    // on this one (a newly added `top` variant).
    const missing = entry.groups.flatMap((group) =>
      group.usages
        .filter((u) => !group.tokens.has(u.counterpart))
        .map((u) => `${u.className} -> needs "${u.counterpart}" in the SAME class string`)
    );

    expect(
      missing,
      `${file} animates without honouring prefers-reduced-motion.\n` +
        'Add the counterpart class to the same class string as the animation. A counterpart ' +
        'elsewhere in the file does not count — each element gets its own class string, and ' +
        'a sibling variant cannot cover this one.\n' +
        'The variant prefix MUST match too: Tailwind compiles ' +
        '`data-[state=open]:animate-fade-in` to a (0,2,0) selector, so a bare ' +
        '`motion-reduce:animate-none` at (0,1,0) loses the cascade and the animation still ' +
        'plays for reduced-motion users.\n' +
        `Exempt by design: ${[...EXEMPT_ANIMATIONS].join(', ')}.`
    ).toEqual([]);
  });
});

/**
 * Turn a Tailwind class name into the selector Tailwind emits for it: every
 * character outside `[A-Za-z0-9_-]` is backslash-escaped, so
 * `data-[state=open]:motion-reduce:animate-none` becomes
 * `.data-\[state\=open\]\:motion-reduce\:animate-none`.
 */
function toSelector(className: string): string {
  return `.${className.replace(/[^A-Za-z0-9_-]/g, (c) => `\\${c}`)}`;
}

/**
 * Index of a top-level rule for `selector`, or -1. Guards against matching a
 * longer selector that merely starts with this one (`.animate-fade-in` must
 * not match inside `.animate-fade-in-fast`) and against matching the tail of
 * a longer one (the leading `.` already does that).
 */
function findSelectorIndex(css: string, selector: string): number {
  let searchFrom = 0;
  for (;;) {
    const idx = css.indexOf(selector, searchFrom);
    if (idx === -1) return -1;
    const nextChar = css[idx + selector.length];
    if (nextChar === undefined || !/[\w\\-]/.test(nextChar)) return idx;
    searchFrom = idx + selector.length;
  }
}

/**
 * Body of the rule starting at `idx`, matched with balanced braces.
 *
 * Tailwind v4 emits nested CSS (`.cls { &[data-state="open"] { @media … { … } } }`),
 * so slicing to the first `}` would truncate the rule and silently drop the
 * declaration we care about.
 */
function ruleBodyAt(css: string, idx: number): string {
  const braceStart = css.indexOf('{', idx);
  if (braceStart === -1) return '';
  let depth = 0;
  for (let i = braceStart; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(braceStart + 1, i);
    }
  }
  return '';
}

describe('dist/styles.css — the reduced-motion counterparts compile and win', () => {
  let distCss: string;
  /** Byte range of the single `@layer utilities { … }` block. */
  let utilitiesLayer: { start: number; end: number };

  beforeAll(() => {
    if (!existsSync(distStylesPath)) {
      throw new Error(
        `packages/ui/dist/styles.css does not exist at ${distStylesPath}.\n` +
          'This suite asserts against the BUILT stylesheet because Tailwind only emits ' +
          'utilities it finds in source, and jsdom never evaluates a media query — a ' +
          'class-string test cannot tell a working motion-reduce variant from a dead one. ' +
          'Run `pnpm --filter @nim-ui/components build` first.'
      );
    }
    distCss = readFileSync(distStylesPath, 'utf-8');

    // The source-order comparison below is only meaningful if both rules live
    // in the SAME cascade layer — layer order outranks source order, so if
    // Tailwind ever emitted them into different layers the byte comparison
    // would keep passing while meaning nothing.
    const start = distCss.indexOf('@layer utilities {');
    if (start === -1) {
      throw new Error(
        'No `@layer utilities` block in dist/styles.css. The compiled output changed shape; ' +
          'the source-order assertions in this suite assume both rules share one layer and ' +
          'must be re-derived before they can be trusted.'
      );
    }
    // `end` is the offset of the layer's closing brace: body starts one char
    // after the opening `{`, so brace + 1 + body length lands exactly on it.
    const braceStart = distCss.indexOf('{', start);
    utilitiesLayer = { start, end: braceStart + 1 + ruleBodyAt(distCss, start).length };
  });

  // De-duplicate: the same pair (e.g. data-[state=open]:animate-fade-in) is
  // used by several components but compiles to exactly one rule.
  const uniquePairs = [...new Map(allUsages.map((u) => [u.className, u])).values()].sort((a, b) =>
    a.className.localeCompare(b.className)
  );

  it('has pairs to assert against', () => {
    expect(uniquePairs.length).toBeGreaterThanOrEqual(10);
  });

  // Titled by the ANIMATED class, not the counterpart: several animations
  // share one counterpart (every `data-[state=open]:animate-*` maps to
  // `data-[state=open]:motion-reduce:animate-none`), and identically-titled
  // failures are unreadable.
  it.each(uniquePairs.map((p) => [p.className, p] as const))(
    '%s is switched off under prefers-reduced-motion by a rule that wins',
    (_name, pair) => {
      const selector = toSelector(pair.counterpart);
      const idx = findSelectorIndex(distCss, selector);

      expect(
        idx,
        `No compiled rule for ${selector} in dist/styles.css (used by ${pair.file}). ` +
          'The class name exists in source but Tailwind generated nothing for it — it is ' +
          'a dead class and reduced-motion users still get the animation. Rebuild with ' +
          '`pnpm --filter @nim-ui/components build`; if it is still missing, the variant ' +
          'chain is malformed.'
      ).toBeGreaterThan(-1);

      const body = ruleBodyAt(distCss, idx);
      expect(body, `${selector} compiled to an empty rule body.`).toMatch(
        /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/
      );
      expect(body, `${selector} does not actually switch the animation off.`).toMatch(
        /animation:\s*none/
      );

      // Both rules land on the same specificity, so SOURCE ORDER decides the
      // winner. Assert it: if a future Tailwind release reorders its variants,
      // the fix silently reverts and every string-level test stays green.
      const animatedIdx = findSelectorIndex(distCss, toSelector(pair.className));
      expect(
        animatedIdx,
        `No compiled rule for ${toSelector(pair.className)} — the scan and the build disagree.`
      ).toBeGreaterThan(-1);

      // Comparing byte offsets only decides the cascade if both rules are in
      // the same layer; a layered rule loses to an unlayered one regardless of
      // order, and an earlier layer loses to a later one.
      for (const [label, at] of [
        [selector, idx],
        [toSelector(pair.className), animatedIdx],
      ] as const) {
        expect(
          at > utilitiesLayer.start && at < utilitiesLayer.end,
          `${label} is emitted OUTSIDE the @layer utilities block ` +
            `(offset ${at}, layer spans ${utilitiesLayer.start}-${utilitiesLayer.end}). ` +
            'Cascade layers outrank source order, so the byte comparison below no longer ' +
            'proves which rule wins.'
        ).toBe(true);
      }

      expect(
        idx,
        `${selector} is emitted BEFORE ${toSelector(pair.className)} in dist/styles.css. ` +
          'Both selectors have the same specificity and share a cascade layer, so the ' +
          'earlier one loses and the animation still plays under prefers-reduced-motion.'
      ).toBeGreaterThan(animatedIdx);
    }
  );
});
