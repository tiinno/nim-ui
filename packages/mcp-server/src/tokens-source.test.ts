import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { loadTokens, renderTokens, formatTokenSection, NO_SPACING_TOKENS } from './tokens-source.js';

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
 * token load, and the document the tool returns. The server wiring is not —
 * `index.ts` self-starts a stdio server on import, so it cannot be imported by
 * a test, which is why the fragile logic was moved out rather than tested in
 * place.
 */

const TOKENS_MODULE = pathToFileURL(resolve(__dirname, '../../tailwind-config/src/tokens.js')).href;

describe('loadTokens', () => {
  it('imports the real tokens module this server ships against', async () => {
    const tokens = await loadTokens(TOKENS_MODULE);

    expect(Object.keys(tokens).sort()).toEqual(['animation', 'borderRadius', 'colors', 'typography']);
  });

  it('serves no spacing scale, because the kit declares none', async () => {
    const tokens = (await loadTokens(TOKENS_MODULE)) as unknown as Record<string, unknown>;

    expect(
      'spacing' in tokens,
      'A `spacing` key is back in tokens.js. NIMUI-61 removed it because it had no counterpart ' +
        'in any stylesheet, and this server was handing those values to clients as if they ' +
        'shipped. If spacing tokens are real now, `renderTokens` should serve them instead of ' +
        'explaining their absence.'
    ).toBe(false);
    expect('fontSize' in (tokens.typography as object)).toBe(false);
  });

  it('fails loudly when the module has no tokens export', async () => {
    const notATokensModule = pathToFileURL(resolve(__dirname, './tokens-source.js')).href;

    await expect(loadTokens(notATokensModule)).rejects.toThrow(/No `tokens` export/);
  });
});

describe('renderTokens', () => {
  it('renders every section for "all", including animation', async () => {
    const output = renderTokens(await loadTokens(TOKENS_MODULE), 'all');

    for (const heading of ['## Colors', '## Spacing', '## BorderRadius', '## Typography', '## Animation']) {
      expect(output, `"${heading}" is missing from the "all" document.`).toContain(heading);
    }
  });

  it('explains the missing spacing scale rather than omitting it', async () => {
    const tokens = await loadTokens(TOKENS_MODULE);

    // Silence would read as "not loaded" to a client, which is the failure this
    // wording exists to prevent.
    expect(renderTokens(tokens, 'all')).toContain(NO_SPACING_TOKENS);
    expect(renderTokens(tokens, 'spacing')).toContain(NO_SPACING_TOKENS);
  });

  it('keeps each tokenType to its own sections', async () => {
    const tokens = await loadTokens(TOKENS_MODULE);

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

  it('serves values a client can read back', async () => {
    const tokens = await loadTokens(TOKENS_MODULE);
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
