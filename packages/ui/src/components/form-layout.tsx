import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const formLayoutVariants = cva('w-full min-w-0', {
  variants: {
    density: {
      comfortable: 'space-y-5',
      compact: 'space-y-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
});

const formLayoutSectionVariants = cva(
  'min-w-0 overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
  {
    variants: {
      divided: {
        true: 'divide-y divide-neutral-200 dark:divide-neutral-800',
        false: '',
      },
    },
    defaultVariants: {
      divided: true,
    },
  }
);

const formLayoutGridVariants = cva('grid min-w-0 gap-4', {
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    },
  },
  defaultVariants: {
    columns: 2,
  },
});

const formLayoutActionsVariants = cva(
  'z-10 flex flex-col-reverse gap-2 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 sm:flex-row sm:items-center sm:justify-end',
  {
    variants: {
      sticky: {
        true: 'sticky bottom-0',
        false: '',
      },
    },
    defaultVariants: {
      sticky: true,
    },
  }
);

export interface FormLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formLayoutVariants> {}

const FormLayout = React.forwardRef<HTMLDivElement, FormLayoutProps>(
  ({ className, density, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(formLayoutVariants({ density }), className)}
      {...props}
    />
  )
);
FormLayout.displayName = 'FormLayout';

export interface FormLayoutSectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof formLayoutSectionVariants> {}

const FormLayoutSection = React.forwardRef<HTMLElement, FormLayoutSectionProps>(
  ({ className, divided, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(formLayoutSectionVariants({ divided }), className)}
      {...props}
    />
  )
);
FormLayoutSection.displayName = 'FormLayoutSection';

const FormLayoutSectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-1 px-4 py-4 sm:px-5', className)} {...props} />
));
FormLayoutSectionHeader.displayName = 'FormLayoutSectionHeader';

const FormLayoutSectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-base font-semibold text-neutral-950 dark:text-neutral-50', className)}
    {...props}
  />
));
FormLayoutSectionTitle.displayName = 'FormLayoutSectionTitle';

const FormLayoutSectionDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('max-w-2xl text-sm text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
FormLayoutSectionDescription.displayName = 'FormLayoutSectionDescription';

export interface FormLayoutGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formLayoutGridVariants> {}

const FormLayoutGrid = React.forwardRef<HTMLDivElement, FormLayoutGridProps>(
  ({ className, columns, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(formLayoutGridVariants({ columns }), 'px-4 py-4 sm:px-5', className)}
      {...props}
    />
  )
);
FormLayoutGrid.displayName = 'FormLayoutGrid';

export interface FormLayoutActionsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formLayoutActionsVariants> {}

const FormLayoutActions = React.forwardRef<HTMLDivElement, FormLayoutActionsProps>(
  ({ className, sticky, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(formLayoutActionsVariants({ sticky }), className)}
      {...props}
    />
  )
);
FormLayoutActions.displayName = 'FormLayoutActions';

export interface FormLayoutValidationError {
  label: React.ReactNode;
  message: React.ReactNode;
  href?: string;
}

export interface FormLayoutValidationSummaryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  errors: FormLayoutValidationError[];
}

const FormLayoutValidationSummary = React.forwardRef<
  HTMLDivElement,
  FormLayoutValidationSummaryProps
>(({ className, title = 'Review these fields', errors, ...props }, ref) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="polite"
      className={cn(
        'rounded-md border border-error-200 bg-error-50 p-4 text-sm text-error-900 dark:border-error-900/60 dark:bg-error-950/30 dark:text-error-100',
        className
      )}
      {...props}
    >
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map((error, index) => (
          <li key={index}>
            {error.href ? (
              <a className="underline underline-offset-2" href={error.href}>
                <span className="font-medium">{error.label}</span>: {error.message}
              </a>
            ) : (
              <>
                <span className="font-medium">{error.label}</span>: {error.message}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});
FormLayoutValidationSummary.displayName = 'FormLayoutValidationSummary';

export {
  FormLayout,
  FormLayoutSection,
  FormLayoutSectionHeader,
  FormLayoutSectionTitle,
  FormLayoutSectionDescription,
  FormLayoutGrid,
  FormLayoutActions,
  FormLayoutValidationSummary,
  formLayoutVariants,
  formLayoutSectionVariants,
  formLayoutGridVariants,
  formLayoutActionsVariants,
};
