import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * CartItem component for displaying items in a shopping cart
 *
 * @example
 * // Basic cart item
 * <CartItem
 *   image="/product.jpg"
 *   title="Premium Headphones"
 *   price="$199.99"
 *   quantity={1}
 *   onRemove={() => console.log('Remove item')}
 * />
 *
 * @example
 * // Cart item with quantity control
 * <CartItem
 *   image="/laptop.jpg"
 *   title="MacBook Pro"
 *   price="$1,999"
 *   quantity={2}
 *   onQuantityChange={(qty) => console.log('New quantity:', qty)}
 *   onRemove={() => console.log('Remove item')}
 * />
 *
 * @example
 * // Cart item with variant
 * <CartItem
 *   image="/shirt.jpg"
 *   title="Cotton T-Shirt"
 *   price="$29.99"
 *   quantity={3}
 *   variant="Size: L, Color: Blue"
 *   onRemove={() => console.log('Remove item')}
 * />
 */

const cartItemVariants = cva(
  'flex gap-4 p-4 border-b bg-white dark:bg-neutral-900 dark:border-neutral-700',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface CartItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cartItemVariants> {
  image: string;
  title: string;
  price: string | number;
  quantity: number;
  variant?: string;
  imageAlt?: string;
  onRemove?: () => void;
  onQuantityChange?: (quantity: number) => void;
}

const CartItem = React.forwardRef<HTMLDivElement, CartItemProps>(
  ({
    className,
    image,
    title,
    price,
    quantity,
    variant,
    imageAlt,
    onRemove,
    onQuantityChange,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(cartItemVariants(), className)}
      {...props}
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
        <img
          src={image}
          alt={imageAlt || title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              {title}
            </h4>
            {variant && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {variant}
              </p>
            )}
          </div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            {price}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Qty: {quantity}
            </span>
            {onQuantityChange && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="h-6 w-6 cursor-pointer rounded-md border border-neutral-300 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="h-6 w-6 cursor-pointer rounded-md border border-neutral-300 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="cursor-pointer text-sm text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
);
CartItem.displayName = 'CartItem';

export { CartItem, cartItemVariants };
