import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Dot component for minimal inline status indication
 *
 * A lighter-weight sibling of StatusPill for dense table cells and list rows
 * where a full pill is too loud. Status color map mirrors statusDotVariants
 * in status-pill.tsx — keep the two in sync.
 *
 * @example
 * // Dot with label
 * <Dot status="active">Online</Dot>
 *
 * @example
 * // Bare dot in a dense cell (label the status for screen readers)
 * <Dot status="failed" aria-label="Failed" />
 *
 * @example
 * // Live state
 * <Dot status="processing" pulse>Syncing</Dot>
 */

const dotVariants = cva('shrink-0 rounded-full', {
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
    size: {
      sm: 'size-1.5',
      md: 'size-2',
      lg: 'size-2.5',
    },
    pulse: {
      true: 'animate-pulse',
    },
  },
  defaultVariants: {
    status: 'pending',
    size: 'sm',
  },
});

export interface DotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof dotVariants> {}

const Dot = React.forwardRef<HTMLSpanElement, DotProps>(
  ({ className, status, size, pulse, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex min-w-0 items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300',
        className
      )}
      {...props}
    >
      <span
        data-testid="dot-indicator"
        aria-hidden="true"
        className={cn(dotVariants({ status, size, pulse }))}
      />
      {children != null && <span className="truncate">{children}</span>}
    </span>
  )
);
Dot.displayName = 'Dot';

export { Dot, dotVariants };
