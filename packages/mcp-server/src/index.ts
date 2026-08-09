import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { renderTokens, type TokenType, type TokensData } from './tokens-source.js';
import {
  renderComponentList,
  renderComponent,
  renderSearch,
  renderExamples,
  type RegistryData,
} from './registry-tools.js';
import registryJson from '@nim-ui/components/registry';
import { tokens } from '@nim-ui/tailwind-config/tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Registry types and the documents built from them live in `registry-tools.ts`,
// so they can be tested — see the note at the top of that file.

/**
 * Where this server's data comes from, and why none of it is read from a
 * sibling package at runtime.
 *
 * Until NIMUI-93 all three inputs were read through paths relative to
 * `__dirname` — `../../ui/src/registry/index.json`,
 * `../../tailwind-config/src/tokens.js`, and `../../ui/src/<file>` for source.
 * Inside this workspace those land on `packages/ui` and
 * `packages/tailwind-config`. Installed from the registry they land on
 * `node_modules/@nim-ui/ui`, a package that exists under no name, and on
 * `@nim-ui/tailwind-config`, which is `private: true` and will never be
 * published. The server threw in `loadData` and exited 1 for every consumer;
 * only the workspace layout ever made it work.
 *
 * The registry and the tokens object are now static imports, which tsup inlines
 * into `dist/index.js` — so they cannot go missing, and a rename breaks the
 * build instead of the binary. Component sources are copied into
 * `dist/sources/` by `scripts/copy-sources.mjs` and read from there.
 *
 * Depending on `@nim-ui/components` at runtime was the alternative and was
 * rejected on measurement: the kit carries 23 runtime dependencies and declares
 * `react`/`react-dom` as **peers**, so `npx nim-mcp` — a stdio server that
 * emits text — would have required React to be installed.
 */
const registryData = registryJson as RegistryData;
const tokensData = tokens as TokensData;

/**
 * The version reported in the MCP handshake, injected at build time.
 *
 * `tsup.config.ts` reads this package's own `package.json` — it is build
 * tooling, not part of this `rootDir`-pinned program, so it can — and passes
 * the version to esbuild's `define`, which replaces every reference to
 * `process.env.NIM_MCP_VERSION` in the bundle with the literal string. By the
 * time this runs as `dist/index.js` there is no `package.json` read left: the
 * value is baked in, same as the registry and tokens imports above.
 *
 * NIMUI-96: a hand-kept literal here went stale through two releases before
 * `packaged-layout.test.ts` caught it (it spawns the packaged binary and
 * diffs the handshake against `package.json`). `define` is keyed on the exact
 * `process.env.NIM_MCP_VERSION` text, so a divergence between this reference
 * and the `define` key (a typo on either side) leaves a live `process.env`
 * read in the bundle — `undefined` at startup, since nothing sets that var —
 * and the throw below fails the server loudly instead of reporting a
 * fabricated version. When the substitution succeeds, as it does today, the
 * throw is dead code and esbuild folds it away: measured, `dist/index.js`
 * contains `var MCP_SERVER_VERSION = "0.1.1"` and zero occurrences of
 * `NIM_MCP_VERSION`, so no `process.env` read ships either way.
 */
// Typed (not narrowed from a guard) so the constant is `string` at every use
// site, including inside the class below: control-flow narrowing of a
// module-level `const` does not survive a closure boundary, and `tsup`'s
// `dts: true` step runs the real TypeScript compiler, which caught that.
const MCP_SERVER_VERSION: string =
  process.env.NIM_MCP_VERSION ??
  (() => {
    throw new Error(
      'NIM_MCP_VERSION was not injected at build time — see the `define` in tsup.config.ts.'
    );
  })();

/** The root the copied component sources sit under. See `copy-sources.mjs`. */
const SOURCES_ROOT = join(__dirname, 'sources');

// Zod schemas for validation
const ListComponentsSchema = z.object({
  category: z
    .enum(['primitives', 'layout', 'data-display', 'commerce', 'landing', 'feedback', 'forms', 'navigation'])
    .optional(),
});

const GetComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
});

const GetTokensSchema = z.object({
  tokenType: z.enum(['colors', 'spacing', 'typography', 'all']).optional().default('all'),
});

const SearchComponentsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

const GetExampleSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  exampleIndex: z.number().int().min(0).optional(),
});

class NimMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'nim-ui-mcp',
        // See MCP_SERVER_VERSION above: injected by tsup's `define` from
        // package.json, not hand-kept.
        version: MCP_SERVER_VERSION,
      },
      {
        capabilities: { tools: {} },
      }
    );
    this.setupHandlers();
  }

  private setupHandlers() {
    // Handler for listing available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'ui_list_components',
          description:
            'List all available UI components with optional category filter. Returns components grouped by category.',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['primitives', 'layout', 'data-display', 'commerce', 'landing', 'feedback', 'forms', 'navigation'],
                description: 'Optional category to filter components',
              },
            },
          },
        },
        {
          name: 'ui_get_component',
          description:
            'Get full details of a specific component including metadata and source code.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the component (e.g., "Button", "Card")',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'ui_get_tokens',
          description:
            'Get design tokens from the Nim UI design system (colors, typography, radius, animation). ' +
            'The kit declares no spacing tokens of its own — spacing comes from Tailwind.',
          inputSchema: {
            type: 'object',
            properties: {
              tokenType: {
                type: 'string',
                enum: ['colors', 'spacing', 'typography', 'all'],
                description:
                  'Type of tokens to retrieve. "spacing" is kept for compatibility and reports ' +
                  'that the kit ships none.',
                default: 'all',
              },
            },
          },
        },
        {
          name: 'ui_search_components',
          description:
            'Search for components by keyword. Searches across component names, descriptions, keywords, and categories.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query string',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'ui_get_example',
          description:
            'Get usage examples for a specific component. Returns all examples or a specific example by index.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the component',
              },
              exampleIndex: {
                type: 'number',
                description: 'Optional index of a specific example (0-based)',
              },
            },
            required: ['name'],
          },
        },
      ],
    }));

    // Handler for tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'ui_list_components':
            return await this.handleListComponents(args);
          case 'ui_get_component':
            return await this.handleGetComponent(args);
          case 'ui_get_tokens':
            return await this.handleGetTokens(args);
          case 'ui_search_components':
            return await this.handleSearchComponents(args);
          case 'ui_get_example':
            return await this.handleGetExample(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  private async handleListComponents(args: any) {
    const { category } = ListComponentsSchema.parse(args);

    return {
      content: [
        {
          type: 'text',
          text: renderComponentList(registryData, category),
        },
      ],
    };
  }

  private async handleGetComponent(args: any) {
    const { name } = GetComponentSchema.parse(args);

    // The path still comes from the registry's own `file` field and never from
    // the caller — see the note in `registry-tools.ts`. Only the root changed.
    const text = await renderComponent(registryData, name, (file) =>
      readFile(join(SOURCES_ROOT, file), 'utf-8')
    );

    return {
      content: [
        {
          type: 'text',
          text: text,
        },
      ],
    };
  }

  private async handleGetTokens(args: any) {
    const { tokenType } = GetTokensSchema.parse(args);

    const output = renderTokens(tokensData, tokenType as TokenType);

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  private async handleSearchComponents(args: any) {
    const { query } = SearchComponentsSchema.parse(args);

    return {
      content: [
        {
          type: 'text',
          text: renderSearch(registryData, query),
        },
      ],
    };
  }

  private async handleGetExample(args: any) {
    const { name, exampleIndex } = GetExampleSchema.parse(args);

    return {
      content: [
        {
          type: 'text',
          text: renderExamples(registryData, name, exampleIndex),
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Nim UI MCP Server started');
  }
}

const server = new NimMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
