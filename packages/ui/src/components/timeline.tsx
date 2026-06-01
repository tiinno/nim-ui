import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Timeline component for audit trails, order activity, and status history.
 *
 * @example
 * <Timeline aria-label="Order activity">
 *   <TimelineItem>
 *     <TimelineMarker variant="success" />
 *     <TimelineContent>
 *       <TimelineTime dateTime="2026-05-24T08:30:00Z">08:30</TimelineTime>
 *       <TimelineTitle>Order packed</TimelineTitle>
 *       <TimelineDescription>Warehouse team completed final scan.</TimelineDescription>
 *     </TimelineContent>
 *   </TimelineItem>
 * </Timeline>
 */

const timelineMarkerVariants = cva(
  'mt-1 flex size-3 shrink-0 items-center justify-center rounded-full border-2 border-white text-[0px] shadow-sm dark:border-neutral-950',
  {
    variants: {
      variant: {
        default: 'bg-neutral-400',
        success: 'bg-success-600',
        warning: 'bg-warning-500',
        destructive: 'bg-error-600',
        info: 'bg-info-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TimelineProps
  extends React.HTMLAttributes<HTMLUListElement> {}

const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('space-y-5', className)} {...props} />
  )
);
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('relative flex gap-3', className)} {...props} />
));
TimelineItem.displayName = 'TimelineItem';

export interface TimelineMarkerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof timelineMarkerVariants> {}

const TimelineMarker = React.forwardRef<HTMLSpanElement, TimelineMarkerProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(timelineMarkerVariants({ variant }), className)}
      {...props}
    />
  )
);
TimelineMarker.displayName = 'TimelineMarker';

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('min-w-0 space-y-1', className)} {...props} />
));
TimelineContent.displayName = 'TimelineContent';

const TimelineTime = React.forwardRef<
  HTMLTimeElement,
  React.TimeHTMLAttributes<HTMLTimeElement>
>(({ className, ...props }, ref) => (
  <time
    ref={ref}
    className={cn('block text-xs text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
TimelineTime.displayName = 'TimelineTime';

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-sm font-semibold text-neutral-950 dark:text-neutral-50', className)}
    {...props}
  />
));
TimelineTitle.displayName = 'TimelineTitle';

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
TimelineDescription.displayName = 'TimelineDescription';

export {
  Timeline,
  TimelineItem,
  TimelineMarker,
  TimelineContent,
  TimelineTime,
  TimelineTitle,
  TimelineDescription,
  timelineMarkerVariants,
};
