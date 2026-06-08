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
        default: 'border border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300',
        secondary: 'border border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400',
        outline: 'border border-neutral-300 bg-transparent text-neutral-700 dark:border-neutral-700 dark:text-neutral-300',
        destructive: 'border border-error-200 bg-error-50 text-error-700 dark:border-error-900/60 dark:bg-error-950/40 dark:text-error-300',
        success: 'border border-success-200 bg-success-50 text-success-700 dark:border-success-900/60 dark:bg-success-950/40 dark:text-success-300',
        warning: 'border border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-900/60 dark:bg-warning-950/40 dark:text-warning-300',
        info: 'border border-info-200 bg-info-50 text-info-700 dark:border-info-900/60 dark:bg-info-950/40 dark:text-info-300',
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
