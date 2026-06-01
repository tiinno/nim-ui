import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * FilterSummary component for active filter chips in admin tables.
 *
 * @example
 * <FilterSummary aria-label="Active order filters">
 *   <FilterSummaryList>
 *     <FilterSummaryItem label="Status" value="Open" onRemove={clearStatus} />
 *   </FilterSummaryList>
 *   <FilterSummaryClear onClear={clearAllFilters} />
 * </FilterSummary>
 */

export interface FilterSummaryProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const FilterSummary = React.forwardRef<HTMLDivElement, FilterSummaryProps>(
  ({ className, role = 'region', ...props }, ref) => (
    <div
      ref={ref}
      role={role}
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      {...props}
    />
  )
);
FilterSummary.displayName = 'FilterSummary';

export interface FilterSummaryListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  emptyText?: React.ReactNode;
}

const FilterSummaryList = React.forwardRef<HTMLDivElement, FilterSummaryListProps>(
  ({ className, children, emptyText = 'No active filters', ...props }, ref) => {
    const hasChildren = React.Children.count(children) > 0;

    return (
      <div
        ref={ref}
        className={cn('flex min-w-0 flex-1 flex-wrap items-center gap-2', className)}
        {...props}
      >
        {hasChildren ? (
          children
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{emptyText}</p>
        )}
      </div>
    );
  }
);
FilterSummaryList.displayName = 'FilterSummaryList';

export interface FilterSummaryItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  onRemove?: React.MouseEventHandler<HTMLButtonElement>;
  removeLabel?: string;
}

const toLabelText = (value: React.ReactNode) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return '';
};

const FilterSummaryItem = React.forwardRef<HTMLDivElement, FilterSummaryItemProps>(
  ({ className, label, value, onRemove, removeLabel, ...props }, ref) => {
    const fallbackRemoveLabel = [
      'Remove',
      toLabelText(label),
      'filter',
      toLabelText(value),
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700 shadow-sm shadow-neutral-950/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200',
          className
        )}
        {...props}
      >
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        <span className="min-w-0 truncate font-medium text-neutral-950 dark:text-neutral-50">
          {value}
        </span>
        {onRemove && (
          <button
            type="button"
            className="ml-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            aria-label={removeLabel ?? fallbackRemoveLabel}
            onClick={onRemove}
          >
            <svg
              className="size-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 3l6 6M9 3L3 9" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
FilterSummaryItem.displayName = 'FilterSummaryItem';

export interface FilterSummaryClearProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onClear: React.MouseEventHandler<HTMLButtonElement>;
}

const FilterSummaryClear = React.forwardRef<
  HTMLButtonElement,
  FilterSummaryClearProps
>(({ className, onClear, children = 'Clear all filters', type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md px-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
      className
    )}
    onClick={onClear}
    {...props}
  >
    {children}
  </button>
));
FilterSummaryClear.displayName = 'FilterSummaryClear';

export {
  FilterSummary,
  FilterSummaryList,
  FilterSummaryItem,
  FilterSummaryClear,
};
