# Tiinno UI MCP Server - Integration Guide

## Quick Start

### 1. Build the Server

```bash
cd packages/mcp-server
pnpm install
pnpm run build
```

### 2. Configure Claude Desktop

Add the server to your Claude Desktop configuration file:

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "tiinno-ui": {
      "command": "node",
      "args": [
        "/absolute/path/to/tiinno-ui/packages/mcp-server/dist/index.js"
      ]
    }
  }
}
```

Replace `/absolute/path/to/tiinno-ui` with your actual project path.

### 3. Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the MCP server.

### 4. Verify Installation

In Claude Desktop, you should now be able to:

```
List all Tiinno UI components
```

Claude will use the `ui_list_components` tool to show you all available components.

## Usage Examples

### Example 1: Browse Components

```
Show me all the primitive components in Tiinno UI
```

Claude will use: `ui_list_components` with `category: "primitives"`

### Example 2: Get Component Details

```
Show me the Button component with its source code
```

Claude will use: `ui_get_component` with `name: "Button"`

### Example 3: Search for Components

```
Find all components related to shopping carts
```

Claude will use: `ui_search_components` with `query: "cart"`

### Example 4: Get Design Tokens

```
What colors are available in Tiinno UI?
```

Claude will use: `ui_get_tokens` with `tokenType: "colors"`

### Example 5: Get Usage Examples

```
Show me examples of how to use the Card component
```

Claude will use: `ui_get_example` with `name: "Card"`

## Tool Reference

### ui_list_components

List all components, optionally filtered by category.

**Input:**
```json
{
  "category": "primitives"  // Optional
}
```

**Categories:**
- `primitives` - Basic UI elements (Button, Input, Badge, Avatar)
- `layout` - Layout components (Card, Modal, Drawer, Tabs)
- `data-display` - Data visualization (DataCard, DataTable, Stat)
- `commerce` - E-commerce components (ProductCard, CartItem, PriceTag, QuantitySelector)
- `landing` - Landing page sections (Hero, FeatureGrid, CTA, Testimonial)
- `forms` - Form components (Form, FormField, Select, Checkbox, Radio)

### ui_get_component

Get complete component details including source code.

**Input:**
```json
{
  "name": "Button"  // Required
}
```

**Output includes:**
- Component metadata (category, file, keywords)
- Variant definitions
- Usage examples
- Full TypeScript source code

### ui_get_tokens

Get design system tokens.

**Input:**
```json
{
  "tokenType": "colors"  // Optional, default: "all"
}
```

**Token Types:**
- `colors` - Color palette
- `spacing` - Spacing scale and border radius
- `typography` - Font families and sizes
- `all` - All tokens (default)

### ui_search_components

Search across all component metadata.

**Input:**
```json
{
  "query": "button"  // Required
}
```

Searches in:
- Component names
- Descriptions
- Categories
- Keywords

### ui_get_example

Get usage examples for a component.

**Input:**
```json
{
  "name": "Button",
  "exampleIndex": 0  // Optional, 0-based index
}
```

If `exampleIndex` is not provided, returns all examples.

## Troubleshooting

### Server Not Starting

1. Check that the build succeeded:
   ```bash
   ls -la packages/mcp-server/dist/index.js
   ```

2. Verify the file is executable:
   ```bash
   head -1 packages/mcp-server/dist/index.js
   # Should show: #!/usr/bin/env node
   ```

3. Test the server manually:
   ```bash
   node packages/mcp-server/dist/index.js
   ```

### Configuration Issues

1. Check JSON syntax in `claude_desktop_config.json`
2. Use absolute paths (not relative paths like `~/`)
3. Escape backslashes on Windows: `C:\\Users\\...`

### Data Loading Errors

If the server can't find registry or tokens:

1. Verify paths are correct relative to `dist/index.js`:
   ```
   dist/index.js
   ../../ui/src/registry/index.json
   ../../tailwind-config/src/tokens.js
   ```

2. Run the test script:
   ```bash
   cd packages/mcp-server
   npx tsx test-server.ts
   ```

## Development

### Watch Mode

For development, use watch mode to rebuild on changes:

```bash
pnpm run dev
```

### Type Checking

Verify TypeScript types:

```bash
pnpm run type-check
```

### Testing

Run the test script to verify data loading:

```bash
npx tsx test-server.ts
```

## Advanced Configuration

### Custom Port or Transport

The server uses `StdioServerTransport` by default. To use a different transport, modify `src/index.ts`:

```typescript
// For HTTP transport (example)
import { HttpServerTransport } from '@modelcontextprotocol/sdk/server/http.js';

// In the start() method:
const transport = new HttpServerTransport(/* options */);
```

### Adding Custom Tools

To add a new tool:

1. Define a zod schema for validation
2. Add tool definition in `ListToolsRequestSchema` handler
3. Add tool handler in `CallToolRequestSchema` handler
4. Implement the handler method

Example:
```typescript
// 1. Define schema
const MyToolSchema = z.object({
  param: z.string(),
});

// 2. Add to tools list
{
  name: 'my_tool',
  description: 'My custom tool',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string' }
    },
    required: ['param']
  }
}

// 3. Add to switch statement
case 'my_tool':
  return await this.handleMyTool(args);

// 4. Implement handler
private async handleMyTool(args: any) {
  const { param } = MyToolSchema.parse(args);
  // Implementation
  return {
    content: [{ type: 'text', text: 'Result' }]
  };
}
```

## Support

For issues or questions:
1. Check this guide
2. Review the README.md
3. Run the test script
4. Check MCP SDK documentation: https://modelcontextprotocol.io
