import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Dot component for minimal inline status indication
 *
 * A lighter-weight sibling of StatusPill for dense table cells and list rows
 * where a full pill is too loud. Status color map mirrors statusDotVariants
 * in status-pill.tsx — keep the two in sync.
 *
 * @example
 * // Dot with label
 * <Dot status="active">Online</Dot>
 *
 * @example
 * // Visually bare dot in a dense cell — carry the status in sr-only text.
 * // NOT `aria-label`: the wrapper is a role-less <span>, whose implicit
 * // `generic` role prohibits naming, so no browser exposes the label and real
 * // assistive tech ignores it. `role="img"` is not the fix either — it prunes
 * // descendant text and would break the labelled form above.
 * <Dot status="failed" srLabel="Failed" />
 *
 * @example
 * // Live state
 * <Dot status="processing" pulse>Syncing</Dot>
 */

const dotVariants = cva('shrink-0 rounded-full', {
  variants: {
    status: {
      active: 'bg-success-500',
      pending: 'bg-neutral-400',
      processing: 'bg-info-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      failed: 'bg-error-500',
      blocked: 'bg-error-600',
      archived: 'bg-neutral-400',
    },
    size: {
      sm: 'size-1.5',
      md: 'size-2',
      lg: 'size-2.5',
    },
    pulse: {
      true: 'animate-pulse',
    },
  },
  defaultVariants: {
    status: 'pending',
    size: 'sm',
  },
});

export interface DotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof dotVariants> {
  /**
   * Screen-reader-only status text for a visually bare dot (no `children`).
   *
   * Needed because the wrapper is a role-less `<span>`: its implicit `generic`
   * role **prohibits** an accessible name, so `aria-label` on a `Dot` is
   * silently dropped by every browser. The status has to be real text in the
   * accessibility tree instead.
   *
   * Ignored when `children` are present — an `srLabel` alongside a visible
   * label would announce the status twice.
   *
   * @default undefined
   */
  srLabel?: string;
}

const Dot = React.forwardRef<HTMLSpanElement, DotProps>(
  ({ className, status, size, pulse, srLabel, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex min-w-0 items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300',
        className
      )}
      {...props}
    >
      <span
        data-testid="dot-indicator"
        aria-hidden="true"
        className={cn(dotVariants({ status, size, pulse }))}
      />
      {/*
        A DIRECT child of the flex wrapper, never inside `.truncate` — same
        shape as `spinner.tsx`. `.truncate` never positions its own box, so it
        stays a flex item even when its only content is absolutely positioned, and
        `gap-1.5` then adds 6px: a "bare" dot measures 12px instead of 6px. An
        `sr-only` span is absolutely positioned, so as a direct child of the
        flex container it is out of flow, is not a flex item, and costs nothing.
      */}
      {children == null && srLabel != null && <span className="sr-only">{srLabel}</span>}
      {children != null && <span className="truncate">{children}</span>}
    </span>
  )
);
Dot.displayName = 'Dot';

export { Dot, dotVariants };
