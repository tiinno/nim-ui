import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Badge component for labels and status indicators
 *
 * @example
 * // Default badge
 * <Badge>New</Badge>
 *
 * @example
 * // Outline badge with size
 * <Badge variant="outline" size="lg">Featured</Badge>
 *
 * @example
 * // Destructive badge
 * <Badge variant="destructive">Deprecated</Badge>
 */

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-full transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white dark:bg-primary-700',
        secondary: 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100',
        outline: 'border border-neutral-300 bg-transparent text-neutral-900 dark:border-neutral-600 dark:text-neutral-100',
        destructive: 'bg-error-600 text-white dark:bg-error-700',
        success: 'bg-success-600 text-white dark:bg-success-700',
        warning: 'bg-warning-500 text-warning-950 dark:bg-warning-600 dark:text-warning-50',
        info: 'bg-info-600 text-white dark:bg-info-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
      animate: {
        true: 'animate-scale-in',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, animate, ...props }, ref) => (
    <div
      className={cn(badgeVariants({ variant, size, animate }), className)}
      ref={ref}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
