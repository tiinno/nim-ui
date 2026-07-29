import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Guards against a specific class of dead Tailwind utility: a custom `@theme`
 * token (e.g. `--duration-slow`) that has no corresponding Tailwind v4
 * namespace, so `duration-slow` in JSX never becomes a real CSS rule — the
 * class name matches nothing, and every transition silently falls back to
 * Tailwind's default 150ms duration.
 *
 * A test that only asserts the class STRING in a component (e.g. "className
 * contains 'duration-slow'") does not catch this: the string is always
 * present, it just means nothing once compiled. The only way to catch it is
 * to read the BUILT stylesheet and assert a real rule with the right value
 * exists.
 *
 * This test intentionally has a hard dependency on `dist/styles.css`
 * existing. If it's missing, we fail loudly with instructions — we do NOT
 * skip, because a skipped test here is exactly the silent-failure mode this
 * test exists to eliminate.
 */

const distStylesPath = resolve(__dirname, '../dist/styles.css');

let distCss: string;

beforeAll(() => {
  if (!existsSync(distStylesPath)) {
    throw new Error(
      `packages/ui/dist/styles.css does not exist at ${distStylesPath}.\n` +
        'This test asserts against the BUILT stylesheet, not source CSS, ' +
        'because dead Tailwind utilities (a class name that matches no ' +
        'generated rule) are invisible in source and only detectable in the ' +
        'compiled output. Run `pnpm --filter @nim-ui/components build` first.'
    );
  }
  distCss = readFileSync(distStylesPath, 'utf-8');
});

/**
 * Find a top-level CSS rule for the given literal selector body (e.g. the
 * literal text `duration-\(--duration-fast\)` or `shadow-soft`, exactly as
 * it appears after the leading `.` in compiled CSS — including the real
 * backslash-escape characters Tailwind emits for selectors containing `(`
 * `)`) and return the rule's body, or undefined if no such rule was emitted.
 *
 * Deliberately does plain string search rather than building a RegExp from
 * the selector text: the selector itself contains regex metacharacters
 * (parens) plus literal backslashes, and round-tripping those through
 * RegExp escaping is exactly the kind of subtle bug this test exists to
 * avoid introducing.
 */
function findRuleBody(css: string, literalSelectorBody: string): string | undefined {
  const needle = `.${literalSelectorBody}`;
  let searchFrom = 0;
  while (true) {
    const idx = css.indexOf(needle, searchFrom);
    if (idx === -1) return undefined;
    // Guard against matching a longer selector that merely starts with this
    // one (e.g. `.ease-in` must not match inside `.ease-in-out`) — the
    // character immediately after the needle must not continue an
    // identifier (word char or `-`).
    const nextChar = css[idx + needle.length];
    if (nextChar === undefined || !/[\w-]/.test(nextChar)) {
      const braceStart = css.indexOf('{', idx);
      if (braceStart === -1) return undefined;
      const braceEnd = css.indexOf('}', braceStart);
      if (braceEnd === -1) return undefined;
      return css.slice(braceStart + 1, braceEnd);
    }
    searchFrom = idx + needle.length;
  }
}

describe('dist/styles.css — custom @theme tokens compile to real utilities', () => {
  describe('duration tokens', () => {
    const cases: Array<{ token: string; ms: string }> = [
      { token: 'fast', ms: '150ms' },
      { token: 'normal', ms: '200ms' },
      { token: 'slow', ms: '300ms' },
    ];

    it.each(cases)(
      'emits a real .duration-(--duration-$token) rule with transition-duration: $ms',
      ({ token, ms }) => {
        const literalSelector = `duration-\\(--duration-${token}\\)`;
        const body = findRuleBody(distCss, literalSelector);
        expect(
          body,
          `Expected a compiled rule for .duration-(--duration-${token}) in dist/styles.css. ` +
            'If this is missing, the utility is dead — the class name in JSX matches no ' +
            'Tailwind-generated CSS and the transition silently falls back to the 150ms default.'
        ).toBeDefined();

        // The custom property must resolve through the semantic token (not a
        // hardcoded literal), so a later change to --duration-slow propagates.
        expect(body).toMatch(new RegExp(`--tw-duration:\\s*var\\(--duration-${token}\\)`));
        expect(body).toMatch(new RegExp(`transition-duration:\\s*var\\(--duration-${token}\\)`));

        // And the underlying custom property itself must resolve to the
        // expected millisecond value somewhere in the theme block.
        expect(distCss).toMatch(new RegExp(`--duration-${token}:\\s*${ms}\\b`));
      }
    );
  });

  describe('easing tokens', () => {
    const easingNames = ['ease-out', 'ease-in', 'ease-in-out'];

    it.each(easingNames)('emits a real .%s rule backed by the custom-property token', (name) => {
      const body = findRuleBody(distCss, name);
      expect(
        body,
        `Expected a compiled .${name} rule in dist/styles.css.`
      ).toBeDefined();
      expect(body).toMatch(new RegExp(`--tw-ease:\\s*var\\(--${name}\\)`));
    });
  });

  describe('shadow tokens', () => {
    const shadowNames = ['soft', 'panel', 'control'];

    it.each(shadowNames)('emits a real .shadow-%s rule with a non-empty box-shadow value', (name) => {
      const body = findRuleBody(distCss, `shadow-${name}`);
      expect(
        body,
        `Expected a compiled .shadow-${name} rule in dist/styles.css.`
      ).toBeDefined();
      expect(body).toMatch(/--tw-shadow:\s*\S/);
      expect(body).toMatch(/box-shadow:\s*var\(--tw-inset-shadow\)/);
    });
  });
});

/**
 * Walk every `{ … }` block in a stylesheet and return each one with the chain
 * of preludes enclosing it, so a rule's cascade context can be asserted
 * structurally instead of by comparing byte offsets (which is exactly the
 * brittleness this replaces).
 *
 * Quoted strings are skipped so a brace inside a `content:` value or a data
 * URI cannot desynchronise the walker.
 */
interface CssBlock {
  /** Selector or at-rule prelude, whitespace-collapsed. */
  prelude: string;
  /** Preludes of every enclosing block, outermost first. */
  ancestors: string[];
  /** The block's body, braces excluded. */
  body: string;
}

function collectBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  /** Indexes into `blocks` for the currently open blocks, plus each body start. */
  const open: Array<{ index: number; bodyStart: number }> = [];
  const stack: string[] = [];
  let preludeStart = 0;

  for (let i = 0; i < css.length; i++) {
    const c = css[i];

    if (c === '"' || c === "'") {
      for (let j = i + 1; j < css.length; j++) {
        if (css[j] === '\\') j++;
        else if (css[j] === c) {
          i = j;
          break;
        }
      }
      continue;
    }

    if (c === '{') {
      const prelude = css.slice(preludeStart, i).replace(/\s+/g, ' ').trim();
      open.push({ index: blocks.length, bodyStart: i + 1 });
      blocks.push({ prelude, ancestors: [...stack], body: '' });
      stack.push(prelude);
      preludeStart = i + 1;
    } else if (c === '}') {
      const opened = open.pop();
      if (opened) {
        const block = blocks[opened.index];
        if (block) block.body = css.slice(opened.bodyStart, i);
      }
      stack.pop();
      preludeStart = i + 1;
    } else if (c === ';') {
      preludeStart = i + 1;
    }
  }

  return blocks;
}

/**
 * The global reduced-motion damper — the `*, *::before, *::after` reset that
 * `styles.css` pulls in from `./reduced-motion.css`.
 *
 * This exists so "the extraction into reduced-motion.css was behaviour-neutral"
 * stops resting on a human diffing byte offsets in the built stylesheet. The
 * rule reaches every element in the consumer's app, and it is currently the
 * ONLY thing damping the kit's own `animate-spin` / `animate-pulse` loaders
 * (`Spinner`, `Skeleton`, `Dot`, `StatusPill`, `Button`) — those are exempt
 * from the per-component `motion-reduce:animate-none` contract that
 * `motion-reduce.test.ts` enforces, so nothing else would notice if it
 * silently stopped being emitted.
 *
 * **This is the assertion the opt-in slice flips.** When the damper stops
 * shipping in the default bundle (NIMUI-33), flip it: assert the blanket
 * block is ABSENT from `dist/styles.css` and present in
 * `src/reduced-motion.css`, and update `motion-reduce.test.ts`'s
 * `EXEMPT_ANIMATIONS` note — full-speed loaders under reduced motion are the
 * intended outcome there (NIMUI-42), not a regression.
 *
 * Note the block is deliberately NOT located by searching for
 * `@media (prefers-reduced-motion: reduce)`: every `motion-reduce:` utility
 * compiles to its own such media block inside `@layer utilities`, so the first
 * textual match is one of those, not this rule.
 */
describe('dist/styles.css — the global reduced-motion damper', () => {
  const BLANKET_SELECTOR = '*, *::before, *::after';
  const REDUCE_MEDIA = '@media (prefers-reduced-motion: reduce)';

  let blanketBlocks: CssBlock[];

  beforeAll(() => {
    blanketBlocks = collectBlocks(distCss).filter((b) => b.prelude === BLANKET_SELECTOR);
  });

  it('is emitted exactly once', () => {
    expect(
      blanketBlocks.length,
      `Expected exactly one \`${BLANKET_SELECTOR}\` block in dist/styles.css.\n` +
        '0 means styles.css stopped importing ./reduced-motion.css, so every animation and ' +
        'transition now runs at full speed under prefers-reduced-motion — including the ' +
        'kit\'s own loaders, which have no per-component counterpart. If that removal is ' +
        'deliberate (NIMUI-33), flip this suite rather than deleting it.\n' +
        '>1 means the reset is being imported twice.'
    ).toBe(1);
  });

  it('sits inside the prefers-reduced-motion media query', () => {
    // `?? []` so a missing block fails as "expected [] to include …" rather
    // than as an unreadable "undefined is invalid for this assertion".
    expect(blanketBlocks[0]?.ancestors ?? []).toContain(REDUCE_MEDIA);
  });

  it('is UNLAYERED, which is what lets it outrank every utility', () => {
    const block = blanketBlocks[0];
    const layers = (block?.ancestors ?? []).filter((a) => a.startsWith('@layer'));

    expect(
      layers,
      'The blanket reduced-motion reset is enclosed in a cascade layer ' +
        `(${layers.join(' > ')}). Unlayered NORMAL declarations outrank every layered one ` +
        'regardless of source position, which is the whole basis of this rule winning; ' +
        'inside a layer it can be beaten by any later layer. Move the @import back out of ' +
        'any @layer block in styles.css.'
    ).toEqual([]);
  });

  it('still clamps animation and transition with !important', () => {
    const body = blanketBlocks[0]?.body ?? '';
    expect(body).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(body).toMatch(/animation-iteration-count:\s*1\s*!important/);
    expect(body).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });
});

/**
 * The dist-emission checks above only guard REMOVAL of a working utility —
 * they stay green as long as at least one component in the whole library
 * still requests the token-preserving form, even if a brand-new component
 * reintroduces the bare (dead) `duration-fast` / `duration-normal` /
 * `duration-slow` class. That reintroduction is exactly the original bug, so
 * it needs its own guard: scan every component source file directly for the
 * bare form and fail per-file if found, independent of what the rest of the
 * library does.
 */
describe('component sources never reintroduce a bare duration-* class', () => {
  const componentsDir = resolve(__dirname, 'components');

  const componentFiles = readdirSync(componentsDir)
    .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
    .sort();

  // Sanity check on the scan itself: if this drops to 0, the glob broke and
  // every other assertion in this suite would pass vacuously.
  it('found component source files to scan', () => {
    expect(componentFiles.length).toBeGreaterThan(20);
  });

  it.each(componentFiles)('%s uses no bare (dead) duration-fast/normal/slow class', (file) => {
    const source = readFileSync(join(componentsDir, file), 'utf-8');

    // Matches `duration-fast`/`duration-normal`/`duration-slow` NOT preceded
    // by `--` (which would mean it's the CSS custom-property name inside the
    // token-preserving `duration-(--duration-fast)` form — the only form
    // that actually compiles to a real Tailwind v4 utility).
    const bareDurationClass = /(?<!--)\bduration-(fast|normal|slow)\b/;

    expect(
      source,
      `${file} uses a bare "duration-${(source.match(bareDurationClass) ?? [])[1] ?? '?'}" class. ` +
        'Tailwind v4 has no --duration-* theme namespace, so this class name matches no ' +
        'generated CSS and the transition silently falls back to the 150ms default. Use the ' +
        'token-preserving form instead: duration-(--duration-fast) / duration-(--duration-normal) / duration-(--duration-slow).'
    ).not.toMatch(bareDurationClass);
  });
});
