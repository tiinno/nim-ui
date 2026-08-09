import * as React from 'react';
import { cn } from '../lib/utils';
import { QuantitySelector } from './quantity-selector';

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

export interface CartItemProps extends React.HTMLAttributes<HTMLDivElement> {
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
  (
    {
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
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex w-full min-w-0 gap-4 border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950',
        className
      )}
      {...props}
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
        <img
          src={image}
          alt={imageAlt || title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex min-w-0 justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              {title}
            </h4>
            {variant && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {variant}
              </p>
            )}
          </div>
          <p className="shrink-0 font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {price}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {onQuantityChange ? (
            <QuantitySelector
              value={quantity}
              min={1}
              size="sm"
              onChange={onQuantityChange}
            />
          ) : (
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Qty: {quantity}
            </span>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 cursor-pointer text-sm text-error-600 transition-colors hover:text-error-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-error-400 dark:hover:text-error-300 dark:focus-visible:outline-primary-400"
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

/**
 * @deprecated `cartItemVariants` is kept for backwards compatibility.
 * Prefer using the `CartItem` component directly.
 */
const cartItemVariants = () =>
  'flex w-full min-w-0 gap-4 border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950';

export { CartItem, cartItemVariants };
