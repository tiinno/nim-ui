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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Type definitions for registry data
interface ComponentVariant {
  name: string;
  values: string[];
}

interface ComponentExample {
  title: string;
  code: string;
}

interface Component {
  name: string;
  category: string;
  description: string;
  keywords: string[];
  file: string;
  variants: ComponentVariant[];
  hasRadixPrimitive: boolean;
  examples: ComponentExample[];
}

interface RegistryData {
  version: string;
  components: Component[];
}

// Zod schemas for validation
const ListComponentsSchema = z.object({
  category: z
    .enum(['primitives', 'layout', 'data-display', 'commerce', 'landing', 'forms'])
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

class TiinnoMCPServer {
  private server: Server;
  private registryData: RegistryData | null = null;
  private tokensData: any = null;

  constructor() {
    this.server = new Server(
      {
        name: 'tiinno-ui-mcp',
        version: '0.0.0',
      },
      {
        capabilities: { tools: {} },
      }
    );
    this.setupHandlers();
  }

  private async loadData() {
    try {
      // Load registry data
      const registryPath = join(__dirname, '../../ui/src/registry/index.json');
      const registryContent = await readFile(registryPath, 'utf-8');
      this.registryData = JSON.parse(registryContent);

      // Load tokens data
      const tokensPath = join(__dirname, '../../tailwind-config/src/tokens.js');
      const tokensContent = await readFile(tokensPath, 'utf-8');

      // Parse tokens from JS file (extract the export)
      const tokensMatch = tokensContent.match(/export\s+const\s+tokens\s+=\s+({[\s\S]*});/);
      if (tokensMatch) {
        // Use Function constructor to safely evaluate the object literal
        this.tokensData = new Function(`return ${tokensMatch[1]}`)();
      }

      console.error('Tiinno UI data loaded successfully');
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
                enum: ['primitives', 'layout', 'data-display', 'commerce', 'landing', 'forms'],
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
            'Get design tokens from the Tiinno UI design system (colors, spacing, typography).',
          inputSchema: {
            type: 'object',
            properties: {
              tokenType: {
                type: 'string',
                enum: ['colors', 'spacing', 'typography', 'all'],
                description: 'Type of tokens to retrieve',
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

    if (!this.registryData) {
      throw new Error('Registry data not loaded');
    }

    const components = category
      ? this.registryData.components.filter((c) => c.category === category)
      : this.registryData.components;

    // Group components by category
    const grouped: Record<string, Component[]> = {};
    components.forEach((component) => {
      if (!grouped[component.category]) {
        grouped[component.category] = [];
      }
      grouped[component.category]!.push(component);
    });

    // Format output
    let output = `# Tiinno UI Components${category ? ` (${category})` : ''}\n\n`;
    output += `Total: ${components.length} component${components.length !== 1 ? 's' : ''}\n\n`;

    for (const [cat, comps] of Object.entries(grouped)) {
      output += `## ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n\n`;
      comps.forEach((comp) => {
        output += `### ${comp.name}\n`;
        output += `${comp.description}\n`;
        output += `- **File**: ${comp.file}\n`;
        output += `- **Radix Primitive**: ${comp.hasRadixPrimitive ? 'Yes' : 'No'}\n`;
        if (comp.variants.length > 0) {
          output += `- **Variants**: ${comp.variants.map((v) => `${v.name} (${v.values.join(', ')})`).join('; ')}\n`;
        }
        output += `- **Keywords**: ${comp.keywords.join(', ')}\n\n`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  private async handleGetComponent(args: any) {
    const { name } = GetComponentSchema.parse(args);

    if (!this.registryData) {
      throw new Error('Registry data not loaded');
    }

    const component = this.registryData.components.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (!component) {
      throw new Error(`Component "${name}" not found`);
    }

    // Read the component source code
    let sourceCode = '';
    try {
      const componentPath = join(__dirname, '../../ui/src', component.file);
      sourceCode = await readFile(componentPath, 'utf-8');
    } catch (error) {
      sourceCode = `Error reading source file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Format output
    let output = `# ${component.name}\n\n`;
    output += `${component.description}\n\n`;
    output += `## Metadata\n\n`;
    output += `- **Category**: ${component.category}\n`;
    output += `- **File**: ${component.file}\n`;
    output += `- **Radix Primitive**: ${component.hasRadixPrimitive ? 'Yes' : 'No'}\n`;
    output += `- **Keywords**: ${component.keywords.join(', ')}\n\n`;

    if (component.variants.length > 0) {
      output += `## Variants\n\n`;
      component.variants.forEach((variant) => {
        output += `- **${variant.name}**: ${variant.values.join(', ')}\n`;
      });
      output += `\n`;
    }

    if (component.examples.length > 0) {
      output += `## Examples\n\n`;
      component.examples.forEach((example, idx) => {
        output += `### ${example.title}\n\n`;
        output += `\`\`\`tsx\n${example.code}\n\`\`\`\n\n`;
      });
    }

    output += `## Source Code\n\n`;
    output += `\`\`\`typescript\n${sourceCode}\n\`\`\`\n`;

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  private async handleGetTokens(args: any) {
    const { tokenType } = GetTokensSchema.parse(args);

    if (!this.tokensData) {
      throw new Error('Tokens data not loaded');
    }

    let output = `# Tiinno UI Design Tokens\n\n`;

    const formatTokens = (tokens: any, category: string) => {
      let result = `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      result += `\`\`\`json\n${JSON.stringify(tokens, null, 2)}\n\`\`\`\n\n`;
      return result;
    };

    if (tokenType === 'all') {
      output += formatTokens(this.tokensData.colors, 'colors');
      output += formatTokens(this.tokensData.spacing, 'spacing');
      output += formatTokens(this.tokensData.borderRadius, 'borderRadius');
      output += formatTokens(this.tokensData.typography, 'typography');
    } else if (tokenType === 'colors') {
      output += formatTokens(this.tokensData.colors, 'colors');
    } else if (tokenType === 'spacing') {
      output += formatTokens(this.tokensData.spacing, 'spacing');
      output += formatTokens(this.tokensData.borderRadius, 'borderRadius');
    } else if (tokenType === 'typography') {
      output += formatTokens(this.tokensData.typography, 'typography');
    }

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

    if (!this.registryData) {
      throw new Error('Registry data not loaded');
    }

    const searchTerm = query.toLowerCase();
    const results = this.registryData.components.filter((component) => {
      return (
        component.name.toLowerCase().includes(searchTerm) ||
        component.description.toLowerCase().includes(searchTerm) ||
        component.category.toLowerCase().includes(searchTerm) ||
        component.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm))
      );
    });

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No components found matching "${query}"`,
          },
        ],
      };
    }

    let output = `# Search Results for "${query}"\n\n`;
    output += `Found ${results.length} component${results.length !== 1 ? 's' : ''}\n\n`;

    results.forEach((component) => {
      output += `## ${component.name}\n`;
      output += `${component.description}\n`;
      output += `- **Category**: ${component.category}\n`;
      output += `- **File**: ${component.file}\n`;
      output += `- **Keywords**: ${component.keywords.join(', ')}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  private async handleGetExample(args: any) {
    const { name, exampleIndex } = GetExampleSchema.parse(args);

    if (!this.registryData) {
      throw new Error('Registry data not loaded');
    }

    const component = this.registryData.components.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (!component) {
      throw new Error(`Component "${name}" not found`);
    }

    if (component.examples.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No examples available for component "${component.name}"`,
          },
        ],
      };
    }

    let output = `# Examples for ${component.name}\n\n`;

    if (exampleIndex !== undefined) {
      if (exampleIndex >= component.examples.length) {
        throw new Error(
          `Example index ${exampleIndex} out of range. Component has ${component.examples.length} example(s).`
        );
      }

      const example = component.examples[exampleIndex];
      if (example) {
        output += `## ${example.title}\n\n`;
        output += `\`\`\`tsx\n${example.code}\n\`\`\`\n`;
      }
    } else {
      component.examples.forEach((example, idx) => {
        output += `## Example ${idx + 1}: ${example.title}\n\n`;
        output += `\`\`\`tsx\n${example.code}\n\`\`\`\n\n`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  async start() {
    await this.loadData();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Tiinno UI MCP Server started');
  }
}

const server = new TiinnoMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
