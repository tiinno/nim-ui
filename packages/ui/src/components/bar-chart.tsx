import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * BarChart component for small categorical comparisons
 *
 * A dependency-free bar chart for dashboard cards and record panels: a handful
 * of named categories compared against each other, drawn with plain layout
 * elements rather than SVG so it reflows with its container. Values print above
 * the column when vertical and in a fixed-width trailing column when horizontal,
 * so every row's track stays the same length and bars remain comparable.
 * Distinct from
 * Meter, which reports one value inside a known range, and from Progress,
 * which tracks a task. Steel is offered as a data-series tone here (data
 * encoding, never decorative fill).
 *
 * @example
 * // Vertical comparison across categories
 * <BarChart
 *   label="Orders by channel"
 *   data={[
 *     { label: 'Web', value: 412 },
 *     { label: 'POS', value: 268 },
 *     { label: 'API', value: 97 },
 *   ]}
 *   showValues
 * />
 *
 * @example
 * // Horizontal, for long category names
 * <BarChart
 *   label="Failures by reason"
 *   orientation="horizontal"
 *   data={[
 *     { label: 'Card declined', value: 34, tone: 'error' },
 *     { label: 'Address mismatch', value: 12, tone: 'warning' },
 *     { label: 'Manual review', value: 5 },
 *   ]}
 *   showValues
 * />
 *
 * @example
 * // Fixed scale and formatted values
 * <BarChart
 *   label="SLA attainment"
 *   max={100}
 *   tone="steel"
 *   valueFormatter={(v) => `${v}%`}
 *   data={[{ label: 'Tier 1', value: 98 }, { label: 'Tier 2', value: 91 }]}
 *   showValues
 * />
 */

const barChartVariants = cva('w-full', {
  variants: {
    orientation: {
      vertical: 'flex flex-col gap-2',
      horizontal: 'flex flex-col gap-1.5',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

const barChartBarVariants = cva('rounded-sm transition-all duration-(--duration-slow) ease-out', {
  variants: {
    tone: {
      ink: 'bg-neutral-900 dark:bg-neutral-100',
      steel: 'bg-primary-500 dark:bg-primary-400',
      success: 'bg-success-500 dark:bg-success-400',
      warning: 'bg-warning-500 dark:bg-warning-400',
      error: 'bg-error-600 dark:bg-error-400',
    },
  },
  defaultVariants: {
    tone: 'ink',
  },
});

/** Tones available to the chart and to individual data points */
export type BarChartTone = 'ink' | 'steel' | 'success' | 'warning' | 'error';

export interface BarChartDatum {
  /** Category name shown next to (or under) the bar */
  label: string;
  /** Measured value for the category */
  value: number;
  /** Overrides the chart-level tone for this bar only */
  tone?: BarChartTone;
}

export interface BarChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof barChartVariants> {
  /** Categories to plot, in display order */
  data: BarChartDatum[];
  /** Accessible name for the chart */
  label: string;
  /** Upper bound of the scale; defaults to the largest value in data */
  max?: number;
  /** Chart-level bar tone; per-datum tone overrides it */
  tone?: BarChartTone;
  /** Print the formatted value beside each bar — above the column when vertical */
  showValues?: boolean;
  /** Formats values for display and for the screen-reader enumeration */
  valueFormatter?: (value: number) => string;
  /** Plot height in px, vertical orientation only; non-positive values fall back to the default */
  height?: number;
}

/** Values that are not finite numbers are treated as zero rather than NaN */
const toSafeValue = (value: number): number => (Number.isFinite(value) ? value : 0);

const DEFAULT_PLOT_HEIGHT = 120;

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      className,
      data,
      label,
      max,
      tone = 'ink',
      orientation = 'vertical',
      showValues = false,
      valueFormatter = (value: number) => String(value),
      height = DEFAULT_PLOT_HEIGHT,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const descriptionId = `${generatedId}-bar-chart-desc`;

    const points = data.map((datum) => ({ ...datum, value: toSafeValue(datum.value) }));

    // `max ?? computed` so an explicit max={0} is honored instead of falling back.
    const computedMax = points.reduce((highest, point) => Math.max(highest, point.value), 0);
    const rawMax = toSafeValue(max ?? computedMax);
    const scaleMax = rawMax > 0 ? rawMax : 0;

    const bars = points.map((point) => {
      // Guarded division: empty data, all-zero data and max <= 0 collapse to 0%.
      const ratio = scaleMax > 0 ? point.value / scaleMax : 0;
      const clamped = Math.min(1, Math.max(0, ratio));
      // Two decimals keeps small differences honest without float noise.
      const percentage = Math.round(clamped * 10000) / 100;
      return {
        ...point,
        percentage,
        formatted: valueFormatter(point.value),
        // A positive value never collapses to an invisible bar.
        hasExtent: point.value > 0,
      };
    });

    const description =
      bars.length === 0
        ? `${label}: no data`
        : `${label}: ${bars.map((bar) => `${bar.label}: ${bar.formatted}`).join(', ')}`;

    const isHorizontal = orientation === 'horizontal';

    // A NaN/Infinite/non-positive height would emit an invalid CSS length, which
    // the browser drops — collapsing the plot (and every h-full column) to zero.
    const plotHeight = Number.isFinite(height) && height > 0 ? height : DEFAULT_PLOT_HEIGHT;

    return (
      <div
        ref={ref}
        role="img"
        aria-label={label}
        aria-describedby={ariaDescribedBy ?? descriptionId}
        className={cn(barChartVariants({ orientation }), className)}
        {...props}
      >
        <span id={descriptionId} className="sr-only">
          {description}
        </span>

        {isHorizontal ? (
          <div aria-hidden="true" className="flex flex-col gap-1.5">
            {bars.map((bar, index) => (
              <div key={`${bar.label}-${index}`} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {bar.label}
                </span>
                <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-neutral-200 dark:bg-neutral-800">
                  <div
                    data-testid="bar-chart-bar"
                    className={cn(
                      barChartBarVariants({ tone: bar.tone ?? tone }),
                      'h-full',
                      bar.hasExtent && 'min-w-px'
                    )}
                    style={{ width: `${bar.percentage}%` }}
                  />
                </div>
                {showValues && (
                  // Fixed width, not shrink-to-fit: a value column that sizes to
                  // its content would leave each row a different track width, so
                  // 50% in one row would not be the same length as 50% in another.
                  <span className="w-14 shrink-0 truncate text-right text-xs tabular-nums text-neutral-700 dark:text-neutral-300">
                    {bar.formatted}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {/*
              The plot has an explicit px height and each column is h-full, so the
              bar's percentage height resolves against a definite box. Value text is
              absolutely positioned above the bar so it never steals plot height;
              the padding reserves room for it inside the same total height.
            */}
            <div
              aria-hidden="true"
              data-testid="bar-chart-plot"
              className={cn('flex items-end gap-2', showValues && 'pt-5')}
              style={{ height: `${plotHeight}px` }}
            >
              {bars.map((bar, index) => (
                <div
                  key={`${bar.label}-${index}`}
                  className="flex h-full min-w-0 flex-1 flex-col justify-end"
                >
                  <div
                    data-testid="bar-chart-bar"
                    className={cn(
                      barChartBarVariants({ tone: bar.tone ?? tone }),
                      'relative w-full',
                      bar.hasExtent && 'min-h-px'
                    )}
                    style={{ height: `${bar.percentage}%` }}
                  >
                    {showValues && (
                      <span className="absolute inset-x-0 -top-5 truncate text-center text-xs tabular-nums text-neutral-700 dark:text-neutral-300">
                        {bar.formatted}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {bars.length > 0 && (
              <div className="flex gap-2">
                {bars.map((bar, index) => (
                  <span
                    key={`${bar.label}-${index}`}
                    className="min-w-0 flex-1 truncate text-center text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    {bar.label}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);
BarChart.displayName = 'BarChart';

export { BarChart, barChartVariants, barChartBarVariants };
