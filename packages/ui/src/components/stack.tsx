import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Stack component for vertical or horizontal stacking with consistent spacing
 *
 * @example
 * // Vertical stack
 * <Stack spacing="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 *
 * @example
 * // Horizontal stack
 * <Stack direction="horizontal" spacing="lg" align="center">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </Stack>
 */

const stackVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        vertical: 'flex-col',
        horizontal: 'flex-row',
      },
      spacing: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
    },
    defaultVariants: {
      direction: 'vertical',
      spacing: 'md',
      align: 'stretch',
    },
  }
);

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, spacing, align, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stackVariants({ direction, spacing, align }), className)}
      {...props}
    />
  )
);
Stack.displayName = 'Stack';

export { Stack, stackVariants };
