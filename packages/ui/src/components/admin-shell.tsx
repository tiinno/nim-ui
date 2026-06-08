import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const adminShellVariants = cva(
  'min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50',
  {
    variants: {
      density: {
        comfortable: '[--admin-shell-sidebar:17rem] [--admin-shell-topbar:4rem]',
        compact: '[--admin-shell-sidebar:15rem] [--admin-shell-topbar:3.5rem]',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  }
);

export interface AdminShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof adminShellVariants> {}

const AdminShell = React.forwardRef<HTMLDivElement, AdminShellProps>(
  ({ className, density, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(adminShellVariants({ density }), className)}
      {...props}
    />
  )
);
AdminShell.displayName = 'AdminShell';

export interface AdminShellSidebarProps
  extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

const AdminShellSidebar = React.forwardRef<HTMLElement, AdminShellSidebarProps>(
  ({ className, sticky = true, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        'hidden w-[var(--admin-shell-sidebar)] shrink-0 border-r border-neutral-200 bg-white/95 shadow-[8px_0_30px_rgba(15,23,42,0.04)] dark:border-neutral-800 dark:bg-neutral-950/95 lg:flex lg:flex-col',
        sticky && 'lg:sticky lg:top-0 lg:h-screen',
        className
      )}
      {...props}
    />
  )
);
AdminShellSidebar.displayName = 'AdminShellSidebar';

const AdminShellBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('min-h-screen min-w-0 lg:flex', className)}
    {...props}
  />
));
AdminShellBody.displayName = 'AdminShellBody';

const AdminShellPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('min-w-0 flex-1', className)} {...props} />
));
AdminShellPanel.displayName = 'AdminShellPanel';

export interface AdminShellHeaderProps
  extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

const AdminShellHeader = React.forwardRef<HTMLElement, AdminShellHeaderProps>(
  ({ className, sticky = true, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'z-20 flex min-h-[var(--admin-shell-topbar)] items-center gap-3 border-b border-neutral-200 bg-white/88 px-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/88 sm:px-6',
        sticky && 'sticky top-0',
        className
      )}
      {...props}
    />
  )
);
AdminShellHeader.displayName = 'AdminShellHeader';

const AdminShellMain = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <main
    ref={ref}
    className={cn('min-w-0 px-4 py-5 sm:px-6 lg:px-8', className)}
    {...props}
  />
));
AdminShellMain.displayName = 'AdminShellMain';

export {
  AdminShell,
  AdminShellSidebar,
  AdminShellBody,
  AdminShellPanel,
  AdminShellHeader,
  AdminShellMain,
  adminShellVariants,
};
