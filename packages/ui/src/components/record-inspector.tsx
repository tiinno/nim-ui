import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

// The root paints the panel and spends nothing on spacing itself: every gap a
// reader sees belongs to the header or to a section. It therefore has no
// density group of its own — it *provides* the value the parts spend, through
// the context below. It used to declare one whose two keys were both the empty
// string, which is how a prop on the most obvious component in the family could
// do nothing at all without erroring, warning, or looking any different.
const recordInspectorVariants = cva(
  'flex min-w-0 flex-col overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-950 shadow-soft dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50'
);

const recordInspectorHeaderVariants = cva(
  'flex min-w-0 flex-col gap-3 border-b border-neutral-200 dark:border-neutral-800 sm:flex-row sm:items-start sm:justify-between',
  {
    variants: {
      density: {
        comfortable: 'px-4 py-4 sm:px-5',
        compact: 'px-3 py-3 sm:px-4',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  }
);

// Same reasoning as the root: the body draws the dividing lines between
// sections and no spacing, so there is nothing for a density to change here.
// The sections it wraps carry the padding, and they read the root's value.
const recordInspectorBodyVariants = cva(
  'min-w-0 divide-y divide-neutral-200 dark:divide-neutral-800'
);

const recordInspectorSectionVariants = cva('min-w-0', {
  variants: {
    density: {
      comfortable: 'px-4 py-4 sm:px-5',
      compact: 'px-3 py-3 sm:px-4',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
});

const recordInspectorMetadataVariants = cva('grid min-w-0 gap-x-4 gap-y-3', {
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
    },
  },
  defaultVariants: {
    columns: 2,
  },
});

const recordInspectorFooterVariants = cva(
  'flex flex-col-reverse gap-2 border-t border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40 sm:flex-row sm:items-center sm:justify-end',
  {
    variants: {
      sticky: {
        true: 'sticky bottom-0',
        false: '',
      },
    },
    defaultVariants: {
      sticky: false,
    },
  }
);

/**
 * The one density the whole panel runs at.
 *
 * Derived from the header's class factory rather than written out again, so the
 * value a consumer may pass stays tied to the keys that are actually spent.
 */
type RecordInspectorDensity = NonNullable<
  VariantProps<typeof recordInspectorHeaderVariants>['density']
>;

interface RecordInspectorContextValue {
  density: RecordInspectorDensity;
}

/**
 * Defaulted to the same value the class factories declare, so a header or a
 * section rendered on its own — inside a drawer, or in a test — renders exactly
 * as it does inside an inspector instead of failing for want of a provider.
 */
const RecordInspectorContext = React.createContext<RecordInspectorContextValue>({
  density: 'comfortable',
});

export interface RecordInspectorProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Spacing for the whole panel. RecordInspectorHeader and
   * RecordInspectorSection inherit it, and either can pass its own to opt out
   * of the inherited value.
   */
  density?: RecordInspectorDensity;
}

const RecordInspector = React.forwardRef<HTMLElement, RecordInspectorProps>(
  ({ className, density = 'comfortable', ...props }, ref) => (
    <RecordInspectorContext.Provider value={{ density }}>
      <section
        ref={ref}
        className={cn(recordInspectorVariants(), className)}
        {...props}
      />
    </RecordInspectorContext.Provider>
  )
);
RecordInspector.displayName = 'RecordInspector';

export interface RecordInspectorHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof recordInspectorHeaderVariants> {}

const RecordInspectorHeader = React.forwardRef<
  HTMLDivElement,
  RecordInspectorHeaderProps
>(({ className, density, ...props }, ref) => {
  const context = React.useContext(RecordInspectorContext);

  return (
    <div
      ref={ref}
      className={cn(
        recordInspectorHeaderVariants({ density: density ?? context.density }),
        className
      )}
      {...props}
    />
  );
});
RecordInspectorHeader.displayName = 'RecordInspectorHeader';

const RecordInspectorHeading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('min-w-0 space-y-1', className)} {...props} />
));
RecordInspectorHeading.displayName = 'RecordInspectorHeading';

const RecordInspectorTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('truncate text-base font-semibold text-neutral-950 dark:text-neutral-50', className)}
    {...props}
  />
));
RecordInspectorTitle.displayName = 'RecordInspectorTitle';

const RecordInspectorDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
RecordInspectorDescription.displayName = 'RecordInspectorDescription';

const RecordInspectorStatus = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('shrink-0', className)} {...props} />
));
RecordInspectorStatus.displayName = 'RecordInspectorStatus';

const RecordInspectorActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn('flex flex-wrap items-center gap-2', className)}
    {...props}
  />
));
RecordInspectorActions.displayName = 'RecordInspectorActions';

export type RecordInspectorBodyProps = React.HTMLAttributes<HTMLDivElement>;

const RecordInspectorBody = React.forwardRef<HTMLDivElement, RecordInspectorBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(recordInspectorBodyVariants(), className)}
      {...props}
    />
  )
);
RecordInspectorBody.displayName = 'RecordInspectorBody';

export interface RecordInspectorSectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof recordInspectorSectionVariants> {}

const RecordInspectorSection = React.forwardRef<HTMLElement, RecordInspectorSectionProps>(
  ({ className, density, ...props }, ref) => {
    const context = React.useContext(RecordInspectorContext);

    return (
      <section
        ref={ref}
        className={cn(
          recordInspectorSectionVariants({ density: density ?? context.density }),
          className
        )}
        {...props}
      />
    );
  }
);
RecordInspectorSection.displayName = 'RecordInspectorSection';

const RecordInspectorSectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mb-3 min-w-0 space-y-1', className)} {...props} />
));
RecordInspectorSectionHeader.displayName = 'RecordInspectorSectionHeader';

const RecordInspectorSectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-sm font-semibold text-neutral-950 dark:text-neutral-50', className)}
    {...props}
  />
));
RecordInspectorSectionTitle.displayName = 'RecordInspectorSectionTitle';

const RecordInspectorSectionDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
RecordInspectorSectionDescription.displayName = 'RecordInspectorSectionDescription';

export interface RecordInspectorMetadataProps
  extends React.HTMLAttributes<HTMLDListElement>,
    VariantProps<typeof recordInspectorMetadataVariants> {}

const RecordInspectorMetadata = React.forwardRef<
  HTMLDListElement,
  RecordInspectorMetadataProps
>(({ className, columns, ...props }, ref) => (
  <dl
    ref={ref}
    className={cn(recordInspectorMetadataVariants({ columns }), className)}
    {...props}
  />
));
RecordInspectorMetadata.displayName = 'RecordInspectorMetadata';

const RecordInspectorMetadataItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('min-w-0 space-y-1', className)} {...props} />
));
RecordInspectorMetadataItem.displayName = 'RecordInspectorMetadataItem';

const RecordInspectorMetadataLabel = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <dt
    ref={ref}
    className={cn('text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
RecordInspectorMetadataLabel.displayName = 'RecordInspectorMetadataLabel';

const RecordInspectorMetadataValue = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <dd
    ref={ref}
    className={cn('truncate text-sm font-medium text-neutral-950 dark:text-neutral-50', className)}
    {...props}
  />
));
RecordInspectorMetadataValue.displayName = 'RecordInspectorMetadataValue';

export interface RecordInspectorFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof recordInspectorFooterVariants> {}

const RecordInspectorFooter = React.forwardRef<HTMLDivElement, RecordInspectorFooterProps>(
  ({ className, sticky, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(recordInspectorFooterVariants({ sticky }), className)}
      {...props}
    />
  )
);
RecordInspectorFooter.displayName = 'RecordInspectorFooter';

export {
  RecordInspector,
  RecordInspectorHeader,
  RecordInspectorHeading,
  RecordInspectorTitle,
  RecordInspectorDescription,
  RecordInspectorStatus,
  RecordInspectorActions,
  RecordInspectorBody,
  RecordInspectorSection,
  RecordInspectorSectionHeader,
  RecordInspectorSectionTitle,
  RecordInspectorSectionDescription,
  RecordInspectorMetadata,
  RecordInspectorMetadataItem,
  RecordInspectorMetadataLabel,
  RecordInspectorMetadataValue,
  RecordInspectorFooter,
  recordInspectorVariants,
  recordInspectorHeaderVariants,
  recordInspectorBodyVariants,
  recordInspectorSectionVariants,
  recordInspectorMetadataVariants,
  recordInspectorFooterVariants,
};
