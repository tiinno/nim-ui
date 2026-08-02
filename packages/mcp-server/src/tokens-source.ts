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
 * It is an ES module with a named export, so it is now imported as one. No
 * regex, no evaluated substring, and formatting stops mattering.
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

/**
 * Import the `tokens` object from a `tokens.js` on disk.
 *
 * `specifier` is a file URL rather than a path: Node's ESM loader rejects a
 * bare Windows path, and this server is developed on one.
 *
 * Throws if the module has no `tokens` export, which is the case worth failing
 * loudly on — a server that starts and serves `undefined` fields looks healthy.
 */
export async function loadTokens(specifier: string): Promise<TokensData> {
  const module = (await import(/* @vite-ignore */ specifier)) as { tokens?: TokensData };

  if (module.tokens === undefined) {
    throw new Error(
      `No \`tokens\` export in ${specifier}. This server mirrors ` +
        '@nim-ui/tailwind-config/tokens; if that module was renamed or restructured, this is ' +
        'where it surfaces.'
    );
  }

  return module.tokens;
}

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
