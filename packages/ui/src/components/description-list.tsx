import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * DescriptionList component for compact record metadata.
 *
 * @example
 * <DescriptionList aria-label="Order details">
 *   <DescriptionListItem>
 *     <DescriptionListTerm>Order ID</DescriptionListTerm>
 *     <DescriptionListDescription>ORD-4821</DescriptionListDescription>
 *   </DescriptionListItem>
 * </DescriptionList>
 */

const descriptionListVariants = cva(
  'divide-y divide-neutral-200 dark:divide-neutral-800',
  {
    variants: {
      variant: {
        default: '',
        inline: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const descriptionListItemVariants = cva('py-3', {
  variants: {
    variant: {
      default: 'space-y-1',
      inline: 'sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type DescriptionListVariant = NonNullable<
  VariantProps<typeof descriptionListVariants>['variant']
>;

const DescriptionListContext = React.createContext<DescriptionListVariant>('default');

export interface DescriptionListProps
  extends React.HTMLAttributes<HTMLDListElement>,
    VariantProps<typeof descriptionListVariants> {}

const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <DescriptionListContext.Provider value={variant ?? 'default'}>
      <dl
        ref={ref}
        className={cn(descriptionListVariants({ variant }), className)}
        {...props}
      />
    </DescriptionListContext.Provider>
  )
);
DescriptionList.displayName = 'DescriptionList';

export interface DescriptionListItemProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const DescriptionListItem = React.forwardRef<HTMLDivElement, DescriptionListItemProps>(
  ({ className, ...props }, ref) => {
    const variant = React.useContext(DescriptionListContext);

    return (
      <div
        ref={ref}
        className={cn(descriptionListItemVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
DescriptionListItem.displayName = 'DescriptionListItem';

const DescriptionListTerm = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <dt
    ref={ref}
    className={cn('text-sm font-medium text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
DescriptionListTerm.displayName = 'DescriptionListTerm';

const DescriptionListDescription = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <dd
    ref={ref}
    className={cn('text-sm text-neutral-950 dark:text-neutral-50 sm:col-span-2', className)}
    {...props}
  />
));
DescriptionListDescription.displayName = 'DescriptionListDescription';

const DescriptionListActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn('mt-2 flex flex-wrap items-center gap-2 sm:col-span-2 sm:col-start-2', className)}
    {...props}
  />
));
DescriptionListActions.displayName = 'DescriptionListActions';

export {
  DescriptionList,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListDescription,
  DescriptionListActions,
  descriptionListVariants,
};
