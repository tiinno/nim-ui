---
inclusion: fileMatch
fileMatchPattern: "packages/mcp-server/**"
---

# Nim UI — MCP Server

Package: `@nim-ui/mcp-server`
Location: `packages/mcp-server/`

The MCP server exposes Nim UI's component library to AI assistants via the Model Context Protocol.

## Architecture

- Entry: `src/index.ts`
- Main class: `NimMCPServer`
- Loads component registry data on startup via `loadData()`
- Uses `@modelcontextprotocol/sdk` for the MCP protocol

## Key Interfaces

```ts
interface ComponentVariant { name: string; description: string; className: string; }
interface ComponentExample { title: string; code: string; description?: string; }
interface Component { name: string; description: string; category: string; props: any[]; variants: ComponentVariant[]; examples: ComponentExample[]; }
interface RegistryData { components: Component[]; tokens: any; }
```

## Available Tools (5)

1. `list-components` — List all components, optionally filtered by category
2. `get-component` — Get detailed info (props, variants, examples) for a specific component
3. `get-tokens` — Get design tokens (colors, spacing, typography, or all)
4. `search-components` — Search components by name/description query
5. `get-example` — Get usage example code for a component

## Development

```bash
# Build
pnpm --filter @nim-ui/mcp-server build

# Test the server
npx tsx packages/mcp-server/test-server.ts
```

## Config for Claude Desktop

```json
{
  "mcpServers": {
    "nim-ui": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"]
    }
  }
}
```

## When Modifying

- Keep tool handlers in `setupHandlers()` method
- Follow existing pattern: validate args → query data → format response
- Update `RegistryData` interface if adding new data sources
- Run `pnpm build` in mcp-server package after changes
