import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const metricCardVariants = cva(
  'min-w-0 overflow-hidden rounded-md border bg-white text-neutral-950 shadow-soft dark:bg-neutral-950 dark:text-neutral-50',
  {
    variants: {
      tone: {
        neutral: 'border-neutral-200 dark:border-neutral-800',
        success: 'border-success-200 dark:border-success-900/60',
        warning: 'border-warning-200 dark:border-warning-900/60',
        danger: 'border-error-200 dark:border-error-900/60',
        info: 'border-info-200 dark:border-info-900/60',
      },
      density: {
        comfortable: 'p-4 sm:p-5',
        compact: 'p-3 sm:p-4',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      density: 'comfortable',
    },
  }
);

const metricCardAccentVariants = cva('h-1 w-full', {
  variants: {
    tone: {
      neutral: 'bg-primary-300 dark:bg-primary-700',
      success: 'bg-success-400',
      warning: 'bg-warning-400',
      danger: 'bg-error-400',
      info: 'bg-primary-400',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});

const metricCardDeltaVariants = cva(
  'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums',
  {
    variants: {
      tone: {
        neutral: 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300',
        success: 'border-success-200 bg-success-50 text-success-700 dark:border-success-900/60 dark:bg-success-950/30 dark:text-success-300',
        warning: 'border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-900/60 dark:bg-warning-950/30 dark:text-warning-300',
        danger: 'border-error-200 bg-error-50 text-error-700 dark:border-error-900/60 dark:bg-error-950/30 dark:text-error-300',
        info: 'border-info-200 bg-info-50 text-info-700 dark:border-info-900/60 dark:bg-info-950/30 dark:text-info-300',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  }
);

type MetricCardTone = NonNullable<VariantProps<typeof metricCardVariants>['tone']>;

interface MetricCardContextValue {
  tone: MetricCardTone;
}

const MetricCardContext = React.createContext<MetricCardContextValue>({
  tone: 'neutral',
});

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  showAccent?: boolean;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, tone = 'neutral', density, showAccent = true, children, ...props }, ref) => (
    <MetricCardContext.Provider value={{ tone: tone ?? 'neutral' }}>
      <div
        ref={ref}
        className={cn(metricCardVariants({ tone, density }), className)}
        {...props}
      >
        {showAccent && <div className={cn('-mx-4 -mt-4 mb-4 sm:-mx-5 sm:-mt-5', metricCardAccentVariants({ tone }))} />}
        {children}
      </div>
    </MetricCardContext.Provider>
  )
);
MetricCard.displayName = 'MetricCard';

const MetricCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex min-w-0 items-start justify-between gap-3', className)}
    {...props}
  />
));
MetricCardHeader.displayName = 'MetricCardHeader';

const MetricCardLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('truncate text-sm font-medium text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
MetricCardLabel.displayName = 'MetricCardLabel';

const MetricCardValue = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('mt-2 text-2xl font-semibold leading-none tracking-normal text-neutral-950 dark:text-neutral-50', className)}
    {...props}
  />
));
MetricCardValue.displayName = 'MetricCardValue';

export interface MetricCardDeltaProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof metricCardDeltaVariants> {}

const MetricCardDelta = React.forwardRef<HTMLSpanElement, MetricCardDeltaProps>(
  ({ className, tone, ...props }, ref) => {
    const context = React.useContext(MetricCardContext);

    return (
      <span
        ref={ref}
        className={cn(metricCardDeltaVariants({ tone: tone ?? context.tone }), className)}
        {...props}
      />
    );
  }
);
MetricCardDelta.displayName = 'MetricCardDelta';

const MetricCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('mt-2 text-sm text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
MetricCardDescription.displayName = 'MetricCardDescription';

const MetricCardVisual = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-4 min-h-10 min-w-0 overflow-hidden rounded-md bg-neutral-50 dark:bg-neutral-900', className)}
    {...props}
  />
));
MetricCardVisual.displayName = 'MetricCardVisual';

const MetricCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-4 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400', className)}
    {...props}
  />
));
MetricCardFooter.displayName = 'MetricCardFooter';

export {
  MetricCard,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardValue,
  MetricCardDelta,
  MetricCardDescription,
  MetricCardVisual,
  MetricCardFooter,
  metricCardVariants,
  metricCardAccentVariants,
  metricCardDeltaVariants,
};
