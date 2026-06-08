import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from '../lib/utils';

const CommandMenu = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex min-w-0 flex-col overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-950 shadow-panel dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50',
      className
    )}
    {...props}
  />
));
CommandMenu.displayName = 'CommandMenu';

export type CommandMenuInputProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
>;

const CommandMenuInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  CommandMenuInputProps
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center gap-2 border-b border-neutral-200 px-3 dark:border-neutral-800"
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
      className="shrink-0 text-neutral-500 dark:text-neutral-400"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-neutral-400',
        className
      )}
      {...props}
    />
  </div>
));
CommandMenuInput.displayName = 'CommandMenuInput';

export type CommandMenuListProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
>;

const CommandMenuList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  CommandMenuListProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[360px] overflow-y-auto overflow-x-hidden p-1', className)}
    {...props}
  />
));
CommandMenuList.displayName = 'CommandMenuList';

export type CommandMenuEmptyProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;

const CommandMenuEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  CommandMenuEmptyProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('py-8 text-center text-sm text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
CommandMenuEmpty.displayName = 'CommandMenuEmpty';

export type CommandMenuGroupProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;

const CommandMenuGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  CommandMenuGroupProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-neutral-950 dark:text-neutral-50 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-neutral-500 dark:[&_[cmdk-group-heading]]:text-neutral-500',
      className
    )}
    {...props}
  />
));
CommandMenuGroup.displayName = 'CommandMenuGroup';

export interface CommandMenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>, 'children'> {
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  shortcut?: React.ReactNode;
  children: React.ReactNode;
}

const CommandMenuItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  CommandMenuItemProps
>(({ className, icon, meta, badge, shortcut, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex min-h-12 cursor-pointer select-none items-center gap-3 rounded-md px-2.5 py-2 text-sm outline-none transition-colors duration-fast',
      'data-[selected=true]:bg-neutral-100 data-[selected=true]:text-neutral-950 dark:data-[selected=true]:bg-neutral-900 dark:data-[selected=true]:text-neutral-50',
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className
    )}
    {...props}
  >
    {icon && (
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
      >
        {icon}
      </span>
    )}
    <span className="min-w-0 flex-1">
      <span className="block truncate font-medium">{children}</span>
      {meta && (
        <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">
          {meta}
        </span>
      )}
    </span>
    {badge && (
      <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
        {badge}
      </span>
    )}
    {shortcut && <CommandMenuShortcut>{shortcut}</CommandMenuShortcut>}
  </CommandPrimitive.Item>
));
CommandMenuItem.displayName = 'CommandMenuItem';

export type CommandMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;

const CommandMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  CommandMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-neutral-200 dark:bg-neutral-800', className)}
    {...props}
  />
));
CommandMenuSeparator.displayName = 'CommandMenuSeparator';

const CommandMenuShortcut = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <kbd
    ref={ref}
    className={cn(
      'ml-auto hidden h-6 shrink-0 items-center rounded border border-neutral-200 bg-neutral-50 px-1.5 font-mono text-[11px] font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 sm:inline-flex',
      className
    )}
    {...props}
  />
));
CommandMenuShortcut.displayName = 'CommandMenuShortcut';

export {
  CommandMenu,
  CommandMenuInput,
  CommandMenuList,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuItem,
  CommandMenuSeparator,
  CommandMenuShortcut,
};
