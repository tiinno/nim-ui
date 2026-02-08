---
inclusion: fileMatch
fileMatchPattern: "packages/docs/**"
---

# Tiinno UI — Documentation Site

Package: `packages/docs/`
Framework: Astro + Starlight
Components import from: `@tiinno-ui/components`

## Structure

```
packages/docs/src/
├── components/           # Astro/React helper components
│   ├── ComponentPreview.astro   # Live preview with code toggle
│   ├── PropsTable.astro         # Props documentation table
│   ├── ColorSwatch.astro        # Color display
│   └── SelectDemo.tsx           # React interactive demo
├── content/docs/         # MDX documentation pages
│   ├── components/       # Component docs (by category)
│   │   ├── primitives/   # button.mdx, input.mdx, radio.mdx, etc.
│   │   ├── layout/       # container.mdx, grid.mdx, etc.
│   │   ├── data-display/ # badge.mdx, avatar.mdx, etc.
│   │   ├── commerce/     # product-card.mdx, cart-item.mdx, etc.
│   │   ├── landing/      # hero.mdx, feature.mdx, etc.
│   │   └── forms/        # form.mdx, form-field.mdx
│   ├── design-system/    # colors.mdx, typography.mdx, spacing.mdx
│   ├── getting-started/  # installation.mdx, quick-start.mdx
│   └── guides/           # customization.mdx, theming.mdx, etc.
└── styles/custom.css     # Custom Starlight overrides
```

## Sidebar Config

Sidebar is defined in `astro.config.mjs`. When adding a new component doc, also add its entry to the sidebar.

## Writing Component Docs

### MDX Template

```mdx
---
title: ComponentName
description: Brief description
---

import { ComponentName } from '@tiinno-ui/components';
import ComponentPreview from '../../../../components/ComponentPreview.astro';
import PropsTable from '../../../../components/PropsTable.astro';

## Import
\`\`\`tsx
import { ComponentName } from '@tiinno-ui/components';
\`\`\`

## Variants

<ComponentPreview title="Default">
  <ComponentName client:load>Content</ComponentName>
  <Fragment slot="code">
\`\`\`tsx
<ComponentName>Content</ComponentName>
\`\`\`
  </Fragment>
</ComponentPreview>

## Props
<PropsTable props={[...]} />
```

### Critical: Radix Components in MDX

Radix-based components (Radio, Select, Checkbox, Switch) require their context provider. Child primitives MUST be nested inside the parent:

```mdx
<!-- ✅ Correct: RadioGroupItem inside RadioGroup -->
<RadioGroup client:load defaultValue="a">
  <RadioGroupItem client:load value="a" id="a" />
</RadioGroup>

<!-- ❌ Wrong: RadioGroupItem standalone — causes runtime error -->
<RadioGroupItem client:load value="a" id="a" />
```

### Astro Client Directives

Interactive React components need `client:load` directive in MDX:
```mdx
<Button client:load variant="primary">Click</Button>
<RadioGroup client:load>...</RadioGroup>
```

### ComponentPreview Usage

```mdx
<ComponentPreview title="Example Title" description="Optional description">
  <!-- Live preview content (default slot) -->
  <Button client:load>Click me</Button>

  <!-- Code snippet (named slot) -->
  <Fragment slot="code">
\`\`\`tsx
<Button>Click me</Button>
\`\`\`
  </Fragment>
</ComponentPreview>
```

### PropsTable Usage

```mdx
<PropsTable props={[
  { name: 'variant', type: "'primary' | 'secondary'", default: "'primary'", description: 'Visual style' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the component' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state' },
]} />
```
