import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const progressIndicatorVariants = cva(
  'h-full rounded-full transition-all duration-slow ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 dark:bg-primary-500',
        success: 'bg-success-600 dark:bg-success-500',
        warning: 'bg-warning-500 dark:bg-warning-400',
        danger: 'bg-error-600 dark:bg-error-500',
        info: 'bg-info-600 dark:bg-info-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant, size, showLabel, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(progressVariants({ size }), className)}
        {...props}
      >
        <div
          className={cn(progressIndicatorVariants({ variant }))}
          style={{ width: `${percentage}%` }}
        />
        {showLabel && size === 'lg' && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-neutral-900 dark:text-neutral-100">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress, progressVariants, progressIndicatorVariants };
