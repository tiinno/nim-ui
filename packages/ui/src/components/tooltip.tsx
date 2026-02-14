import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Tooltip component built on Radix UI Tooltip primitive.
 * Displays informational text when hovering or focusing on an element.
 *
 * @example
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>Tooltip text</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 *
 * @example
 * ```tsx
 * // With arrow and light variant
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent variant="light" showArrow>
 *       Light tooltip with arrow
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */

// ---------------------------------------------------------------------------
// TooltipProvider
// ---------------------------------------------------------------------------

export interface TooltipProviderProps {
  children: React.ReactNode;
  /** Delay in ms before the tooltip opens. @default 300 */
  delayDuration?: number;
  /** Delay in ms before the next tooltip opens when one was recently visible. @default 300 */
  skipDelayDuration?: number;
  /** When true, hovering the tooltip content will not keep it open. */
  disableHoverableContent?: boolean;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({
  delayDuration = 300,
  skipDelayDuration = 300,
  ...props
}) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
);
TooltipProvider.displayName = 'TooltipProvider';

// ---------------------------------------------------------------------------
// Tooltip (Root)
// ---------------------------------------------------------------------------

export interface TooltipProps {
  children: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled default open state. */
  defaultOpen?: boolean;
  /** Callback when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Override the delay from the Provider for this tooltip. */
  delayDuration?: number;
}

const Tooltip = TooltipPrimitive.Root;

// ---------------------------------------------------------------------------
// TooltipTrigger
// ---------------------------------------------------------------------------

const TooltipTrigger = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Trigger ref={ref} className={cn(className)} {...props} />
));
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

// ---------------------------------------------------------------------------
// tooltipContentVariants (CVA)
// ---------------------------------------------------------------------------

const tooltipContentVariants = cva(
  'z-50 overflow-hidden rounded-md px-3 py-1.5 text-sm data-[state=delayed-open]:animate-fade-in data-[state=closed]:animate-fade-out',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900',
        light:
          'border border-neutral-200 bg-white text-neutral-900 shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ---------------------------------------------------------------------------
// TooltipContent
// ---------------------------------------------------------------------------

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {
  /** Show an arrow pointing to the trigger element. @default false */
  showArrow?: boolean;
  /** Distance in px between the tooltip and the trigger. @default 4 */
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      variant,
      showArrow = false,
      sideOffset = 4,
      side = 'top',
      children,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        className={cn(tooltipContentVariants({ variant }), className)}
        {...props}
      >
        {children}
        {showArrow && <TooltipArrow variant={variant ?? undefined} />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ---------------------------------------------------------------------------
// TooltipArrow
// ---------------------------------------------------------------------------

export interface TooltipArrowProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow> {
  /** Variant to match the parent TooltipContent color scheme. @default 'default' */
  variant?: 'default' | 'light';
}

const TooltipArrow = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Arrow>,
  TooltipArrowProps
>(({ className, variant = 'default', ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn(
      variant === 'default'
        ? 'fill-neutral-900 dark:fill-neutral-50'
        : 'fill-white dark:fill-neutral-800',
      className
    )}
    {...props}
  />
));
TooltipArrow.displayName = 'TooltipArrow';

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  tooltipContentVariants,
};
