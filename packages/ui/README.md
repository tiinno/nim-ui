# @nim-ui/components

**Quiet, accessible React UI kit for dashboards, backoffice, and commerce operations**

91 components across 8 categories, built with React 19, TypeScript, and Tailwind CSS v4.

[Documentation](https://nim-ui.tiinno.com) &bull; [Components](https://nim-ui.tiinno.com/components/primitives/button/) &bull; [Design system](https://nim-ui.tiinno.com/design-system/colors/)

## Install

```bash
pnpm add @nim-ui/components
pnpm add -D tailwindcss @tailwindcss/postcss
```

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

```css
/* src/index.css */
@import 'tailwindcss';
@import '@nim-ui/components/styles';
```

```tsx
// src/main.tsx
import './index.css';
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

Full setup — TypeScript config, Vite/Next.js/Remix wiring, troubleshooting: see the
[Installation guide](https://nim-ui.tiinno.com/getting-started/installation/).

## What you get

- **91 components**: Primitives, Layout, Data Display, Commerce, Landing, Feedback, Forms, Navigation
- **Typed** in TypeScript strict mode, with `cva` variants and forwarded refs throughout
- **Dark mode** on every component — each colour ships its `dark:` counterpart
- **Tree-shakeable** — import only what you use
- **Radix UI** primitives underneath the interactive components

## Design

"Ink + Muted Steel", built for operational software: calm hierarchy, restrained colour, dense
enough to scan. The near-black primary button is deliberate, not a missing brand colour.

The focus indicator is an `outline`, not a `ring`, and always ships as a light/dark pair —
no single step of the steel scale clears WCAG's 3:1 in both themes. To override it, replace
both halves:

```tsx
<Button className="focus-visible:outline-red-500 dark:focus-visible:outline-red-500" />
```

[Customization guide](https://nim-ui.tiinno.com/guides/customization/) covers `className`,
extending variants, and the `cn()` helper.

## Exports

| Entry | What |
|---|---|
| `@nim-ui/components` | Every component and its types |
| `@nim-ui/components/styles` | Compiled stylesheet — import once |
| `@nim-ui/components/tokens.css` | The `@theme` token block on its own |
| `@nim-ui/components/reduced-motion.css` | Opt-in blanket `prefers-reduced-motion` reset |
| `@nim-ui/components/registry` | Component metadata as JSON |

## Peer dependencies

React 19.2+ and React DOM 19.2+.

## License

MIT — see [LICENSE](./LICENSE).
