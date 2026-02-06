import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Grid, gridVariants } from './grid';

describe('Grid', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('applies base grid styles', () => {
      render(<Grid data-testid="grid">Content</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('grid');
    });

    it('applies default columns (1)', () => {
      render(<Grid data-testid="grid">Content</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('grid-cols-1');
    });

    it('applies default gap (md)', () => {
      render(<Grid data-testid="grid">Content</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('gap-4');
    });
  });

  describe('Column Variants', () => {
    it.each([
      [1, 'grid-cols-1'],
      [2, 'grid-cols-1'],
      [3, 'grid-cols-1'],
      [4, 'grid-cols-1'],
      [5, 'grid-cols-1'],
      [6, 'grid-cols-1'],
      [12, 'grid-cols-1'],
    ])('renders %d columns with base class', (cols, expectedClass) => {
      render(
        <Grid cols={cols as any} data-testid="grid">
          Content
        </Grid>
      );
      expect(screen.getByTestId('grid')).toHaveClass(expectedClass);
    });

    it('renders 2 columns grid', () => {
      render(<Grid cols={2} data-testid="grid">Content</Grid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
    });

    it('renders 3 columns grid', () => {
      render(<Grid cols={3} data-testid="grid">Content</Grid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('renders 4 columns grid', () => {
      render(<Grid cols={4} data-testid="grid">Content</Grid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });

    it('renders 6 columns grid', () => {
      render(<Grid cols={6} data-testid="grid">Content</Grid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-3');
      expect(grid).toHaveClass('lg:grid-cols-6');
    });

    it('renders 12 columns grid', () => {
      render(<Grid cols={12} data-testid="grid">Content</Grid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-4');
      expect(grid).toHaveClass('lg:grid-cols-12');
    });
  });

  describe('Gap Variants', () => {
    it.each([
      ['none', 'gap-0'],
      ['sm', 'gap-2'],
      ['md', 'gap-4'],
      ['lg', 'gap-6'],
      ['xl', 'gap-8'],
    ])('renders %s gap variant', (gap, expectedClass) => {
      render(
        <Grid gap={gap as any} data-testid="grid">
          Content
        </Grid>
      );
      expect(screen.getByTestId('grid')).toHaveClass(expectedClass);
    });

    it('applies no gap', () => {
      render(<Grid gap="none" data-testid="grid">Content</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('gap-0');
    });

    it('applies small gap', () => {
      render(<Grid gap="sm" data-testid="grid">Content</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('gap-2');
    });

    it('applies large gap', () => {
      render(<Grid gap="lg" data-testid="grid">Content</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('gap-6');
    });

    it('applies extra large gap', () => {
      render(<Grid gap="xl" data-testid="grid">Content</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('gap-8');
    });
  });

  describe('Responsive Behavior', () => {
    it('2-column grid is responsive', () => {
      render(<Grid cols={2} data-testid="grid">Content</Grid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
    });

    it('3-column grid has multiple breakpoints', () => {
      render(<Grid cols={3} data-testid="grid">Content</Grid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('4-column grid is responsive', () => {
      render(<Grid cols={4} data-testid="grid">Content</Grid>);
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Grid ref={ref}>Content</Grid>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports gridVariants function', () => {
      expect(typeof gridVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = gridVariants();
      expect(classes).toContain('grid');
    });

    it('generates correct column classes', () => {
      const cols2 = gridVariants({ cols: 2 });
      expect(cols2).toContain('sm:grid-cols-2');

      const cols4 = gridVariants({ cols: 4 });
      expect(cols4).toContain('lg:grid-cols-4');
    });

    it('generates correct gap classes', () => {
      const gapSm = gridVariants({ gap: 'sm' });
      expect(gapSm).toContain('gap-2');

      const gapLg = gridVariants({ gap: 'lg' });
      expect(gapLg).toContain('gap-6');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Grid className="bg-gray-50" data-testid="grid">
          Content
        </Grid>
      );
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('bg-gray-50');
      expect(grid).toHaveClass('grid');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <Grid data-testid="grid" data-layout="product-grid">
          Content
        </Grid>
      );
      expect(screen.getByTestId('grid')).toHaveAttribute('data-layout', 'product-grid');
    });

    it('supports aria attributes', () => {
      render(
        <Grid aria-label="Product grid" data-testid="grid">
          Content
        </Grid>
      );
      expect(screen.getByTestId('grid')).toHaveAttribute('aria-label', 'Product grid');
    });

    it('supports id attribute', () => {
      render(<Grid id="product-grid">Content</Grid>);
      expect(document.getElementById('product-grid')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('renders product grid', () => {
      render(
        <Grid cols={3} gap="lg">
          <div>Product 1</div>
          <div>Product 2</div>
          <div>Product 3</div>
        </Grid>
      );
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Product 3')).toBeInTheDocument();
    });

    it('renders image gallery', () => {
      render(
        <Grid cols={4} gap="sm">
          <img src="/1.jpg" alt="Image 1" />
          <img src="/2.jpg" alt="Image 2" />
          <img src="/3.jpg" alt="Image 3" />
          <img src="/4.jpg" alt="Image 4" />
        </Grid>
      );
      expect(screen.getByAltText('Image 1')).toBeInTheDocument();
      expect(screen.getByAltText('Image 4')).toBeInTheDocument();
    });

    it('renders feature grid without gaps', () => {
      render(
        <Grid cols={2} gap="none" data-testid="grid">
          <div>Feature 1</div>
          <div>Feature 2</div>
        </Grid>
      );
      expect(screen.getByTestId('grid')).toHaveClass('gap-0');
    });
  });

  describe('Multiple Items', () => {
    it('renders multiple grid items', () => {
      render(
        <Grid cols={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>Item {i}</div>
          ))}
        </Grid>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 6')).toBeInTheDocument();
    });
  });
});
