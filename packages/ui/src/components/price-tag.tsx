import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * PriceTag component for displaying prices with optional discounts
 *
 * @example
 * // Basic price
 * <PriceTag price="$99.99" />
 *
 * @example
 * // Price with discount
 * <PriceTag price="$79.99" originalPrice="$99.99" />
 *
 * @example
 * // Large price with discount percentage
 * <PriceTag
 *   price="$799"
 *   originalPrice="$999"
 *   discountPercent="20%"
 *   size="lg"
 * />
 */

const priceTagVariants = cva(
  'inline-flex items-center gap-2',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface PriceTagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof priceTagVariants> {
  price: string | number;
  originalPrice?: string | number;
  discountPercent?: string;
}

const PriceTag = React.forwardRef<HTMLDivElement, PriceTagProps>(
  ({ className, price, originalPrice, discountPercent, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(priceTagVariants({ size }), className)}
      {...props}
    >
      <span className="font-bold text-neutral-900 dark:text-neutral-100">
        {price}
      </span>
      {originalPrice && (
        <span className="text-sm line-through text-neutral-500 dark:text-neutral-400">
          {originalPrice}
        </span>
      )}
      {discountPercent && (
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          Save {discountPercent}
        </span>
      )}
    </div>
  )
);
PriceTag.displayName = 'PriceTag';

export { PriceTag, priceTagVariants };
