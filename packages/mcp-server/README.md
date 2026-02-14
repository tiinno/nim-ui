# @nim-ui/mcp-server

Model Context Protocol (MCP) Server for the Nim UI component library.

## Overview

This package provides an MCP server that exposes Nim UI components, design tokens, and documentation through a standardized protocol. It enables AI assistants and other tools to discover and use Nim UI components effectively.

## Installation

```bash
# Install dependencies
pnpm install

# Build the server
pnpm run build

# Run the server
pnpm run start
```

## Available Tools

The MCP server provides 5 tools for interacting with the Nim UI component library:

### 1. ui_list_components

List all available UI components with optional category filter.

**Parameters:**
- `category` (optional): Filter by category (`primitives`, `layout`, `data-display`, `commerce`, `landing`, `forms`)

**Example:**
```typescript
{
  "category": "primitives"
}
```

### 2. ui_get_component

Get full details of a specific component including metadata and source code.

**Parameters:**
- `name` (required): The component name (e.g., "Button", "Card")

**Example:**
```typescript
{
  "name": "Button"
}
```

### 3. ui_get_tokens

Get design tokens from the Nim UI design system.

**Parameters:**
- `tokenType` (optional): Type of tokens to retrieve (`colors`, `spacing`, `typography`, `all`). Default: `all`

**Example:**
```typescript
{
  "tokenType": "colors"
}
```

### 4. ui_search_components

Search for components by keyword across names, descriptions, keywords, and categories.

**Parameters:**
- `query` (required): Search query string

**Example:**
```typescript
{
  "query": "button"
}
```

### 5. ui_get_example

Get usage examples for a specific component.

**Parameters:**
- `name` (required): The component name
- `exampleIndex` (optional): Index of a specific example (0-based)

**Example:**
```typescript
{
  "name": "Button",
  "exampleIndex": 0
}
```

## Configuration

To use this MCP server with Claude Desktop or other MCP clients, add it to your configuration:

```json
{
  "mcpServers": {
    "nim-ui": {
      "command": "node",
      "args": ["/path/to/nim-ui/packages/mcp-server/dist/index.js"]
    }
  }
}
```

For Claude Desktop on macOS, this configuration file is typically located at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

## Development

```bash
# Type check
pnpm run type-check

# Build
pnpm run build

# Watch mode (rebuild on changes)
pnpm run dev

# Clean build artifacts
pnpm run clean
```

## Architecture

The server is built using:
- **@modelcontextprotocol/sdk**: MCP server implementation
- **zod**: Input validation
- **TypeScript**: Type-safe implementation
- **tsup**: Fast TypeScript bundler

## Data Sources

The server reads from:
- Component registry: `packages/ui/src/registry/index.json`
- Design tokens: `packages/tailwind-config/src/tokens.js`
- Component source code: `packages/ui/src/components/*.tsx`

## Error Handling

All tools include comprehensive error handling:
- Input validation with zod schemas
- Component not found errors
- File read errors
- Graceful error responses

## License

MIT
