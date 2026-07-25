import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Sparkline component for inline trend lines
 *
 * A dependency-free inline SVG chart primitive: a compact, axis-less line that
 * sits beside a number and answers "which way is this going?". Built for
 * backoffice tables and KPI cards where a full chart would be noise. Unlike
 * Meter (a measurement inside a known range) or Progress (task completion),
 * Sparkline plots a *series over time* and carries no absolute scale of its own.
 *
 * @example
 * // Trend beside a metric
 * <Sparkline data={[12, 18, 15, 22, 27, 24, 31]} label="Orders, last 7 days" />
 *
 * @example
 * // Filled area with an emphasis dot on the latest value
 * <Sparkline data={series} label="Revenue trend" tone="success" area showLastPoint />
 *
 * @example
 * // Stretch to the container width with an explicit domain
 * <Sparkline data={series} label="Latency" tone="error" min={0} max={500} className="h-8 w-full" />
 */

/**
 * Tone classes for the series stroke.
 *
 * Status tones use 600/400 rather than Meter's 500 fills: a hairline stroke
 * needs more contrast than a solid bar to stay legible at 1.5px.
 * `steel` is a sanctioned use of the accent — a data series is quiet emphasis,
 * not a decorative fill.
 */
// `overflow-visible`: the last-point dot is sized in device pixels at x === width,
// so half of it would be clipped by the viewport. The overflow is in device space,
// which no viewBox-unit inset can compensate for under preserveAspectRatio="none".
const sparklineVariants = cva('block max-w-full overflow-visible', {
  variants: {
    tone: {
      ink: 'stroke-neutral-900 dark:stroke-neutral-100',
      steel: 'stroke-primary-500 dark:stroke-primary-400',
      success: 'stroke-success-600 dark:stroke-success-400',
      warning: 'stroke-warning-600 dark:stroke-warning-400',
      error: 'stroke-error-600 dark:stroke-error-400',
    },
  },
  defaultVariants: {
    tone: 'ink',
  },
});

/** Soft fill under the line — always visibly quieter than the stroke, never a gradient. */
const sparklineAreaVariants = cva('', {
  variants: {
    tone: {
      ink: 'fill-neutral-900/10 dark:fill-neutral-100/10',
      steel: 'fill-primary-500/10 dark:fill-primary-400/15',
      success: 'fill-success-600/10 dark:fill-success-400/15',
      warning: 'fill-warning-600/10 dark:fill-warning-400/15',
      error: 'fill-error-600/10 dark:fill-error-400/15',
    },
  },
  defaultVariants: {
    tone: 'ink',
  },
});

export interface SparklineProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'width' | 'height' | 'min' | 'max'>,
    VariantProps<typeof sparklineVariants> {
  /** The series to plot, oldest first. Non-finite entries are ignored. */
  data: number[];
  /** Accessible name for the chart — describe the series and its window */
  label: string;
  /** Intrinsic width in viewBox units; override the rendered size with className */
  width?: number;
  /** Intrinsic height in viewBox units; override the rendered size with className */
  height?: number;
  /** Series color; `ink` for neutral trends, status tones for judged ones */
  tone?: 'ink' | 'steel' | 'success' | 'warning' | 'error';
  /** Draw a soft fill between the line and the baseline */
  area?: boolean;
  /** Emphasize the most recent value with a dot */
  showLastPoint?: boolean;
  /** Line thickness in device pixels (the stroke does not scale with the box) */
  strokeWidth?: number;
  /** Lower bound of the value domain; derived from data when omitted */
  min?: number;
  /** Upper bound of the value domain; derived from data when omitted */
  max?: number;
}

/** Trim floating point noise so coordinates stay readable in the DOM. */
const round = (n: number): number => Math.round(n * 100) / 100;

const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      className,
      data,
      label,
      width = 120,
      height = 32,
      tone = 'ink',
      area = false,
      showLastPoint = false,
      strokeWidth = 1.5,
      min,
      max,
      ...props
    },
    ref
  ) => {
    // Every numeric input is sanitized before it can reach an SVG attribute —
    // a NaN in `points` silently blanks the whole chart.
    const safeWidth = Number.isFinite(width) && width > 0 ? width : 120;
    const safeHeight = Number.isFinite(height) && height > 0 ? height : 32;
    const safeStroke = Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 1.5;

    // `Array.isArray` guard, not just the filter: series data usually arrives from
    // an API, and a `null`/`undefined` payload must render the empty chart rather
    // than throw inside a table row.
    const series = (Array.isArray(data) ? data : []).filter((n) => Number.isFinite(n));
    const count = series.length;

    // Inset by half the stroke so the line never clips at the top or bottom edge.
    const pad = Math.min(safeStroke / 2, safeHeight / 2);
    const plotHeight = Math.max(0, safeHeight - pad * 2);
    const baseline = round(pad + plotHeight);
    const midline = round(pad + plotHeight / 2);

    // Domain: explicit props win, otherwise derive in one pass (spread would
    // blow the stack on a long series).
    let lo = Number.POSITIVE_INFINITY;
    let hi = Number.NEGATIVE_INFINITY;
    for (const v of series) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (Number.isFinite(min)) lo = min as number;
    if (Number.isFinite(max)) hi = max as number;
    const span = hi - lo;
    // A flat series, an inverted domain, or min === max all land here.
    const hasSpan = Number.isFinite(span) && span > 0;

    const yFor = (value: number): number => {
      if (!hasSpan) return midline;
      const clamped = Math.min(hi, Math.max(lo, value));
      return round(pad + (1 - (clamped - lo) / span) * plotHeight);
    };

    let coords: Array<[number, number]>;
    if (count === 0) {
      coords = [];
    } else if (count === 1) {
      // A single reading has no slope — draw it as a flat line across the box.
      const y = yFor(series[0] ?? 0);
      coords = [
        [0, y],
        [round(safeWidth), y],
      ];
    } else {
      coords = series.map((v, i) => [round((i / (count - 1)) * safeWidth), yFor(v)]);
    }

    const linePoints = coords.map(([x, y]) => `${x},${y}`).join(' ');
    // Fallbacks are unreachable while coords is non-empty; they exist so the
    // tuple lookups stay typed without assertions.
    const [firstX] = coords[0] ?? [0, midline];
    const [lastX, lastY] = coords[coords.length - 1] ?? [0, midline];
    const areaPoints =
      coords.length > 1 ? `${linePoints} ${lastX},${baseline} ${firstX},${baseline}` : '';
    const dotSize = Math.max(3, safeStroke * 3);

    return (
      <svg
        ref={ref}
        role="img"
        aria-label={label}
        width={safeWidth}
        height={safeHeight}
        viewBox={`0 0 ${safeWidth} ${safeHeight}`}
        preserveAspectRatio="none"
        data-empty={count === 0 ? 'true' : undefined}
        className={cn(sparklineVariants({ tone }), className)}
        {...props}
      >
        {area && areaPoints !== '' && (
          <polygon
            data-testid="sparkline-area"
            points={areaPoints}
            stroke="none"
            className={cn(sparklineAreaVariants({ tone }))}
          />
        )}
        {coords.length > 0 && (
          <polyline
            data-testid="sparkline-line"
            points={linePoints}
            fill="none"
            strokeWidth={safeStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {showLastPoint && coords.length > 0 && (
          // Drawn as a round-capped nub rather than a <circle>: preserveAspectRatio
          // is "none", so a real circle would stretch into an ellipse.
          <path
            data-testid="sparkline-point"
            d={`M ${lastX} ${lastY} l 0.01 0`}
            fill="none"
            strokeWidth={dotSize}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    );
  }
);
Sparkline.displayName = 'Sparkline';

export { Sparkline, sparklineVariants, sparklineAreaVariants };
