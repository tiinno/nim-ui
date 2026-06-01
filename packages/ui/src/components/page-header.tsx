import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * PageHeader component for admin and backoffice page titles.
 *
 * @example
 * <PageHeader>
 *   <PageHeaderMeta>Updated 2 minutes ago</PageHeaderMeta>
 *   <PageHeaderTitle>Orders</PageHeaderTitle>
 *   <PageHeaderDescription>
 *     Review exceptions, fulfillment status, and risk signals.
 *   </PageHeaderDescription>
 *   <PageHeaderActions>
 *     <Button>Export</Button>
 *   </PageHeaderActions>
 * </PageHeader>
 */

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLElement> {}

const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'flex flex-col gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
      {...props}
    />
  )
);
PageHeader.displayName = 'PageHeader';

const PageHeaderMeta = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400',
      className
    )}
    {...props}
  />
));
PageHeaderMeta.displayName = 'PageHeaderMeta';

const PageHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-2xl font-semibold tracking-normal text-neutral-950 dark:text-neutral-50',
      className
    )}
    {...props}
  />
));
PageHeaderTitle.displayName = 'PageHeaderTitle';

const PageHeaderDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('max-w-2xl text-sm text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
PageHeaderDescription.displayName = 'PageHeaderDescription';

const PageHeaderActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn('flex flex-wrap items-center gap-2 sm:justify-end', className)}
    {...props}
  />
));
PageHeaderActions.displayName = 'PageHeaderActions';

export {
  PageHeader,
  PageHeaderMeta,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
};
