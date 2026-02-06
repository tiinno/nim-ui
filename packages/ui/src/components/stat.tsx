import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Stat component for displaying simple statistics
 *
 * @example
 * // Basic stat
 * <Stat value="1,234" label="Total Users" />
 *
 * @example
 * // Stat with custom styling
 * <Stat value="98%" label="Success Rate" className="text-green-600" />
 *
 * @example
 * // Multiple stats in a group
 * <div className="grid grid-cols-3 gap-4">
 *   <Stat value="1.2K" label="Followers" />
 *   <Stat value="456" label="Following" />
 *   <Stat value="89" label="Posts" />
 * </div>
 */

const statVariants = cva(
  'flex flex-col space-y-1',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface StatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statVariants> {
  value: string | number;
  label: string;
}

const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, value, label, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(statVariants(), className)}
      {...props}
    >
      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {label}
      </p>
    </div>
  )
);
Stat.displayName = 'Stat';

export { Stat, statVariants };
