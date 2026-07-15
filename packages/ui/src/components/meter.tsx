import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Meter component for capacity and usage display
 *
 * Shows how full something is — storage, rate limits, seat quotas — with
 * automatic threshold coloring (calm green until usage approaches the limit).
 * Distinct from Progress, which tracks task completion (role="progressbar");
 * Meter reports a measurement within a known range (role="meter").
 *
 * @example
 * // Storage usage with automatic threshold coloring
 * <Meter value={82} label="Storage used" showValue />
 *
 * @example
 * // Custom range and thresholds
 * <Meter value={450} max={500} thresholds={{ warning: 0.8, critical: 0.95 }} label="API calls" />
 *
 * @example
 * // Fixed tone
 * <Meter value={35} tone="neutral" label="Archive quota" />
 */

const meterVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2.5',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

const meterFillVariants = cva('h-full rounded-full transition-all duration-slow ease-out', {
  variants: {
    tone: {
      success: 'bg-success-500 dark:bg-success-400',
      warning: 'bg-warning-500 dark:bg-warning-400',
      error: 'bg-error-600 dark:bg-error-400',
      neutral: 'bg-neutral-400 dark:bg-neutral-500',
    },
  },
  defaultVariants: {
    tone: 'success',
  },
});

export interface MeterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof meterVariants> {
  /** Current measurement */
  value: number;
  /** Upper bound of the range */
  max?: number;
  /** Accessible name for the meter (required unless aria-labelledby is set) */
  label?: string;
  /** Fractions of max where auto coloring shifts to warning and error */
  thresholds?: { warning: number; critical: number };
  /** 'auto' colors by thresholds; fixed tones override */
  tone?: 'auto' | 'success' | 'warning' | 'error' | 'neutral';
  /** Show the percentage as trailing text */
  showValue?: boolean;
}

const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  (
    {
      className,
      value,
      max = 100,
      label,
      thresholds = { warning: 0.7, critical: 0.9 },
      tone = 'auto',
      showValue,
      size,
      ...props
    },
    ref
  ) => {
    const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
    const percentage = Math.round(fraction * 100);
    const resolvedTone =
      tone !== 'auto'
        ? tone
        : fraction >= thresholds.critical
          ? 'error'
          : fraction >= thresholds.warning
            ? 'warning'
            : 'success';

    return (
      <div ref={ref} className={cn('flex w-full items-center gap-2', className)} {...props}>
        <div
          role="meter"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={`${percentage}% used`}
          className={cn(meterVariants({ size }))}
        >
          <div
            data-testid="meter-fill"
            className={cn(meterFillVariants({ tone: resolvedTone }))}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
            {percentage}%
          </span>
        )}
      </div>
    );
  }
);
Meter.displayName = 'Meter';

export { Meter, meterVariants, meterFillVariants };
