---
inclusion: fileMatch
fileMatchPattern: "packages/ui/src/components/**"
---

# Tiinno UI — Component Catalog

All components live in `packages/ui/src/components/` as flat kebab-case files.
Every component must be exported from `packages/ui/src/components/index.ts`.

## Components by Category

### Primitives
| Component | File | Radix-based |
|-----------|------|-------------|
| Button | `button.tsx` | No |
| Input | `input.tsx` | No |
| Textarea | `textarea.tsx` | No |
| Badge | `badge.tsx` | No |
| Avatar | `avatar.tsx` | No |
| Switch | `switch.tsx` | Yes (`@radix-ui/react-switch`) |
| Select | `select.tsx` | Yes (`@radix-ui/react-select`) |
| Checkbox | `checkbox.tsx` | Yes (`@radix-ui/react-checkbox`) |
| Radio | `radio.tsx` | Yes (`@radix-ui/react-radio-group`) |

### Layout
| Component | File |
|-----------|------|
| Container | `container.tsx` |
| Grid | `grid.tsx` |
| Stack | `stack.tsx` |
| Flex | `flex.tsx` |
| Spacer | `spacer.tsx` |
| Card | `card.tsx` |
| Modal | `modal.tsx` |
| Drawer | `drawer.tsx` |
| Tabs | `tabs.tsx` |

### Data Display
| Component | File |
|-----------|------|
| DataCard | `data-card.tsx` |
| DataTable | `data-table.tsx` |
| Stat | `stat.tsx` |

### Commerce
| Component | File |
|-----------|------|
| ProductCard | `product-card.tsx` |
| CartItem | `cart-item.tsx` |
| PriceTag | `price-tag.tsx` |
| QuantitySelector | `quantity-selector.tsx` |

### Landing
| Component | File |
|-----------|------|
| Hero | `hero.tsx` |
| FeatureGrid | `feature-grid.tsx` |
| CTA | `cta.tsx` |
| Testimonial | `testimonial.tsx` |

### Forms
| Component | File |
|-----------|------|
| Form | `form.tsx` |
| FormField | `form-field.tsx` |

## Radix UI Components

Components built on Radix primitives re-export the Radix sub-components with custom styling:
- `RadioGroup` + `RadioGroupItem` (from `@radix-ui/react-radio-group`)
- `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` etc.
- `Checkbox` (from `@radix-ui/react-checkbox`)
- `Switch` (from `@radix-ui/react-switch`)

When using Radix-based components in docs MDX, child primitives (e.g. `RadioGroupItem`) must always be nested inside their parent context provider (e.g. `RadioGroup`).

## Adding a New Component

1. Create `packages/ui/src/components/{name}.tsx` (kebab-case)
2. Create `packages/ui/src/components/{name}.test.tsx`
3. Add `export * from './{name}';` to `index.ts`
4. Follow CVA pattern from `ui-conventions.md` steering
5. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
