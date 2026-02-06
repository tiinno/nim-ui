import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * FeatureGrid component for displaying features in a grid layout
 *
 * @example
 * // Basic feature grid
 * <FeatureGrid>
 *   <FeatureCard
 *     icon={<Icon />}
 *     title="Fast Performance"
 *     description="Lightning fast load times"
 *   />
 *   <FeatureCard
 *     icon={<Icon />}
 *     title="Secure"
 *     description="Enterprise-grade security"
 *   />
 * </FeatureGrid>
 *
 * @example
 * // Feature grid with custom columns
 * <FeatureGrid columns={4}>
 *   <FeatureCard icon={<Icon />} title="Feature 1" description="Description 1" />
 *   <FeatureCard icon={<Icon />} title="Feature 2" description="Description 2" />
 *   <FeatureCard icon={<Icon />} title="Feature 3" description="Description 3" />
 *   <FeatureCard icon={<Icon />} title="Feature 4" description="Description 4" />
 * </FeatureGrid>
 */

const featureGridVariants = cva(
  'grid gap-8 py-12',
  {
    variants: {
      columns: {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      },
    },
    defaultVariants: {
      columns: 3,
    },
  }
);

export interface FeatureGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof featureGridVariants> {}

const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  ({ className, columns, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(featureGridVariants({ columns }), className)}
      {...props}
    />
  )
);
FeatureGrid.displayName = 'FeatureGrid';

const featureCardVariants = cva(
  'flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface FeatureCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof featureCardVariants> {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, icon, title, description, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(featureCardVariants(), className)}
      {...props}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  )
);
FeatureCard.displayName = 'FeatureCard';

export { FeatureGrid, FeatureCard, featureGridVariants, featureCardVariants };
