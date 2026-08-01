/**
 * Parity between `tokens.js` and the CSS that mirrors it.
 *
 * ## Why (NIMUI-29)
 *
 * Design tokens live in two shapes that must agree but were never mechanically
 * linked: this package's `tokens.js` object, and the `@theme` blocks the
 * stylesheets declare. NIMUI-23 was that gap firing — the library sat on
 * Inter/Fira Code while the docs site had moved to Hanken/JetBrains/Fraunces,
 * and nothing flagged it. It was fixed by syncing the copies by hand, which is
 * the same mechanism that let them drift in the first place.
 *
 * This is the check half of that ticket's scope rather than a generator. A
 * generator would have to own the CSS files' formatting and comments, and those
 * comments carry decisions — why `--radius-md` is 8px, why the fonts are named
 * but not loaded. A check keeps the prose hand-written and still fails when the
 * numbers disagree.
 *
 * `culori` was a root devDependency added for the emitter that was never
 * written. A comparison needs no colour maths, so nothing here uses it; that
 * ticket's "drop it or use it" is answered by dropping it.
 *
 * ## What is actually mirrored, and what only looks like it
 *
 * Measured rather than assumed. Three groups genuinely exist in both places and
 * are checked below in BOTH directions:
 *
 * - the six colour scales (66 values)
 * - the animation durations and easings
 * - the three font stacks
 *
 * `--radius-md` is the one radius the CSS declares, and it is checked too.
 *
 * Everything else in `tokens.js` — `spacing`, `typography.fontSize`, and seven
 * of the eight `borderRadius` steps — has NO counterpart in any stylesheet, in
 * this repo or in either compiled bundle. Those keys are listed in
 * `NOT_MIRRORED` and asserted to stay absent, so the split is a stated fact
 * rather than something the next reader has to re-derive. **They are a Tailwind
 * v3 remnant, not a deliberate divergence** — `index.js` still exports a v3
 * config object (`theme.extend`) that consumes exactly those keys and that
 * nothing in this repo imports. See NIMUI-61; do not read their presence here
 * as endorsement.
 *
 * ## Bidirectional, on purpose
 *
 * The obvious shape — walk `tokens.js` and look each key up in the CSS — is
 * one-directional, and a one-directional check goes blind in the direction it
 * does not walk: a `--color-*` added to the CSS with no JS entry would pass in
 * silence. Both directions are asserted, so drift fails whichever side moved.
 * Values are compared with whitespace normalised, since a reformat that changes
 * nothing should not fail, and a changed number should.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tokens } from './tokens.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');

const TOKENS_CSS = 'packages/ui/src/tokens.css';
const UI_STYLES_CSS = 'packages/ui/src/styles.css';
const DOCS_GLOBAL_CSS = 'packages/docs/app/global.css';

/** `--name: value;` declarations of a stylesheet, whitespace-normalised. */
function customProperties(relativePath) {
  const text = readFileSync(resolve(repoRoot, relativePath), 'utf-8');
  const found = new Map();
  for (const match of text.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    found.set(match[1], match[2].replace(/\s+/g, ' ').trim());
  }
  return found;
}

const tokensCss = customProperties(TOKENS_CSS);
const uiStyles = customProperties(UI_STYLES_CSS);
const docsGlobal = customProperties(DOCS_GLOBAL_CSS);

const norm = (value) => String(value).replace(/\s+/g, ' ').trim();

/** The `tokens.js` view of what the CSS should declare. */
const expectedFromJs = new Map();
for (const [family, scale] of Object.entries(tokens.colors)) {
  for (const [step, value] of Object.entries(scale)) {
    expectedFromJs.set(`--color-${family}-${step}`, norm(value));
  }
}
for (const [step, value] of Object.entries(tokens.animation.duration)) {
  expectedFromJs.set(`--duration-${step}`, norm(value));
}
for (const [name, value] of Object.entries(tokens.animation.easing)) {
  expectedFromJs.set(`--${name}`, norm(value));
}
expectedFromJs.set('--radius-md', norm(tokens.borderRadius.md));

/**
 * Keys `tokens.js` declares that no stylesheet implements — the v3 remnant.
 *
 * Asserted ABSENT rather than merely skipped. If one of these ever becomes a
 * real CSS variable, this list is wrong and the parity check above should be
 * covering it instead; that is a change worth failing on, not absorbing.
 */
const NOT_MIRRORED = [
  ...Object.keys(tokens.spacing).map((k) => `--spacing-${k}`),
  ...Object.keys(tokens.typography.fontSize).map((k) => `--text-${k}`),
  ...Object.keys(tokens.borderRadius)
    .filter((k) => k !== 'md' && k !== 'DEFAULT')
    .map((k) => `--radius-${k}`),
];

/** Font stacks, which are declared in the stylesheets rather than in tokens.css. */
const FONT_STACKS = Object.entries(tokens.typography.fontFamily).map(([key, list]) => ({
  variable: `--font-${key}`,
  stack: list.map((family) => (family.includes(' ') ? `'${family}'` : family)),
}));

/** Compare font stacks without caring which quote style a file uses. */
const unquote = (value) => norm(value).replace(/['"]/g, '');

describe('tokens.js and the stylesheets that mirror it agree', () => {
  // ---- vacuity guards -----------------------------------------------------
  // Both sides are parsed out of files by hand. A regression in either produces
  // a comparison that measures nothing: an empty CSS map makes every key an
  // absence (loud), but an empty expectation set makes the whole suite pass on
  // air (silent), which is the dangerous direction.

  it('builds an expectation set of a plausible size', () => {
    expect(
      expectedFromJs.size,
      'Far fewer expected tokens than tokens.js declares. The object shape changed, or the ' +
        'walk above regressed — either way the comparison below is checking almost nothing.'
    ).toBeGreaterThan(60);
  });

  it('reads custom properties out of every stylesheet it compares', () => {
    const empty = [
      [TOKENS_CSS, tokensCss],
      [UI_STYLES_CSS, uiStyles],
      [DOCS_GLOBAL_CSS, docsGlobal],
    ]
      .filter(([, map]) => map.size === 0)
      .map(([path]) => path);

    expect(
      empty,
      'These stylesheets yielded ZERO custom properties, so the parser bailed on them and every ' +
        'assertion about their tokens would pass by finding nothing.'
    ).toEqual([]);
  });

  // ---- the parity check, both directions ----------------------------------

  it('declares every tokens.js value in tokens.css, with the same value', () => {
    const wrong = [];
    for (const [variable, expected] of expectedFromJs) {
      const actual = tokensCss.get(variable);
      if (actual === undefined) wrong.push(`${variable}   <- absent from ${TOKENS_CSS}`);
      else if (actual !== expected) wrong.push(`${variable}   <- tokens.js ${expected} / css ${actual}`);
    }

    expect(
      wrong,
      'tokens.js and tokens.css disagree. They are hand-maintained copies of the same design ' +
        'decisions, and this is the drift NIMUI-23 was: one moved, the other did not, and nothing ' +
        'noticed. Change both in the same commit.'
    ).toEqual([]);
  });

  it('declares nothing in tokens.css that tokens.js does not know about', () => {
    const owned = /^--(?:color|duration|ease)-|^--ease-|^--radius-md$/;
    const orphans = [...tokensCss.keys()]
      .filter((variable) => owned.test(variable) || /^--ease(-|$)/.test(variable))
      .filter((variable) => !expectedFromJs.has(variable))
      .map((variable) => `${variable}   <- in ${TOKENS_CSS}, absent from tokens.js`);

    expect(
      orphans,
      'The stylesheet declares tokens the JS object has never heard of. Walking only ' +
        'tokens.js -> css would pass this in silence, which is why both directions are checked: ' +
        'a one-directional guard goes blind in the direction it does not walk. Add the entry to ' +
        'tokens.js, or drop it from the stylesheet.'
    ).toEqual([]);
  });

  // ---- font stacks, mirrored in three places ------------------------------

  it('ships the same font stack in tokens.js and the library stylesheet', () => {
    const wrong = FONT_STACKS.filter(
      ({ variable, stack }) => unquote(uiStyles.get(variable) ?? '') !== unquote(stack.join(', '))
    ).map(({ variable, stack }) => `${variable}   <- tokens.js ${stack.join(', ')} / css ${uiStyles.get(variable)}`);

    expect(
      wrong,
      `${UI_STYLES_CSS} and tokens.js name different font stacks. This exact divergence is ` +
        'NIMUI-23: the library kept its old families while the docs site moved on.'
    ).toEqual([]);
  });

  it('keeps the docs fallbacks identical, differing only in the first family', () => {
    // The docs site loads its fonts through next/font, so the first entry is a
    // generated `var(--font-…)` rather than the family name. Everything after it
    // is the same fallback chain, and that is what must not drift.
    const wrong = [];
    for (const { variable, stack } of FONT_STACKS) {
      const declared = docsGlobal.get(variable);
      if (declared === undefined) {
        wrong.push(`${variable}   <- absent from ${DOCS_GLOBAL_CSS}`);
        continue;
      }
      const docsFallbacks = unquote(declared).split(',').slice(1).map((s) => s.trim());
      const jsFallbacks = stack.slice(1).map((s) => unquote(s));
      if (docsFallbacks.join('|') !== jsFallbacks.join('|')) {
        wrong.push(`${variable}   <- docs [${docsFallbacks.join(', ')}] / tokens.js [${jsFallbacks.join(', ')}]`);
      }
      if (!/^var\(--font-/.test(unquote(declared).split(',')[0].trim())) {
        wrong.push(`${variable}   <- docs first entry is not a next/font variable: ${declared}`);
      }
    }

    expect(
      wrong,
      'The docs site and tokens.js disagree on a font stack. Only the FIRST entry may differ — ' +
        'the site loads its families through next/font and substitutes the generated variable ' +
        'there. The fallbacks behind it are the same decision and must match.'
    ).toEqual([]);
  });

  // ---- the semantic layer: a fourth copy of the same colours --------------
  // `tokens.css` also carries a shadcn-shaped `:root` / `.dark` block —
  // `--background`, `--primary`, `--ring`, `--radius` and friends. It is NOT in
  // `@theme`, so Tailwind generates no utilities from it, and nothing in this
  // repo references any of it. It still ships in the published stylesheet and
  // in the docs bundle, and every colour in it is a scale step written out a
  // second time (`--ring` is primary-400, `--destructive` is error-500).
  //
  // That makes it a fourth hand-maintained copy of values NIMUI-29 exists to
  // stop drifting, and one the ticket did not list. Rather than pin forty
  // mappings that would churn, the check is that every semantic colour is STILL
  // some step of the palette: retune a scale and forget the semantic layer, and
  // the orphaned value fails here by name.

  const SEMANTIC_BLOCK = /@layer\s+base\s*\{[\s\S]*$/;
  const semanticDeclarations = (() => {
    const text = readFileSync(resolve(repoRoot, TOKENS_CSS), 'utf-8');
    const block = text.match(SEMANTIC_BLOCK)?.[0] ?? '';
    return [...block.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)].map((m) => ({
      variable: m[1],
      value: m[2].replace(/\s+/g, ' ').trim(),
    }));
  })();

  const paletteValues = new Map();
  for (const [family, scale] of Object.entries(tokens.colors)) {
    for (const [step, value] of Object.entries(scale)) {
      if (!paletteValues.has(norm(value))) paletteValues.set(norm(value), `${family}-${step}`);
    }
  }

  it('finds the semantic layer it is about to check', () => {
    expect(
      semanticDeclarations.length,
      `No semantic declarations parsed out of ${TOKENS_CSS}. If that block moved or was removed ` +
        'the check below is measuring nothing — re-derive it before trusting a green run.'
    ).toBeGreaterThan(30);
  });

  // Values that are deliberately off-scale. Pure white is not a neutral step —
  // the lightest is 0.985 — and the light background is meant to be paper-white,
  // not the top of the grey ramp. Listed so it is a decision on the record
  // rather than a hole in the check.
  const OFF_SCALE_BY_DESIGN = new Map([['oklch(1.000 0.000 0)', 'pure white — the light background is not a neutral step']]);

  it('keeps every semantic colour on a real step of the palette', () => {
    const orphaned = semanticDeclarations
      .filter(({ value }) => value.startsWith('oklch('))
      .filter(({ value }) => !paletteValues.has(value) && !OFF_SCALE_BY_DESIGN.has(value))
      .map(({ variable, value }) => `${variable}: ${value}   <- matches no step of any scale in tokens.js`);

    expect(
      orphaned,
      'A semantic colour no longer equals any palette step. This block is a second spelling of ' +
        'the scales — retuning a scale without updating it leaves the two describing different ' +
        'colours under the same name, and nothing else in the repo reads it, so nothing else ' +
        'would notice.'
    ).toEqual([]);
  });

  it('keeps the semantic radius on the kit component radius', () => {
    const radius = semanticDeclarations.find((d) => d.variable === '--radius');

    expect(radius?.value, `--radius is missing from the semantic block in ${TOKENS_CSS}.`).toBeDefined();
    expect(
      radius.value,
      'The semantic `--radius` and the kit component radius have diverged. Note this is ' +
        '`borderRadius.md`, NOT `borderRadius.DEFAULT` — that one is still Tailwind v3\'s own ' +
        '0.375rem default and belongs to the remnant described in NIMUI-61.'
    ).toBe(norm(tokens.borderRadius.md));
  });

  // ---- the stated non-mirror ----------------------------------------------

  it('keeps the unmirrored tokens.js keys out of the stylesheets', () => {
    const surprises = [];
    for (const variable of NOT_MIRRORED) {
      for (const [path, map] of [
        [TOKENS_CSS, tokensCss],
        [UI_STYLES_CSS, uiStyles],
        [DOCS_GLOBAL_CSS, docsGlobal],
      ]) {
        if (map.has(variable)) surprises.push(`${variable}   <- now declared in ${path}`);
      }
    }

    expect(
      surprises,
      'A tokens.js key with no stylesheet counterpart has grown one. That is good news, but it ' +
        'means this list is now wrong: move the key into the parity check above so its VALUE is ' +
        'compared, instead of leaving it here where only its absence was. See NIMUI-61 — these ' +
        'keys are a Tailwind v3 remnant, and implementing one is a decision, not a detail.'
    ).toEqual([]);
  });
});
