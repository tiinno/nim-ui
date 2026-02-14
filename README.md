<div align="center">

# Nim UI

**Modern, accessible, production-ready React components**

Built with React 19 + TypeScript + Tailwind CSS v4

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2+-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)

[Documentation](https://nim-ui.tiinno.com) &bull; [Components](https://nim-ui.tiinno.com/components/primitives/button/) &bull; [Design System](https://nim-ui.tiinno.com/design-system/colors/)

</div>

---

## Features

- **43+ Components** across 8 categories: Primitives, Layout, Data Display, Commerce, Landing, Feedback, Forms, Navigation
- **Fully Typed** with TypeScript 5.9+ strict mode
- **Accessible** following WCAG 2.1 AA, keyboard navigation, screen reader support
- **Dark Mode** built-in with Tailwind `dark:` variants
- **Tree-shakeable** import only what you use
- **Radix UI** primitives for robust accessibility
- **CVA** (class-variance-authority) for consistent variant patterns

## Quick Start

```bash
# Install
pnpm add @nim-ui/components
pnpm add -D tailwindcss @tailwindcss/postcss
```

```css
/* src/index.css */
@import '@nim-ui/components/styles';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx
import { Button, Card, Input } from '@nim-ui/components';

export default function App() {
  return (
    <Card className="p-6">
      <Input placeholder="Enter your email" />
      <Button variant="primary">Subscribe</Button>
    </Card>
  );
}
```

## Components

| Category | Components |
|----------|-----------|
| **Primitives** | Button, Input, Textarea, Checkbox, Radio, Select, Switch |
| **Layout** | Container, Grid, Stack, Flex, Spacer, Card, Modal, Drawer, Tabs, Accordion, Separator |
| **Data Display** | Badge, Avatar, DataTable, DataCard, Stat |
| **Commerce** | ProductCard, CartItem, PriceTag, QuantitySelector |
| **Landing** | Hero, FeatureGrid, Testimonial, CTA |
| **Feedback** | Toast, Tooltip, Popover, DropdownMenu, AlertDialog, Alert, Progress, Spinner, Skeleton |
| **Forms** | Form, FormField |
| **Navigation** | Breadcrumb |

## Development

```bash
# Prerequisites: Node.js 18+, pnpm 9+

pnpm install        # Install dependencies
pnpm dev            # Start dev server
pnpm build          # Build all packages
pnpm test           # Run tests
pnpm lint           # Lint code
```

## Project Structure

```
nim-ui/
├── packages/
│   ├── ui/               # Component library
│   ├── docs/             # Documentation (Astro + Starlight)
│   ├── tailwind-config/  # Shared Tailwind config
│   └── mcp-server/       # MCP server for AI assistants
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # Workspace config
```

## MCP Server

Nim UI includes an MCP (Model Context Protocol) server that helps AI assistants understand and use the component library.

```json
{
  "mcpServers": {
    "nim-ui": {
      "command": "node",
      "args": ["path/to/nim-ui/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## License

MIT
