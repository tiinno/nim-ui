/**
 * Reading `tokens.js` and rendering it for a client.
 *
 * Extracted from `index.ts` so it can be tested. This package had **no tests at
 * all** — it is the surface that hands the registry and the design tokens to AI
 * clients, and nothing checked either. `index.ts` self-starts a stdio server on
 * import, so it cannot be imported by a test; splitting the fragile parts out
 * leaves the binary's startup path untouched.
 *
 * The load also stopped going through a regex. `tokens.js` used to be read as
 * TEXT, matched with `/export\s+const\s+tokens\s+=\s+({[\s\S]*});/`, and handed
 * to `new Function`. That coupled this package to the other one's FORMATTING —
 * a reordered export, a dropped semicolon, a rename, and the match silently
 * yields nothing. NIMUI-61 rewrote large parts of that file and nothing here
 * would have noticed if the shape had broken.
 *
 * NIMUI-93 finished that move. There is no loader left at all: `index.ts`
 * imports `tokens` from `@nim-ui/tailwind-config/tokens` statically and tsup
 * inlines it. A `loadTokens(specifier)` that dynamically imported a path on
 * disk is what made the published server unstartable — the path pointed at a
 * `private: true` package that will never be on the registry — and its one
 * runtime check, "throw if the module has no `tokens` export", is now a
 * compile error instead. That is strictly stronger: it fails the build rather
 * than the binary, and it cannot be reached in production at all.
 */

/** The token object shape this server serves. Loose on purpose — the source owns it. */
export interface TokensData {
  colors: Record<string, Record<string, string>>;
  borderRadius: Record<string, string>;
  typography: Record<string, unknown>;
  animation: Record<string, unknown>;
}

export type TokenType = 'colors' | 'spacing' | 'typography' | 'all';

/**
 * The kit declares no spacing scale of its own.
 *
 * It used to appear in the output, read out of a `spacing` block that had no
 * counterpart in any stylesheet — so every client asking for Nim UI's spacing
 * tokens was handed values that shipped nowhere. NIMUI-61 removed the block.
 * This says so rather than returning nothing, because a silent omission reads
 * as "not loaded".
 */
export const NO_SPACING_TOKENS =
  '## Spacing\n\n' +
  "Nim UI declares no spacing tokens. Spacing comes from Tailwind's own scale — `p-4` is " +
  '`calc(var(--spacing) * 4)`, 16px at the default 0.25rem base — and the kit uses it ' +
  'directly rather than naming its own steps.\n\n';

/** One `## Heading` + fenced JSON section. */
export function formatTokenSection(tokens: unknown, category: string): string {
  return (
    `## ${category.charAt(0).toUpperCase()}${category.slice(1)}\n\n` +
    `\`\`\`json\n${JSON.stringify(tokens, null, 2)}\n\`\`\`\n\n`
  );
}

/** The full document for a `tokenType`, as the `ui_get_tokens` tool returns it. */
export function renderTokens(tokens: TokensData, tokenType: TokenType): string {
  let output = `# Nim UI Design Tokens\n\n`;

  if (tokenType === 'all') {
    output += formatTokenSection(tokens.colors, 'colors');
    output += NO_SPACING_TOKENS;
    output += formatTokenSection(tokens.borderRadius, 'borderRadius');
    output += formatTokenSection(tokens.typography, 'typography');
    output += formatTokenSection(tokens.animation, 'animation');
  } else if (tokenType === 'colors') {
    output += formatTokenSection(tokens.colors, 'colors');
  } else if (tokenType === 'spacing') {
    output += NO_SPACING_TOKENS;
    output += formatTokenSection(tokens.borderRadius, 'borderRadius');
  } else if (tokenType === 'typography') {
    output += formatTokenSection(tokens.typography, 'typography');
  }

  return output;
}
