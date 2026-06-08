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
  'rounded-md transition-[box-shadow,transform,border-color,background-color] duration-fast ease-out',
  {
    variants: {
      variant: {
        default: 'border border-neutral-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-neutral-950',
        outlined: 'border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
        elevated: 'border border-neutral-100 bg-white shadow-panel dark:border-neutral-900 dark:bg-neutral-950',
        ghost: 'border border-transparent bg-transparent',
      },
      hoverable: {
        true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-panel',
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
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter, cardVariants };
