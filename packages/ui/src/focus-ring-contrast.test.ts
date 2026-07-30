import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { extractStringLiterals, toSelector, findSelectorIndex, ruleBodyAt } from './test/class-scan';

/**
 * Guards WCAG 2.2 SC 1.4.11 for the kit's focus indicator: the ring (and the
 * focus border on the three text controls) must reach 3:1 against the surface
 * it is painted on, in BOTH themes.
 *
 * ## The defect this exists to prevent coming back (NIMUI-51)
 *
 * The design contract used to mandate a single steel step for every focus
 * indicator. Measured on painted sRGB bytes, that step reaches 2.84:1 on white,
 * 2.72:1 on the 50 surface and 2.61:1 on the 100 surface — three failures on the
 * lightest and most common backgrounds in the kit. The obvious repair, moving
 * one step down the scale, trades the light failure for a dark one: the darker
 * step reaches only 2.86:1 against the 800 surface that 53 component files paint
 * on.
 *
 * **No single step in the scale clears 3:1 on both light and dark surfaces.**
 * The indicator is therefore a PAIR — a light-mode colour and a dark-mode
 * counterpart — which is what the rest of the design contract has always
 * demanded of every colour utility anyway. This suite is the machine-checkable
 * form of that sentence.
 *
 * ## Four independent halves, because each alone passes vacuously
 *
 * 1. **Source scan** — every focus-indicator colour in a component class string
 *    must be paired, in the SAME string, by a dark-mode counterpart for the same
 *    variant and the same property. This is what makes a future edit that drops
 *    the dark half (or a new component that ships only the light one) fail CI.
 *    A `toHaveClass` assertion in a component test cannot do this: it only knows
 *    about the components someone remembered to write it for.
 *
 * 2. **Compiled binding** — each half must emit a real rule in `dist/styles.css`
 *    that binds its colour property to the token the arithmetic below then
 *    measures. Without this the arithmetic could keep passing over a renamed or
 *    dead class, proving a ratio about a colour nothing paints. jsdom never
 *    computes a colour, and Tailwind only emits utilities it finds in source, so
 *    a class-string test proves nothing about the compiled result — NIMUI-30
 *    shipped 43 class names that compiled to nothing while every class-string
 *    test stayed green.
 *
 * 3. **Contrast arithmetic** — the token each half actually binds to, converted
 *    OKLCH → sRGB → relative luminance in plain arithmetic, must reach 3:1
 *    against a list of surfaces. The shade is never hardcoded here: it is read
 *    back out of the compiled rule, so this measures whatever the kit really
 *    ships rather than whatever this file expected it to.
 *
 * 4. **Source order** — the decisive one, and the reason a passing
 *    `toHaveClass` is not evidence. The dark variant compiles to
 *    `&:where(.dark, …)`, and `:where()` contributes ZERO specificity, so the
 *    light rule and the dark rule are both (0,2,0) and BOTH match a focused
 *    element inside a dark tree. Only source order separates them. If a future
 *    Tailwind release sorted the light rule last, dark mode would silently paint
 *    the light-mode colour — 2.86:1 on the 800 surface — and every other
 *    assertion in this repo would stay green. So the emitted offsets are
 *    compared directly, inside the one `@layer utilities` block (cascade layers
 *    outrank source order, so a rule emitted elsewhere would make the comparison
 *    meaningless).
 *
 * ## What this does NOT cover — read before trusting it
 *
 * **The surface lists are hand-maintained, and they are the weak half.** CSS
 * cannot tell you which background an indicator is painted on: the ring belongs
 * to the focused element, the background belongs to whatever ancestor happens to
 * paint one, and a consumer can put any of the 91 components on any surface they
 * like. So `LIGHT_SURFACES` / `DARK_SURFACES` below are a judgement about where
 * this kit's components realistically sit — the page, the card, the tab strip,
 * the dark panel — not a fact derived from the stylesheet. A component dropped
 * onto a mid-scale background (the 300–600 steps) is outside what this measures,
 * and so is any consumer surface. Widen the lists deliberately when that
 * changes; do not read a green run as "the ring passes everywhere".
 *
 * **The pairing is per class string, and two strings that MERGE are invisible
 * to it.** A colour declared in a `cva` base and a different colour for the same
 * property in one of its variants combine on the rendered element, but they live
 * in separate literals, so each is judged alone. tailwind-merge would drop the
 * light half and leave the dark one alive — light in one theme, steel in the
 * other. Nothing hits this today: no `cva` in the kit declares a focus colour in
 * both its base and a variant (the bases that carry one — checkbox, copy-button,
 * link, radio, resizable, select, sidebar-nav, slider, switch, tabs — carry
 * complete pairs and no variant colour, and button/input/textarea keep theirs in
 * mutually exclusive variants). Re-check that if a component ever splits one.
 *
 * A second gap: this measures the indicator against its BACKGROUND. It says
 * nothing about the offset band drawn between the two, which defaults to opaque
 * white and is wrong in dark mode on most components (NIMUI-52). That is a
 * separate defect with a separate fix; the outer edge of the ring meets the page
 * directly, which is the boundary SC 1.4.11 needs, so it is not this one.
 *
 * ## Why the class names here are assembled rather than written
 *
 * Tailwind's automatic source detection scans `.test.ts` files as text. A
 * literal class name written anywhere in this file would compile a real rule
 * into `dist/styles.css` and would keep BOTH that rule and its vouching source
 * alive after the components stopped shipping it — so half 2 would pass over a
 * reverted fix, and `compiled-utility-inventory.test.ts` would see a used rule
 * rather than an arrival. Every class name below is therefore joined together at
 * runtime from fragments that name no utility on their own, and the two property
 * namespaces carry the `~` marker this package uses for exactly that purpose.
 */

const distStylesPath = resolve(__dirname, '../dist/styles.css');
const componentsDir = resolve(__dirname, 'components');

/** Inserted mid-name, so a fragment here cannot be a Tailwind candidate. */
const SENTINEL = '~';

/**
 * The variants under which a colour in this kit is a FOCUS INDICATOR rather than
 * decoration. Bare, so none of them names a utility on its own.
 *
 * The middle two are not stylistic: a dropzone and a chip field put the
 * indicator on a wrapper whose real focus target is a descendant input, and the
 * tree rows move it onto the row `div` because the focusable node is the row's
 * parent. They are the same contract and fail the same way, so they are scanned
 * the same way.
 *
 * The last one is Card's (NIMUI-50). Its focus target is the stretched anchor
 * inside the card, and the indicator is drawn around the card — so the variant
 * is a relational one, and it is the kit's first. It is listed here for the same
 * reason as the others, and for one more: an arbitrary variant with a typo in it
 * compiles to NOTHING, silently, and every class-string assertion stays green.
 * The compiled-binding half below is what catches that.
 */
const FOCUS_VARIANTS = [
  'focus-visible',
  'focus-within',
  '[&:focus-visible>div]',
  'has-[[data-card-link]:focus-visible]',
];

/** The dark-mode variant, as the design contract spells it. */
const DARK = 'dark';

/**
 * Colour-bearing namespaces a focus indicator uses, encoded.
 *
 * The third arrived with NIMUI-50. A shadow ring paints its offset band in an
 * OPAQUE colour, and the kit leaves that colour at its white default — a 2px
 * sliver at a control's scale, a bright halo when it is traced around a whole
 * card in dark mode. Card therefore draws its indicator with outline-width and
 * outline-color, whose offset gap is transparent. The contrast requirement is
 * identical, so it is measured here identically.
 */
const ENCODED_PROPERTIES = ['r~ing', 'b~order', 'o~utline'];

/** The theme colour scales, so a width like the offset utility is not read as a colour. */
const SCALES = ['primary', 'neutral', 'success', 'error', 'warning', 'info'];

/** Strip the marker to recover the real namespace. */
const decode = (encoded: string): string => encoded.replace(SENTINEL, '');

/**
 * Focus indicators that ship ONE colour for both themes today, pinned.
 *
 * These are outside NIMUI-51, which repaired the steel indicator the design
 * contract mandates. They are recorded here rather than quietly filtered out,
 * because a filter would also hide the next one to arrive. Ratios measured the
 * same way this file measures everything else.
 *
 * Encoded for the same reason `compiled-utility-inventory.test.ts` encodes its
 * pin: an entry written plainly is a live Tailwind candidate, so the pin would
 * keep compiling the very class it merely tolerates after the component stopped
 * shipping it.
 */
const KNOWN_UNPAIRED = [
  // The WORST one, and the reason this pin is a list rather than a filter.
  // Three of Button's six variants take a much lighter steel step than the one
  // the contract mandates: 1.79 on white, 1.71 on the 50 surface, 1.64 on the
  // 100 surface, 1.42 on the 200 surface. That is a bigger SC 1.4.11 gap than
  // the one NIMUI-51 repaired, and repairing it changes how three shipped
  // Button variants LOOK, which is a design decision and not a mechanical
  // token swap — so it is recorded here, loudly, awaiting its own ticket rather
  // than being smuggled in. Passes on dark (8.25–11.08).
  { entry: 'focus-visible:r~ing-primary-300', where: 'button (secondary, outline, ghost)' },
  // Toolbar/chip affordances on the neutral scale rather than the steel one.
  // 2.58 on white, 2.48 on the 50 surface, 2.37 on the 100 surface — the same
  // defect NIMUI-51 fixed, on a different scale. Passes on dark (5.71–7.66).
  { entry: 'focus-visible:r~ing-neutral-400', where: 'bulk-action-bar, filter-summary, view-switcher' },
  // Destructive Button tints its ring to match. 3.02 on white but 2.90 on the
  // 50 surface and 2.77 on the 100 surface. Passes on dark (4.88–6.55).
  { entry: 'focus-visible:r~ing-error-400', where: 'button (destructive)' },
  // The error variant of the two text controls. Clears light (4.52–4.93) and
  // just misses dark: 2.99 on the 800 surface.
  { entry: 'focus-visible:r~ing-error-500', where: 'input, textarea (error)' },
  // The success variant of the same two. Clears 3:1 on every surface in both
  // lists (3.62 worst), so it is unpaired but not a failure.
  { entry: 'focus-visible:r~ing-success-500', where: 'input, textarea (success)' },
];

/**
 * The CSS declaration each namespace must be found binding, keyed by namespace.
 *
 * Neither is a Tailwind utility, so both are safe to write plainly: a colour
 * utility is `<namespace>-<colour>`, and there is no colour called "color".
 */
const BOUND_DECLARATION: Record<string, string> = {
  [decode('r~ing')]: '--tw-ring-color',
  [decode('b~order')]: 'border-color',
  [decode('o~utline')]: 'outline-color',
};

/**
 * Surfaces a focus indicator is realistically painted on, as theme token names.
 *
 * Hand-maintained — see the docblock. Light: the page, the card and popover
 * body, the tab strip, and the one step below it that a few controls use.
 * Dark: the dark page, the dark panel, and the raised dark surface that the
 * resizable handle and the hover states use.
 */
const LIGHT_SURFACES = ['white', 'neutral-50', 'neutral-100', 'neutral-200'];
const DARK_SURFACES = ['neutral-950', 'neutral-900', 'neutral-800'];

/** WCAG 2.2 SC 1.4.11 — non-text contrast, Level AA. */
const MINIMUM_RATIO = 3;

// ---------------------------------------------------------------------------
// Colour maths — OKLCH to relative luminance, in plain arithmetic
// ---------------------------------------------------------------------------

/**
 * OKLCH → linear sRGB → gamma-encoded sRGB, clamped to the gamut.
 *
 * Done here rather than through the browser on purpose: a browser resolves these
 * tokens to `lab()`, so reading one back through the computed style and parsing
 * it as three 0–255 channels yields nonsense. The published stylesheet is the
 * artifact under test and it states the tokens exactly, so the conversion is
 * reproducible without a rendering engine at all.
 */
function oklchToSrgb(L: number, C: number, hDegrees: number): [number, number, number] {
  const h = (hDegrees * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const lRoot = L + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = L - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = L - 0.0894841775 * a - 1.291485548 * b;

  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;

  const linear: [number, number, number] = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return linear.map((v) => {
    const encoded = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, encoded));
  }) as [number, number, number];
}

/**
 * WCAG relative luminance of a gamma-encoded sRGB triple.
 *
 * Quantised to 8 bits first, because that is what actually reaches the screen —
 * and it is what a screenshot-based measurement reads back, so the two methods
 * can be compared without a rounding argument.
 */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channels = [r, g, b].map((v) => {
    const byte = Math.round(v * 255) / 255;
    return byte <= 0.04045 ? byte / 12.92 : Math.pow((byte + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a: number, b: number): number {
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Every `--color-*` token declared in the compiled theme block, as a luminance.
 *
 * Reads both forms the stylesheet contains: the kit's own tokens are authored
 * with a fractional lightness, Tailwind's built-in palette uses a percentage,
 * and two are plain hex.
 */
function parseThemeLuminances(css: string): Map<string, number> {
  const out = new Map<string, number>();

  for (const match of css.matchAll(
    /--color-([a-z0-9-]+):\s*oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)/g
  )) {
    const [, name, lightness, percent, chroma, hue] = match;
    if (name === undefined) continue;
    const L = Number(lightness) / (percent === '%' ? 100 : 1);
    out.set(name, relativeLuminance(oklchToSrgb(L, Number(chroma), Number(hue))));
  }

  for (const match of css.matchAll(/--color-([a-z0-9-]+):\s*#([0-9a-fA-F]{3,6})\s*;/g)) {
    const [, name, hex] = match;
    if (name === undefined || hex === undefined) continue;
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
    if (full.length !== 6) continue;
    const rgb = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [
      number,
      number,
      number,
    ];
    out.set(name, relativeLuminance(rgb));
  }

  return out;
}

// ---------------------------------------------------------------------------
// Source scan
// ---------------------------------------------------------------------------

interface Usage {
  /** File the class string lives in, e.g. `input.tsx`. */
  file: string;
  /** Index of the string literal within that file — pairs must share one. */
  literal: number;
  /** Focus variant, e.g. the plain one or the wrapper one. */
  variant: string;
  /** Colour namespace, decoded. */
  property: string;
  /** Theme colour the class names, e.g. `primary-500`. */
  shade: string;
  /** Whether the class carries the dark-mode prefix. */
  dark: boolean;
  /** The class exactly as written in source. */
  className: string;
}

/** `<dark:>?<variant>:<property>-<scale>-<step>` for any focus variant and namespace. */
const USAGE_PATTERN = new RegExp(
  `^(${DARK}:)?(${FOCUS_VARIANTS.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}):` +
    `(${ENCODED_PROPERTIES.map(decode).join('|')})-((?:${SCALES.join('|')})-\\d+)$`
);

const componentFiles = readdirSync(componentsDir)
  .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
  .sort();

const usages: Usage[] = [];

for (const file of componentFiles) {
  const literals = extractStringLiterals(readFileSync(join(componentsDir, file), 'utf-8'));
  literals.forEach((text, literal) => {
    for (const token of text.split(/\s+/).filter(Boolean)) {
      const match = USAGE_PATTERN.exec(token);
      if (match === null) continue;
      usages.push({
        file,
        literal,
        variant: match[2] as string,
        property: match[3] as string,
        shade: match[4] as string,
        dark: match[1] !== undefined,
        className: token,
      });
    }
  });
}

/** One indicator: a light class and the dark counterpart in the same string. */
interface Pair {
  variant: string;
  property: string;
  light: string;
  dark: string;
  lightShade: string;
  darkShade: string;
}

const key = (u: Usage): string => `${u.file}#${u.literal} ${u.variant} ${u.property}`;

const grouped = new Map<string, Usage[]>();
for (const usage of usages) {
  const existing = grouped.get(key(usage));
  if (existing === undefined) grouped.set(key(usage), [usage]);
  else existing.push(usage);
}

const pinned = new Set(KNOWN_UNPAIRED.map((p) => decode(p.entry)));

/** Indicators missing one half of the pair, as human-readable complaints. */
const unpaired: string[] = [];
/** Pin entries that were actually found unpaired in source — used to spot stale ones. */
const pinsHit = new Set<string>();
/** Distinct (variant, property, light shade, dark shade) combinations shipped. */
const pairs = new Map<string, Pair>();

for (const [where, group] of grouped) {
  const light = group.filter((u) => !u.dark);
  const dark = group.filter((u) => u.dark);

  if (light.length === 1 && dark.length === 0 && pinned.has((light[0] as Usage).className)) {
    pinsHit.add((light[0] as Usage).className);
    continue;
  }

  if (light.length !== 1 || dark.length !== 1) {
    unpaired.push(
      `${where}: ${light.length} light + ${dark.length} dark (${group
        .map((u) => u.className)
        .join(' ')}) — expected exactly one of each`
    );
    continue;
  }

  const l = light[0] as Usage;
  const d = dark[0] as Usage;
  pairs.set(`${l.className} + ${d.className}`, {
    variant: l.variant,
    property: l.property,
    light: l.className,
    dark: d.className,
    lightShade: l.shade,
    darkShade: d.shade,
  });
}

// ---------------------------------------------------------------------------

describe('focus indicator — the light/dark pair is complete in source', () => {
  // Without these a scanner regression yields zero usages and every assertion
  // below passes by finding nothing, which is the failure mode every guard in
  // this package exists to prevent.
  it('finds focus indicators across most of the kit', () => {
    const files = new Set(usages.map((u) => u.file));

    expect(
      files.size,
      'Far fewer component files ship a focus indicator than this kit has interactive ' +
        'components. The literal scanner regressed and the pairing check below is blind.'
    ).toBeGreaterThan(25);
  });

  it('finds both halves of every indicator it scanned', () => {
    const light = usages.filter((u) => !u.dark && !pinned.has(u.className));
    expect(light.length).toBeGreaterThan(40);
    expect(usages.filter((u) => u.dark).length).toBe(light.length);
  });

  it('keeps the pin encoded, so the pin cannot mint what it tolerates', () => {
    expect(
      KNOWN_UNPAIRED.filter((p) => !p.entry.includes(SENTINEL)).map((p) => p.entry),
      `These KNOWN_UNPAIRED entries are missing the "${SENTINEL}" marker, so they are live ` +
        'Tailwind candidates and this file would compile the very classes it merely tolerates.'
    ).toEqual([]);
  });

  it('pins nothing that has since been paired or removed', () => {
    const stale = KNOWN_UNPAIRED.map((p) => decode(p.entry))
      .filter((name) => !pinsHit.has(name))
      .map((name) => `${name}   <- no longer ships unpaired; drop the pin entry`);

    expect(
      stale,
      'KNOWN_UNPAIRED holds entries that are not unpaired any more. A stale entry is the pin ' +
        'quietly authorising something that has stopped happening, and next time an indicator ' +
        'by that name really does lose its counterpart this guard would wave it through.'
    ).toEqual([]);
  });

  it('pairs every focus indicator with a dark-mode counterpart in the same class string', () => {
    expect(
      unpaired,
      'A focus indicator declares a colour for one theme only.\n' +
        'No single step of the steel scale reaches 3:1 on both light and dark surfaces — the ' +
        'lighter step measures 2.84:1 on white, the darker one 2.86:1 on the 800 surface — so ' +
        'the indicator is a PAIR, not a colour. Half of it is a real SC 1.4.11 failure in one ' +
        'theme, and no rendering test in this repo will show you which.\n' +
        'Add the counterpart to the SAME class string, with the dark prefix OUTERMOST (the ' +
        'contract spells it that way and every assertion in the kit matches on the literal).'
    ).toEqual([]);
  });
});

describe('focus indicator — the shipped colours clear 3:1 in both themes', () => {
  let distCss: string;
  let luminance: Map<string, number>;
  let utilitiesLayer: { start: number; end: number };

  beforeAll(() => {
    if (!existsSync(distStylesPath)) {
      throw new Error(
        `packages/ui/dist/styles.css does not exist at ${distStylesPath}.\n` +
          'This suite measures the BUILT stylesheet because that is the only place the colour ' +
          'a focus indicator really paints can be read: jsdom computes no colours, and a ' +
          'class-string assertion cannot tell a live utility from a dead class name. Run ' +
          '`pnpm --filter @nim-ui/components build` first.'
      );
    }
    distCss = readFileSync(distStylesPath, 'utf-8');
    luminance = parseThemeLuminances(distCss);

    const start = distCss.indexOf('@layer utilities {');
    if (start === -1) {
      throw new Error(
        'No `@layer utilities` block in dist/styles.css. The source-order assertion below ' +
          'assumes both halves of a pair share one cascade layer — layers outrank source ' +
          'order — so it must be re-derived before it can be trusted again.'
      );
    }
    utilitiesLayer = { start, end: distCss.indexOf('{', start) + 1 + ruleBodyAt(distCss, start).length };
  });

  // If the arithmetic is broken, every ratio below is meaningless in a direction
  // no assertion can detect. Pin it to values that are true by definition.
  it('computes luminance correctly for colours whose answer is known', () => {
    expect(relativeLuminance([1, 1, 1])).toBeCloseTo(1, 10);
    expect(relativeLuminance([0, 0, 0])).toBeCloseTo(0, 10);
    expect(contrastRatio(relativeLuminance([1, 1, 1]), relativeLuminance([0, 0, 0]))).toBeCloseTo(21, 6);

    // The achromatic OKLCH round trip must land back on the same two extremes.
    expect(relativeLuminance(oklchToSrgb(1, 0, 0))).toBeCloseTo(1, 6);
    expect(relativeLuminance(oklchToSrgb(0, 0, 0))).toBeCloseTo(0, 6);
  });

  it('reads the theme tokens out of the compiled stylesheet', () => {
    const missing = [...LIGHT_SURFACES, ...DARK_SURFACES].filter((s) => !luminance.has(s));

    expect(
      missing,
      'Surfaces named in LIGHT_SURFACES/DARK_SURFACES have no `--color-*` token in the ' +
        'published stylesheet, so nothing was measured against them.'
    ).toEqual([]);
    expect(luminance.size).toBeGreaterThan(20);
  });

  it('has pairs to measure', () => {
    expect(pairs.size).toBeGreaterThan(0);
  });

  it.each([...pairs.values()].map((p) => [`${p.light} + ${p.dark}`, p] as const))(
    '%s binds, measures and orders correctly',
    (_name, pair) => {
      const declaration = BOUND_DECLARATION[pair.property];
      expect(declaration, `No known CSS declaration for the "${pair.property}" namespace.`).toBeDefined();

      const halves = [
        { className: pair.light, shade: pair.lightShade, surfaces: LIGHT_SURFACES, theme: 'light' },
        { className: pair.dark, shade: pair.darkShade, surfaces: DARK_SURFACES, theme: 'dark' },
      ];

      const offsets: number[] = [];

      for (const half of halves) {
        const selector = toSelector(half.className);
        const idx = findSelectorIndex(distCss, selector);

        expect(
          idx,
          `No compiled rule for ${selector}. The class name exists in source but Tailwind ` +
            'generated nothing for it — it is a dead class, the indicator falls back to ' +
            "Tailwind's default ring colour, and every class-string assertion stays green. " +
            'Rebuild; if it is still missing, the variant chain is malformed.'
        ).toBeGreaterThan(-1);

        const body = ruleBodyAt(distCss, idx);

        // The binding is what ties the arithmetic to reality: without it a
        // renamed class could leave this suite measuring a token nothing paints.
        expect(
          body.replace(/\s+/g, ' '),
          `${selector} does not bind ${declaration} to the ${half.shade} token, so the ratio ` +
            'asserted below is about a colour this class does not actually paint.'
        ).toContain(`${declaration}: var(--color-${half.shade})`);

        expect(
          idx > utilitiesLayer.start && idx < utilitiesLayer.end,
          `${selector} is emitted OUTSIDE the @layer utilities block (offset ${idx}, layer ` +
            `spans ${utilitiesLayer.start}-${utilitiesLayer.end}). Cascade layers outrank ` +
            'source order, so the order comparison below no longer proves which rule wins.'
        ).toBe(true);

        offsets.push(idx);

        const indicator = luminance.get(half.shade);
        expect(indicator, `No --color-${half.shade} token in the published stylesheet.`).toBeDefined();

        const failures = half.surfaces
          .map((surface) => ({ surface, ratio: contrastRatio(indicator as number, luminance.get(surface) as number) }))
          .filter(({ ratio }) => ratio < MINIMUM_RATIO)
          .map(({ surface, ratio }) => `${half.shade} on ${surface} = ${ratio.toFixed(2)}:1`);

        expect(
          failures,
          `The ${half.theme}-mode half of this focus indicator does not reach ${MINIMUM_RATIO}:1 ` +
            'against a surface the kit paints it on. WCAG 2.2 SC 1.4.11 (AA) requires 3:1 for a ' +
            'focus indicator, and a keyboard user cannot see where they are.\n' +
            'Do NOT answer this by retuning the shared token — it also fills bar charts, ' +
            'sparklines, progress bars, spinners, slider ranges and the radio dot. Move the ' +
            'indicator to a different step of the scale instead, and re-check the OTHER theme: ' +
            'no single step passes on both.'
        ).toEqual([]);
      }

      // The decisive assertion. Both halves are (0,2,0) — the dark variant is a
      // zero-specificity `:where()` — and both match a focused element in a dark
      // tree, so whichever Tailwind emits LAST is the one that paints.
      expect(
        offsets[1],
        `${toSelector(pair.dark)} is emitted BEFORE ${toSelector(pair.light)} in ` +
          'dist/styles.css. The dark variant compiles to a zero-specificity `:where()`, so ' +
          'both halves tie at (0,2,0) and the later rule wins — dark mode would paint the ' +
          'LIGHT-mode colour, which is the failure this pair exists to prevent, and every ' +
          'class-string assertion in the repo would stay green.'
      ).toBeGreaterThan(offsets[0] as number);
    }
  );
});
