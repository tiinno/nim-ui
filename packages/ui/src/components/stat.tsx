import * as React from 'react';
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
 * <Stat value="98%" label="Success Rate" className="text-success-600" />
 *
 * @example
 * // Multiple stats in a group
 * <div className="grid grid-cols-3 gap-4">
 *   <Stat value="1.2K" label="Followers" />
 *   <Stat value="456" label="Following" />
 *   <Stat value="89" label="Posts" />
 * </div>
 */

export interface StatProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
}

const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, value, label, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1', className)}
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

/**
 * @deprecated `statVariants` is kept for backwards compatibility.
 * Prefer using the `Stat` component directly.
 */
const statVariants = () => 'flex flex-col space-y-1';

export { Stat, statVariants };
