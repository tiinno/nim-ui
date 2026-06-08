import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * BulkActionBar component for selected-row actions in admin tables.
 *
 * @example
 * <BulkActionBar aria-label="Selected order actions">
 *   <BulkActionBarSelection count={3} label="orders selected" />
 *   <BulkActionBarActions aria-label="Bulk order actions">
 *     <Button size="sm">Assign</Button>
 *     <Button variant="outline" size="sm">Export</Button>
 *   </BulkActionBarActions>
 *   <BulkActionBarClear onClear={clearSelection} />
 * </BulkActionBar>
 */

const bulkActionBarVariants = cva(
  'sticky bottom-3 z-20 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 shadow-panel dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/30 sm:flex-row sm:items-center sm:justify-between',
  {
    variants: {
      tone: {
        default: '',
        elevated: 'border-neutral-300 dark:border-neutral-700',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  }
);

const bulkActionBarActionsVariants = cva(
  'flex flex-wrap items-center gap-2',
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'rounded-md border border-error-200 bg-error-50 p-1 dark:border-error-900/60 dark:bg-error-950/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BulkActionBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bulkActionBarVariants> {}

const BulkActionBar = React.forwardRef<HTMLDivElement, BulkActionBarProps>(
  ({ className, tone, ...props }, ref) => (
    <div
      ref={ref}
      role="toolbar"
      className={cn(bulkActionBarVariants({ tone }), className)}
      {...props}
    />
  )
);
BulkActionBar.displayName = 'BulkActionBar';

export interface BulkActionBarSelectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  label?: string;
}

const BulkActionBarSelection = React.forwardRef<
  HTMLDivElement,
  BulkActionBarSelectionProps
>(({ className, count, label = 'selected', ...props }, ref) => (
  <div
    ref={ref}
    aria-label={`${count} ${label}`}
    className={cn('flex min-w-0 items-center gap-2', className)}
    {...props}
  >
    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-primary-600 px-2 text-sm font-semibold text-white dark:bg-primary-700">
      {count}
    </span>
    <span className="truncate text-sm font-medium text-neutral-950 dark:text-neutral-50">
      {label}
    </span>
  </div>
));
BulkActionBarSelection.displayName = 'BulkActionBarSelection';

const BulkActionBarMeta = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
BulkActionBarMeta.displayName = 'BulkActionBarMeta';

export interface BulkActionBarActionsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bulkActionBarActionsVariants> {}

const BulkActionBarActions = React.forwardRef<
  HTMLDivElement,
  BulkActionBarActionsProps
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn(bulkActionBarActionsVariants({ variant }), className)}
    {...props}
  />
));
BulkActionBarActions.displayName = 'BulkActionBarActions';

export interface BulkActionBarClearProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onClear: React.MouseEventHandler<HTMLButtonElement>;
}

const BulkActionBarClear = React.forwardRef<
  HTMLButtonElement,
  BulkActionBarClearProps
>(({ className, onClear, children = 'Clear selection', type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
      className
    )}
    onClick={onClear}
    {...props}
  >
    {children}
  </button>
));
BulkActionBarClear.displayName = 'BulkActionBarClear';

export {
  BulkActionBar,
  BulkActionBarSelection,
  BulkActionBarMeta,
  BulkActionBarActions,
  BulkActionBarClear,
  bulkActionBarVariants,
};
