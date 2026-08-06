import { describe, it, expect } from 'vitest';
import { renderTokens, formatTokenSection, NO_SPACING_TOKENS, type TokensData } from './tokens-source.js';
import { tokens as realTokens } from '@nim-ui/tailwind-config/tokens';

/**
 * The first tests this package has ever had.
 *
 * `@nim-ui/mcp-server` is the surface that hands the registry and the design
 * tokens to AI clients, and nothing checked either — no test file, and no
 * `test` script for turbo to run, so the repo-wide gate reported success while
 * skipping the package entirely. NIMUI-61 changed the token output with only
 * `tsc --noEmit` behind it.
 *
 * What is covered here is the part that can break without anyone noticing: the
 * shape of the tokens object, and the document the tool returns. The server
 * wiring is not — `index.ts` self-starts a stdio server on import, so it cannot
 * be imported by a test, which is why the fragile logic was moved out rather
 * than tested in place. `server.integration.test.ts` covers the wiring by
 * spawning the built binary.
 *
 * NIMUI-93 removed the `loadTokens` these tests used to call. There is no
 * loader to test any more: the tokens arrive by static import, exactly as
 * `index.ts` takes them, so this file exercises the same module the shipped
 * server inlines. The one case that went with it — "throws when the module has
 * no `tokens` export" — is now a compile error, which is a stronger guard than
 * the runtime throw it replaced and cannot be asserted from here.
 */

const tokens = realTokens as TokensData;

describe('the tokens module this server ships against', () => {
  it('has exactly the four groups the renderer knows how to serve', () => {
    expect(Object.keys(tokens).sort()).toEqual(['animation', 'borderRadius', 'colors', 'typography']);
  });

  it('declares no spacing scale, because the kit declares none', () => {
    const asRecord = tokens as unknown as Record<string, unknown>;

    expect(
      'spacing' in asRecord,
      'A `spacing` key is back in tokens.js. NIMUI-61 removed it because it had no counterpart ' +
        'in any stylesheet, and this server was handing those values to clients as if they ' +
        'shipped. If spacing tokens are real now, `renderTokens` should serve them instead of ' +
        'explaining their absence.'
    ).toBe(false);
    expect('fontSize' in (tokens.typography as object)).toBe(false);
  });
});

describe('renderTokens', () => {
  it('renders every section for "all", including animation', () => {
    const output = renderTokens(tokens, 'all');

    for (const heading of ['## Colors', '## Spacing', '## BorderRadius', '## Typography', '## Animation']) {
      expect(output, `"${heading}" is missing from the "all" document.`).toContain(heading);
    }
  });

  it('explains the missing spacing scale rather than omitting it', () => {
    // Silence would read as "not loaded" to a client, which is the failure this
    // wording exists to prevent.
    expect(renderTokens(tokens, 'all')).toContain(NO_SPACING_TOKENS);
    expect(renderTokens(tokens, 'spacing')).toContain(NO_SPACING_TOKENS);
  });

  it('keeps each tokenType to its own sections', () => {
    const colors = renderTokens(tokens, 'colors');
    expect(colors).toContain('## Colors');
    expect(colors).not.toContain('## Typography');

    const typography = renderTokens(tokens, 'typography');
    expect(typography).toContain('## Typography');
    expect(typography).not.toContain('## Colors');

    const spacing = renderTokens(tokens, 'spacing');
    expect(spacing).toContain('## BorderRadius');
    expect(spacing).not.toContain('## Colors');
  });

  it('serves values a client can read back', () => {
    const output = renderTokens(tokens, 'colors');

    const fenced = /```json\n([\s\S]*?)\n```/.exec(output);
    expect(fenced, 'The colours section is not a parseable JSON fence.').not.toBeNull();

    const parsed = JSON.parse(fenced![1] as string);
    expect(parsed.primary['500']).toBe(tokens.colors.primary?.['500']);
  });
});

describe('formatTokenSection', () => {
  it('capitalises the heading without touching the rest of the name', () => {
    expect(formatTokenSection({}, 'borderRadius')).toContain('## BorderRadius');
  });
});
