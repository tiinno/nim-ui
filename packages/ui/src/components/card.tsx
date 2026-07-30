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

/*
 * Two things about the property list below are deliberate (NIMUI-48).
 *
 * 1. It names `translate`, not `transform`. The hoverable variant lifts the card
 *    with a negative vertical translate utility, and Tailwind v4 compiles that to
 *    the INDEPENDENT `translate` property — it stopped writing the combined
 *    `transform` one that v3 used. A list carried over from v3 therefore named a
 *    property nothing on this element ever set, so the browser had nothing to
 *    interpolate and the lift snapped, for everyone, for as long as the class
 *    existed. Tailwind's own named transform transition dodges this by
 *    enumerating all four transform-family properties; a hand-written list gets
 *    no such expansion. `src/transition-property.test.ts` now fails on this class
 *    of mistake — read the compiled rule in `dist/styles.css` before editing the
 *    list, do not reason from the utility name.
 *
 * 2. The reduced-motion counterpart is NARROWED rather than switching the whole
 *    list off. It re-declares only the colour and shadow properties, so the lift
 *    is suppressed while the depth crossfade still runs. That is what the kit's
 *    policy already says elsewhere: `src/motion-reduce.test.ts` classifies colour
 *    and `box-shadow` as non-motion and leaves them undamped at every other site,
 *    because a crossfade is not a vestibular trigger. Switching the whole list
 *    off here would have contradicted that — it was only ever doing so because
 *    the lift it was written to suppress never ran.
 */
const cardVariants = cva(
  'rounded-md transition-[box-shadow,translate,border-color,background-color] motion-reduce:transition-[box-shadow,border-color,background-color] duration-(--duration-fast) ease-out',
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
