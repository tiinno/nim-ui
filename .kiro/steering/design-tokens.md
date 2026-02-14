---
inclusion: fileMatch
fileMatchPattern: "packages/ui/src/**"
---

# Nim UI — Design Tokens

Source of truth: `packages/tailwind-config/src/tokens.js`

Always use these tokens via Tailwind classes. Never hardcode color values or arbitrary spacing.

## Colors

### Primary (Sky Blue)
`bg-primary-50` through `bg-primary-950`, same for `text-` and `border-`
- Base: `primary-500` (oklch(0.685 0.169 237.3))
- Hover: `primary-600` (oklch(0.588 0.158 241.0))
- Dark text on primary: use `text-white`

### Neutral (Gray)
`bg-neutral-50` through `bg-neutral-950`
- Light bg: `neutral-50` / `neutral-100`
- Borders: `neutral-200` (light) / `neutral-700` (dark)
- Body text: `neutral-900` (light) / `neutral-100` (dark)
- Muted text: `neutral-500`

### Semantic
- Success: `success-50`, `success-500` (oklch(0.723 0.191 149.6)), `success-700`
- Error: `error-50`, `error-500` (oklch(0.637 0.237 25.3)), `error-700`
- Warning: `warning-50`, `warning-500` (oklch(0.769 0.188 70.1)), `warning-700`

Note: The token uses `error` not `danger`. Use `error-500` for destructive states.

## Spacing

| Token | Value |
|-------|-------|
| `base` | 4px |
| `xs` | 8px |
| `sm` | 12px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `2xl` | 48px |
| `3xl` | 64px |

Use via: `p-md`, `gap-lg`, `m-sm`, `space-x-xs`, etc.

## Border Radius

| Token | Value |
|-------|-------|
| `rounded-none` | 0 |
| `rounded-sm` | 0.25rem (4px) |
| `rounded` | 0.375rem (6px) — DEFAULT |
| `rounded-md` | 0.5rem (8px) |
| `rounded-lg` | 0.75rem (12px) |
| `rounded-xl` | 1rem (16px) |
| `rounded-2xl` | 1.5rem (24px) |
| `rounded-full` | 9999px |

## Typography

Font families:
- Sans: `font-sans` → Inter, system-ui, sans-serif
- Mono: `font-mono` → Fira Code, monospace

Font sizes: `text-xs` (12px) through `text-4xl` (36px)

## Dark Mode

Dark mode uses `class` strategy. Always provide dark variants:
```
bg-white dark:bg-neutral-800
text-neutral-900 dark:text-neutral-100
border-neutral-200 dark:border-neutral-700
hover:bg-neutral-50 dark:hover:bg-neutral-700
```
