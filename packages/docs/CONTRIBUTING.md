# Contributing to Nim UI Documentation

Thank you for contributing to the Nim UI documentation!

## Getting Started

1. **Install dependencies** (from monorepo root):
   ```bash
   pnpm install
   ```

2. **Start the dev server**:
   ```bash
   cd packages/docs
   pnpm dev
   ```

3. **Open in browser**: `http://localhost:4321`

## Adding New Component Documentation

### 1. Create the MDX File

Create a new file in the appropriate category:

```
src/content/docs/components/[category]/[component-name].mdx
```

Categories:
- `primitives/` - Basic form elements
- `layout/` - Layout components
- `data-display/` - Data presentation
- `commerce/` - E-commerce components
- `landing/` - Landing page sections
- `forms/` - Form utilities

### 2. Use the Template

```mdx
---
title: Component Name
description: Brief description of the component
---

import { ComponentName } from '@nim-ui/components';
import ComponentPreview from '../../../../components/ComponentPreview.astro';
import PropsTable from '../../../../components/PropsTable.astro';

Brief introduction to the component.

## Import

\`\`\`tsx
import { ComponentName } from '@nim-ui/components';
\`\`\`

## Basic Usage

<ComponentPreview title="Basic Example">
  <ComponentName client:load>
    Example content
  </ComponentName>

  <Fragment slot="code">
\`\`\`tsx
<ComponentName>Example content</ComponentName>
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
      required: false,
      description: 'Description of what this prop does',
    },
  ]}
/>

## Accessibility

Describe accessibility features and keyboard support.

## Best Practices

### Do
- List good practices

### Don't
- List bad practices

## Related Components

- Link to related components
```

### 3. Update Sidebar

Add your new page to `astro.config.mjs`:

```js
sidebar: [
  {
    label: 'Components',
    items: [
      {
        label: 'Category',
        items: [
          { label: 'Your Component', slug: 'components/category/component' },
        ],
      },
    ],
  },
],
```

### 4. Test Your Changes

- [ ] Component preview renders correctly
- [ ] Code examples work
- [ ] Props table is complete
- [ ] Dark mode looks good
- [ ] Mobile responsive
- [ ] No TypeScript errors

## Style Guide

### Writing

- Use clear, concise language
- Write in present tense
- Use active voice
- Include code examples
- Explain the "why", not just the "how"

### Code Examples

```tsx
// ✅ Good - shows real-world usage
function LoginForm() {
  const [email, setEmail] = useState('');

  return (
    <Input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="you@example.com"
    />
  );
}

// ❌ Bad - too abstract
<Input {...props} />
```

### Screenshots

If adding screenshots:

1. Use 2x resolution
2. Show both light and dark mode
3. Optimize file size
4. Add to `src/assets/`

## Custom Components

### ComponentPreview

Shows live component with code toggle:

```astro
<ComponentPreview title="Title" description="Optional">
  <Component client:load />

  <Fragment slot="code">
```tsx
<Component />
```
  </Fragment>
</ComponentPreview>
```

### PropsTable

Documents component props:

```astro
<PropsTable
  props={[
    {
      name: 'propName',          // Required
      type: 'string',            // Required
      default: "'value'",        // Optional
      required: true,            // Optional
      description: 'What it does', // Required
    },
  ]}
/>
```

### ColorSwatch

Shows color palette:

```astro
<ColorSwatch
  name="Palette Name"
  colors={[
    { shade: '500', value: '#0ea5e9' },
  ]}
/>
```

## Deployment

The documentation is automatically deployed on push to `main`:

- **Vercel**: Production builds
- **Netlify**: Preview deployments
- **GitHub Pages**: Staging

## Common Issues

### Components Not Rendering

If components don't render in previews:

1. Ensure `client:load` directive is present
2. Check imports are correct
3. Verify component is exported from `@nim-ui/components`

### Styles Not Applied

If styles aren't working:

1. Check Tailwind content paths in `tailwind.config.mjs`
2. Verify CSS imports in `src/styles/custom.css`
3. Clear `.astro` cache: `rm -rf .astro`

### Build Errors

If build fails:

1. Run `pnpm build` to see detailed errors
2. Check TypeScript errors: `astro check`
3. Verify all imports are correct
4. Clear cache and rebuild

## Questions?

- Open an issue on GitHub
- Ask in our Discord
- Email: docs@nim-ui.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
