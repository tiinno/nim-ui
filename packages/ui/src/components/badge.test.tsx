import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Badge, badgeVariants } from './badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('bg-primary-600');
    });

    it('applies base styles', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('justify-center');
      expect(badge).toHaveClass('font-medium');
      expect(badge).toHaveClass('rounded-full');
      expect(badge).toHaveClass('transition-colors');
    });

    it('renders with default size', () => {
      render(<Badge data-testid="badge">Medium</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-1');
      expect(badge).toHaveClass('text-sm');
    });
  });

  describe('Variants', () => {
    it.each([
      ['default', 'bg-primary-600', 'text-white'],
      ['secondary', 'bg-neutral-200', 'text-neutral-900'],
      ['outline', 'border', 'bg-transparent'],
      ['destructive', 'bg-red-600', 'text-white'],
    ])('renders %s variant with correct styles', (variant, bgClass, textClass) => {
      render(
        <Badge data-testid="badge" variant={variant as any}>
          {variant}
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(bgClass);
      expect(badge).toHaveClass(textClass);
    });

    it('applies default variant background', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('bg-primary-600');
    });

    it('applies secondary variant background', () => {
      render(
        <Badge variant="secondary" data-testid="badge">
          Secondary
        </Badge>
      );
      expect(screen.getByTestId('badge')).toHaveClass('bg-neutral-200');
    });

    it('applies outline variant border', () => {
      render(
        <Badge variant="outline" data-testid="badge">
          Outline
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('border');
      expect(badge).toHaveClass('border-neutral-300');
      expect(badge).toHaveClass('bg-transparent');
    });

    it('applies destructive variant background', () => {
      render(
        <Badge variant="destructive" data-testid="badge">
          Destructive
        </Badge>
      );
      expect(screen.getByTestId('badge')).toHaveClass('bg-red-600');
    });
  });

  describe('Sizes', () => {
    it.each([
      ['sm', 'px-2', 'py-0.5', 'text-xs'],
      ['md', 'px-2.5', 'py-1', 'text-sm'],
      ['lg', 'px-3', 'py-1.5', 'text-base'],
    ])('renders %s size with correct padding and text', (size, px, py, textSize) => {
      render(
        <Badge data-testid="badge" size={size as any}>
          {size}
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(px);
      expect(badge).toHaveClass(py);
      expect(badge).toHaveClass(textSize);
    });

    it('applies small size correctly', () => {
      render(
        <Badge size="sm" data-testid="badge">
          Small
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('text-xs');
    });

    it('applies large size correctly', () => {
      render(
        <Badge size="lg" data-testid="badge">
          Large
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('px-3');
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode to default variant', () => {
      render(
        <Badge variant="default" data-testid="badge">
          Default
        </Badge>
      );
      expect(screen.getByTestId('badge')).toHaveClass('dark:bg-primary-700');
    });

    it('applies dark mode to secondary variant', () => {
      render(
        <Badge variant="secondary" data-testid="badge">
          Secondary
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('dark:bg-neutral-700');
      expect(badge).toHaveClass('dark:text-neutral-100');
    });

    it('applies dark mode to outline variant', () => {
      render(
        <Badge variant="outline" data-testid="badge">
          Outline
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('dark:border-neutral-600');
      expect(badge).toHaveClass('dark:text-neutral-100');
    });

    it('applies dark mode to destructive variant', () => {
      render(
        <Badge variant="destructive" data-testid="badge">
          Destructive
        </Badge>
      );
      expect(screen.getByTestId('badge')).toHaveClass('dark:bg-red-700');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to badge element', () => {
      const ref = { current: null };
      render(<Badge ref={ref}>Badge</Badge>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('ref can access DOM properties', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Badge ref={ref}>Badge</Badge>);
      expect(ref.current?.classList).toBeDefined();
    });
  });

  describe('CVA Variants', () => {
    it('exports badgeVariants function', () => {
      expect(typeof badgeVariants).toBe('function');
    });

    it('generates correct classes for default variant', () => {
      const classes = badgeVariants({ variant: 'default', size: 'md' });
      expect(classes).toContain('bg-primary-600');
      expect(classes).toContain('px-2.5');
    });

    it('generates correct classes for custom combination', () => {
      const classes = badgeVariants({ variant: 'destructive', size: 'lg' });
      expect(classes).toContain('bg-red-600');
      expect(classes).toContain('px-3');
      expect(classes).toContain('text-base');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with variant classes', () => {
      render(
        <Badge className="custom-badge" data-testid="badge">
          Custom
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-badge');
      expect(badge).toHaveClass('bg-primary-600');
    });

    it('allows overriding default classes', () => {
      render(
        <Badge className="bg-yellow-500" data-testid="badge">
          Yellow
        </Badge>
      );
      expect(screen.getByTestId('badge')).toHaveClass('bg-yellow-500');
    });

    it('supports multiple custom classes', () => {
      render(
        <Badge className="ml-2 uppercase tracking-wide" data-testid="badge">
          Badge
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('ml-2');
      expect(badge).toHaveClass('uppercase');
      expect(badge).toHaveClass('tracking-wide');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <Badge data-testid="status-badge" data-status="active">
          Active
        </Badge>
      );
      expect(screen.getByTestId('status-badge')).toHaveAttribute('data-status', 'active');
    });

    it('supports aria attributes', () => {
      render(
        <Badge aria-label="Status badge" data-testid="badge">
          New
        </Badge>
      );
      expect(screen.getByTestId('badge')).toHaveAttribute('aria-label', 'Status badge');
    });

    it('supports id attribute', () => {
      render(<Badge id="feature-badge">Featured</Badge>);
      expect(document.getElementById('feature-badge')).toBeInTheDocument();
    });

    it('supports role attribute', () => {
      render(
        <Badge role="status" data-testid="badge">
          Online
        </Badge>
      );
      expect(screen.getByTestId('badge')).toHaveAttribute('role', 'status');
    });

    it('supports title attribute', () => {
      render(
        <Badge title="This is a badge" data-testid="badge">
          Hover me
        </Badge>
      );
      expect(screen.getByTestId('badge')).toHaveAttribute('title', 'This is a badge');
    });
  });

  describe('Content Types', () => {
    it('renders text content', () => {
      render(<Badge>Text Badge</Badge>);
      expect(screen.getByText('Text Badge')).toBeInTheDocument();
    });

    it('renders numeric content', () => {
      render(<Badge>99+</Badge>);
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('renders single character', () => {
      render(<Badge>!</Badge>);
      expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('renders emoji', () => {
      render(<Badge>🔥</Badge>);
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('renders mixed content', () => {
      render(
        <Badge>
          <span>Status:</span> Active
        </Badge>
      );
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('renders status badge', () => {
      render(
        <Badge variant="default" size="sm">
          New
        </Badge>
      );
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders notification count', () => {
      render(
        <Badge variant="destructive" size="sm">
          5
        </Badge>
      );
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders feature tag', () => {
      render(
        <Badge variant="secondary" size="md">
          Featured
        </Badge>
      );
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('renders category label', () => {
      render(
        <Badge variant="outline" size="lg">
          Technology
        </Badge>
      );
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  describe('Variant Combinations', () => {
    it('combines default variant with small size', () => {
      render(
        <Badge variant="default" size="sm" data-testid="badge">
          Default Small
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-primary-600');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('text-xs');
    });

    it('combines secondary variant with large size', () => {
      render(
        <Badge variant="secondary" size="lg" data-testid="badge">
          Secondary Large
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-neutral-200');
      expect(badge).toHaveClass('px-3');
      expect(badge).toHaveClass('text-base');
    });

    it('combines outline variant with medium size', () => {
      render(
        <Badge variant="outline" size="md" data-testid="badge">
          Outline Medium
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('border');
      expect(badge).toHaveClass('px-2.5');
    });

    it('combines destructive variant with small size', () => {
      render(
        <Badge variant="destructive" size="sm" data-testid="badge">
          Error
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-red-600');
      expect(badge).toHaveClass('text-xs');
    });
  });

  describe('Visual Styling', () => {
    it('has inline-flex display', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('inline-flex');
    });

    it('has centered content', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('justify-center');
    });

    it('has rounded-full shape', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('rounded-full');
    });

    it('has transition-colors animation', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('transition-colors');
    });

    it('has medium font-weight', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('font-medium');
    });
  });
});
