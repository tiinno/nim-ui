import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Popover component built on Radix UI Popover primitive.
 * Displays rich content in a floating panel when clicking on a trigger element.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger>Click me</PopoverTrigger>
 *   <PopoverContent>Popover content here</PopoverContent>
 * </Popover>
 * ```
 *
 * @example
 * ```tsx
 * // With arrow and outline variant
 * <Popover>
 *   <PopoverTrigger>Click me</PopoverTrigger>
 *   <PopoverContent variant="outline" showArrow>
 *     <p>Rich content with close button</p>
 *     <PopoverClose>Close</PopoverClose>
 *   </PopoverContent>
 * </Popover>
 * ```
 */

// ---------------------------------------------------------------------------
// PopoverProvider (optional)
// ---------------------------------------------------------------------------

export interface PopoverProviderProps {
  children: React.ReactNode;
}

/**
 * Optional context wrapper for managing multiple popovers.
 * Not required for single popover usage — simply renders children directly.
 */
const PopoverProvider: React.FC<PopoverProviderProps> = ({ children }) => (
  <>{children}</>
);
PopoverProvider.displayName = 'PopoverProvider';

// ---------------------------------------------------------------------------
// Popover (Root)
// ---------------------------------------------------------------------------

export interface PopoverProps {
  children: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled default open state. */
  defaultOpen?: boolean;
  /** Callback when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** When true, interaction with outside elements is disabled and only popover content is visible to screen readers. */
  modal?: boolean;
}

const Popover = PopoverPrimitive.Root;

// ---------------------------------------------------------------------------
// PopoverTrigger
// ---------------------------------------------------------------------------

export type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Trigger
>;

const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Trigger>,
  PopoverTriggerProps
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Trigger ref={ref} className={cn(className)} {...props} />
));
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

// ---------------------------------------------------------------------------
// popoverContentVariants (CVA)
// ---------------------------------------------------------------------------

const popoverContentVariants = cva(
  'z-50 w-72 rounded-md p-4 shadow-md outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
  {
    variants: {
      variant: {
        default:
          'border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
        outline:
          'border-2 border-neutral-300 bg-white text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ---------------------------------------------------------------------------
// PopoverContent
// ---------------------------------------------------------------------------

export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverContentVariants> {
  /** Show an arrow pointing to the trigger element. @default false */
  showArrow?: boolean;
  /** Distance in px between the popover and the trigger. @default 4 */
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      variant,
      showArrow = false,
      sideOffset = 4,
      side = 'bottom',
      children,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        className={cn(popoverContentVariants({ variant }), className)}
        {...props}
      >
        {children}
        {showArrow && <PopoverArrow />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// ---------------------------------------------------------------------------
// PopoverArrow
// ---------------------------------------------------------------------------

export interface PopoverArrowProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow> {
  /** Variant to match the parent PopoverContent color scheme. @default 'default' */
  variant?: 'default' | 'outline';
}

const PopoverArrow = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Arrow>,
  PopoverArrowProps
>(({ className, variant = 'default', ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn('fill-white dark:fill-neutral-800', className)}
    {...props}
  />
));
PopoverArrow.displayName = 'PopoverArrow';

// ---------------------------------------------------------------------------
// PopoverClose
// ---------------------------------------------------------------------------

export interface PopoverCloseProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close> {}

const PopoverClose = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Close>,
  PopoverCloseProps
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Close ref={ref} className={cn(className)} {...props} />
));
PopoverClose.displayName = 'PopoverClose';

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  PopoverProvider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverClose,
  popoverContentVariants,
};
