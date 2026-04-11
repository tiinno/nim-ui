import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../lib/utils';

/**
 * Combobox component: a searchable, filterable dropdown input.
 * Built on cmdk and Radix Popover.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [value, setValue] = useState('');
 *
 * <Combobox open={open} onOpenChange={setOpen}>
 *   <ComboboxTrigger>
 *     {value || 'Select a fruit...'}
 *   </ComboboxTrigger>
 *   <ComboboxContent>
 *     <ComboboxInput placeholder="Search fruits..." />
 *     <ComboboxList>
 *       <ComboboxEmpty>No fruits found.</ComboboxEmpty>
 *       <ComboboxGroup heading="Fruits">
 *         <ComboboxItem value="apple" onSelect={setValue}>Apple</ComboboxItem>
 *         <ComboboxItem value="banana" onSelect={setValue}>Banana</ComboboxItem>
 *       </ComboboxGroup>
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 * ```
 */

// ---------------------------------------------------------------------------
// Combobox root — wraps Popover for open state management
// ---------------------------------------------------------------------------

const Combobox = PopoverPrimitive.Root;

// ---------------------------------------------------------------------------
// ComboboxTrigger
// ---------------------------------------------------------------------------

export type ComboboxTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Trigger
>;

const ComboboxTrigger = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Trigger>,
  ComboboxTriggerProps
>(({ className, children, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    role="combobox"
    className={cn(
      'flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors duration-fast',
      'hover:bg-neutral-50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
      className
    )}
    {...props}
  >
    {children}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-2 shrink-0 opacity-50"
      aria-hidden="true"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  </PopoverPrimitive.Trigger>
));
ComboboxTrigger.displayName = 'ComboboxTrigger';

// ---------------------------------------------------------------------------
// ComboboxContent
// ---------------------------------------------------------------------------

export interface ComboboxContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  /** Width strategy. @default 'trigger' */
  width?: 'trigger' | 'auto';
}

const ComboboxContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  ComboboxContentProps
>(
  (
    { className, children, width = 'trigger', sideOffset = 4, ...props },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-900 shadow-md data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
          width === 'trigger' && 'w-[var(--radix-popover-trigger-width)]',
          className
        )}
        {...props}
      >
        <CommandPrimitive
          className="flex flex-col overflow-hidden rounded-md bg-transparent text-neutral-900 dark:text-neutral-100"
        >
          {children}
        </CommandPrimitive>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
);
ComboboxContent.displayName = 'ComboboxContent';

// ---------------------------------------------------------------------------
// ComboboxInput
// ---------------------------------------------------------------------------

export type ComboboxInputProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
>;

const ComboboxInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  ComboboxInputProps
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center border-b border-neutral-200 px-3 dark:border-neutral-700"
    cmdk-input-wrapper=""
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2 shrink-0 opacity-50"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-neutral-400',
        className
      )}
      {...props}
    />
  </div>
));
ComboboxInput.displayName = 'ComboboxInput';

// ---------------------------------------------------------------------------
// ComboboxList
// ---------------------------------------------------------------------------

export type ComboboxListProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
>;

const ComboboxList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  ComboboxListProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));
ComboboxList.displayName = 'ComboboxList';

// ---------------------------------------------------------------------------
// ComboboxEmpty
// ---------------------------------------------------------------------------

export type ComboboxEmptyProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;

const ComboboxEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  ComboboxEmptyProps
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400"
    {...props}
  />
));
ComboboxEmpty.displayName = 'ComboboxEmpty';

// ---------------------------------------------------------------------------
// ComboboxGroup
// ---------------------------------------------------------------------------

export type ComboboxGroupProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;

const ComboboxGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  ComboboxGroupProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-neutral-900 dark:text-neutral-100 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500 dark:[&_[cmdk-group-heading]]:text-neutral-400',
      className
    )}
    {...props}
  />
));
ComboboxGroup.displayName = 'ComboboxGroup';

// ---------------------------------------------------------------------------
// ComboboxItem
// ---------------------------------------------------------------------------

export type ComboboxItemProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
>;

const ComboboxItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  ComboboxItemProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors duration-fast',
      'data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-700',
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className
    )}
    {...props}
  />
));
ComboboxItem.displayName = 'ComboboxItem';

// ---------------------------------------------------------------------------
// ComboboxSeparator
// ---------------------------------------------------------------------------

export type ComboboxSeparatorProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;

const ComboboxSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  ComboboxSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn(
      '-mx-1 h-px bg-neutral-200 dark:bg-neutral-700',
      className
    )}
    {...props}
  />
));
ComboboxSeparator.displayName = 'ComboboxSeparator';

export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
};
