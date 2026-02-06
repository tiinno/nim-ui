import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { CartItem, cartItemVariants } from './cart-item';

describe('CartItem', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Premium Headphones"
          price="$199.99"
          quantity={1}
        />
      );
      expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
      expect(screen.getByText('$199.99')).toBeInTheDocument();
      expect(screen.getByText('Qty: 1')).toBeInTheDocument();
    });

    it('renders image element', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Headphones"
          price="$99"
          quantity={1}
        />
      );
      const img = screen.getByAltText('Headphones');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/product.jpg');
    });

    it('applies cart item styles', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Test"
          price="$10"
          quantity={1}
          data-testid="cart-item"
        />
      );
      const item = screen.getByTestId('cart-item');
      expect(item).toHaveClass('flex');
      expect(item).toHaveClass('gap-4');
      expect(item).toHaveClass('p-4');
      expect(item).toHaveClass('border-b');
      expect(item).toHaveClass('bg-white');
    });
  });

  describe('Image', () => {
    it('renders image with src', () => {
      render(
        <CartItem
          image="/laptop.jpg"
          title="MacBook Pro"
          price="$1,999"
          quantity={1}
        />
      );
      const img = screen.getByAltText('MacBook Pro');
      expect(img).toHaveAttribute('src', '/laptop.jpg');
    });

    it('uses title as default alt text', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product Name"
          price="$50"
          quantity={1}
        />
      );
      expect(screen.getByAltText('Product Name')).toBeInTheDocument();
    });

    it('uses custom imageAlt when provided', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          imageAlt="Custom alt text"
        />
      );
      expect(screen.getByAltText('Custom alt text')).toBeInTheDocument();
      expect(screen.queryByAltText('Product')).not.toBeInTheDocument();
    });

    it('image container has fixed size', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          data-testid="cart-item"
        />
      );
      const item = screen.getByTestId('cart-item');
      const imageContainer = item.querySelector('div') as HTMLElement;
      expect(imageContainer).toHaveClass('h-20');
      expect(imageContainer).toHaveClass('w-20');
      expect(imageContainer).toHaveClass('flex-shrink-0');
      expect(imageContainer).toHaveClass('rounded-md');
    });
  });

  describe('Title', () => {
    it('renders title text', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Premium Headphones"
          price="$199"
          quantity={1}
        />
      );
      expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
    });

    it('applies title styling', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Title"
          price="$10"
          quantity={1}
        />
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('font-medium');
      expect(title).toHaveClass('text-neutral-900');
    });

    it('title has dark mode styles', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Title"
          price="$10"
          quantity={1}
        />
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Price', () => {
    it('renders string price', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$199.99"
          quantity={1}
        />
      );
      expect(screen.getByText('$199.99')).toBeInTheDocument();
    });

    it('renders numeric price', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price={99}
          quantity={1}
        />
      );
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('applies price styling', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
        />
      );
      const price = screen.getByText('$50');
      expect(price).toHaveClass('font-semibold');
      expect(price).toHaveClass('text-neutral-900');
    });

    it('price has dark mode styles', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
        />
      );
      const price = screen.getByText('$50');
      expect(price).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Quantity Display', () => {
    it('displays quantity', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={3}
        />
      );
      expect(screen.getByText('Qty: 3')).toBeInTheDocument();
    });

    it('displays quantity label styling', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
        />
      );
      const qtyLabel = screen.getByText('Qty: 1');
      expect(qtyLabel).toHaveClass('text-sm');
      expect(qtyLabel).toHaveClass('text-neutral-600');
    });
  });

  describe('Optional Variant', () => {
    it('does not render variant when not provided', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
        />
      );
      expect(screen.queryByText(/Size|Color/)).not.toBeInTheDocument();
    });

    it('renders variant when provided', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="T-Shirt"
          price="$29.99"
          quantity={1}
          variant="Size: L, Color: Blue"
        />
      );
      expect(screen.getByText('Size: L, Color: Blue')).toBeInTheDocument();
    });

    it('applies variant styling', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          variant="Size: M"
        />
      );
      const variant = screen.getByText('Size: M');
      expect(variant).toHaveClass('text-sm');
      expect(variant).toHaveClass('text-neutral-600');
    });

    it('variant has dark mode styles', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          variant="Size: L"
        />
      );
      const variant = screen.getByText('Size: L');
      expect(variant).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('Quantity Change Buttons', () => {
    it('does not render quantity buttons when onQuantityChange not provided', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
        />
      );
      expect(screen.queryByLabelText('Decrease quantity')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Increase quantity')).not.toBeInTheDocument();
    });

    it('renders quantity buttons when onQuantityChange provided', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          onQuantityChange={() => {}}
        />
      );
      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
    });

    it('calls onQuantityChange with decreased value', async () => {
      const user = userEvent.setup();
      const handleQuantityChange = vi.fn();
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={5}
          onQuantityChange={handleQuantityChange}
        />
      );

      await user.click(screen.getByLabelText('Decrease quantity'));

      expect(handleQuantityChange).toHaveBeenCalledWith(4);
    });

    it('calls onQuantityChange with increased value', async () => {
      const user = userEvent.setup();
      const handleQuantityChange = vi.fn();
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={5}
          onQuantityChange={handleQuantityChange}
        />
      );

      await user.click(screen.getByLabelText('Increase quantity'));

      expect(handleQuantityChange).toHaveBeenCalledWith(6);
    });

    it('does not decrease below 1', async () => {
      const user = userEvent.setup();
      const handleQuantityChange = vi.fn();
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          onQuantityChange={handleQuantityChange}
        />
      );

      await user.click(screen.getByLabelText('Decrease quantity'));

      expect(handleQuantityChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Remove Button', () => {
    it('does not render remove button when onRemove not provided', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
        />
      );
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });

    it('renders remove button when onRemove provided', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          onRemove={() => {}}
        />
      );
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('calls onRemove when clicked', async () => {
      const user = userEvent.setup();
      const handleRemove = vi.fn();
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          onRemove={handleRemove}
        />
      );

      await user.click(screen.getByText('Remove'));

      expect(handleRemove).toHaveBeenCalledOnce();
    });

    it('applies remove button styling', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          onRemove={() => {}}
        />
      );
      const removeBtn = screen.getByText('Remove');
      expect(removeBtn).toHaveClass('text-sm');
      expect(removeBtn).toHaveClass('text-red-600');
      expect(removeBtn).toHaveClass('hover:text-red-700');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode cart item styles', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          data-testid="cart-item"
        />
      );
      const item = screen.getByTestId('cart-item');
      expect(item).toHaveClass('dark:bg-neutral-900');
      expect(item).toHaveClass('dark:border-neutral-700');
    });

    it('image container has dark mode background', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          data-testid="cart-item"
        />
      );
      const item = screen.getByTestId('cart-item');
      const imageContainer = item.querySelector('div') as HTMLElement;
      expect(imageContainer).toHaveClass('dark:bg-neutral-800');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to cart item element', () => {
      const ref = { current: null };
      render(
        <CartItem
          ref={ref}
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
        />
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports cartItemVariants function', () => {
      expect(typeof cartItemVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = cartItemVariants();
      expect(classes).toContain('flex');
      expect(classes).toContain('gap-4');
      expect(classes).toContain('p-4');
      expect(classes).toContain('border-b');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          className="hover:bg-neutral-50"
          data-testid="cart-item"
        />
      );
      const item = screen.getByTestId('cart-item');
      expect(item).toHaveClass('hover:bg-neutral-50');
      expect(item).toHaveClass('flex');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          data-testid="cart-item"
          data-product-id="123"
        />
      );
      expect(screen.getByTestId('cart-item')).toHaveAttribute('data-product-id', '123');
    });

    it('supports aria attributes', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          aria-label="Cart item"
          data-testid="cart-item"
        />
      );
      expect(screen.getByTestId('cart-item')).toHaveAttribute('aria-label', 'Cart item');
    });

    it('supports id attribute', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          id="cart-item-1"
        />
      );
      expect(document.getElementById('cart-item-1')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('uses flex layout', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          data-testid="cart-item"
        />
      );
      const item = screen.getByTestId('cart-item');
      expect(item).toHaveClass('flex');
      expect(item).toHaveClass('gap-4');
    });

    it('content section uses flex-1', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          data-testid="cart-item"
        />
      );
      const item = screen.getByTestId('cart-item');
      const contentSection = item.children[1] as HTMLElement;
      expect(contentSection).toHaveClass('flex');
      expect(contentSection).toHaveClass('flex-1');
      expect(contentSection).toHaveClass('flex-col');
    });
  });

  describe('Complete Examples', () => {
    it('renders full cart item with all props', () => {
      render(
        <CartItem
          image="/shirt.jpg"
          title="Cotton T-Shirt"
          price="$29.99"
          quantity={3}
          variant="Size: L, Color: Blue"
          imageAlt="Blue cotton t-shirt"
          onQuantityChange={() => {}}
          onRemove={() => {}}
        />
      );

      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('Qty: 3')).toBeInTheDocument();
      expect(screen.getByText('Size: L, Color: Blue')).toBeInTheDocument();
      expect(screen.getByAltText('Blue cotton t-shirt')).toBeInTheDocument();
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('renders minimal cart item', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$10"
          quantity={1}
        />
      );

      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('$10')).toBeInTheDocument();
      expect(screen.getByText('Qty: 1')).toBeInTheDocument();
    });

    it('renders cart item with quantity control only', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Widget"
          price="$42"
          quantity={2}
          onQuantityChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long title', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="This is a very long product title that might wrap"
          price="$50"
          quantity={1}
        />
      );
      expect(screen.getByText('This is a very long product title that might wrap')).toBeInTheDocument();
    });

    it('handles large quantity values', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={999}
        />
      );
      expect(screen.getByText('Qty: 999')).toBeInTheDocument();
    });

    it('handles large price values', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Luxury Item"
          price="$1,999,999.99"
          quantity={1}
        />
      );
      expect(screen.getByText('$1,999,999.99')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('quantity buttons have aria-labels', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product"
          price="$50"
          quantity={1}
          onQuantityChange={() => {}}
        />
      );
      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
    });

    it('image has alt text', () => {
      render(
        <CartItem
          image="/product.jpg"
          title="Product Name"
          price="$50"
          quantity={1}
        />
      );
      expect(screen.getByAltText('Product Name')).toBeInTheDocument();
    });
  });
});
