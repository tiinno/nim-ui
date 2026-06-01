import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * StatusPill component for operational states in admin tables.
 *
 * @example
 * <StatusPill status="processing">Picking</StatusPill>
 */

const statusPillVariants = cva(
  'inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none transition-colors',
  {
    variants: {
      status: {
        active: 'border-success-200 bg-success-50 text-success-700 dark:border-success-900/60 dark:bg-success-950/30 dark:text-success-300',
        pending: 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300',
        processing: 'border-info-200 bg-info-50 text-info-700 dark:border-info-900/60 dark:bg-info-950/30 dark:text-info-300',
        success: 'border-success-200 bg-success-50 text-success-700 dark:border-success-900/60 dark:bg-success-950/30 dark:text-success-300',
        warning: 'border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-900/60 dark:bg-warning-950/30 dark:text-warning-300',
        failed: 'border-error-200 bg-error-50 text-error-700 dark:border-error-900/60 dark:bg-error-950/30 dark:text-error-300',
        blocked: 'border-error-300 bg-error-100 text-error-800 dark:border-error-900 dark:bg-error-950/50 dark:text-error-200',
        archived: 'border-neutral-200 bg-neutral-100 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'md',
    },
  }
);

const statusDotVariants = cva('size-1.5 shrink-0 rounded-full', {
  variants: {
    status: {
      active: 'bg-success-500',
      pending: 'bg-neutral-400',
      processing: 'bg-info-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      failed: 'bg-error-500',
      blocked: 'bg-error-600',
      archived: 'bg-neutral-400',
    },
    pulse: {
      true: 'animate-pulse',
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {
  showDot?: boolean;
  pulse?: boolean;
}

const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, status, size, showDot = true, pulse, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(statusPillVariants({ status, size }), className)}
      {...props}
    >
      {showDot && (
        <span
          data-testid="status-pill-dot"
          aria-hidden="true"
          className={cn(statusDotVariants({ status, pulse }))}
        />
      )}
      <span className="truncate">{children}</span>
    </span>
  )
);
StatusPill.displayName = 'StatusPill';

export { StatusPill, statusPillVariants, statusDotVariants };
