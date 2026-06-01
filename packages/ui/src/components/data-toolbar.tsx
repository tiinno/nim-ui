import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * DataToolbar component for table and list controls in admin screens.
 *
 * @example
 * <DataToolbar aria-label="Order table controls">
 *   <DataToolbarSearch>
 *     <Input aria-label="Search orders" />
 *   </DataToolbarSearch>
 *   <DataToolbarFilters aria-label="Order filters">
 *     <Button variant="outline">Open only</Button>
 *   </DataToolbarFilters>
 *   <DataToolbarActions aria-label="Order actions">
 *     <Button>Export</Button>
 *   </DataToolbarActions>
 * </DataToolbar>
 */

export interface DataToolbarProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const DataToolbar = React.forwardRef<HTMLDivElement, DataToolbarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="toolbar"
      className={cn(
        'flex flex-col gap-3 border-b border-neutral-200 pb-4 dark:border-neutral-800 lg:flex-row lg:items-center lg:justify-between',
        className
      )}
      {...props}
    />
  )
);
DataToolbar.displayName = 'DataToolbar';

const DataToolbarSearch = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex min-w-0 flex-1 items-center gap-2', className)}
    {...props}
  />
));
DataToolbarSearch.displayName = 'DataToolbarSearch';

const DataToolbarFilters = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn('flex flex-wrap items-center gap-2', className)}
    {...props}
  />
));
DataToolbarFilters.displayName = 'DataToolbarFilters';

const DataToolbarActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn('flex flex-wrap items-center gap-2 lg:justify-end', className)}
    {...props}
  />
));
DataToolbarActions.displayName = 'DataToolbarActions';

const DataToolbarMeta = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
DataToolbarMeta.displayName = 'DataToolbarMeta';

export {
  DataToolbar,
  DataToolbarSearch,
  DataToolbarFilters,
  DataToolbarActions,
  DataToolbarMeta,
};
