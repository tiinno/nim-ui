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

/*
 * The root transitions its shadow and NOTHING else, and carries no
 * reduced-motion counterpart as a consequence (NIMUI-48).
 *
 * It used to declare a hand-written list naming `transform` as well. No utility
 * on this element has ever set a transform-family property — the only thing that
 * changes on hover here is the shadow — so that entry was inert from the day it
 * was written, and it made the element read as a moving one to every reader and
 * to the reduced-motion guard. With it gone the site is honestly non-motion, and
 * `box-shadow` is a depth cue rather than a vestibular trigger, so it gets the
 * same treatment as the kit's ~55 colour transitions: no counterpart, because
 * suppressing a crossfade buys no accessibility. The image's own zoom is the real
 * movement on this component and keeps its counterpart, below.
 */
const productCardVariants = cva(
  'overflow-hidden rounded-md border border-neutral-200 bg-white shadow-soft transition-shadow duration-(--duration-fast) ease-out hover:shadow-panel dark:border-neutral-800 dark:bg-neutral-950',
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
          className="h-full w-full object-cover transition-transform motion-reduce:transition-none duration-(--duration-normal) hover:scale-105"
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
