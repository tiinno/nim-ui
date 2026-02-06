import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Stack, stackVariants } from './stack';

describe('Stack', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('applies base stack styles', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('flex');
    });

    it('applies default direction (vertical)', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('flex-col');
    });

    it('applies default spacing (md)', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('gap-4');
    });

    it('applies default alignment (stretch)', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('items-stretch');
    });
  });

  describe('Direction Variants', () => {
    it.each([
      ['vertical', 'flex-col'],
      ['horizontal', 'flex-row'],
    ])('renders %s direction', (direction, expectedClass) => {
      render(
        <Stack direction={direction as any} data-testid="stack">
          Content
        </Stack>
      );
      expect(screen.getByTestId('stack')).toHaveClass(expectedClass);
    });

    it('applies vertical direction', () => {
      render(<Stack direction="vertical" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('flex-col');
    });

    it('applies horizontal direction', () => {
      render(<Stack direction="horizontal" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('flex-row');
    });
  });

  describe('Spacing Variants', () => {
    it.each([
      ['none', 'gap-0'],
      ['xs', 'gap-1'],
      ['sm', 'gap-2'],
      ['md', 'gap-4'],
      ['lg', 'gap-6'],
      ['xl', 'gap-8'],
    ])('renders %s spacing variant', (spacing, expectedClass) => {
      render(
        <Stack spacing={spacing as any} data-testid="stack">
          Content
        </Stack>
      );
      expect(screen.getByTestId('stack')).toHaveClass(expectedClass);
    });

    it('applies no spacing', () => {
      render(<Stack spacing="none" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('gap-0');
    });

    it('applies extra small spacing', () => {
      render(<Stack spacing="xs" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('gap-1');
    });

    it('applies small spacing', () => {
      render(<Stack spacing="sm" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('gap-2');
    });

    it('applies large spacing', () => {
      render(<Stack spacing="lg" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('gap-6');
    });

    it('applies extra large spacing', () => {
      render(<Stack spacing="xl" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('gap-8');
    });
  });

  describe('Alignment Variants', () => {
    it.each([
      ['start', 'items-start'],
      ['center', 'items-center'],
      ['end', 'items-end'],
      ['stretch', 'items-stretch'],
    ])('renders %s alignment', (align, expectedClass) => {
      render(
        <Stack align={align as any} data-testid="stack">
          Content
        </Stack>
      );
      expect(screen.getByTestId('stack')).toHaveClass(expectedClass);
    });

    it('applies start alignment', () => {
      render(<Stack align="start" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('items-start');
    });

    it('applies center alignment', () => {
      render(<Stack align="center" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('items-center');
    });

    it('applies end alignment', () => {
      render(<Stack align="end" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('items-end');
    });

    it('applies stretch alignment', () => {
      render(<Stack align="stretch" data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('items-stretch');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Stack ref={ref}>Content</Stack>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports stackVariants function', () => {
      expect(typeof stackVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = stackVariants();
      expect(classes).toContain('flex');
    });

    it('generates correct direction classes', () => {
      const vertical = stackVariants({ direction: 'vertical' });
      expect(vertical).toContain('flex-col');

      const horizontal = stackVariants({ direction: 'horizontal' });
      expect(horizontal).toContain('flex-row');
    });

    it('generates correct spacing classes', () => {
      const spacingSm = stackVariants({ spacing: 'sm' });
      expect(spacingSm).toContain('gap-2');

      const spacingLg = stackVariants({ spacing: 'lg' });
      expect(spacingLg).toContain('gap-6');
    });

    it('generates correct alignment classes', () => {
      const alignCenter = stackVariants({ align: 'center' });
      expect(alignCenter).toContain('items-center');

      const alignEnd = stackVariants({ align: 'end' });
      expect(alignEnd).toContain('items-end');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Stack className="p-4" data-testid="stack">
          Content
        </Stack>
      );
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('p-4');
      expect(stack).toHaveClass('flex');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <Stack data-testid="stack" data-layout="vertical">
          Content
        </Stack>
      );
      expect(screen.getByTestId('stack')).toHaveAttribute('data-layout', 'vertical');
    });

    it('supports aria attributes', () => {
      render(
        <Stack aria-label="Navigation stack" data-testid="stack">
          Content
        </Stack>
      );
      expect(screen.getByTestId('stack')).toHaveAttribute('aria-label', 'Navigation stack');
    });

    it('supports id attribute', () => {
      render(<Stack id="nav-stack">Content</Stack>);
      expect(document.getElementById('nav-stack')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('renders vertical form stack', () => {
      render(
        <Stack spacing="md">
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <button>Submit</button>
        </Stack>
      );
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('renders horizontal button stack', () => {
      render(
        <Stack direction="horizontal" spacing="sm" align="center">
          <button>Cancel</button>
          <button>Save</button>
        </Stack>
      );
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders navigation stack', () => {
      render(
        <Stack direction="horizontal" spacing="lg" align="center">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </Stack>
      );
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  describe('Combination of Variants', () => {
    it('applies direction, spacing, and alignment together', () => {
      render(
        <Stack
          direction="horizontal"
          spacing="lg"
          align="center"
          data-testid="stack"
        >
          Content
        </Stack>
      );
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('flex-row');
      expect(stack).toHaveClass('gap-6');
      expect(stack).toHaveClass('items-center');
    });

    it('renders vertical centered stack with large spacing', () => {
      render(
        <Stack
          direction="vertical"
          spacing="xl"
          align="center"
          data-testid="stack"
        >
          Content
        </Stack>
      );
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('flex-col');
      expect(stack).toHaveClass('gap-8');
      expect(stack).toHaveClass('items-center');
    });
  });

  describe('Multiple Items', () => {
    it('renders multiple stacked items', () => {
      render(
        <Stack>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>Item {i}</div>
          ))}
        </Stack>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 5')).toBeInTheDocument();
    });
  });
});
