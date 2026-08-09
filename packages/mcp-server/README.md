# @nim-ui/mcp-server

Model Context Protocol (MCP) Server for the Nim UI component library.

## Overview

This package provides an MCP server that exposes Nim UI components, design tokens, and documentation through a standardized protocol. It enables AI assistants and other tools to discover and use Nim UI components effectively.

## Installation

Nothing to install ahead of time — point your MCP client at the documented version and `npx`
fetches it on first run:

```bash
npx -y @nim-ui/mcp-server@0.1.0
```

It speaks JSON-RPC over stdio and is meant to be launched by a client rather than run by hand; the
command above is mostly useful for checking that it starts.

The package is self-contained. The component registry and the design tokens are compiled into the
binary, and the component sources ship alongside it, so it needs no other `@nim-ui` package
installed — and in particular **not** `@nim-ui/components`, which would drag React in as a peer
dependency of a server that only emits text.

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
      "command": "npx",
      "args": ["-y", "@nim-ui/mcp-server@0.1.0"]
    }
  }
}
```

For Claude Desktop on macOS, this configuration file is typically located at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

To run a local checkout instead, point `command` at `node` and `args` at this package's
`dist/index.js` — after a build, since the sources it serves are copied into `dist` by the build.

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

All three come from this repository at build time and ship inside the package:

| Data | Source | How it ships |
|---|---|---|
| Component registry | `packages/ui/src/registry/index.json` | inlined into `dist/index.js` |
| Design tokens | `packages/tailwind-config/src/tokens.js` | inlined into `dist/index.js` |
| Component source | `packages/ui/src/components/*.tsx` | copied to `dist/sources/` by the build |

Nothing is read from a sibling package at runtime. It used to be, through paths relative to the
binary, and that worked only because of where this package sits in the monorepo — installed from
npm the same paths pointed at `@nim-ui/ui` (no such package) and at `@nim-ui/tailwind-config`
(`private: true`), so the server exited 1 on startup for every consumer. `src/packaged-layout.test.ts`
now runs the packaged files from a simulated `node_modules` install and fails if that regresses.

## Error Handling

All tools include comprehensive error handling:
- Input validation with zod schemas
- Component not found errors
- File read errors
- Graceful error responses

## License

MIT
