import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * ProductCard component for displaying product information
 *
 * @example
 * // Basic product card
 * <ProductCard
 *   image="/product.jpg"
 *   title="Premium Headphones"
 *   price="$199.99"
 * />
 *
 * @example
 * // Product card with description
 * <ProductCard
 *   image="/laptop.jpg"
 *   title="MacBook Pro"
 *   price="$1,999"
 *   description="Powerful laptop with M2 chip"
 * />
 *
 * @example
 * // Product card with custom action
 * <ProductCard
 *   image="/shirt.jpg"
 *   title="Cotton T-Shirt"
 *   price="$29.99"
 *   description="Comfortable everyday wear"
 *   action={<button>Add to Cart</button>}
 * />
 */

const productCardVariants = cva(
  'rounded-lg border bg-white overflow-hidden shadow-sm transition-[box-shadow,transform] duration-fast ease-out hover:shadow-md dark:bg-neutral-900 dark:border-neutral-700',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface ProductCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof productCardVariants> {
  image: string;
  title: string;
  price: string | number;
  description?: string;
  action?: React.ReactNode;
  imageAlt?: string;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ className, image, title, price, description, action, imageAlt, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(productCardVariants(), className)}
      {...props}
    >
      <div className="aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src={image}
          alt={imageAlt || title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {price}
          </p>
          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  )
);
ProductCard.displayName = 'ProductCard';

export { ProductCard, productCardVariants };
