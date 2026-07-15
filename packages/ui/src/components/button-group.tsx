import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * ButtonGroup component for attached button sets
 *
 * Wraps Button (or any button-shaped child) into a single segmented control:
 * inner radii collapse, adjacent borders overlap by 1px, and the focused
 * segment lifts above its neighbors so focus rings stay visible. Pairs best
 * with Button variant="outline".
 *
 * @example
 * <ButtonGroup aria-label="View density">
 *   <Button variant="outline" size="sm">Compact</Button>
 *   <Button variant="outline" size="sm">Comfortable</Button>
 * </ButtonGroup>
 *
 * @example
 * // Vertical stack
 * <ButtonGroup orientation="vertical" aria-label="Sort order">
 *   <Button variant="outline">Newest</Button>
 *   <Button variant="outline">Oldest</Button>
 * </ButtonGroup>
 */

const buttonGroupVariants = cva(
  'inline-flex shadow-control [&>*]:relative [&>*]:rounded-none [&>*]:shadow-none [&>*:focus-visible]:z-10',
  {
    variants: {
      orientation: {
        horizontal:
          'items-stretch [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:-ml-px',
        vertical:
          'flex-col items-stretch [&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md [&>*:not(:first-child)]:-mt-px',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation, ...props }, ref) => (
    <div
      role="group"
      className={cn(buttonGroupVariants({ orientation }), className)}
      ref={ref}
      {...props}
    />
  )
);
ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup, buttonGroupVariants };
