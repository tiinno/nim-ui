import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * Fieldset component for grouped form sections
 *
 * Semantic <fieldset>/<legend> compound: assistive tech announces the group,
 * and the native disabled prop disables every descendant control at once —
 * useful while a mutation is in flight. Layout quirks of <fieldset> are
 * normalized (min-w-0 on the root, float/clear on legend and content).
 *
 * @example
 * <Fieldset>
 *   <FieldsetLegend>Shipping address</FieldsetLegend>
 *   <FieldsetDescription>Used for carrier labels and customs forms.</FieldsetDescription>
 *   <FieldsetContent>
 *     <FormField label="Street"><Input /></FormField>
 *   </FieldsetContent>
 *   <FieldsetFooter>
 *     <span>Saved 2 minutes ago</span>
 *     <Button size="sm">Save</Button>
 *   </FieldsetFooter>
 * </Fieldset>
 */

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {}

const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ className, ...props }, ref) => (
    <fieldset
      ref={ref}
      className={cn(
        'min-w-0 rounded-md border border-neutral-200 bg-white shadow-control disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-950',
        className
      )}
      {...props}
    />
  )
);
Fieldset.displayName = 'Fieldset';

export interface FieldsetLegendProps extends React.HTMLAttributes<HTMLLegendElement> {}

const FieldsetLegend = React.forwardRef<HTMLLegendElement, FieldsetLegendProps>(
  ({ className, ...props }, ref) => (
    <legend
      ref={ref}
      className={cn(
        'float-left w-full px-5 pt-4 text-sm font-semibold text-neutral-950 dark:text-neutral-50',
        className
      )}
      {...props}
    />
  )
);
FieldsetLegend.displayName = 'FieldsetLegend';

export interface FieldsetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldsetDescription = React.forwardRef<HTMLParagraphElement, FieldsetDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'clear-both px-5 pt-1 text-sm text-neutral-500 dark:text-neutral-400',
        className
      )}
      {...props}
    />
  )
);
FieldsetDescription.displayName = 'FieldsetDescription';

export interface FieldsetContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldsetContent = React.forwardRef<HTMLDivElement, FieldsetContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('clear-both space-y-4 px-5 py-4', className)} {...props} />
  )
);
FieldsetContent.displayName = 'FieldsetContent';

export interface FieldsetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldsetFooter = React.forwardRef<HTMLDivElement, FieldsetFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between gap-3 rounded-b-md border-t border-neutral-200 bg-neutral-50 px-5 py-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400',
        className
      )}
      {...props}
    />
  )
);
FieldsetFooter.displayName = 'FieldsetFooter';

export { Fieldset, FieldsetLegend, FieldsetDescription, FieldsetContent, FieldsetFooter };
