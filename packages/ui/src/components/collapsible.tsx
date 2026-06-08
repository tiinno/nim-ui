import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cn } from '../lib/utils';

/**
 * Collapsible component for a single expandable section.
 * Built on Radix UI Collapsible primitive.
 *
 * @example
 * ```tsx
 * <Collapsible>
 *   <CollapsibleTrigger>Show more</CollapsibleTrigger>
 *   <CollapsibleContent>Hidden content revealed on open.</CollapsibleContent>
 * </Collapsible>
 * ```
 *
 * @example
 * ```tsx
 * // Controlled
 * <Collapsible open={open} onOpenChange={setOpen}>
 *   <CollapsibleTrigger>Toggle FAQ</CollapsibleTrigger>
 *   <CollapsibleContent>
 *     <p>Answer goes here.</p>
 *   </CollapsibleContent>
 * </Collapsible>
 * ```
 */

const Collapsible = CollapsiblePrimitive.Root;

export type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>;

const CollapsibleTrigger = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  CollapsibleTriggerProps
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn(
      'inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-medium transition-colors duration-fast',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export type CollapsibleContentProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.CollapsibleContent
>;

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      'overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className
    )}
    {...props}
  >
    <div className="pt-2">{children}</div>
  </CollapsiblePrimitive.CollapsibleContent>
));
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
