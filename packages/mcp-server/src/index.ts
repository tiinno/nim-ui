import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { loadTokens, renderTokens, type TokenType } from './tokens-source.js';
import {
  renderComponentList,
  renderComponent,
  renderSearch,
  renderExamples,
  type RegistryData,
} from './registry-tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Registry types and the documents built from them live in `registry-tools.ts`,
// so they can be tested — see the note at the top of that file.

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
  private registryData: RegistryData | null = null;
  private tokensData: any = null;

  constructor() {
    this.server = new Server(
      {
        name: 'nim-ui-mcp',
        version: '0.0.0',
      },
      {
        capabilities: { tools: {} },
      }
    );
    this.setupHandlers();
  }

  /** The registry, or the error every tool used to repeat for itself. */
  private requireRegistry(): RegistryData {
    if (!this.registryData) throw new Error('Registry data not loaded');
    return this.registryData;
  }

  private async loadData() {
    try {
      // Load registry data
      const registryPath = join(__dirname, '../../ui/src/registry/index.json');
      const registryContent = await readFile(registryPath, 'utf-8');
      this.registryData = JSON.parse(registryContent);

      // Load tokens data. `tokens.js` is an ES module with a named export, so
      // it is imported as one — see `tokens-source.ts` for what this replaced.
      const tokensPath = join(__dirname, '../../tailwind-config/src/tokens.js');
      this.tokensData = await loadTokens(pathToFileURL(tokensPath).href);

      console.error('Nim UI data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
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
    const registry = this.requireRegistry();

    return {
      content: [
        {
          type: 'text',
          text: renderComponentList(registry, category),
        },
      ],
    };
  }

  private async handleGetComponent(args: any) {
    const { name } = GetComponentSchema.parse(args);
    const registry = this.requireRegistry();

    const text = await renderComponent(registry, name, (file) =>
      readFile(join(__dirname, '../../ui/src', file), 'utf-8')
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

    if (!this.tokensData) {
      throw new Error('Tokens data not loaded');
    }

    const output = renderTokens(this.tokensData, tokenType as TokenType);

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
    const registry = this.requireRegistry();

    return {
      content: [
        {
          type: 'text',
          text: renderSearch(registry, query),
        },
      ],
    };
  }

  private async handleGetExample(args: any) {
    const { name, exampleIndex } = GetExampleSchema.parse(args);
    const registry = this.requireRegistry();

    return {
      content: [
        {
          type: 'text',
          text: renderExamples(registry, name, exampleIndex),
        },
      ],
    };
  }

  async start() {
    await this.loadData();
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
