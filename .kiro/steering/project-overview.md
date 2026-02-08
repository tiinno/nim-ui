# Tiinno UI — Project Overview

Modern, accessible, production-ready React component library built with TypeScript and Tailwind CSS v4.

## Tech Stack

- React 19.2.0+ (JSX transform)
- TypeScript 5.9.0+ (strict mode)
- Tailwind CSS v4.0.0
- pnpm 9.0.0+ (package manager)
- Turborepo (monorepo)
- Vite (build tool)
- Vitest + React Testing Library (testing)
- Astro Starlight (documentation site)
- class-variance-authority (CVA) for variant styling
- Radix UI primitives for accessible base components

## Monorepo Structure

```
tiinno-ui/
├── packages/
│   ├── ui/                    # Main component library (@tiinno-ui/components)
│   │   ├── src/
│   │   │   ├── components/    # All UI components (flat structure, kebab-case files)
│   │   │   ├── lib/           # Utility functions (cn, utils)
│   │   │   └── index.ts       # Public API exports
│   │   └── package.json
│   ├── docs/                  # Astro Starlight documentation site
│   │   └── src/content/docs/  # MDX documentation pages
│   ├── mcp-server/            # Model Context Protocol server
│   │   └── src/index.ts       # MCP server implementation
│   └── tailwind-config/       # Shared Tailwind configuration & tokens
│       └── src/
│           ├── index.js       # Tailwind plugin
│           └── tokens.js      # Design tokens
└── package.json               # Root workspace config
```

## Important: Actual File Structure

Components live in a flat directory (NOT nested by category):
```
packages/ui/src/components/
├── button.tsx          # kebab-case filenames
├── button.test.tsx     # co-located tests
├── input.tsx
├── card.tsx
├── radio.tsx
├── index.ts            # barrel exports
└── ...
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Testing
pnpm test                # Run all tests
pnpm test:coverage       # Coverage report

# Code Quality
pnpm lint                # Run ESLint
pnpm lint:fix            # Fix linting issues
pnpm typecheck           # TypeScript check

# Quality check (run after changes)
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Package Names

- UI library: `@tiinno-ui/components`
- Tailwind config: `@tiinno-ui/tailwind-config`
- MCP server: `@tiinno-ui/mcp-server`

## Git Workflow

- Feature branches: `feat/add-component-name`
- Commit format: `feat: add ComponentName with variants`
- Always run quality checks before committing
