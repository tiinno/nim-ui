import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Card component with header, content, and footer sections
 *
 * @example
 * // Basic card
 * <Card>
 *   <CardContent>Card content here</CardContent>
 * </Card>
 *
 * @example
 * // Full card with all sections
 * <Card>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <button>Action</button>
 *   </CardFooter>
 * </Card>
 *
 * @example
 * // Card with custom styling
 * <Card className="max-w-md">
 *   <CardHeader>Featured Content</CardHeader>
 *   <CardContent>This is a featured card</CardContent>
 * </Card>
 */

const cardVariants = cva(
  'rounded-lg transition-[box-shadow,transform,border-color] duration-fast ease-out',
  {
    variants: {
      variant: {
        default: 'border bg-white shadow-sm dark:bg-neutral-900 dark:border-neutral-700',
        outlined: 'border-2 border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900',
        elevated: 'border border-transparent bg-white shadow-lg dark:bg-neutral-900',
        ghost: 'border border-transparent bg-transparent',
      },
      hoverable: {
        true: 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hoverable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hoverable }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter, cardVariants };
