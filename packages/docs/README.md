# @nim-ui/docs

Official documentation site for Nim UI component library.

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- pnpm 10.0 or later

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

Start the development server:

```bash
cd packages/docs
pnpm dev
```

The documentation site will be available at `http://localhost:4321`.

### Build

Build the static site:

```bash
pnpm build
```

Output will be in the `dist/` directory.

### Preview

Preview the production build:

```bash
pnpm preview
```

## Project Structure

```
packages/docs/
├── src/
│   ├── assets/           # Images, logos, SVGs
│   ├── components/       # Custom Astro components
│   │   ├── ComponentPreview.astro
│   │   ├── PropsTable.astro
│   │   ├── ColorSwatch.astro
│   │   └── Head.astro
│   ├── content/
│   │   └── docs/         # MDX documentation pages
│   │       ├── index.mdx
│   │       ├── getting-started/
│   │       ├── components/
│   │       ├── design-system/
│   │       └── guides/
│   ├── styles/
│   │   └── custom.css    # Custom styles
│   └── env.d.ts
├── public/               # Static assets
├── astro.config.mjs     # Astro configuration
├── tailwind.config.mjs  # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Writing Documentation

### Component Documentation

Create a new MDX file in the appropriate category:

```mdx
---
title: Component Name
description: Brief description
---

import { ComponentName } from '@nim-ui/components';
import ComponentPreview from '../../../../components/ComponentPreview.astro';
import PropsTable from '../../../../components/PropsTable.astro';

## Import

\`\`\`tsx
import { ComponentName } from '@nim-ui/components';
\`\`\`

## Example

<ComponentPreview title="Basic Usage">
  <ComponentName client:load>
    Example
  </ComponentName>

  <Fragment slot="code">
\`\`\`tsx
<ComponentName>Example</ComponentName>
\`\`\`
  </Fragment>
</ComponentPreview>

## Props

<PropsTable
  props={[
    {
      name: 'propName',
      type: 'string',
      default: "'default'",
      description: 'Description of the prop',
    },
  ]}
/>
```

### Custom Components

#### ComponentPreview

Displays a live component example with code:

```astro
<ComponentPreview title="Example Title" description="Optional description">
  <Button client:load>Example</Button>

  <Fragment slot="code">
```tsx
<Button>Example</Button>
```
  </Fragment>
</ComponentPreview>
```

#### PropsTable

Documents component props:

```astro
<PropsTable
  props={[
    {
      name: 'variant',
      type: "'primary' | 'secondary'",
      default: "'primary'",
      required: false,
      description: 'Visual variant',
    },
  ]}
/>
```

#### ColorSwatch

Shows color palettes:

```astro
<ColorSwatch
  name="Primary"
  colors={[
    { shade: '500', value: '#0ea5e9' },
    { shade: '600', value: '#0284c7' },
  ]}
/>
```

## Deployment

The documentation can be deployed to any static hosting service:

### Vercel

```bash
vercel --prod
```

### Netlify

```bash
netlify deploy --prod
```

### GitHub Pages

```bash
pnpm build
# Deploy the dist/ folder
```

## Features

- Interactive component previews
- Live code examples
- Full-text search
- Dark mode support
- Mobile responsive
- SEO optimized
- Fast page loads

## Technology Stack

- **Astro**: Static site generator
- **Starlight**: Documentation theme
- **React**: Component previews
- **Tailwind CSS v4**: Styling
- **TypeScript**: Type safety
- **MDX**: Enhanced markdown

## Contributing

When adding new documentation:

1. Follow the existing structure
2. Use ComponentPreview for examples
3. Document all props with PropsTable
4. Include accessibility information
5. Add usage examples
6. Test in both light and dark mode

## License

MIT
