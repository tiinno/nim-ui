# Nim UI - Component Library

**Modern, accessible, production-ready React components built with TypeScript and Tailwind CSS v4**

## Project Overview

Nim UI is a comprehensive component library designed for building modern web applications. It features 24 carefully crafted components organized into 6 categories, all built with accessibility, performance, and developer experience in mind.

### Tech Stack

- **React**: 19.2.0+ (with JSX transform)
- **TypeScript**: 5.9.0+ (strict mode)
- **Styling**: Tailwind CSS v4.0.0
- **Package Manager**: pnpm 9.0.0+
- **Monorepo**: Turborepo
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Documentation**: Storybook

### Project Structure

```
nim-ui/
├── packages/
│   ├── ui/                    # Main component library
│   │   ├── src/
│   │   │   ├── components/    # All UI components
│   │   │   ├── hooks/         # Shared React hooks
│   │   │   ├── utils/         # Utility functions
│   │   │   └── index.ts       # Public API exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mcp-server/            # Model Context Protocol server
│       ├── src/
│       │   ├── index.ts       # MCP server implementation
│       │   └── tools/         # Component tools
│       └── package.json
├── apps/
│   ├── docs/                  # Storybook documentation
│   └── playground/            # Development sandbox
├── turbo.json                 # Turborepo configuration
├── pnpm-workspace.yaml        # pnpm workspace config
└── package.json               # Root package.json
```

---

## Component Library (24 Components)

### 1. Layout Components (5)

#### Container
**Purpose**: Responsive container with max-width constraints
**File**: `src/components/Layout/Container.tsx`
**Props**:
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'` - Maximum width (default: 'xl')
- `padding?: boolean` - Apply horizontal padding (default: true)
- `className?: string` - Additional CSS classes

```tsx
import { Container } from '@nim/ui';

<Container maxWidth="lg">
  <h1>My Content</h1>
</Container>
```

#### Grid
**Purpose**: Responsive CSS Grid layout system
**File**: `src/components/Layout/Grid.tsx`
**Props**:
- `cols?: 1-12` - Number of columns (default: 1)
- `gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'` - Grid gap (default: 'md')
- `responsive?: boolean` - Auto-responsive behavior (default: true)

```tsx
import { Grid } from '@nim/ui';

<Grid cols={3} gap="lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

#### Stack
**Purpose**: Vertical or horizontal stacking with consistent spacing
**File**: `src/components/Layout/Stack.tsx`
**Props**:
- `direction?: 'vertical' | 'horizontal'` - Stack direction (default: 'vertical')
- `spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Gap between items
- `align?: 'start' | 'center' | 'end' | 'stretch'` - Alignment

```tsx
import { Stack } from '@nim/ui';

<Stack spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

#### Flex
**Purpose**: Flexbox layout with common patterns
**File**: `src/components/Layout/Flex.tsx`
**Props**:
- `direction?: 'row' | 'column'` - Flex direction (default: 'row')
- `justify?: 'start' | 'center' | 'end' | 'between' | 'around'` - justify-content
- `align?: 'start' | 'center' | 'end' | 'stretch'` - align-items
- `wrap?: boolean` - Enable flex-wrap (default: false)

```tsx
import { Flex } from '@nim/ui';

<Flex justify="between" align="center">
  <span>Left</span>
  <span>Right</span>
</Flex>
```

#### Spacer
**Purpose**: Flexible spacing element
**File**: `src/components/Layout/Spacer.tsx`
**Props**:
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'` - Fixed size (optional)
- `flex?: boolean` - Use flex: 1 for flexible spacing (default: false)

```tsx
import { Flex, Spacer } from '@nim/ui';

<Flex>
  <div>Left</div>
  <Spacer flex />
  <div>Right</div>
</Flex>
```

---

### 2. Form Components (6)

#### Button
**Purpose**: Primary interactive element
**File**: `src/components/Forms/Button.tsx`
**Variants**: primary, secondary, outline, ghost, danger
**Sizes**: sm, md, lg
**Props**:
- `variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`
- `size?: 'sm' | 'md' | 'lg'`
- `fullWidth?: boolean` - Take full width
- `loading?: boolean` - Show loading state
- `disabled?: boolean`

```tsx
import { Button } from '@nim/ui';

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

#### Input
**Purpose**: Text input field
**File**: `src/components/Forms/Input.tsx`
**Props**:
- `type?: string` - HTML input type (default: 'text')
- `placeholder?: string`
- `error?: string` - Error message
- `disabled?: boolean`
- `fullWidth?: boolean`

```tsx
import { Input } from '@nim/ui';

<Input
  placeholder="Enter email"
  error={errors.email}
  type="email"
/>
```

#### Textarea
**Purpose**: Multi-line text input
**File**: `src/components/Forms/Textarea.tsx`
**Props**:
- `rows?: number` - Number of visible rows (default: 4)
- `placeholder?: string`
- `error?: string`
- `disabled?: boolean`
- `resize?: boolean` - Allow resizing (default: true)

```tsx
import { Textarea } from '@nim/ui';

<Textarea
  rows={6}
  placeholder="Enter your message"
/>
```

#### Select
**Purpose**: Dropdown selection
**File**: `src/components/Forms/Select.tsx`
**Props**:
- `options: Array<{value: string, label: string}>`
- `placeholder?: string`
- `error?: string`
- `disabled?: boolean`

```tsx
import { Select } from '@nim/ui';

<Select
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
  placeholder="Select country"
/>
```

#### Checkbox
**Purpose**: Boolean selection
**File**: `src/components/Forms/Checkbox.tsx`
**Props**:
- `checked?: boolean`
- `label?: string`
- `disabled?: boolean`
- `error?: string`

```tsx
import { Checkbox } from '@nim/ui';

<Checkbox
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  label="I agree to terms"
/>
```

#### Radio
**Purpose**: Single selection from group
**File**: `src/components/Forms/Radio.tsx`
**Props**:
- `name: string` - Radio group name
- `value: string`
- `checked?: boolean`
- `label?: string`
- `disabled?: boolean`

```tsx
import { Radio } from '@nim/ui';

<Radio
  name="plan"
  value="pro"
  checked={plan === 'pro'}
  label="Pro Plan"
/>
```

---

### 3. Data Display Components (5)

#### Card
**Purpose**: Content container with optional header/footer
**File**: `src/components/DataDisplay/Card.tsx`
**Props**:
- `variant?: 'default' | 'outlined' | 'elevated'`
- `padding?: 'none' | 'sm' | 'md' | 'lg'`
- `header?: ReactNode` - Card header content
- `footer?: ReactNode` - Card footer content

```tsx
import { Card } from '@nim/ui';

<Card
  variant="elevated"
  header={<h3>Card Title</h3>}
>
  Card content here
</Card>
```

#### Badge
**Purpose**: Small status indicators
**File**: `src/components/DataDisplay/Badge.tsx`
**Variants**: default, success, warning, danger, info
**Props**:
- `variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'`
- `size?: 'sm' | 'md' | 'lg'`

```tsx
import { Badge } from '@nim/ui';

<Badge variant="success">Active</Badge>
```

#### Avatar
**Purpose**: User profile image/initials
**File**: `src/components/DataDisplay/Avatar.tsx`
**Props**:
- `src?: string` - Image URL
- `alt?: string` - Image alt text
- `initials?: string` - Fallback text (2 chars)
- `size?: 'sm' | 'md' | 'lg' | 'xl'`

```tsx
import { Avatar } from '@nim/ui';

<Avatar
  src="/avatar.jpg"
  alt="John Doe"
  initials="JD"
  size="md"
/>
```

#### Table
**Purpose**: Tabular data display
**File**: `src/components/DataDisplay/Table.tsx`
**Props**:
- `data: Array<Record<string, any>>`
- `columns: Array<{key: string, label: string, render?: Function}>`
- `striped?: boolean` - Zebra striping
- `hoverable?: boolean` - Hover effect

```tsx
import { Table } from '@nim/ui';

<Table
  data={users}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]}
  striped
  hoverable
/>
```

#### Spinner
**Purpose**: Loading indicator
**File**: `src/components/DataDisplay/Spinner.tsx`
**Props**:
- `size?: 'sm' | 'md' | 'lg' | 'xl'`
- `color?: string` - Tailwind color class
- `label?: string` - Accessibility label

```tsx
import { Spinner } from '@nim/ui';

<Spinner size="md" label="Loading..." />
```

---

### 4. Feedback Components (3)

#### Alert
**Purpose**: Contextual feedback messages
**File**: `src/components/Feedback/Alert.tsx`
**Variants**: info, success, warning, danger
**Props**:
- `variant?: 'info' | 'success' | 'warning' | 'danger'`
- `title?: string` - Alert title
- `dismissible?: boolean` - Show close button
- `onDismiss?: () => void` - Close callback

```tsx
import { Alert } from '@nim/ui';

<Alert
  variant="success"
  title="Success!"
  dismissible
  onDismiss={() => setShowAlert(false)}
>
  Operation completed successfully
</Alert>
```

#### Toast
**Purpose**: Temporary notification messages
**File**: `src/components/Feedback/Toast.tsx`
**Props**:
- `message: string`
- `variant?: 'info' | 'success' | 'warning' | 'danger'`
- `duration?: number` - Auto-dismiss time (ms)
- `position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'`

```tsx
import { Toast, useToast } from '@nim/ui';

const { showToast } = useToast();

showToast({
  message: 'Changes saved',
  variant: 'success',
  duration: 3000
});
```

#### Progress
**Purpose**: Progress indicator
**File**: `src/components/Feedback/Progress.tsx`
**Props**:
- `value: number` - Progress percentage (0-100)
- `max?: number` - Maximum value (default: 100)
- `variant?: 'default' | 'success' | 'warning' | 'danger'`
- `showLabel?: boolean` - Display percentage text

```tsx
import { Progress } from '@nim/ui';

<Progress
  value={75}
  variant="success"
  showLabel
/>
```

---

### 5. Overlay Components (3)

#### Modal
**Purpose**: Dialog overlay for focused interaction
**File**: `src/components/Overlay/Modal.tsx`
**Props**:
- `isOpen: boolean` - Control visibility
- `onClose: () => void` - Close callback
- `title?: string` - Modal title
- `size?: 'sm' | 'md' | 'lg' | 'xl'`
- `closeOnOverlayClick?: boolean` - Click outside to close

```tsx
import { Modal } from '@nim/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  Are you sure you want to continue?
</Modal>
```

#### Popover
**Purpose**: Contextual popup content
**File**: `src/components/Overlay/Popover.tsx`
**Props**:
- `trigger: ReactNode` - Element that triggers popover
- `content: ReactNode` - Popover content
- `position?: 'top' | 'bottom' | 'left' | 'right'`
- `openOn?: 'click' | 'hover'`

```tsx
import { Popover } from '@nim/ui';

<Popover
  trigger={<Button>Show Info</Button>}
  content={<div>Additional information</div>}
  position="bottom"
/>
```

#### Tooltip
**Purpose**: Brief hint on hover
**File**: `src/components/Overlay/Tooltip.tsx`
**Props**:
- `content: string` - Tooltip text
- `position?: 'top' | 'bottom' | 'left' | 'right'`
- `delay?: number` - Show delay (ms)

```tsx
import { Tooltip } from '@nim/ui';

<Tooltip content="Click to edit" position="top">
  <button>Edit</button>
</Tooltip>
```

---

### 6. Navigation Components (2)

#### Tabs
**Purpose**: Content organization with tabbed interface
**File**: `src/components/Navigation/Tabs.tsx`
**Props**:
- `tabs: Array<{id: string, label: string, content: ReactNode}>`
- `defaultTab?: string` - Initially active tab
- `variant?: 'line' | 'enclosed' | 'pills'`

```tsx
import { Tabs } from '@nim/ui';

<Tabs
  tabs={[
    { id: 'profile', label: 'Profile', content: <ProfileTab /> },
    { id: 'settings', label: 'Settings', content: <SettingsTab /> }
  ]}
  variant="line"
/>
```

#### Breadcrumb
**Purpose**: Navigation hierarchy display
**File**: `src/components/Navigation/Breadcrumb.tsx`
**Props**:
- `items: Array<{label: string, href?: string}>`
- `separator?: ReactNode` - Custom separator (default: '/')

```tsx
import { Breadcrumb } from '@nim/ui';

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Details' }
  ]}
/>
```

---

## Design System

### Design Tokens

#### Color Palette

```css
/* Primary Colors */
--color-primary-50: #f0f9ff;
--color-primary-100: #e0f2fe;
--color-primary-200: #bae6fd;
--color-primary-300: #7dd3fc;
--color-primary-400: #38bdf8;
--color-primary-500: #0ea5e9; /* Base primary */
--color-primary-600: #0284c7;
--color-primary-700: #0369a1;
--color-primary-800: #075985;
--color-primary-900: #0c4a6e;

/* Neutral/Gray */
--color-neutral-50: #f9fafb;
--color-neutral-100: #f3f4f6;
--color-neutral-200: #e5e7eb;
--color-neutral-300: #d1d5db;
--color-neutral-400: #9ca3af;
--color-neutral-500: #6b7280;
--color-neutral-600: #4b5563;
--color-neutral-700: #374151;
--color-neutral-800: #1f2937;
--color-neutral-900: #111827;

/* Semantic Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #3b82f6;
```

#### Spacing Scale

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

#### Typography

```css
/* Font Families */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'Fira Code', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;
```

#### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Dark Mode Support

All components support dark mode via `dark:` Tailwind variants:

```tsx
// Components automatically adapt to dark mode
<Card className="bg-white dark:bg-neutral-800">
  <p className="text-neutral-900 dark:text-neutral-100">
    This text adapts to theme
  </p>
</Card>
```

Enable dark mode in your app:

```tsx
// Add to root element
<html className="dark">
  <body>
    <App />
  </body>
</html>
```

---

## Component Development Patterns

### 1. Component Structure (CVA Pattern)

```tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  // Base styles (always applied)
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

/**
 * Button component for user interactions
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 2. TypeScript Patterns

```typescript
// Strict prop typing
export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'default' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// Generic components
export interface SelectProps<T = string> {
  value?: T;
  onChange?: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

// Ref forwarding with proper types
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  // Implementation
});
```

### 3. Accessibility Requirements

Every component must include:

```tsx
// ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <X />
</button>

// Keyboard navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') onClose();
  if (e.key === 'Enter') onSubmit();
};

// Focus management
const modalRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (isOpen) {
    modalRef.current?.focus();
  }
}, [isOpen]);

// Screen reader support
<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

### 4. Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disables when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant styles', () => {
    const { container } = render(<Button variant="primary">Test</Button>);
    expect(container.firstChild).toHaveClass('bg-primary-500');
  });
});
```

---

## MCP Server

The Nim UI MCP server provides AI assistants with tools to work with the component library.

### Server Location

**Path**: `/Users/emetworks/Project/HOBBY/utils/nim-ui/packages/mcp-server/`

### Available Tools (5)

#### 1. list-components
**Purpose**: Get list of all available components
**Returns**: Array of component names organized by category

```json
{
  "layout": ["Container", "Grid", "Stack", "Flex", "Spacer"],
  "forms": ["Button", "Input", "Textarea", "Select", "Checkbox", "Radio"],
  "dataDisplay": ["Card", "Badge", "Avatar", "Table", "Spinner"],
  "feedback": ["Alert", "Toast", "Progress"],
  "overlay": ["Modal", "Popover", "Tooltip"],
  "navigation": ["Tabs", "Breadcrumb"]
}
```

#### 2. get-component-info
**Purpose**: Get detailed info about a specific component
**Input**: `{ componentName: string }`
**Returns**: Props, usage examples, variants

```typescript
// Usage in MCP
await use_mcp_tool({
  server_name: "nim-ui",
  tool_name: "get-component-info",
  arguments: { componentName: "Button" }
});
```

#### 3. search-components
**Purpose**: Find components by category or feature
**Input**: `{ query: string, category?: string }`
**Returns**: Matching components with descriptions

```typescript
// Find all form components
await use_mcp_tool({
  server_name: "nim-ui",
  tool_name: "search-components",
  arguments: { category: "forms" }
});
```

#### 4. get-design-tokens
**Purpose**: Get design system tokens (colors, spacing, etc.)
**Input**: `{ tokenType?: 'colors' | 'spacing' | 'typography' | 'all' }`
**Returns**: Design token values

```typescript
await use_mcp_tool({
  server_name: "nim-ui",
  tool_name: "get-design-tokens",
  arguments: { tokenType: "colors" }
});
```

#### 5. generate-component-code
**Purpose**: Generate component usage code
**Input**: `{ componentName: string, props?: object }`
**Returns**: TypeScript/JSX code snippet

```typescript
await use_mcp_tool({
  server_name: "nim-ui",
  tool_name: "generate-component-code",
  arguments: {
    componentName: "Button",
    props: { variant: "primary", size: "lg" }
  }
});
```

### MCP Server Configuration

Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "nim-ui": {
      "command": "node",
      "args": [
        "/Users/emetworks/Project/HOBBY/utils/nim-ui/packages/mcp-server/dist/index.js"
      ],
      "env": {}
    }
  }
}
```

---

## Development Workflow

### Setup

```bash
# Clone repository
git clone <repo-url>
cd nim-ui

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

### Common Commands

```bash
# Development
pnpm dev                 # Start dev server (all packages)
pnpm dev --filter ui     # Start only UI package

# Building
pnpm build               # Build all packages
pnpm build:ui            # Build UI package only

# Testing
pnpm test                # Run all tests
pnpm test:watch          # Watch mode
pnpm test:coverage       # Coverage report

# Code Quality
pnpm lint                # Run ESLint
pnpm lint:fix            # Fix linting issues
pnpm typecheck           # TypeScript check
pnpm format              # Format with Prettier

# Storybook
pnpm storybook           # Start Storybook
pnpm build:storybook     # Build Storybook

# Package Management
pnpm add <pkg> -w        # Add to root
pnpm add <pkg> --filter ui  # Add to UI package
```

### Component Creation Workflow

1. **Create component file**:
```bash
# Create in appropriate category
touch packages/ui/src/components/Forms/NewComponent.tsx
```

2. **Implement component**:
```tsx
// Follow CVA pattern (see Component Patterns above)
// Add TypeScript types
// Include JSDoc documentation
// Implement accessibility features
```

3. **Add tests**:
```bash
touch packages/ui/src/components/Forms/NewComponent.test.tsx
```

4. **Create Storybook story**:
```bash
touch apps/docs/stories/NewComponent.stories.tsx
```

5. **Export from index**:
```typescript
// packages/ui/src/index.ts
export { NewComponent } from './components/Forms/NewComponent';
```

6. **Run quality checks**:
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/add-new-component

# Make changes and commit
git add .
git commit -m "feat: add NewComponent with variants"

# Push and create PR
git push origin feat/add-new-component
```

### Publishing Workflow

```bash
# Version bump
pnpm changeset

# Build packages
pnpm build

# Publish to npm
pnpm publish -r
```

---

## File Locations & Quick Reference

### Core Package Paths

```
UI Package:
/Users/emetworks/Project/HOBBY/utils/nim-ui/packages/ui/

MCP Server:
/Users/emetworks/Project/HOBBY/utils/nim-ui/packages/mcp-server/

Documentation:
/Users/emetworks/Project/HOBBY/utils/nim-ui/apps/docs/

Playground:
/Users/emetworks/Project/HOBBY/utils/nim-ui/apps/playground/
```

### Configuration Files

```
Root Config:
├── turbo.json                    # Turborepo config
├── pnpm-workspace.yaml           # Workspace config
├── tsconfig.json                 # Base TypeScript config
└── .eslintrc.js                  # ESLint config

UI Package:
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TS config extends root
├── vite.config.ts                # Vite build config
└── tailwind.config.js            # Tailwind config
```

### Component Index

All components are exported from:
```
/Users/emetworks/Project/HOBBY/utils/nim-ui/packages/ui/src/index.ts
```

---

## Best Practices

### DO's ✅

- Use `forwardRef` for all components that render DOM elements
- Apply strict TypeScript typing with proper interfaces
- Include JSDoc comments with `@example` usage
- Use CVA for variant-based styling
- Test all interactive behaviors
- Support dark mode via Tailwind `dark:` variants
- Include ARIA attributes for accessibility
- Export all public components from `src/index.ts`
- Follow existing naming conventions
- Use semantic HTML elements

### DON'Ts ❌

- Don't use inline styles (use Tailwind classes)
- Don't skip TypeScript types (no `any` unless absolutely necessary)
- Don't forget to forward refs
- Don't ignore accessibility (keyboard nav, ARIA, focus management)
- Don't create components without tests
- Don't hardcode values (use design tokens)
- Don't break existing APIs without major version bump
- Don't forget to update documentation

---

## Troubleshooting

### Build Issues

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### TypeScript Errors

```bash
# Check types
pnpm typecheck

# Rebuild with clean cache
rm -rf node_modules/.vite
pnpm build
```

### Test Failures

```bash
# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test Button.test.tsx

# Update snapshots
pnpm test -u
```

### Storybook Issues

```bash
# Clear Storybook cache
rm -rf apps/docs/.storybook-cache
pnpm storybook
```

---

## Resources

### Documentation
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [CVA Documentation](https://cva.style/docs)

### Tools
- [Storybook](https://storybook.js.org/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Turborepo](https://turbo.build/repo)

### Accessibility
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

---

## Support

For questions or issues:
1. Check existing documentation
2. Search through Storybook examples
3. Review component source code
4. Create GitHub issue

---

**Last Updated**: 2026-02-05
**Version**: 1.0.0
**Maintained by**: Nim UI Team
