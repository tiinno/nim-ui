/**
 * Shared helpers for the style guards in `src/*.test.ts`: read the class strings
 * a component actually ships, and read what a compiled utility rule actually
 * declares.
 *
 * Lifted verbatim out of `motion-reduce.test.ts` when
 * `transition-property.test.ts` needed the same two capabilities. Two
 * hand-rolled copies of a TSX string scanner would drift, and a drifting
 * scanner goes blind *silently* — a file it trips on simply yields fewer
 * literals and every assertion about it passes by finding nothing. That is the
 * one failure mode every guard in this package exists to prevent, so the
 * scanner lives in one place with one set of callers keeping it honest.
 *
 * Test support only — nothing here is exported from the package entry point.
 * Tailwind used to scan this file like any other; since NIMUI-52 `src/styles.css`
 * excludes the whole `src/test` directory, so prose here can no longer compile a
 * rule into the published stylesheet. Keep writing plain property names anyway —
 * the shipped sources this scanner reads are still scanned, and the habit is what
 * stops the next leak landing there. See `motion-reduce.test.ts` for what a
 * utility written in prose costs.
 */

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
 * Comments are skipped on purpose: a JSDoc `@example` mentioning a
 * reduced-motion counterpart must NOT satisfy a pairing requirement — only a
 * class that actually reaches the DOM counts.
 *
 * Template-literal interpolations (`${…}`) are blanked out rather than parsed;
 * no component builds a class string that way today, and if one ever does the
 * worst case is that the group splits early and a guard asks for something it
 * can already see.
 */
export function extractStringLiterals(source: string): string[] {
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
 * Turn a Tailwind class name into the selector Tailwind emits for it: every
 * character outside `[A-Za-z0-9_-]` is backslash-escaped, so
 * `data-[state=open]:motion-reduce:animate-none` becomes
 * `.data-\[state\=open\]\:motion-reduce\:animate-none`.
 */
export function toSelector(className: string): string {
  return `.${className.replace(/[^A-Za-z0-9_-]/g, (c) => `\\${c}`)}`;
}

/**
 * Index of a top-level rule for `selector`, or -1. Guards against matching a
 * longer selector that merely starts with this one (`.animate-fade-in` must
 * not match inside a longer `.animate-fade-in-…`) and against matching the tail
 * of a longer one (the leading `.` already does that).
 */
export function findSelectorIndex(css: string, selector: string): number {
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
export function ruleBodyAt(css: string, idx: number): string {
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
 * Every CSS property `className`'s compiled rule declares, at any nesting
 * depth, or `null` when Tailwind emitted no rule for that class at all.
 *
 * `null` and an empty set mean different things and both matter: `null` is "not
 * a utility Tailwind knows" (most string literals in a component are not class
 * names), an empty set would be "a rule that declares nothing".
 *
 * Custom properties are excluded — a declaration of `--tw-translate-y` is
 * bookkeeping, not something a transition can interpolate. That distinction is
 * the entire point of the caller in `transition-property.test.ts`: in Tailwind
 * v4 the movement utilities set a custom property *and* one of the independent
 * longhands, and never the legacy combined one.
 *
 * The scan keys on `{` / `;` before a `<name>:` so it picks up declarations
 * inside nested selectors and media queries while skipping `&:hover`,
 * `@media (…: …)` and the like, whose colons are never preceded by either.
 */
export function declaredProperties(css: string, className: string): Set<string> | null {
  const idx = findSelectorIndex(css, toSelector(className));
  if (idx === -1) return null;

  const properties = new Set<string>();
  for (const match of ruleBodyAt(css, idx).matchAll(/(?:^|[{;])\s*(-?[a-z][a-z0-9-]*)\s*:/g)) {
    const property = match[1];
    if (property !== undefined) properties.add(property);
  }
  return properties;
}
