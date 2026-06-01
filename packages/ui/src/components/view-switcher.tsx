import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const viewSwitcherVariants = cva(
  'flex min-w-0 gap-1 overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900/60',
  {
    variants: {
      density: {
        comfortable: '',
        compact: '',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  }
);

const viewSwitcherItemVariants = cva(
  'group inline-flex min-w-max items-center gap-2 rounded-md text-left text-sm font-medium outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      selected: {
        true: 'bg-white text-neutral-950 shadow-sm dark:bg-neutral-950 dark:text-neutral-50',
        false:
          'text-neutral-600 hover:bg-white/70 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-950/60 dark:hover:text-neutral-50',
      },
      density: {
        comfortable: 'px-3 py-2',
        compact: 'px-2.5 py-1.5 text-xs',
      },
    },
    defaultVariants: {
      selected: false,
      density: 'comfortable',
    },
  }
);

const viewSwitcherCountVariants = cva(
  'inline-flex min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
  {
    variants: {
      selected: {
        true: 'bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950',
        false:
          'bg-neutral-200 text-neutral-700 group-hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-neutral-700',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

type ViewSwitcherDensity = NonNullable<
  VariantProps<typeof viewSwitcherVariants>['density']
>;

interface ViewSwitcherContextValue {
  density: ViewSwitcherDensity;
}

const ViewSwitcherContext = React.createContext<ViewSwitcherContextValue>({
  density: 'comfortable',
});

export interface ViewSwitcherProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof viewSwitcherVariants> {}

const ViewSwitcher = React.forwardRef<HTMLDivElement, ViewSwitcherProps>(
  ({ className, density = 'comfortable', ...props }, ref) => (
    <ViewSwitcherContext.Provider value={{ density: density ?? 'comfortable' }}>
      <div
        ref={ref}
        role="tablist"
        className={cn(viewSwitcherVariants({ density }), className)}
        {...props}
      />
    </ViewSwitcherContext.Provider>
  )
);
ViewSwitcher.displayName = 'ViewSwitcher';

export interface ViewSwitcherItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  value: string;
  selected?: boolean;
  count?: React.ReactNode;
  meta?: React.ReactNode;
  onSelect?: (value: string) => void;
}

const ViewSwitcherItem = React.forwardRef<HTMLButtonElement, ViewSwitcherItemProps>(
  (
    {
      className,
      value,
      selected = false,
      count,
      meta,
      onSelect,
      onClick,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { density } = React.useContext(ViewSwitcherContext);

    return (
      <button
        ref={ref}
        type={type}
        role="tab"
        aria-selected={selected}
        data-state={selected ? 'active' : 'inactive'}
        className={cn(viewSwitcherItemVariants({ selected, density }), className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            onSelect?.(value);
          }
        }}
        {...props}
      >
        <span className="min-w-0">
          <ViewSwitcherLabel>{children}</ViewSwitcherLabel>
          {meta && <ViewSwitcherMeta>{meta}</ViewSwitcherMeta>}
        </span>
        {count !== undefined && (
          <ViewSwitcherCount selected={selected}>{count}</ViewSwitcherCount>
        )}
      </button>
    );
  }
);
ViewSwitcherItem.displayName = 'ViewSwitcherItem';

const ViewSwitcherLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('block truncate leading-5', className)}
    {...props}
  />
));
ViewSwitcherLabel.displayName = 'ViewSwitcherLabel';

const ViewSwitcherMeta = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('mt-0.5 block truncate text-xs font-normal text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
ViewSwitcherMeta.displayName = 'ViewSwitcherMeta';

export interface ViewSwitcherCountProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof viewSwitcherCountVariants> {}

const ViewSwitcherCount = React.forwardRef<HTMLSpanElement, ViewSwitcherCountProps>(
  ({ className, selected, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(viewSwitcherCountVariants({ selected }), className)}
      {...props}
    />
  )
);
ViewSwitcherCount.displayName = 'ViewSwitcherCount';

const ViewSwitcherActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn('ml-auto flex shrink-0 items-center gap-1 pl-2', className)}
    {...props}
  />
));
ViewSwitcherActions.displayName = 'ViewSwitcherActions';

export {
  ViewSwitcher,
  ViewSwitcherItem,
  ViewSwitcherLabel,
  ViewSwitcherMeta,
  ViewSwitcherCount,
  ViewSwitcherActions,
  viewSwitcherVariants,
  viewSwitcherItemVariants,
  viewSwitcherCountVariants,
};
