import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * EmptyState component for empty tables, filtered lists, and first-run screens.
 *
 * @example
 * <EmptyState aria-label="No orders">
 *   <EmptyStateTitle>No orders found</EmptyStateTitle>
 *   <EmptyStateDescription>
 *     Adjust filters or create the first order for this warehouse.
 *   </EmptyStateDescription>
 *   <EmptyStateActions>
 *     <Button>Create order</Button>
 *   </EmptyStateActions>
 * </EmptyState>
 */

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center dark:border-neutral-700 dark:bg-neutral-900/50',
        className
      )}
      {...props}
    />
  )
);
EmptyState.displayName = 'EmptyState';

const EmptyStateIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn(
      'flex size-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
      className
    )}
    {...props}
  />
));
EmptyStateIcon.displayName = 'EmptyStateIcon';

const EmptyStateTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-base font-semibold text-neutral-950 dark:text-neutral-50', className)}
    {...props}
  />
));
EmptyStateTitle.displayName = 'EmptyStateTitle';

const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('max-w-md text-sm text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
EmptyStateDescription.displayName = 'EmptyStateDescription';

const EmptyStateActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn('mt-1 flex flex-wrap items-center justify-center gap-2', className)}
    {...props}
  />
));
EmptyStateActions.displayName = 'EmptyStateActions';

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
};
