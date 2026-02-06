import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * DataCard component for displaying metrics with optional trend indicators
 *
 * @example
 * // Basic data card
 * <DataCard value="1,234" label="Total Users" />
 *
 * @example
 * // Data card with trend
 * <DataCard value="$45,231" label="Revenue" trend="+12.5%" trendDirection="up" />
 *
 * @example
 * // Data card with description
 * <DataCard
 *   value="98.5%"
 *   label="Uptime"
 *   description="Last 30 days"
 *   trend="+2.3%"
 *   trendDirection="up"
 * />
 */

const dataCardVariants = cva(
  'rounded-lg border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-700',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface DataCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataCardVariants> {
  value: string | number;
  label: string;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  ({ className, value, label, description, trend, trendDirection, ...props }, ref) => {
    const trendColorClass = trendDirection === 'up'
      ? 'text-green-600 dark:text-green-400'
      : trendDirection === 'down'
      ? 'text-red-600 dark:text-red-400'
      : 'text-neutral-600 dark:text-neutral-400';

    return (
      <div
        ref={ref}
        className={cn(dataCardVariants(), className)}
        {...props}
      >
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
            {trend && (
              <span className={cn('text-sm font-medium', trendColorClass)}>
                {trend}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);
DataCard.displayName = 'DataCard';

export { DataCard, dataCardVariants };
