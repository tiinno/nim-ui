import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Guards the kit's hover-while-`aria-disabled` contract: a button that is
 * marked `aria-disabled` must not change colour under the pointer.
 *
 * `Button`'s `loading` state is deliberately **not** natively disabled (WCAG 2.2
 * SC 2.4.3 — a native `disabled` drops keyboard focus to `<body>` on the very
 * interaction that triggered it), and the aria-disabled case just as
 * deliberately keeps its pointer events, so that a click meant for the loading
 * button cannot pass *through* to whatever sits underneath. Both decisions
 * together mean `:hover` still matches on a loading button — so every
 * `hover:<colour>` in `buttonVariants` needs a counterpart that puts the
 * variant's RESTING colour back while `[aria-disabled="true"]`, or the colour
 * says "clickable" while `cursor-not-allowed` says the opposite.
 *
 * Two independent halves, because either one alone passes vacuously:
 *
 * 1. **Source scan** — every `hover:` colour utility in a `buttonVariants`
 *    variant string must be paired, in the same string and with the same
 *    variant prefix, by an `aria-disabled:hover:` counterpart naming that
 *    string's resting utility for the same property. This is what makes a
 *    future variant that forgets it fail CI.
 *
 * 2. **Compiled-CSS assertion** — each counterpart must emit a real rule in
 *    `dist/styles.css` whose declarations are identical to the resting
 *    utility's, gated on `[aria-disabled="true"]:hover`. Tailwind only emits
 *    utilities it actually finds and jsdom never evaluates a hover, so a
 *    class-string test proves nothing about the compiled result — NIMUI-30
 *    shipped 43 class names that compiled to nothing while every class-string
 *    test stayed green.
 *
 * ## Why "restore the resting colour" and not `not-aria-disabled:hover:`
 *
 * Tailwind v4's `not-*` variant does compile — `not-aria-disabled:hover:bg-x`
 * becomes `.cls:not(*[aria-disabled="true"]):hover`. But that is specificity
 * (0,3,0) for the **enabled** hover, up from (0,2,0), which changes cascade
 * outcomes that have nothing to do with loading:
 *
 * - `calendar.tsx` overrides the composed ghost hover with
 *   `[&>button]:hover:bg-primary-700` → `.cls > button:hover`, only (0,2,1).
 *   The rewritten ghost hover would outrank it and a selected day would go grey.
 * - `tailwind-merge` keys on the modifier set, so `not-aria-disabled:hover:bg-*`
 *   no longer conflicts with a consumer's `hover:bg-*`; both would survive and
 *   the library's higher-specificity rule would win.
 *
 * The counterpart form is purely additive: every new rule is gated on the
 * attribute, so the enabled path's cascade is unchanged.
 *
 * ## Why the counterpart wins
 *
 * `.aria-disabled\:hover\:bg-x[aria-disabled="true"]:hover` is (0,3,0) against
 * the plain `.hover\:bg-y:hover` at (0,2,0), so it wins on specificity alone.
 * The one pair that ties is light-vs-dark — `dark:` is a `:where()` custom
 * variant and contributes no specificity — so the dark counterpart must also be
 * emitted *later* than the light one. That is asserted against the built
 * artifact below rather than assumed.
 *
 * ## Why this file names no counterpart class as a literal
 *
 * Tailwind scans test files too. A literal `aria-disabled:hover:bg-*` written
 * anywhere here would compile a real rule into `dist/styles.css` even after
 * `button.tsx` stopped emitting the class — and half 2 would then pass over a
 * reverted fix. Every counterpart name below is assembled at runtime from the
 * resting utility the scan found in `button.tsx`, so it is invisible to the
 * scanner and cannot outlive the source.
 *
 * ## Why the scope is `buttonVariants` and not every component
 *
 * A repo-wide hover scan would flag hundreds of legitimate hovers (calendar's
 * own `hover:opacity-100`, every menu item) that ship no aria-disabled
 * contract at all. `buttonVariants` is the only class factory in the kit that
 * does ship one — `aria-disabled:opacity-50 aria-disabled:cursor-not-allowed
 * aria-disabled:active:scale-100` — and it is composed by five other
 * components (`calendar`, `date-picker`, `date-time-picker`, `time-picker`,
 * `pagination`), so the contract reaches them from here.
 */

const buttonSourcePath = resolve(__dirname, 'components/button.tsx');
const distStylesPath = resolve(__dirname, '../dist/styles.css');

/** Colour-bearing utility namespaces a variant string can hover-swap. */
const COLOUR_PROPERTIES = ['bg', 'text', 'border'] as const;
type ColourProperty = (typeof COLOUR_PROPERTIES)[number];

/**
 * The six variants `buttonVariants` ships, pinned by name.
 *
 * A seventh variant added in the usual one-line form is caught by this list; one
 * added in a form the scanner cannot read (value on its own line, a template
 * literal, a concatenation) is caught by the literal-count check, which requires
 * every string literal in the `variant` block to belong to a named entry.
 */
const EXPECTED_VARIANT_NAMES = [
  'default',
  'destructive',
  'ghost',
  'outline',
  'primary',
  'secondary',
];

/**
 * Exact inventory of the hover-time colour swaps the six variants apply, as
 * `<variant>: <class>`.
 *
 * Pinned exactly rather than as a floor, for the same reason
 * `motion-reduce.test.ts` pins its animations: a floor of "at least 10" would
 * stay green if the tokeniser silently stopped seeing a third of them, which is
 * precisely the quiet degradation this suite exists to prevent. If you
 * legitimately add or change a hover, update this list in the same commit — the
 * diff is the point.
 *
 * Only *live* class names appear here. The counterparts are derived, never
 * written (see the file docblock).
 */
const EXPECTED_HOVER_USAGES = [
  'default: dark:hover:bg-white',
  'default: hover:bg-neutral-800',
  'destructive: dark:hover:bg-error-200',
  'destructive: hover:bg-error-800',
  'ghost: dark:hover:bg-neutral-900',
  'ghost: dark:hover:text-neutral-50',
  'ghost: hover:bg-neutral-100',
  'ghost: hover:text-neutral-950',
  'outline: dark:hover:bg-neutral-900',
  'outline: dark:hover:border-neutral-700',
  'outline: hover:bg-neutral-50',
  'outline: hover:border-neutral-300',
  'primary: dark:hover:bg-white',
  'primary: hover:bg-neutral-800',
  'secondary: dark:hover:bg-neutral-700',
  'secondary: hover:bg-neutral-200',
];

// ---------------------------------------------------------------------------
// Source scan
// ---------------------------------------------------------------------------

/**
 * Strip `//` and block comments while respecting string literals.
 *
 * Both directions matter here. Comments must go, because the JSDoc above
 * `buttonVariants` discusses `aria-disabled:*` in prose and a scan that counted
 * prose would let a variant satisfy the pairing without shipping the class.
 * Strings must be respected, because `button.tsx` contains
 * `xmlns="http://www.w3.org/2000/svg"` — a naive stripper reads `//www.w3.org`
 * as a line comment and eats the rest of the line.
 */
function stripComments(source: string): string {
  let out = '';
  let i = 0;

  while (i < source.length) {
    const c = source[i];

    if (c === '/' && source[i + 1] === '/') {
      const nl = source.indexOf('\n', i);
      i = nl === -1 ? source.length : nl;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === '\\') { j += 2; continue; }
        if (source[j] === quote) break;
        if (source[j] === '\n' && quote !== '`') break;
        j++;
      }
      out += source.slice(i, Math.min(j + 1, source.length));
      i = j + 1;
      continue;
    }

    out += c;
    i++;
  }

  return out;
}

/** Every string literal in `source`, as its raw contents. */
function stringLiterals(source: string): string[] {
  const literals: string[] = [];
  let i = 0;

  while (i < source.length) {
    const c = source[i];
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      let j = i + 1;
      let body = '';
      while (j < source.length) {
        if (source[j] === '\\') { body += ' '; j += 2; continue; }
        if (source[j] === quote) break;
        if (source[j] === '\n' && quote !== '`') break;
        body += source[j];
        j++;
      }
      literals.push(body);
      i = j + 1;
      continue;
    }
    i++;
  }

  return literals;
}

/** Contents of the balanced `{ … }` block that starts at or after `from`. */
function balancedBlock(source: string, from: number): string {
  const start = source.indexOf('{', from);
  if (start === -1) return '';
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(start + 1, i);
    }
  }
  return '';
}

const buttonSource = stripComments(readFileSync(buttonSourcePath, 'utf-8'));

/** The `variant: { … }` block inside the `cva` call — the six variant strings. */
const variantBlock = (() => {
  const cvaAt = buttonSource.indexOf('cva(');
  if (cvaAt === -1) return '';
  const variantAt = buttonSource.indexOf('variant:', cvaAt);
  if (variantAt === -1) return '';
  return balancedBlock(buttonSource, variantAt);
})();

/** The `cva` base string — shared by every variant. */
const baseClassString = (() => {
  const cvaAt = buttonSource.indexOf('cva(');
  if (cvaAt === -1) return '';
  return stringLiterals(buttonSource.slice(cvaAt))[0] ?? '';
})();

interface VariantEntry {
  name: string;
  classString: string;
  tokens: string[];
}

const variantEntries: VariantEntry[] = [
  ...variantBlock.matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:\s*'([^']*)'\s*,?\s*$/gm),
].map((m) => ({
  name: m[1] as string,
  classString: m[2] as string,
  tokens: (m[2] as string).split(/\s+/).filter(Boolean),
}));

interface HoverUsage {
  /** Variant the class belongs to, e.g. `ghost`. */
  variant: string;
  /** The hover class as written, e.g. `dark:hover:bg-neutral-900`. */
  className: string;
  /** Whether the class is scoped to dark mode. */
  dark: boolean;
  /** Utility namespace being swapped. */
  property: ColourProperty;
  /** The resting class the variant applies for that property, e.g. `dark:bg-neutral-800`. */
  resting: string;
  /** The class that must accompany it — assembled, never written literally. */
  counterpart: string;
}

/** Resting (unmodified) utilities for `property` in one class string. */
function restingCandidates(tokens: string[], property: ColourProperty, dark: boolean): string[] {
  const pattern = new RegExp(`^${dark ? 'dark:' : ''}${property}-[^:]+$`);
  return tokens.filter((t) => pattern.test(t) && (dark || !t.startsWith('dark:')));
}

interface Derivation {
  usages: HoverUsage[];
  /** Hover classes whose resting utility could not be resolved unambiguously. */
  unresolved: string[];
}

/**
 * Derive, for every hover colour in a variant string, the counterpart that must
 * accompany it.
 *
 * The rule is mechanical and leaves no room for a wrong value: the counterpart
 * re-applies the *same string's* resting utility for the *same property* under
 * `aria-disabled:hover:`, carrying the hover class's own `dark:` prefix. A dark
 * hover with no dark resting utility falls back to the light resting one —
 * `ghost` is transparent in both themes and declares that once.
 */
function deriveUsages(entry: VariantEntry): Derivation {
  const usages: HoverUsage[] = [];
  const unresolved: string[] = [];

  for (const token of entry.tokens) {
    const match = /^(dark:)?hover:(bg|text|border)-[^:]+$/.exec(token);
    if (!match) continue;

    const dark = match[1] !== undefined;
    const property = match[2] as ColourProperty;

    let candidates = restingCandidates(entry.tokens, property, dark);
    if (dark && candidates.length === 0) {
      candidates = restingCandidates(entry.tokens, property, false);
    }
    if (candidates.length !== 1) {
      unresolved.push(
        `${token} -> ${candidates.length} resting ${property}-* utilities in the same class ` +
          `string (${candidates.join(', ') || 'none'}); expected exactly 1`
      );
      continue;
    }

    const resting = candidates[0] as string;
    const restingUtility = resting.replace(/^dark:/, '');

    usages.push({
      variant: entry.name,
      className: token,
      dark,
      property,
      resting,
      // Assembled from parts on purpose — see the file docblock.
      counterpart: [...(dark ? ['dark'] : []), 'aria-disabled', 'hover', restingUtility].join(':'),
    });
  }

  return { usages, unresolved };
}

const derivations = new Map(variantEntries.map((e) => [e.name, deriveUsages(e)]));
const allUsages = variantEntries.flatMap((e) => derivations.get(e.name)?.usages ?? []);

describe('buttonVariants — every hover colour has an aria-disabled counterpart', () => {
  // Sanity checks on the scan itself. Without these, a parser regression yields
  // zero variants and every assertion below passes vacuously — the exact
  // failure mode this suite exists to prevent.
  it('finds the variant block in button.tsx', () => {
    expect(
      variantBlock.length,
      `Could not locate the \`variant: { … }\` block inside the cva call in ${buttonSourcePath}. ` +
        'The scan below is blind until this is fixed.'
    ).toBeGreaterThan(200);
  });

  it('reads exactly the known variant names', () => {
    expect(variantEntries.map((e) => e.name).sort()).toEqual([...EXPECTED_VARIANT_NAMES].sort());
  });

  it('accounts for every string literal in the variant block', () => {
    const literals = stringLiterals(variantBlock);

    expect(
      literals.length,
      'Found string literals in the `variant` block that no named entry claims. A variant ' +
        'whose value the line-based scan cannot read (value on its own line, a template ' +
        'literal, a concatenation) is invisible to this guard — reformat it to one line, or ' +
        'teach the scanner to read it.'
    ).toBe(variantEntries.length);
  });

  it('resolves a resting utility for every hover colour it found', () => {
    const unresolved = variantEntries.flatMap((e) => derivations.get(e.name)?.unresolved ?? []);

    expect(
      unresolved,
      'The counterpart for these hover classes cannot be derived, so they are NOT guarded. ' +
        'Each hover colour needs exactly one unmodified resting utility for the same property ' +
        'in the same class string; that resting value is what the counterpart restores.'
    ).toEqual([]);
  });

  it('detects exactly the known inventory of hover colour swaps', () => {
    const found = allUsages.map((u) => `${u.variant}: ${u.className}`).sort();

    expect(
      found,
      'The set of detected hover colours drifted from EXPECTED_HOVER_USAGES.\n' +
        '- FEWER than expected usually means the tokeniser regressed and this suite is now ' +
        'passing vacuously over the ones it stopped seeing. Fix the scan.\n' +
        '- MORE (or different) means a variant gained or changed a hover colour. That is ' +
        'fine — update the list in the same commit, deliberately, so the change is visible ' +
        'in review.'
    ).toEqual([...EXPECTED_HOVER_USAGES].sort());
  });

  // The base string is shared by all six variants, so a hover colour added
  // there has no single resting value to restore and the derivation above
  // cannot see it. Keep colour in the variants.
  it('keeps hover colours out of the shared base string', () => {
    const offenders = baseClassString
      .split(/\s+/)
      .filter((t) => /^(dark:)?hover:(bg|text|border)-/.test(t));

    expect(
      offenders,
      'The cva base string applies a hover colour. It is shared by all six variants, so ' +
        'there is no single resting colour to put back while aria-disabled — declare the ' +
        'hover in the variant strings instead, where this guard can pair it.'
    ).toEqual([]);
  });

  it.each(EXPECTED_VARIANT_NAMES)('%s pairs each hover colour with a counterpart', (name) => {
    const entry = variantEntries.find((e) => e.name === name);
    expect(entry, `No variant named ${name} was scanned.`).toBeDefined();

    const tokens = new Set(entry!.tokens);
    const missing = (derivations.get(name)?.usages ?? [])
      .filter((u) => !tokens.has(u.counterpart))
      .map(
        (u) =>
          `${u.className} -> needs the "${u.resting}" utility re-applied under ` +
          `${u.dark ? 'dark + ' : ''}aria-disabled:hover: in the SAME class string`
      );

    expect(
      missing,
      `The ${name} variant lightens (or re-tints) on hover while aria-disabled.\n` +
        'A loading Button is aria-disabled but NOT natively disabled and keeps its pointer ' +
        'events on purpose, so `:hover` still matches: the colour would say "clickable" while ' +
        '`cursor-not-allowed` says the opposite.\n' +
        "Add the variant's own resting utility back under `aria-disabled:hover:` (with the " +
        'same `dark:` prefix as the hover class it answers). Do NOT reach for the `not-*` ' +
        'variant instead — it raises the ENABLED hover to (0,3,0) and silently outranks ' +
        "calendar's `[&>button]:hover:*` override and any consumer className."
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Compiled CSS
// ---------------------------------------------------------------------------

/**
 * Turn a Tailwind class name into the selector Tailwind emits for it: every
 * character outside `[A-Za-z0-9_-]` is backslash-escaped.
 */
function toSelector(className: string): string {
  return `.${className.replace(/[^A-Za-z0-9_-]/g, (c) => `\\${c}`)}`;
}

/**
 * Index of a top-level rule for `selector`, or -1. Guards against matching a
 * longer selector that merely starts with this one (`.bg-white` must not match
 * inside `.bg-white\/70`).
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
 * Body of the rule starting at `idx`, matched with balanced braces. Tailwind v4
 * emits nested CSS, so slicing to the first `}` would truncate the rule.
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

/**
 * Every `property: value` declaration in a rule body, at any nesting depth.
 *
 * Comparing declarations rather than raw text is what lets a counterpart be
 * checked against its resting utility: the two rules nest differently (one is
 * wrapped in `&[aria-disabled="true"] { &:hover { @media … } }`) but must set
 * exactly the same values. The `;` terminator keeps `@media (hover: hover)` and
 * `@supports (color: color-mix(…))` out — they are conditions, not values.
 */
function declarations(body: string): string[] {
  const out: string[] = [];
  const re = /(?:^|[;{}])\s*([-a-z]+)\s*:\s*([^;{}]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push(`${m[1]}: ${(m[2] as string).trim().replace(/\s+/g, ' ')}`);
  }
  return out;
}

describe('dist/styles.css — the aria-disabled counterparts compile and win', () => {
  let distCss: string;
  /** Byte range of the single `@layer utilities { … }` block. */
  let utilitiesLayer: { start: number; end: number };

  beforeAll(() => {
    if (!existsSync(distStylesPath)) {
      throw new Error(
        `packages/ui/dist/styles.css does not exist at ${distStylesPath}.\n` +
          'This suite asserts against the BUILT stylesheet because Tailwind only emits ' +
          'utilities it finds in source, and jsdom never evaluates a hover — a class-string ' +
          'test cannot tell a working counterpart from a dead class name. Run ' +
          '`pnpm --filter @nim-ui/components build` first.'
      );
    }
    distCss = readFileSync(distStylesPath, 'utf-8');

    // The source-order comparison below is only meaningful if the rules share a
    // cascade layer — layer order outranks source order, so if Tailwind ever
    // emitted them into different layers the byte comparison would keep passing
    // while meaning nothing.
    const start = distCss.indexOf('@layer utilities {');
    if (start === -1) {
      throw new Error(
        'No `@layer utilities` block in dist/styles.css. The compiled output changed shape; ' +
          'the source-order assertions in this suite assume the rules share one layer and ' +
          'must be re-derived before they can be trusted.'
      );
    }
    const braceStart = distCss.indexOf('{', start);
    utilitiesLayer = { start, end: braceStart + 1 + ruleBodyAt(distCss, start).length };
  });

  // `primary` and `default` are the same string, so their counterparts compile
  // to one rule each.
  const uniqueUsages = [...new Map(allUsages.map((u) => [u.className, u])).values()].sort((a, b) =>
    a.className.localeCompare(b.className)
  );

  it('has counterparts to assert against', () => {
    expect(uniqueUsages.length).toBeGreaterThanOrEqual(10);
  });

  it.each(uniqueUsages.map((u) => [`${u.variant}: ${u.className}`, u] as const))(
    '%s is neutralised while aria-disabled by a rule that wins',
    (_name, usage) => {
      const selector = toSelector(usage.counterpart);
      const idx = findSelectorIndex(distCss, selector);

      expect(
        idx,
        `No compiled rule for the counterpart to ${usage.className} (${usage.variant}). ` +
          'The class name exists in source but Tailwind generated nothing for it — it is a ' +
          'dead class and a loading button still changes colour under the pointer. Rebuild ' +
          'with `pnpm --filter @nim-ui/components build`; if it is still missing, the variant ' +
          'chain is malformed.'
      ).toBeGreaterThan(-1);

      const body = ruleBodyAt(distCss, idx);

      // The attribute gate is also the specificity argument: it is what takes
      // the counterpart to (0,3,0) against the plain hover's (0,2,0).
      expect(body, `${selector} compiled without its aria-disabled gate.`).toContain(
        '[aria-disabled="true"]'
      );
      expect(body, `${selector} compiled without a :hover gate.`).toContain(':hover');

      // The counterpart must restore EXACTLY the resting colour — not merely
      // some colour. Compared against the resting utility's own compiled rule
      // so no value is hardcoded here.
      const restingIdx = findSelectorIndex(distCss, toSelector(usage.resting));
      expect(
        restingIdx,
        `No compiled rule for ${toSelector(usage.resting)} — the scan and the build disagree.`
      ).toBeGreaterThan(-1);

      expect(
        declarations(body),
        `The counterpart to ${usage.className} does not restore what "${usage.resting}" sets. ` +
          'While aria-disabled the button must look exactly as it does at rest.'
      ).toEqual(declarations(ruleBodyAt(distCss, restingIdx)));

      // Specificity already decides this pair, but assert the order too: if a
      // future Tailwind release reorders its variants, a silent revert here
      // would leave every class-string test green.
      const hoverIdx = findSelectorIndex(distCss, toSelector(usage.className));
      expect(
        hoverIdx,
        `No compiled rule for ${toSelector(usage.className)} — the scan and the build disagree.`
      ).toBeGreaterThan(-1);

      for (const [label, at] of [
        [selector, idx],
        [toSelector(usage.className), hoverIdx],
      ] as const) {
        expect(
          at > utilitiesLayer.start && at < utilitiesLayer.end,
          `${label} is emitted OUTSIDE the @layer utilities block ` +
            `(offset ${at}, layer spans ${utilitiesLayer.start}-${utilitiesLayer.end}). ` +
            'Cascade layers outrank source order, so the byte comparisons in this suite no ' +
            'longer prove which rule wins.'
        ).toBe(true);
      }

      expect(
        idx,
        `${selector} is emitted BEFORE ${toSelector(usage.className)} in dist/styles.css.`
      ).toBeGreaterThan(hoverIdx);
    }
  );

  // The one pair that does NOT separate on specificity: `dark:` is a `:where()`
  // custom variant and contributes nothing, so light and dark counterparts both
  // land on (0,3,0) and only source order decides. If the light one won, a dark
  // loading button would show its LIGHT resting colour under the pointer.
  it.each(
    [
      ...new Map(
        allUsages
          .filter((u) => u.dark)
          .map((u) => [`${u.variant}:${u.property}`, u] as const)
      ).values(),
    ].map((u) => [`${u.variant}: ${u.className}`, u] as const)
  )('%s beats its light-mode counterpart in source order', (_name, usage) => {
    const light = allUsages.find(
      (u) => u.variant === usage.variant && u.property === usage.property && !u.dark
    );

    expect(
      light,
      `No light-mode hover for ${usage.variant}/${usage.property}, so nothing can be ordered ` +
        'against. Every colour utility in this kit needs its dark: counterpart and vice versa.'
    ).toBeDefined();

    // `ghost` restores `bg-transparent` in both themes: one class, one rule,
    // nothing to order.
    if (light!.counterpart === usage.counterpart) return;

    const darkIdx = findSelectorIndex(distCss, toSelector(usage.counterpart));
    const lightIdx = findSelectorIndex(distCss, toSelector(light!.counterpart));

    expect(darkIdx, `No compiled rule for the dark counterpart to ${usage.className}.`).toBeGreaterThan(-1);
    expect(lightIdx, `No compiled rule for the light counterpart to ${light!.className}.`).toBeGreaterThan(-1);

    expect(
      darkIdx,
      `The dark counterpart for ${usage.variant}/${usage.property} is emitted BEFORE the light ` +
        'one. Both are (0,3,0) — `dark:` compiles to a zero-specificity `:where()` — so the ' +
        'later rule wins, and a dark loading button would show the LIGHT resting colour on hover.'
    ).toBeGreaterThan(lightIdx);
  });
});
