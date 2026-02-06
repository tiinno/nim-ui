import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Spacer component for flexible spacing
 *
 * @example
 * // Fixed spacer
 * <Spacer size="md" />
 *
 * @example
 * // Flex spacer (pushes siblings apart)
 * <Flex>
 *   <div>Left</div>
 *   <Spacer flex />
 *   <div>Right</div>
 * </Flex>
 */

const spacerVariants = cva(
  '',
  {
    variants: {
      size: {
        xs: 'h-1 w-1',
        sm: 'h-2 w-2',
        md: 'h-4 w-4',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-12 w-12',
      },
      flex: {
        true: 'flex-1',
        false: '',
      },
    },
    defaultVariants: {
      flex: false,
    },
  }
);

export interface SpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size, flex, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(spacerVariants({ size, flex }), className)}
      {...props}
    />
  )
);
Spacer.displayName = 'Spacer';

export { Spacer, spacerVariants };
