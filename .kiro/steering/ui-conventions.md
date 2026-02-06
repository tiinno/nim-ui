# UI Component Conventions - Tiinno UI

**Strict patterns and conventions for Kiro AI when working with Tiinno UI components**

---

## CRITICAL RULES

### Component Creation Rules

1. **NEVER** create components without following the CVA pattern
2. **ALWAYS** use `forwardRef` for components that render DOM elements
3. **ALWAYS** include TypeScript types with strict interfaces
4. **ALWAYS** add JSDoc documentation with examples
5. **ALWAYS** export new components from `src/index.ts`
6. **ALWAYS** create corresponding test files
7. **NEVER** use inline styles - use Tailwind classes only
8. **NEVER** skip accessibility attributes (ARIA, keyboard nav)

---

## File Structure Convention

```
packages/ui/src/components/
├── Layout/
│   ├── Container.tsx
│   ├── Container.test.tsx
│   ├── Grid.tsx
│   ├── Grid.test.tsx
│   └── index.ts
├── Forms/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Input.tsx
│   ├── Input.test.tsx
│   └── index.ts
├── DataDisplay/
│   └── ...
├── Feedback/
│   └── ...
├── Overlay/
│   └── ...
└── Navigation/
    └── ...
```

### Category Definitions

- **Layout**: Container, Grid, Stack, Flex, Spacer
- **Forms**: Button, Input, Textarea, Select, Checkbox, Radio
- **DataDisplay**: Card, Badge, Avatar, Table, Spinner
- **Feedback**: Alert, Toast, Progress
- **Overlay**: Modal, Popover, Tooltip
- **Navigation**: Tabs, Breadcrumb

---

## Component Template (MANDATORY)

```tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// 1. Define variants using CVA
const componentVariants = cva(
  // Base classes (always applied)
  'base-class-1 base-class-2',
  {
    variants: {
      variant: {
        default: 'variant-specific-classes',
        alternative: 'alternative-classes',
      },
      size: {
        sm: 'small-size-classes',
        md: 'medium-size-classes',
        lg: 'large-size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// 2. Define TypeScript interface
export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Add custom props here
  customProp?: string;
  disabled?: boolean;
}

// 3. JSDoc documentation
/**
 * Component description here
 *
 * @example
 * ```tsx
 * <Component variant="default" size="md">
 *   Content
 * </Component>
 * ```
 */

// 4. Component implementation with forwardRef
export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, customProp, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// 5. Display name for DevTools
Component.displayName = 'Component';
```

---

## TypeScript Conventions

### Interface Naming

```typescript
// Component props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

// Internal state types
type ButtonState = 'idle' | 'loading' | 'disabled';

// Event handler types
type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
```

### Prop Type Patterns

```typescript
// String literals (preferred over enums)
variant?: 'default' | 'outlined' | 'elevated';

// Optional with default
size?: 'sm' | 'md' | 'lg'; // Default via CVA

// Boolean flags
disabled?: boolean;
loading?: boolean;
fullWidth?: boolean;

// Event handlers
onClick?: (event: React.MouseEvent) => void;
onChange?: (value: string) => void;
onClose?: () => void;

// Children
children?: React.ReactNode;

// Generic types for reusable components
export interface SelectProps<T = string> {
  value?: T;
  onChange?: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}
```

---

## Styling Conventions

### Tailwind Class Order

Follow this order for consistency:

```tsx
className="
  // 1. Layout
  flex items-center justify-between

  // 2. Sizing
  w-full h-10

  // 3. Spacing
  px-4 py-2 gap-2

  // 4. Typography
  text-base font-medium

  // 5. Visual
  bg-white border border-gray-200 rounded-lg shadow-sm

  // 6. States
  hover:bg-gray-50 focus:outline-none focus:ring-2
  disabled:opacity-50 disabled:cursor-not-allowed

  // 7. Dark mode
  dark:bg-gray-800 dark:border-gray-700

  // 8. Transitions
  transition-colors duration-200
"
```

### CVA Variant Structure

```typescript
const componentVariants = cva(
  // Base: Common to all variants
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50',
  {
    variants: {
      // Primary variant dimension
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
        outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
        ghost: 'text-primary-500 hover:bg-primary-50',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      // Size variant dimension
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
      },
      // Boolean variant dimension
      fullWidth: {
        true: 'w-full',
      },
    },
    // Compound variants for interactions
    compoundVariants: [
      {
        variant: 'primary',
        size: 'lg',
        className: 'shadow-lg',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

### Dark Mode Pattern

```tsx
// ALWAYS provide dark mode classes
<div className="
  bg-white text-gray-900
  dark:bg-gray-800 dark:text-gray-100
">
  Content
</div>

// For borders
className="border-gray-200 dark:border-gray-700"

// For hover states
className="hover:bg-gray-50 dark:hover:bg-gray-700"

// For focus states
className="focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
```

---

## Accessibility Requirements

### ARIA Attributes (MANDATORY)

```tsx
// Buttons
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  aria-disabled={disabled}
>
  Close
</button>

// Inputs
<input
  aria-label="Email address"
  aria-required={required}
  aria-invalid={!!error}
  aria-describedby={error ? 'error-msg' : undefined}
/>
{error && <span id="error-msg" role="alert">{error}</span>}

// Modals
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <div id="modal-description">Description</div>
</div>

// Alerts
<div role="alert" aria-live="polite">
  Success message
</div>

// Loading states
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Content'}
</div>
```

### Keyboard Navigation (MANDATORY)

```tsx
// Escape key to close
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    onClose();
  }
};

// Enter/Space for activation
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onClick();
  }
};

// Arrow keys for navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      navigatePrevious();
      break;
    case 'ArrowDown':
      e.preventDefault();
      navigateNext();
      break;
  }
};

// Tab trap for modals
import { useFocusTrap } from '@/hooks/useFocusTrap';

export const Modal = ({ isOpen, children }) => {
  const modalRef = useFocusTrap(isOpen);

  return (
    <div ref={modalRef} role="dialog">
      {children}
    </div>
  );
};
```

### Focus Management (MANDATORY)

```tsx
// Auto-focus on mount
useEffect(() => {
  if (isOpen && inputRef.current) {
    inputRef.current.focus();
  }
}, [isOpen]);

// Focus visible styles
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"

// Return focus after modal close
const [previousFocus, setPreviousFocus] = useState<HTMLElement | null>(null);

useEffect(() => {
  if (isOpen) {
    setPreviousFocus(document.activeElement as HTMLElement);
  } else if (previousFocus) {
    previousFocus.focus();
  }
}, [isOpen]);
```

---

## Testing Conventions

### Test File Structure

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Component } from './Component';

describe('Component', () => {
  // Group 1: Rendering tests
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Component>Content</Component>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Component className="custom">Content</Component>);
      expect(container.firstChild).toHaveClass('custom');
    });
  });

  // Group 2: Variant tests
  describe('variants', () => {
    it('renders primary variant', () => {
      const { container } = render(<Component variant="primary">Content</Component>);
      expect(container.firstChild).toHaveClass('bg-primary-500');
    });

    it('renders secondary variant', () => {
      const { container } = render(<Component variant="secondary">Content</Component>);
      expect(container.firstChild).toHaveClass('bg-neutral-200');
    });
  });

  // Group 3: Interaction tests
  describe('interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Component onClick={handleClick}>Click me</Component>);
      await user.click(screen.getByText('Click me'));

      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('handles keyboard events', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(<Component onClose={handleClose}>Content</Component>);
      await user.keyboard('{Escape}');

      expect(handleClose).toHaveBeenCalledOnce();
    });
  });

  // Group 4: Accessibility tests
  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Component aria-label="Test component">Content</Component>);
      expect(screen.getByLabelText('Test component')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Component>Content</Component>);

      await user.tab();
      expect(screen.getByText('Content')).toHaveFocus();
    });
  });

  // Group 5: State tests
  describe('states', () => {
    it('shows loading state', () => {
      render(<Component loading>Submit</Component>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('disables when disabled prop is true', () => {
      render(<Component disabled>Submit</Component>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
```

### Required Test Coverage

Each component MUST have tests for:

1. **Rendering**: Default state, with various props
2. **Variants**: All variant combinations
3. **Interactions**: Click, keyboard, hover (if applicable)
4. **Accessibility**: ARIA attributes, keyboard navigation, focus management
5. **States**: Loading, disabled, error states
6. **Edge cases**: Empty children, long content, invalid props

### Testing Checklist

- [ ] Component renders without errors
- [ ] All variants render correctly
- [ ] Props are applied correctly
- [ ] Event handlers are called
- [ ] Keyboard navigation works
- [ ] ARIA attributes are present
- [ ] Focus management works
- [ ] Loading states work
- [ ] Disabled states prevent interaction
- [ ] Error states display correctly
- [ ] Component is responsive
- [ ] Dark mode works

---

## Component Checklist

Before marking a component as complete, verify:

### Code Quality
- [ ] Follows CVA pattern
- [ ] Uses `forwardRef` (if applicable)
- [ ] TypeScript types are strict and complete
- [ ] JSDoc documentation with examples
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Follows naming conventions

### Styling
- [ ] Uses Tailwind classes only (no inline styles)
- [ ] Follows class order convention
- [ ] Includes dark mode support
- [ ] Responsive on all screen sizes
- [ ] Consistent spacing with design tokens
- [ ] Proper hover/focus/active states

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation support
- [ ] Focus management (modals, menus)
- [ ] Screen reader tested
- [ ] Color contrast meets WCAG AA

### Testing
- [ ] Test file exists
- [ ] Rendering tests pass
- [ ] Variant tests pass
- [ ] Interaction tests pass
- [ ] Accessibility tests pass
- [ ] Coverage > 80%

### Documentation
- [ ] JSDoc comments complete
- [ ] Usage examples provided
- [ ] Props documented
- [ ] Storybook story created
- [ ] Exported from `src/index.ts`

### Build
- [ ] Component builds without errors
- [ ] No console warnings
- [ ] Tree-shakeable
- [ ] Type definitions generated

---

## Common Patterns

### Controlled vs Uncontrolled

```tsx
// Support both patterns
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ value, defaultValue, onChange, ...props }, ref) => {
    // Controlled if value is provided
    const isControlled = value !== undefined;

    // Internal state for uncontrolled
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    return (
      <input
        ref={ref}
        value={isControlled ? value : internalValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
```

### Compound Components

```tsx
// Parent component
export const Card = ({ children, ...props }: CardProps) => {
  return <div {...props}>{children}</div>;
};

// Sub-components
Card.Header = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-header">{children}</div>;
};

Card.Body = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-body">{children}</div>;
};

Card.Footer = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-footer">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

### Polymorphic Components

```tsx
// Component that can render as different elements
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export const Text = <C extends React.ElementType = 'span'>({
  as,
  children,
  ...props
}: PolymorphicComponentProp<C>) => {
  const Component = as || 'span';
  return <Component {...props}>{children}</Component>;
};

// Usage
<Text as="h1">Heading</Text>
<Text as="p">Paragraph</Text>
```

---

## Anti-Patterns (NEVER DO THIS)

### Styling Anti-Patterns

```tsx
// ❌ NEVER: Inline styles
<div style={{ color: 'red', padding: '10px' }}>Bad</div>

// ✅ ALWAYS: Tailwind classes
<div className="text-red-500 p-2.5">Good</div>

// ❌ NEVER: Hardcoded values
<div className="w-[237px] h-[42px]">Bad</div>

// ✅ ALWAYS: Use design tokens
<div className="w-60 h-10">Good</div>

// ❌ NEVER: Complex conditional classes
<div className={error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}>Bad</div>

// ✅ ALWAYS: Use CVA or cn utility
<div className={cn('border', error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white')}>Good</div>
```

### TypeScript Anti-Patterns

```tsx
// ❌ NEVER: Use 'any'
const handleClick = (data: any) => {};

// ✅ ALWAYS: Proper types
const handleClick = (data: { id: string; value: number }) => {};

// ❌ NEVER: Non-strict optional chaining without proper types
props.data?.map?.(item => item?.value);

// ✅ ALWAYS: Define proper types
interface Props {
  data?: Array<{ value: string }>;
}

// ❌ NEVER: Type assertions to bypass errors
const value = data as string;

// ✅ ALWAYS: Type guards
const isString = (value: unknown): value is string => typeof value === 'string';
```

### Accessibility Anti-Patterns

```tsx
// ❌ NEVER: div as button without role
<div onClick={handleClick}>Click me</div>

// ✅ ALWAYS: Use semantic button
<button onClick={handleClick}>Click me</button>

// ❌ NEVER: Missing ARIA labels
<button><X /></button>

// ✅ ALWAYS: Include labels
<button aria-label="Close"><X /></button>

// ❌ NEVER: Ignore keyboard navigation
<div onClick={handleClick}>Click me</div>

// ✅ ALWAYS: Support keyboard
<div role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown}>Click me</div>
```

---

## Design Token Reference

When styling components, ALWAYS use these tokens:

### Colors

```tsx
// Primary (blue)
bg-primary-50 to bg-primary-900
text-primary-500
border-primary-500

// Neutral (gray)
bg-neutral-50 to bg-neutral-900
text-neutral-500
border-neutral-500

// Semantic
bg-success-500    // Green
bg-warning-500    // Orange/Yellow
bg-danger-500     // Red
bg-info-500       // Blue
```

### Spacing

```tsx
gap-xs    // 0.25rem (4px)
gap-sm    // 0.5rem (8px)
gap-md    // 1rem (16px)
gap-lg    // 1.5rem (24px)
gap-xl    // 2rem (32px)
gap-2xl   // 3rem (48px)

// Same for: p-, m-, space-x-, space-y-
```

### Border Radius

```tsx
rounded-none   // 0
rounded-sm     // 0.25rem (4px)
rounded-md     // 0.375rem (6px)
rounded-lg     // 0.5rem (8px)
rounded-xl     // 0.75rem (12px)
rounded-2xl    // 1rem (16px)
rounded-full   // 9999px
```

### Typography

```tsx
// Sizes
text-xs    // 12px
text-sm    // 14px
text-base  // 16px
text-lg    // 18px
text-xl    // 20px
text-2xl   // 24px

// Weights
font-normal    // 400
font-medium    // 500
font-semibold  // 600
font-bold      // 700

// Line heights
leading-tight    // 1.25
leading-normal   // 1.5
leading-relaxed  // 1.75
```

---

## Kiro AI Instructions

When working with Tiinno UI:

1. **ALWAYS read this file first** before creating or modifying components
2. **NEVER deviate** from the component template pattern
3. **ALWAYS run quality checks** after making changes:
   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```
4. **ALWAYS ask** before breaking existing patterns
5. **ALWAYS verify** accessibility requirements are met
6. **ALWAYS write tests** for new components
7. **ALWAYS update** `src/index.ts` with new exports
8. **ALWAYS follow** the existing code style in the repository

### Pre-commit Checklist

Before committing any component:

1. [ ] Follows CVA pattern
2. [ ] Has forwardRef
3. [ ] TypeScript types complete
4. [ ] JSDoc documentation added
5. [ ] Dark mode support
6. [ ] ARIA attributes present
7. [ ] Keyboard navigation works
8. [ ] Tests written and passing
9. [ ] No lint/type errors
10. [ ] Exported from index.ts
11. [ ] Storybook story created

---

**Last Updated**: 2026-02-05
**Version**: 1.0.0
**For**: Kiro AI Agent
