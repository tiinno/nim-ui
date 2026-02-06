import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { PriceTag, priceTagVariants } from './price-tag';

describe('PriceTag', () => {
  describe('Rendering', () => {
    it('renders with price', () => {
      render(<PriceTag price="$99.99" />);
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('renders with numeric price', () => {
      render(<PriceTag price={99} />);
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('applies base layout styles', () => {
      render(<PriceTag price="$99" data-testid="price" />);
      const priceTag = screen.getByTestId('price');
      expect(priceTag).toHaveClass('inline-flex');
      expect(priceTag).toHaveClass('items-center');
      expect(priceTag).toHaveClass('gap-2');
    });
  });

  describe('Price Styling', () => {
    it('applies bold styling to current price', () => {
      render(<PriceTag price="$99.99" />);
      const price = screen.getByText('$99.99');
      expect(price).toHaveClass('font-bold');
      expect(price).toHaveClass('text-neutral-900');
    });

    it('price has dark mode styles', () => {
      render(<PriceTag price="$99.99" />);
      const price = screen.getByText('$99.99');
      expect(price).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Sizes', () => {
    it('applies default (md) size', () => {
      render(<PriceTag price="$99" data-testid="price" />);
      const priceTag = screen.getByTestId('price');
      expect(priceTag).toHaveClass('text-base');
    });

    it.each([
      ['sm', 'text-sm'],
      ['md', 'text-base'],
      ['lg', 'text-xl'],
    ])('renders %s size with correct text class', (size, expectedClass) => {
      render(
        <PriceTag price="$99" size={size as any} data-testid="price" />
      );
      const priceTag = screen.getByTestId('price');
      expect(priceTag).toHaveClass(expectedClass);
    });

    it('applies small size', () => {
      render(<PriceTag price="$99" size="sm" data-testid="price" />);
      expect(screen.getByTestId('price')).toHaveClass('text-sm');
    });

    it('applies large size', () => {
      render(<PriceTag price="$99" size="lg" data-testid="price" />);
      expect(screen.getByTestId('price')).toHaveClass('text-xl');
    });
  });

  describe('Original Price', () => {
    it('does not render original price when not provided', () => {
      const { container } = render(<PriceTag price="$79.99" />);
      const strikethrough = container.querySelector('.line-through');
      expect(strikethrough).not.toBeInTheDocument();
    });

    it('renders original price when provided', () => {
      render(<PriceTag price="$79.99" originalPrice="$99.99" />);
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('applies line-through styling to original price', () => {
      render(<PriceTag price="$79.99" originalPrice="$99.99" />);
      const original = screen.getByText('$99.99');
      expect(original).toHaveClass('line-through');
      expect(original).toHaveClass('text-neutral-500');
      expect(original).toHaveClass('text-sm');
    });

    it('original price has dark mode styles', () => {
      render(<PriceTag price="$79.99" originalPrice="$99.99" />);
      const original = screen.getByText('$99.99');
      expect(original).toHaveClass('dark:text-neutral-400');
    });

    it('renders numeric original price', () => {
      render(<PriceTag price={79} originalPrice={99} />);
      expect(screen.getByText('99')).toBeInTheDocument();
    });
  });

  describe('Discount Percent', () => {
    it('does not render discount when not provided', () => {
      render(<PriceTag price="$79.99" />);
      expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
    });

    it('renders discount percent with "Save" prefix', () => {
      render(<PriceTag price="$79.99" discountPercent="20%" />);
      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });

    it('applies green styling to discount', () => {
      render(<PriceTag price="$79.99" discountPercent="20%" />);
      const discount = screen.getByText('Save 20%');
      expect(discount).toHaveClass('text-sm');
      expect(discount).toHaveClass('font-medium');
      expect(discount).toHaveClass('text-green-600');
    });

    it('discount has dark mode styles', () => {
      render(<PriceTag price="$79.99" discountPercent="20%" />);
      const discount = screen.getByText('Save 20%');
      expect(discount).toHaveClass('dark:text-green-400');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<PriceTag ref={ref} price="$99" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('ref can access DOM properties', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<PriceTag ref={ref} price="$99" />);
      expect(ref.current?.classList).toBeDefined();
    });
  });

  describe('CVA Variants', () => {
    it('exports priceTagVariants function', () => {
      expect(typeof priceTagVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = priceTagVariants();
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('gap-2');
    });

    it('generates correct size classes', () => {
      const smClasses = priceTagVariants({ size: 'sm' });
      expect(smClasses).toContain('text-sm');

      const lgClasses = priceTagVariants({ size: 'lg' });
      expect(lgClasses).toContain('text-xl');
    });

    it('generates default size class', () => {
      const classes = priceTagVariants();
      expect(classes).toContain('text-base');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <PriceTag
          price="$99"
          className="my-4"
          data-testid="price"
        />
      );
      const priceTag = screen.getByTestId('price');
      expect(priceTag).toHaveClass('my-4');
      expect(priceTag).toHaveClass('inline-flex');
    });

    it('allows additional styling', () => {
      render(
        <PriceTag
          price="$99"
          className="bg-yellow-50 px-2 py-1 rounded"
          data-testid="price"
        />
      );
      const priceTag = screen.getByTestId('price');
      expect(priceTag).toHaveClass('bg-yellow-50');
      expect(priceTag).toHaveClass('px-2');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <PriceTag
          price="$99"
          data-testid="price"
          data-currency="USD"
        />
      );
      expect(screen.getByTestId('price')).toHaveAttribute('data-currency', 'USD');
    });

    it('supports aria attributes', () => {
      render(
        <PriceTag
          price="$99.99"
          aria-label="Price: $99.99"
          data-testid="price"
        />
      );
      expect(screen.getByTestId('price')).toHaveAttribute(
        'aria-label',
        'Price: $99.99'
      );
    });

    it('supports id attribute', () => {
      render(<PriceTag price="$99" id="product-price" />);
      expect(document.getElementById('product-price')).toBeInTheDocument();
    });
  });

  describe('Complete Examples', () => {
    it('renders full price tag with all props', () => {
      render(
        <PriceTag
          price="$799"
          originalPrice="$999"
          discountPercent="20%"
          size="lg"
          data-testid="price"
        />
      );

      expect(screen.getByText('$799')).toBeInTheDocument();
      expect(screen.getByText('$999')).toBeInTheDocument();
      expect(screen.getByText('Save 20%')).toBeInTheDocument();
      expect(screen.getByTestId('price')).toHaveClass('text-xl');
    });

    it('renders simple price tag', () => {
      render(<PriceTag price="$29.99" />);
      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });

    it('renders sale price with original', () => {
      render(
        <PriceTag price="$49.99" originalPrice="$79.99" />
      );
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      const original = screen.getByText('$79.99');
      expect(original).toHaveClass('line-through');
    });
  });

  describe('Edge Cases', () => {
    it('handles price with no dollar sign', () => {
      render(<PriceTag price="99.99" />);
      expect(screen.getByText('99.99')).toBeInTheDocument();
    });

    it('handles zero price', () => {
      render(<PriceTag price={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles large prices', () => {
      render(<PriceTag price="$1,999,999" />);
      expect(screen.getByText('$1,999,999')).toBeInTheDocument();
    });

    it('renders discount without original price', () => {
      render(<PriceTag price="$50" discountPercent="10%" />);
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('Save 10%')).toBeInTheDocument();
    });

    it('renders original price without discount percent', () => {
      render(<PriceTag price="$50" originalPrice="$75" />);
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('$75')).toBeInTheDocument();
      expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
    });
  });
});
