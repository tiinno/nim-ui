import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import {
  extractStringLiterals,
  findSelectorIndex,
  ruleBodyAt,
  toSelector,
} from './test/class-scan';

/**
 * Guards the kit's `prefers-reduced-motion` contract: every entrance/exit
 * animation **and every movement-bearing transition** a component applies must
 * be switched off for users who ask for reduced motion, with **zero consumer
 * code**.
 *
 * Two arms, each with two independent halves, because either half alone passes
 * vacuously:
 *
 * 1. **Source scan** — every `animate-*` in `src/components/*.tsx` must be
 *    paired with a `motion-reduce:animate-none` carrying the *same variant
 *    prefix*, and every transition that can move something must be paired with a
 *    reduced-motion counterpart that re-declares the `transition-property`
 *    longhand as something incapable of movement — either off entirely, or
 *    narrowed to the colour and shadow properties. This is what makes a future
 *    component that forgets it fail CI.
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
 * ## Why the transition arm exists, and why it covers so few of them
 *
 * `src/reduced-motion.css` holds a blanket `*` reset that clamps every
 * `animation-duration` / `transition-duration` on the page. As of NIMUI-33 the
 * kit no longer imports it — it is a published opt-in entry point and nothing
 * else — so this arm is the ONLY reduced-motion cover the kit's moving
 * transitions have.
 *
 * The counterpart works on a different longhand from that reset: it sets
 * `transition-property: none`, which the reset never touches, so the transition
 * does not run at all rather than running a 0.01ms one. Correctness by
 * construction, and it is why removing the import did not regress anything
 * here.
 *
 * **Colour and opacity transitions are deliberately left uncovered.** ~55 of
 * the kit's ~70 transitions are `transition-colors`, and a colour crossfade is
 * not a vestibular trigger — clamping it buys no accessibility and makes every
 * hover in the kit feel broken. Same for `transition-opacity`: a fade moves
 * nothing. Do not "complete" this guard by pairing those; the classifier below
 * treats them as non-motion on purpose and pins them, so the decision is
 * visible rather than implied.
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
 * - `spin` / `pulse` — loading indicators. **Settled: they keep animating under
 *   `prefers-reduced-motion` (NIMUI-42).** For a loading indicator the motion
 *   *is* the information — it is the only signal that work is in flight — and
 *   WCAG 2.2 SC 2.2.2 exempts an activity indicator on exactly that basis. This
 *   is not a deferred question any more, so do not "finish the job" by pairing
 *   them; the suite below fails if you do.
 *
 *   Worth knowing why it was settled the way it was: until NIMUI-33 the blanket
 *   reset in `src/reduced-motion.css` shipped in the default bundle and was the
 *   only thing reaching these five. It did not *slow* the loops, it stopped
 *   them dead — one 0.01ms iteration and the element sits at its un-animated
 *   position (Chromium reports `transform: none` on the spinner), which reads
 *   as a hung interface rather than as work in flight. Full speed is better
 *   than frozen, and an application that disagrees can opt the reset back in
 *   with one `@import`.
 * - `ping` / `bounce` — Tailwind's built-in attention loops. Listed
 *   pre-emptively so adding one does not silently trip this guard with an
 *   unrelated failure message. Unlike the two above, nobody has ruled on these:
 *   they are not activity indicators, so if one ever ships, decide it on its
 *   own merits rather than inheriting NIMUI-42.
 * - `none` — this is the counterpart itself (`motion-reduce:animate-none`).
 *   Without it the scan would demand a counterpart for every counterpart.
 */
const EXEMPT_ANIMATIONS = new Set(['none', 'spin', 'pulse', 'ping', 'bounce']);

/**
 * The exempt animations that are ACTIVITY INDICATORS, as opposed to the
 * counterpart's own `none` and the two attention loops nobody has ruled on.
 * Separated because only these carry the NIMUI-42 decision, and only these get
 * asserted as deliberately unpaired below.
 */
const LOADING_ANIMATIONS = new Set(['spin', 'pulse']);

/**
 * The three parts of the transition counterpart, kept apart on purpose.
 *
 * Tailwind scans test files exactly like component files, so a counterpart
 * written here as one literal would compile a real rule into `dist/styles.css`
 * and keep it alive after a component stopped emitting the class — the
 * compiled-CSS half would then pass over a reverted fix, which is the one thing
 * it exists to catch. Assembled at runtime it is invisible to the scanner.
 * `aria-disabled-hover.test.ts` derives its counterparts the same way, for the
 * same reason. (Also why nothing below writes the word out in prose.)
 */
const MOTION_REDUCE_VARIANT = 'motion-reduce';
const TRANSITION_UTILITY = 'transition';
const TRANSITION_OFF = 'none';

/**
 * Named `transition-*` values that cannot move anything, so they need no
 * counterpart.
 *
 * - `colors` / `opacity` — a crossfade is not motion. This is the deliberate
 *   scope limit described in the file docblock, not an oversight.
 * - `shadow` — `box-shadow` changes depth cues, not position.
 * - `discrete` — sets `transition-behavior`, not a property list at all.
 * - `none` — the counterpart itself; without it the scan would demand a
 *   counterpart for every counterpart.
 *
 * Anything NOT listed here (`all`, `transform`, a bare `transition`, a
 * `(--custom-property)` value) is treated as movement-bearing. The list fails
 * closed on purpose: a value nobody classified yet asks for a counterpart
 * rather than slipping through.
 */
const NON_MOTION_TRANSITION_VALUES = new Set(['colors', 'opacity', 'shadow', 'discrete', 'none']);

/**
 * CSS properties that may appear inside an arbitrary bracketed property list
 * without making it movement-bearing.
 *
 * Same fail-closed shape: a bracketed list is exempt only when EVERY property
 * in it is listed here. A list naming `width` or `inset` added tomorrow moves
 * something and will be asked for a counterpart, which a keyword-spotting rule
 * (does the list happen to mention a transform?) would have let through
 * silently.
 *
 * Examples in this docblock are named as bare CSS properties on purpose:
 * Tailwind scans comments, and a full utility written out here would compile a
 * dead rule into the shipped stylesheet (NIMUI-30's failure mode, and 958 bytes
 * of it while this file was being written).
 */
const NON_MOTION_TRANSITION_PROPERTIES = new Set([
  'color',
  'background-color',
  'border-color',
  'outline-color',
  'text-decoration-color',
  'accent-color',
  'caret-color',
  'fill',
  'stroke',
  'opacity',
  'box-shadow',
  'text-shadow',
]);

/**
 * Movement-bearing transitions that deliberately ship NO counterpart, matched
 * by file plus a token that identifies the one class string meant.
 *
 * All three are the same call, made once and applied consistently: a press
 * feedback squeeze. Reasoned at length in `button.tsx`; in short —
 *
 * - it is a 2–3% in-place scale, user-initiated, reverting the moment the
 *   pointer or key is released, travelling no distance. WCAG 2.3.3 is about
 *   non-essential interaction animation such as large movement or parallax; a
 *   control's own press affordance is neither.
 * - under reduced motion the scale would still apply, just instantly, so
 *   pairing removes the 150ms interpolation and nothing else. There is no
 *   accessibility gain to buy with the cost below.
 * - that cost: all three elements reach for `transition-all` mainly to
 *   crossfade their hover colours, and the counterpart used everywhere else in
 *   this kit switches the whole property list off. It is worth being precise
 *   about what that does and does NOT force — a NARROWED counterpart compiles
 *   just as well (an arbitrary property list under the reduced-motion variant,
 *   naming only `color`, `background-color` and `border-color`) and would keep
 *   the crossfade while suppressing the squeeze. It was considered and rejected
 *   on the affordance argument above, not ruled out by the cascade. Anyone
 *   revisiting this should weigh it on the merits rather than assume the
 *   mechanism decided — and it is no longer even hypothetical: `card.tsx` ships a
 *   narrowed counterpart as of NIMUI-48, and both arms of this suite accept it.
 *   (Property names are written bare here on purpose: this file is scanned by
 *   Tailwind, and a full utility in a comment compiles a dead rule into the
 *   shipped stylesheet.)
 *
 * Each entry must match exactly one movement-bearing class string, asserted
 * below — a stale exemption fails instead of quietly widening.
 */
const PRESS_FEEDBACK_EXEMPTIONS = [
  { file: 'button.tsx', marker: 'active:scale-[0.98]', what: 'the shared button base' },
  { file: 'cta.tsx', marker: 'active:scale-[0.97]', what: "the CTA's own button" },
  { file: 'toast.tsx', marker: 'active:scale-[0.97]', what: 'the toast action button' },
];

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

interface TransitionUsage {
  /** Source file the class was found in. */
  file: string;
  /** Full class as written, e.g. `transition-transform`. */
  className: string;
  /** Variant chain including its trailing colon. Empty when unmodified. */
  prefix: string;
  /** The value part, e.g. `all`, `[box-shadow,transform]`, or `''` for a bare `transition`. */
  value: string;
  /** Whether the declared property list can carry movement. */
  movement: boolean;
  /** The canonical counterpart, suggested in failure messages when none is found. */
  counterpart: string;
  /**
   * The counterpart actually present in the same class string, or `null`.
   *
   * The compiled-CSS arm asserts against THIS, never against `counterpart`.
   * Asserting the canonical form would look up a rule that exists for other
   * components regardless of what this element ships — it is inside the reduce
   * media query and it does switch the property list off, so every assertion
   * would pass while proving nothing about the class on this element, and the
   * source-order comparison would compare the wrong pair.
   */
  resolvedCounterpart: string | null;
}

/** One string literal from a source file, treated as one class-string group. */
interface ClassGroup {
  /** Source file the literal came from. */
  file: string;
  /** The literal's contents, for failure messages. */
  text: string;
  /** Every whitespace-delimited token in that literal. */
  tokens: Set<string>;
  /** Entrance/exit animations used in that literal. */
  usages: AnimationUsage[];
  /**
   * Activity-indicator animations (`LOADING_ANIMATIONS`) used in that literal.
   * Kept apart from `usages` rather than dropped, so the NIMUI-42 exemption can
   * be asserted instead of merely implied by an absence.
   */
  loaderUsages: AnimationUsage[];
  /** Transitions used in that literal, movement-bearing or not. */
  transitions: TransitionUsage[];
}

/**
 * Does a `transition-*` value declare a property list that can move something?
 *
 * `''` is a bare `transition`, whose default list includes `transform`,
 * `translate`, `scale` and `rotate` — movement. Everything else is decided by
 * the two fail-closed lists above.
 */
function isMovementBearing(value: string): boolean {
  if (value === '') return true;
  if (value.startsWith('(')) return true;
  if (value.startsWith('[')) {
    const properties = value
      .slice(1, -1)
      .split(',')
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);
    return properties.length === 0 || !properties.every((p) => NON_MOTION_TRANSITION_PROPERTIES.has(p));
  }
  return !NON_MOTION_TRANSITION_VALUES.has(value);
}

/**
 * Which reduced-motion override in `tokens` covers a transition carrying
 * `prefix`, or `null` when none does.
 *
 * Any override whose own property list moves nothing counts, not just the one
 * that switches the list off entirely. A NARROWED counterpart — re-declaring
 * only the colour and shadow properties under the reduced-motion variant — kills
 * the movement just as completely while keeping the crossfade the kit
 * deliberately leaves undamped everywhere else, and `card.tsx` ships exactly
 * that. Reusing `isMovementBearing` for the decision is what keeps the two
 * halves consistent: whatever the classifier calls incapable of movement is
 * acceptable as a counterpart, by definition.
 *
 * The prefix must match for the cascade reason spelled out in the file docblock.
 */
function findCounterpart(tokens: string[], prefix: string): string | null {
  const wanted = `${prefix}${MOTION_REDUCE_VARIANT}:${TRANSITION_UTILITY}-`;
  for (const token of tokens) {
    if (!token.startsWith(wanted)) continue;
    if (!isMovementBearing(token.slice(wanted.length))) return token;
  }
  return null;
}

/**
 * Pull every `animate-*` and `transition-*` class out of a source file, grouped
 * by the string literal it lives in.
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
 * the `(--custom-prop)` value form survives tokenisation intact. (Named without
 * its `animate-` namespace on purpose — writing the whole class here would
 * compile a dead rule into the published stylesheet, which is what
 * `compiled-utility-inventory.test.ts` exists to catch.)
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
    const loaderUsages: AnimationUsage[] = [];
    const transitions: TransitionUsage[] = [];

    for (const token of tokenList) {
      // The same forms as the animation scan, plus the bare `transition` whose
      // default property list already includes the transforms. Named
      // (`transition-transform`), bracketed and `(--custom-property)` values
      // are all recognised, so a component cannot slip past the guard by
      // reaching for Tailwind v4's escape hatches. Only forms that already
      // exist in the kit are written out here — see the constants above for why
      // a comment cannot name a utility the source does not ship.
      const transitionMatch =
        /(?:^|:)transition(?:-(\[[^\]]*\]|\(--[^)]*\)|[a-z][a-z0-9-]*))?$/.exec(token);

      if (transitionMatch) {
        const value = transitionMatch[1] ?? '';
        const prefix = token.slice(0, token.length - (value === '' ? 'transition' : `transition-${value}`).length);
        transitions.push({
          file,
          className: token,
          prefix,
          value,
          movement: isMovementBearing(value),
          // Assembled from parts, never written as one literal — see the
          // constants' docblock.
          counterpart: `${prefix}${MOTION_REDUCE_VARIANT}:${TRANSITION_UTILITY}-${TRANSITION_OFF}`,
          resolvedCounterpart: findCounterpart(tokenList, prefix),
        });
      }

      // Must END in `animate-<name>` and the segment must start the class or
      // follow a variant colon — this skips e.g. `no-animate-foo`.
      //
      // Three animation forms are recognised, so a component cannot slip past
      // the guard by reaching for Tailwind v4's escape hatches. The last two are
      // named WITHOUT the `animate-` namespace, because a whole class written in
      // a comment compiles a dead rule into the published stylesheet — see
      // `compiled-utility-inventory.test.ts`:
      //   - named token      animate-fade-in   (a class the kit really ships)
      //   - arbitrary value  [wiggle_1s_ease-in-out]
      //   - custom property  (--my-animation)
      // The latter two never match EXEMPT_ANIMATIONS, so they always require a
      // counterpart — deliberately strict.
      const match = /(?:^|:)animate-(\[[^\]]*\]|\(--[^)]*\)|[a-z][a-z0-9-]*)$/.exec(token);
      if (!match) continue;

      const animation = match[1];
      // `noUncheckedIndexedAccess` — the capture group is always present when
      // the regex matched, but narrow it explicitly rather than asserting.
      if (animation === undefined) continue;

      const prefix = token.slice(0, token.length - `animate-${animation}`.length);
      const usage: AnimationUsage = {
        file,
        className: token,
        prefix,
        animation,
        counterpart: `${prefix}motion-reduce:animate-none`,
      };

      // Activity indicators are recorded on their own list rather than skipped,
      // so their exemption is asserted rather than inferred from silence.
      if (LOADING_ANIMATIONS.has(animation)) {
        loaderUsages.push(usage);
        continue;
      }
      if (EXEMPT_ANIMATIONS.has(animation)) continue;

      usages.push(usage);
    }

    return { file, text, tokens: new Set(tokenList), usages, loaderUsages, transitions };
  });
}

const scanned = componentFiles.map((file) => ({
  file,
  groups: extractClassGroups(file, readFileSync(join(componentsDir, file), 'utf-8')),
}));

const allUsages = scanned.flatMap((s) => s.groups.flatMap((g) => g.usages));
const allGroups = scanned.flatMap((s) => s.groups);
const allLoaderUsages = scanned.flatMap((s) => s.groups.flatMap((g) => g.loaderUsages));
const allTransitions = allGroups.flatMap((g) => g.transitions);
const movementGroups = allGroups.filter((g) => g.transitions.some((t) => t.movement));

/** Groups this file deliberately leaves without a counterpart, and why. */
const exemptGroups = new Map<ClassGroup, (typeof PRESS_FEEDBACK_EXEMPTIONS)[number]>();
for (const exemption of PRESS_FEEDBACK_EXEMPTIONS) {
  for (const group of movementGroups) {
    if (group.file === exemption.file && group.tokens.has(exemption.marker)) {
      exemptGroups.set(group, exemption);
    }
  }
}

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
 * Exact inventory of the ACTIVITY-INDICATOR animations the library ships, as
 * `<file>: <class>`.
 *
 * Pinned exactly, like the entrance/exit list, and for the same reason: a bare
 * "no counterpart was found" assertion passes the moment the tokeniser stops
 * seeing these classes, which is precisely the blindness this file exists to
 * prevent. If a component gains or loses a loading indicator, update this list
 * in the same commit.
 */
const EXPECTED_LOADING_USAGES = [
  'button.tsx: animate-spin',
  'dot.tsx: animate-pulse',
  'skeleton.tsx: animate-pulse',
  'spinner.tsx: animate-spin',
  'status-pill.tsx: animate-pulse',
];

/**
 * The other side of the contract: loading indicators must stay UNPAIRED.
 *
 * NIMUI-42 settled this — for an activity indicator the motion is the
 * information, and WCAG 2.2 SC 2.2.2 exempts it on that basis. Since NIMUI-33
 * made the blanket reset opt-in, nothing else damps these five, so a
 * well-meaning contributor pairing one would re-freeze it for reduced-motion
 * users and there would be no failing test to notice. This is that test.
 *
 * It is deliberately a HARD failure rather than a lint: reverting the decision
 * is allowed, but it has to be done by editing this file, in the same commit,
 * where the reasoning above is impossible to miss.
 */
describe('loading indicators are deliberately NOT paired (NIMUI-42)', () => {
  it('detects exactly the known inventory of activity-indicator animations', () => {
    const found = allLoaderUsages.map((u) => `${u.file}: ${u.className}`).sort();

    expect(
      found,
      'The set of detected loading indicators drifted from EXPECTED_LOADING_USAGES.\n' +
        '- FEWER than expected usually means the tokeniser regressed, so the exemption ' +
        'assertion below is now passing vacuously. Fix the scan.\n' +
        '- MORE (or different) means a component gained or changed a loading indicator. ' +
        'That is fine — update the list in the same commit, so the change is visible in ' +
        'review.'
    ).toEqual([...EXPECTED_LOADING_USAGES].sort());
  });

  it.each(componentFiles)('%s does not switch its loading indicator off', (file) => {
    const entry = scanned.find((s) => s.file === file)!;

    const paired = entry.groups.flatMap((group) =>
      group.loaderUsages
        .filter((u) => group.tokens.has(u.counterpart))
        .map((u) => `${u.className} was paired with "${u.counterpart}"`)
    );

    expect(
      paired,
      `${file} switches a loading indicator off under prefers-reduced-motion. That is a ` +
        'decided behaviour, not an omission (NIMUI-42): for an activity indicator the ' +
        'motion IS the information, and WCAG 2.2 SC 2.2.2 exempts it on that basis. ' +
        'Stopping it leaves the element frozen at its un-animated position, which reads ' +
        'as a hung interface rather than as work in flight.\n' +
        'An application that wants these damped opts the blanket reset back in with one ' +
        "line — `@import '@nim-ui/components/reduced-motion.css';` — rather than the kit " +
        'deciding it for everyone.\n' +
        'If the decision genuinely changed, remove the animation from LOADING_ANIMATIONS ' +
        'and EXEMPT_ANIMATIONS in this file so the normal pairing contract applies, and ' +
        'say why in the same commit.'
    ).toEqual([]);
  });
});

/**
 * Exact inventory of the movement-bearing transitions the library ships, as
 * `<file>: <class>` — the ones whose declared property list can move an
 * element. Includes the three press-feedback sites that deliberately ship no
 * counterpart, so the exemption stays visible in one list rather than hiding as
 * an absence.
 *
 * Pinned exactly rather than as a floor, for the same reason the animation list
 * is: a floor of "at least 10" stays green if the classifier silently stops
 * seeing a subset. If you add or change a transition, update this list in the
 * same commit — the diff is the point.
 *
 * Note what is NOT here: `transition-colors` (~55 sites), `transition-opacity`,
 * and the three bracketed colour/shadow lists. They move nothing. See the file
 * docblock before "completing" them.
 */
const EXPECTED_MOVEMENT_TRANSITIONS = [
  'accordion.tsx: transition-all',
  'accordion.tsx: transition-transform',
  'bar-chart.tsx: transition-all',
  'button.tsx: transition-all',
  'card.tsx: transition-[box-shadow,translate,border-color,background-color]',
  'cta.tsx: transition-all',
  'meter.tsx: transition-all',
  'product-card.tsx: transition-transform',
  'progress.tsx: transition-all',
  'switch.tsx: transition-transform',
  'toast.tsx: transition-all',
  'toast.tsx: transition-all',
  'tree-view.tsx: transition-transform',
];

/**
 * Every DISTINCT transition value the classifier decided moves nothing, as the
 * bare value (never the class name — writing the counterpart's own class here
 * would compile it, see the constants' docblock).
 *
 * Pinned so that the classifier cannot quietly reclassify a moving transition
 * as harmless: a change on either side of the line shows up in exactly one of
 * these two lists. `none` is the counterpart's own value, which the scan sees
 * as a transition like any other — and so is the four-property list below it,
 * which is `card.tsx`'s narrowed counterpart. That one appearing HERE is the
 * point of narrowing: it declares only properties the classifier calls incapable
 * of movement, which is precisely what makes it a valid counterpart while still
 * letting the crossfade run.
 *
 * `shadow` arrived when `product-card.tsx` stopped naming a transform-family
 * property it never set (NIMUI-48) and became honestly non-motion.
 *
 * The bare border-colour entry arrived the same way, for the same reason, when
 * NIMUI-57 moved the focus indicator off the ring: a ring IS a `box-shadow`, so
 * `input` and `textarea` naming that property was honest only while they drew
 * one. An outline sets neither, so the property left the list rather than
 * lingering as something nothing sets. The two-property form above it survives
 * on `tags-input`, which paints a real shadow.
 */
const EXPECTED_NON_MOTION_TRANSITION_VALUES = [
  '[background-color,border-color]',
  '[background-color,box-shadow,color]',
  '[border-color,box-shadow]',
  '[border-color]',
  '[box-shadow,border-color,background-color]',
  'colors',
  'none',
  'opacity',
  'shadow',
];

describe('every movement-bearing transition is paired with a reduced-motion counterpart', () => {
  // Same vacuity guard as the animation arm: if the tokeniser stops seeing
  // transitions, every per-file assertion below passes by finding nothing.
  it('found transitions to classify', () => {
    expect(allTransitions.length).toBeGreaterThan(50);
  });

  it('detects exactly the known inventory of movement-bearing transitions', () => {
    const found = allTransitions
      .filter((t) => t.movement)
      .map((t) => `${t.file}: ${t.className}`)
      .sort();

    expect(
      found,
      'The set of movement-bearing transitions drifted from EXPECTED_MOVEMENT_TRANSITIONS.\n' +
        '- FEWER than expected usually means the classifier regressed and this suite is now ' +
        'passing vacuously over the ones it stopped seeing. Fix the scan.\n' +
        '- MORE (or different) means a component gained or changed a transition that can move ' +
        'something. Pair it with the counterpart and add it here in the same commit, so the ' +
        'change is visible in review.'
    ).toEqual([...EXPECTED_MOVEMENT_TRANSITIONS].sort());
  });

  it('classifies exactly the known set of values as moving nothing', () => {
    const found = [
      ...new Set(allTransitions.filter((t) => !t.movement).map((t) => t.value)),
    ].sort();

    expect(
      found,
      'The set of transitions treated as non-motion drifted from ' +
        'EXPECTED_NON_MOTION_TRANSITION_VALUES. A value that quietly moved onto this side of ' +
        'the line is a transition that now ships no reduced-motion cover at all. Colour and ' +
        'opacity belong here; anything that changes size, position or a transform does not.'
    ).toEqual([...EXPECTED_NON_MOTION_TRANSITION_VALUES].sort());
  });

  it.each(PRESS_FEEDBACK_EXEMPTIONS.map((e) => [`${e.file} (${e.what})`, e] as const))(
    '%s still matches exactly one movement-bearing class string',
    (_name, exemption) => {
      const matches = movementGroups.filter(
        (g) => g.file === exemption.file && g.tokens.has(exemption.marker)
      );

      expect(
        matches.length,
        `The press-feedback exemption for ${exemption.file} matched ${matches.length} ` +
          'movement-bearing class strings, expected exactly 1.\n' +
          `- 0 means the exemption is stale: no class string in that file still carries ` +
          `"${exemption.marker}" next to a movement-bearing transition. Delete the entry (and ` +
          'the comment in the component that points here).\n' +
          '- 2+ means the marker no longer identifies ONE element, so the exemption is ' +
          'silently excusing a second transition nobody decided about. Pick a marker unique ' +
          'to the element that carries the press feedback.'
      ).toBe(1);
    }
  );

  it.each(componentFiles)(
    '%s pairs each movement-bearing transition with a counterpart',
    (file) => {
      const entry = scanned.find((s) => s.file === file)!;

      // Scoped to the SAME class string, exactly like the animation arm: a
      // counterpart on a sibling element must not excuse this one.
      const missing = entry.groups
        .filter((group) => !exemptGroups.has(group))
        .flatMap((group) =>
          group.transitions
            .filter((t) => t.movement && t.resolvedCounterpart === null)
            .map((t) => `${t.className} -> needs "${t.counterpart}" in the SAME class string`)
        );

      expect(
        missing,
        `${file} transitions something that moves without honouring prefers-reduced-motion.\n` +
          'Add the counterpart class to the same class string as the transition. It sets the ' +
          '`transition-property` longhand, so the transition does not run at all. Nothing else ' +
          'covers it: the blanket reset in reduced-motion.css became opt-in with NIMUI-33 and ' +
          'the kit no longer imports it.\n' +
          'A NARROWED counterpart also satisfies this — a reduced-motion override naming only ' +
          'properties the classifier calls incapable of movement. Prefer it when the transition ' +
          'crossfades colour or shadow alongside the movement, so the crossfade survives; ' +
          'card.tsx does this.\n' +
          'If the transition genuinely moves nothing, the fix is the property list, not an ' +
          'exemption: name the properties you actually animate instead of reaching for ' +
          '`transition-all`.\n' +
          `Deliberately unpaired: ${PRESS_FEEDBACK_EXEMPTIONS.map((e) => e.file).join(', ')} ` +
          '(press feedback — see button.tsx).'
      ).toEqual([]);
    }
  );
});

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

describe('dist/styles.css — the transition counterparts compile and win', () => {
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

    const start = distCss.indexOf('@layer utilities {');
    if (start === -1) {
      throw new Error(
        'No `@layer utilities` block in dist/styles.css. The compiled output changed shape; ' +
          'the source-order assertions in this suite assume both rules share one layer and ' +
          'must be re-derived before they can be trusted.'
      );
    }
    const braceStart = distCss.indexOf('{', start);
    utilitiesLayer = { start, end: braceStart + 1 + ruleBodyAt(distCss, start).length };
  });

  // One rule covers every paired site, so assert per DISTINCT pair: what differs
  // between them is the rule the counterpart has to beat. Keyed on BOTH classes
  // because the counterpart is no longer a function of the transition — a
  // narrowed override and the switch-it-all-off one are both valid, so two
  // components could share a transition class and cover it differently.
  const coveredClasses = [
    ...new Map(
      allGroups
        .filter((g) => !exemptGroups.has(g))
        .flatMap((g) => g.transitions)
        .filter((t) => t.movement && t.resolvedCounterpart !== null)
        .map((t) => [`${t.className}|${t.resolvedCounterpart}`, t])
    ).values(),
  ].sort((a, b) => a.className.localeCompare(b.className));

  // Only three distinct classes reach here, and that is expected rather than a
  // thin sample: nearly every moving site in the kit reaches for one of
  // Tailwind's two named values, which compile to one rule each however many
  // components use them. The inventory pinned in EXPECTED_MOVEMENT_TRANSITIONS is
  // what guards the per-SITE coverage; this floor only guards against the map
  // above collapsing to nothing.
  it('has paired transitions to assert against', () => {
    expect(coveredClasses.length).toBeGreaterThanOrEqual(3);
  });

  // Every entry here has a non-null resolvedCounterpart by construction — the
  // source arm above is what fails when one is missing.
  it.each(coveredClasses.map((t) => [t.className, t] as const))(
    '%s is switched off under prefers-reduced-motion by a rule that wins',
    (_name, usage) => {
      const counterpart = usage.resolvedCounterpart!;
      const selector = toSelector(counterpart);
      const idx = findSelectorIndex(distCss, selector);

      expect(
        idx,
        `No compiled rule for ${selector} in dist/styles.css (used by ${usage.file}). ` +
          'The class name exists in source but Tailwind generated nothing for it — it is ' +
          'a dead class and reduced-motion users still get the movement. Rebuild with ' +
          '`pnpm --filter @nim-ui/components build`; if it is still missing, the variant ' +
          'chain is malformed.'
      ).toBeGreaterThan(-1);

      const body = ruleBodyAt(distCss, idx);
      expect(body, `${selector} compiled to an empty rule body.`).toMatch(
        /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/
      );

      // The `transition-property` longhand specifically. Clamping the DURATION
      // is all the blanket reset in reduced-motion.css ever did, and that reset
      // is opt-in now — re-declaring the property list is what makes this cover
      // stand on its own.
      const declared = [...body.matchAll(/transition-property:\s*([^;}]+)/g)].map((m) =>
        (m[1] ?? '').trim()
      );

      expect(
        declared.length,
        `${selector} does not set the transition-property longhand at all, so it only ` +
          'duplicates what the opt-in blanket reset does — and the kit no longer ships that ' +
          'reset, so nothing covers this transition at all.'
      ).toBeGreaterThan(0);

      // Read what the counterpart RE-DECLARES rather than insisting it be the
      // off switch. A narrowed override is equally effective at suppressing
      // movement and keeps the crossfade, so the assertion that matters is that
      // nothing movement-bearing survives in the list — checked property by
      // property against the same classifier the source arm uses, so the two
      // halves cannot disagree about what counts as movement.
      const stillMoving = declared
        .flatMap((value) => value.split(','))
        .map((property) => property.trim().toLowerCase())
        .filter(
          (property) =>
            property !== '' &&
            property !== 'none' &&
            !NON_MOTION_TRANSITION_PROPERTIES.has(property)
        );

      expect(
        stillMoving,
        `${selector} still declares ${stillMoving.join(', ')} under prefers-reduced-motion, so ` +
          'the element keeps moving for users who asked it not to. A counterpart may narrow the ' +
          'property list to the colour and shadow properties, but anything left in it that can ' +
          'change size, position or a transform defeats the point.'
      ).toEqual([]);

      const transitionIdx = findSelectorIndex(distCss, toSelector(usage.className));
      expect(
        transitionIdx,
        `No compiled rule for ${toSelector(usage.className)} — the scan and the build disagree.`
      ).toBeGreaterThan(-1);

      // Byte offsets only decide the cascade inside one layer.
      for (const [label, at] of [
        [selector, idx],
        [toSelector(usage.className), transitionIdx],
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
        `${selector} is emitted BEFORE ${toSelector(usage.className)} in dist/styles.css. ` +
          'Both selectors have the same specificity and share a cascade layer — a media ' +
          'query adds none — so the earlier one loses and the element still moves under ' +
          'prefers-reduced-motion.'
      ).toBeGreaterThan(transitionIdx);
    }
  );

  // The whole mechanism rests on nothing else claiming that longhand with
  // `!important`: an important declaration outranks the counterpart whatever
  // the layer or order. The blanket reset deliberately clamps DURATION only,
  // and this is the assertion that keeps it that way.
  it('leaves the transition-property longhand uncontested by any !important rule', () => {
    const offenders = [...distCss.matchAll(/transition-property:[^;{}]*!important/g)].map(
      (m) => m[0]
    );

    expect(
      offenders,
      'Something in the compiled stylesheet sets transition-property with !important. That ' +
        'beats every per-component counterpart regardless of cascade layer or source order, ' +
        'so the paired transitions would either move under reduced motion or stop moving for ' +
        'everyone. Keep the blanket reset on the duration longhands.'
    ).toEqual([]);
  });
});
