import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const sidebarNavItemVariants = cva(
  'group flex min-h-9 w-full min-w-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
  {
    variants: {
      active: {
        true: 'bg-neutral-950 text-white shadow-sm dark:bg-neutral-50 dark:text-neutral-950',
        false: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface SidebarNavProps
  extends React.HTMLAttributes<HTMLElement> {}

const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn('flex min-w-0 flex-1 flex-col gap-5 px-3 py-4', className)}
      {...props}
    />
  )
);
SidebarNav.displayName = 'SidebarNav';

const SidebarNavSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('min-w-0 space-y-1', className)} {...props} />
));
SidebarNavSection.displayName = 'SidebarNavSection';

const SidebarNavSectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500',
      className
    )}
    {...props}
  />
));
SidebarNavSectionTitle.displayName = 'SidebarNavSectionTitle';

const SidebarNavList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('space-y-1', className)} {...props} />
));
SidebarNavList.displayName = 'SidebarNavList';

export interface SidebarNavItemProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>,
    VariantProps<typeof sidebarNavItemVariants> {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

const SidebarNavItem = React.forwardRef<HTMLAnchorElement, SidebarNavItemProps>(
  ({ className, active, icon, badge, children, ...props }, ref) => (
    <li>
      <a
        ref={ref}
        aria-current={active ? 'page' : undefined}
        className={cn(sidebarNavItemVariants({ active }), className)}
        {...props}
      >
        {icon && (
          <span
            aria-hidden="true"
            className="flex size-4 shrink-0 items-center justify-center text-current"
          >
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {badge && (
          <span className="ml-auto shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 group-aria-[current=page]:bg-white/15 group-aria-[current=page]:text-white dark:bg-neutral-900 dark:text-neutral-300 dark:group-aria-[current=page]:bg-neutral-950/15 dark:group-aria-[current=page]:text-neutral-950">
            {badge}
          </span>
        )}
      </a>
    </li>
  )
);
SidebarNavItem.displayName = 'SidebarNavItem';

const SidebarNavFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-auto border-t border-neutral-200 p-3 dark:border-neutral-800', className)}
    {...props}
  />
));
SidebarNavFooter.displayName = 'SidebarNavFooter';

export {
  SidebarNav,
  SidebarNavSection,
  SidebarNavSectionTitle,
  SidebarNavList,
  SidebarNavItem,
  SidebarNavFooter,
  sidebarNavItemVariants,
};
