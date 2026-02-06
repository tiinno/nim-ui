import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  FeatureGrid,
  FeatureCard,
  featureGridVariants,
  featureCardVariants,
} from './feature-grid';

describe('FeatureGrid', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <FeatureGrid>
          <div>Feature 1</div>
          <div>Feature 2</div>
        </FeatureGrid>
      );
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
    });

    it('applies base grid styles', () => {
      render(<FeatureGrid data-testid="grid">Content</FeatureGrid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('gap-8');
      expect(grid).toHaveClass('py-12');
    });

    it('applies default columns (3)', () => {
      render(<FeatureGrid data-testid="grid">Content</FeatureGrid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('Column Variants', () => {
    it.each([
      [2, 'md:grid-cols-2'],
      [3, 'lg:grid-cols-3'],
      [4, 'lg:grid-cols-4'],
    ])('renders %d columns grid', (columns, expectedClass) => {
      render(
        <FeatureGrid columns={columns as any} data-testid="grid">
          Content
        </FeatureGrid>
      );
      expect(screen.getByTestId('grid')).toHaveClass(expectedClass);
    });

    it('applies 2 columns layout', () => {
      render(<FeatureGrid columns={2} data-testid="grid">Content</FeatureGrid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('applies 3 columns layout', () => {
      render(<FeatureGrid columns={3} data-testid="grid">Content</FeatureGrid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('applies 4 columns layout', () => {
      render(<FeatureGrid columns={4} data-testid="grid">Content</FeatureGrid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<FeatureGrid ref={ref}>Content</FeatureGrid>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports featureGridVariants function', () => {
      expect(typeof featureGridVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = featureGridVariants();
      expect(classes).toContain('grid');
      expect(classes).toContain('gap-8');
    });

    it('generates correct column classes', () => {
      const cols2 = featureGridVariants({ columns: 2 });
      expect(cols2).toContain('md:grid-cols-2');

      const cols4 = featureGridVariants({ columns: 4 });
      expect(cols4).toContain('lg:grid-cols-4');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <FeatureGrid className="container mx-auto" data-testid="grid">
          Content
        </FeatureGrid>
      );
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('container');
      expect(grid).toHaveClass('grid');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <FeatureGrid data-testid="grid" data-section="features">
          Content
        </FeatureGrid>
      );
      expect(screen.getByTestId('grid')).toHaveAttribute('data-section', 'features');
    });

    it('supports aria attributes', () => {
      render(
        <FeatureGrid aria-label="Features grid" data-testid="grid">
          Content
        </FeatureGrid>
      );
      expect(screen.getByTestId('grid')).toHaveAttribute('aria-label', 'Features grid');
    });

    it('supports id attribute', () => {
      render(<FeatureGrid id="features">Content</FeatureGrid>);
      expect(document.getElementById('features')).toBeInTheDocument();
    });
  });
});

describe('FeatureCard', () => {
  describe('Rendering', () => {
    it('renders with title and description', () => {
      render(
        <FeatureCard
          title="Fast Performance"
          description="Lightning fast load times"
        />
      );
      expect(screen.getByText('Fast Performance')).toBeInTheDocument();
      expect(screen.getByText('Lightning fast load times')).toBeInTheDocument();
    });

    it('applies base card styles', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('flex');
      expect(card).toHaveClass('flex-col');
      expect(card).toHaveClass('items-center');
      expect(card).toHaveClass('text-center');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('border');
    });
  });

  describe('Icon', () => {
    it('does not render icon when not provided', () => {
      const { container } = render(
        <FeatureCard title="Title" description="Description" />
      );
      const iconContainer = container.querySelector('[class*="h-12 w-12"]');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('renders icon when provided', () => {
      render(
        <FeatureCard
          icon={<svg data-testid="icon">Icon</svg>}
          title="Title"
          description="Description"
        />
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('icon container has correct styling', () => {
      const { container } = render(
        <FeatureCard
          icon={<span>Icon</span>}
          title="Title"
          description="Description"
        />
      );
      const iconContainer = container.querySelector('[class*="h-12 w-12"]');
      expect(iconContainer).toHaveClass('h-12');
      expect(iconContainer).toHaveClass('w-12');
      expect(iconContainer).toHaveClass('rounded-lg');
      expect(iconContainer).toHaveClass('bg-primary-100');
    });
  });

  describe('Title', () => {
    it('renders title text', () => {
      render(
        <FeatureCard
          title="Fast Performance"
          description="Description"
        />
      );
      expect(screen.getByText('Fast Performance')).toBeInTheDocument();
    });

    it('applies title styling', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
        />
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-neutral-900');
    });

    it('title has dark mode styles', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
        />
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Description', () => {
    it('renders description text', () => {
      render(
        <FeatureCard
          title="Title"
          description="Lightning fast load times"
        />
      );
      expect(screen.getByText('Lightning fast load times')).toBeInTheDocument();
    });

    it('applies description styling', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
        />
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-neutral-600');
    });

    it('description has dark mode styles', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
        />
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode card styles', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('dark:bg-neutral-900');
      expect(card).toHaveClass('dark:border-neutral-700');
    });

    it('icon container has dark mode styles', () => {
      const { container } = render(
        <FeatureCard
          icon={<span>Icon</span>}
          title="Title"
          description="Description"
        />
      );
      const iconContainer = container.querySelector('[class*="h-12 w-12"]');
      expect(iconContainer).toHaveClass('dark:bg-primary-900');
      expect(iconContainer).toHaveClass('dark:text-primary-400');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(
        <FeatureCard ref={ref} title="Title" description="Description" />
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports featureCardVariants function', () => {
      expect(typeof featureCardVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = featureCardVariants();
      expect(classes).toContain('flex');
      expect(classes).toContain('flex-col');
      expect(classes).toContain('rounded-lg');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
          className="shadow-lg"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('shadow-lg');
      expect(card).toHaveClass('flex');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
          data-testid="card"
          data-feature="performance"
        />
      );
      expect(screen.getByTestId('card')).toHaveAttribute('data-feature', 'performance');
    });

    it('supports aria attributes', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
          aria-label="Feature card"
          data-testid="card"
        />
      );
      expect(screen.getByTestId('card')).toHaveAttribute('aria-label', 'Feature card');
    });

    it('supports id attribute', () => {
      render(
        <FeatureCard
          title="Title"
          description="Description"
          id="feature-1"
        />
      );
      expect(document.getElementById('feature-1')).toBeInTheDocument();
    });
  });

  describe('Complete Examples', () => {
    it('renders feature card with all props', () => {
      render(
        <FeatureCard
          icon={<svg data-testid="icon">Icon</svg>}
          title="Fast Performance"
          description="Lightning fast load times"
        />
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Fast Performance')).toBeInTheDocument();
      expect(screen.getByText('Lightning fast load times')).toBeInTheDocument();
    });

    it('renders feature card without icon', () => {
      render(
        <FeatureCard
          title="Secure"
          description="Enterprise-grade security"
        />
      );

      expect(screen.getByText('Secure')).toBeInTheDocument();
      expect(screen.getByText('Enterprise-grade security')).toBeInTheDocument();
    });
  });
});

describe('FeatureGrid with FeatureCard Integration', () => {
  it('renders multiple feature cards in grid', () => {
    render(
      <FeatureGrid>
        <FeatureCard
          title="Fast"
          description="Lightning fast"
        />
        <FeatureCard
          title="Secure"
          description="Enterprise-grade"
        />
        <FeatureCard
          title="Reliable"
          description="99.9% uptime"
        />
      </FeatureGrid>
    );

    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Reliable')).toBeInTheDocument();
  });

  it('renders 4-column grid with feature cards', () => {
    render(
      <FeatureGrid columns={4} data-testid="grid">
        <FeatureCard title="Feature 1" description="Description 1" />
        <FeatureCard title="Feature 2" description="Description 2" />
        <FeatureCard title="Feature 3" description="Description 3" />
        <FeatureCard title="Feature 4" description="Description 4" />
      </FeatureGrid>
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });
});
