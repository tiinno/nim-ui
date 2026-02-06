import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { ProductCard, productCardVariants } from './product-card';

describe('ProductCard', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Premium Headphones"
          price="$199.99"
        />
      );
      expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
      expect(screen.getByText('$199.99')).toBeInTheDocument();
    });

    it('renders image element', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Headphones"
          price="$99"
        />
      );
      const img = screen.getByAltText('Headphones');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/product.jpg');
    });

    it('applies card styles', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Test"
          price="$10"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('overflow-hidden');
      expect(card).toHaveClass('shadow-sm');
    });

    it('applies hover shadow transition', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Test"
          price="$10"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('transition-shadow');
      expect(card).toHaveClass('hover:shadow-md');
    });
  });

  describe('Image', () => {
    it('renders image with src', () => {
      render(
        <ProductCard
          image="/laptop.jpg"
          title="MacBook Pro"
          price="$1,999"
        />
      );
      const img = screen.getByAltText('MacBook Pro');
      expect(img).toHaveAttribute('src', '/laptop.jpg');
    });

    it('uses title as default alt text', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product Name"
          price="$50"
        />
      );
      expect(screen.getByAltText('Product Name')).toBeInTheDocument();
    });

    it('uses custom imageAlt when provided', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          imageAlt="Custom alt text"
        />
      );
      expect(screen.getByAltText('Custom alt text')).toBeInTheDocument();
      expect(screen.queryByAltText('Product')).not.toBeInTheDocument();
    });

    it('applies image styles', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
        />
      );
      const img = screen.getByAltText('Product');
      expect(img).toHaveClass('h-full');
      expect(img).toHaveClass('w-full');
      expect(img).toHaveClass('object-cover');
    });

    it('applies hover scale transition on image', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
        />
      );
      const img = screen.getByAltText('Product');
      expect(img).toHaveClass('transition-transform');
      expect(img).toHaveClass('hover:scale-105');
    });

    it('image container has aspect-square', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      const imageContainer = card.firstChild as HTMLElement;
      expect(imageContainer).toHaveClass('aspect-square');
      expect(imageContainer).toHaveClass('overflow-hidden');
    });
  });

  describe('Title', () => {
    it('renders title text', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Premium Headphones"
          price="$199"
        />
      );
      expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
    });

    it('applies title styling', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Title"
          price="$10"
        />
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('text-neutral-900');
      expect(title).toHaveClass('line-clamp-1');
    });

    it('title has dark mode styles', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Title"
          price="$10"
        />
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Price', () => {
    it('renders string price', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$199.99"
        />
      );
      expect(screen.getByText('$199.99')).toBeInTheDocument();
    });

    it('renders numeric price', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price={99}
        />
      );
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('applies price styling', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
        />
      );
      const price = screen.getByText('$50');
      expect(price).toHaveClass('text-xl');
      expect(price).toHaveClass('font-bold');
      expect(price).toHaveClass('text-neutral-900');
    });

    it('price has dark mode styles', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
        />
      );
      const price = screen.getByText('$50');
      expect(price).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Optional Description', () => {
    it('does not render description when not provided', () => {
      const { container } = render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
        />
      );
      const descriptions = container.querySelectorAll('[class*="line-clamp-2"]');
      expect(descriptions.length).toBe(0);
    });

    it('renders description when provided', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="MacBook Pro"
          price="$1,999"
          description="Powerful laptop with M2 chip"
        />
      );
      expect(screen.getByText('Powerful laptop with M2 chip')).toBeInTheDocument();
    });

    it('applies description styling', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          description="Some description"
        />
      );
      const description = screen.getByText('Some description');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-neutral-600');
      expect(description).toHaveClass('line-clamp-2');
    });

    it('description has dark mode styles', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          description="Description text"
        />
      );
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('Optional Action', () => {
    it('does not render action when not provided', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
        />
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          action={<button>Add to Cart</button>}
        />
      );
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('renders custom action element', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          action={<span data-testid="custom-action">Buy Now</span>}
        />
      );
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode card styles', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('dark:bg-neutral-900');
      expect(card).toHaveClass('dark:border-neutral-700');
    });

    it('image container has dark mode background', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      const imageContainer = card.firstChild as HTMLElement;
      expect(imageContainer).toHaveClass('dark:bg-neutral-800');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to card element', () => {
      const ref = { current: null };
      render(
        <ProductCard
          ref={ref}
          image="/product.jpg"
          title="Product"
          price="$50"
        />
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports productCardVariants function', () => {
      expect(typeof productCardVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = productCardVariants();
      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('border');
      expect(classes).toContain('overflow-hidden');
      expect(classes).toContain('shadow-sm');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          className="max-w-sm"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('max-w-sm');
      expect(card).toHaveClass('rounded-lg');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          data-testid="card"
          data-product-id="123"
        />
      );
      expect(screen.getByTestId('card')).toHaveAttribute('data-product-id', '123');
    });

    it('supports aria attributes', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          aria-label="Product card"
          data-testid="card"
        />
      );
      expect(screen.getByTestId('card')).toHaveAttribute('aria-label', 'Product card');
    });

    it('supports id attribute', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          id="product-card-1"
        />
      );
      expect(document.getElementById('product-card-1')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('content section has proper padding and spacing', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      const contentSection = card.children[1] as HTMLElement;
      expect(contentSection).toHaveClass('p-4');
      expect(contentSection).toHaveClass('space-y-2');
    });

    it('price and action are on same row', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          action={<button>Buy</button>}
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      const priceRow = card.querySelector('[class*="items-center"][class*="justify-between"]');
      expect(priceRow).toBeInTheDocument();
      expect(priceRow).toHaveClass('flex');
    });
  });

  describe('Complete Examples', () => {
    it('renders full product card with all props', () => {
      render(
        <ProductCard
          image="/shirt.jpg"
          title="Cotton T-Shirt"
          price="$29.99"
          description="Comfortable everyday wear"
          imageAlt="Blue cotton t-shirt"
          action={<button>Add to Cart</button>}
        />
      );

      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('Comfortable everyday wear')).toBeInTheDocument();
      expect(screen.getByAltText('Blue cotton t-shirt')).toBeInTheDocument();
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('renders minimal product card', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$10"
        />
      );

      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('$10')).toBeInTheDocument();
    });

    it('renders product card with numeric price', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Widget"
          price={42}
        />
      );
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long title (line-clamp-1)', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="This is a very long product title that should be clamped to one line"
          price="$50"
        />
      );
      const title = screen.getByText(
        'This is a very long product title that should be clamped to one line'
      );
      expect(title).toHaveClass('line-clamp-1');
    });

    it('handles very long description (line-clamp-2)', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Product"
          price="$50"
          description="This is a very long description that goes on and on and should be clamped to two lines maximum"
        />
      );
      const desc = screen.getByText(/This is a very long description/);
      expect(desc).toHaveClass('line-clamp-2');
    });

    it('handles large price values', () => {
      render(
        <ProductCard
          image="/product.jpg"
          title="Luxury Item"
          price="$1,999,999.99"
        />
      );
      expect(screen.getByText('$1,999,999.99')).toBeInTheDocument();
    });
  });
});
