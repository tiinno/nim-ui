import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Flex component for common flexbox layout patterns
 *
 * @example
 * // Space between
 * <Flex justify="between" align="center">
 *   <span>Left</span>
 *   <span>Right</span>
 * </Flex>
 *
 * @example
 * // Centered column
 * <Flex direction="column" justify="center" align="center">
 *   <h1>Title</h1>
 *   <p>Description</p>
 * </Flex>
 */

const flexVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        column: 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'column-reverse': 'flex-col-reverse',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline',
      },
      wrap: {
        true: 'flex-wrap',
        false: 'flex-nowrap',
      },
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
      },
    },
    defaultVariants: {
      direction: 'row',
      wrap: false,
    },
  }
);

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, justify, align, wrap, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(flexVariants({ direction, justify, align, wrap, gap }), className)}
      {...props}
    />
  )
);
Flex.displayName = 'Flex';

export { Flex, flexVariants };
