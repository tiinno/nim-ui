import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Banner component for page-level announcements and system notices
 *
 * Full-bleed chrome that spans the app frame — maintenance windows, trial
 * expiry, degraded-service notices. Distinct from Alert, which is inline and
 * scoped to the content it sits beside: Banner is denser vertically, has no
 * corner radius (border-b only), can stick to the top of the viewport, and
 * dismisses itself.
 *
 * @example
 * // System notice above the app chrome
 * <Banner tone="warning" title="Scheduled maintenance">
 *   Order sync pauses Sunday 02:00–04:00 UTC.
 * </Banner>
 *
 * @example
 * // Dismissible with a trailing action
 * <Banner
 *   tone="info"
 *   title="Trial ends in 5 days"
 *   dismissible
 *   onDismiss={() => persistDismissal('trial-banner')}
 *   action={<Button size="sm">Upgrade</Button>}
 * />
 *
 * @example
 * // Centered neutral announcement pinned to the viewport
 * <Banner sticky align="center" icon={null}>
 *   Read-only mode — you are viewing a historical snapshot.
 * </Banner>
 */

const bannerVariants = cva(
  'relative flex w-full items-center gap-3 border-b px-4 py-2.5 text-sm transition-opacity duration-normal sm:px-6',
  {
    variants: {
      tone: {
        neutral:
          'border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300',
        info: 'border-info-200 bg-info-50 text-info-700 dark:border-info-900/60 dark:bg-info-950/40 dark:text-info-300',
        success:
          'border-success-200 bg-success-50 text-success-700 dark:border-success-900/60 dark:bg-success-950/40 dark:text-success-300',
        warning:
          'border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-900/60 dark:bg-warning-950/40 dark:text-warning-300',
        error:
          'border-error-200 bg-error-50 text-error-700 dark:border-error-900/60 dark:bg-error-950/40 dark:text-error-300',
      },
      align: {
        start: 'justify-start text-left',
        center: 'justify-center text-center',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      align: 'start',
    },
  }
);

type BannerTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

const iconPaths: Record<BannerTone, React.ReactNode> = {
  neutral: (
    <>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  success: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  warning: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  error: (
    <>
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </>
  ),
};

function ToneIcon({ tone }: { tone: BannerTone }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[tone]}
    </svg>
  );
}

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    Omit<VariantProps<typeof bannerVariants>, 'tone'> {
  /** Severity of the notice; drives the tonal surface and the ARIA role */
  tone?: BannerTone;
  /** Headline of the notice, rendered in medium weight */
  title?: React.ReactNode;
  /** Supporting copy shown beneath (or beside) the title */
  children?: React.ReactNode;
  /** Leading icon slot; defaults to a decorative tone icon, pass null to suppress */
  icon?: React.ReactNode;
  /** Trailing action slot — a Button or Link that resolves the notice */
  action?: React.ReactNode;
  /** Render a dismiss button that unmounts the banner */
  dismissible?: boolean;
  /** Called when the operator dismisses the banner; persist the choice here */
  onDismiss?: () => void;
  /** Accessible name for the dismiss button */
  dismissLabel?: string;
  /** Pin the banner to the top of the viewport above app chrome */
  sticky?: boolean;
  /** Horizontal alignment of the banner content */
  align?: 'start' | 'center';
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      tone = 'neutral',
      title,
      children,
      icon: iconProp,
      action,
      dismissible,
      onDismiss,
      dismissLabel = 'Dismiss',
      sticky,
      align = 'start',
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);

    if (dismissed) return null;

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    const urgent = tone === 'warning' || tone === 'error';
    // Only the built-in tone icon is decorative. A consumer-supplied mark may
    // carry meaning (a product logo, a provider glyph), so it keeps its own
    // semantics instead of being silenced by the wrapper.
    const isDefaultIcon = iconProp === undefined;
    const icon = isDefaultIcon ? <ToneIcon tone={tone} /> : iconProp;

    return (
      <div
        ref={ref}
        role={urgent ? 'alert' : 'status'}
        className={cn(
          bannerVariants({ tone, align }),
          sticky && 'sticky top-0 z-30',
          // Reserve room for the absolutely positioned dismiss button. Centered
          // banners need it on both sides or the copy drifts off true center.
          dismissible && (align === 'center' ? 'px-12 sm:px-14' : 'pr-12 sm:pr-14'),
          className
        )}
        {...props}
      >
        {icon != null && (
          <span
            data-testid="banner-icon"
            className="shrink-0"
            aria-hidden={isDefaultIcon ? true : undefined}
          >
            {icon}
          </span>
        )}
        {(title || children) && (
          <div className={cn('min-w-0', align === 'start' && 'flex-1')}>
            {title && <p className="font-medium leading-snug">{title}</p>}
            {children && <div className="leading-snug">{children}</div>}
          </div>
        )}
        {action && (
          <div
            data-testid="banner-action"
            className={cn('shrink-0', align === 'start' && 'ml-auto')}
          >
            {action}
          </div>
        )}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={dismissLabel}
            className="absolute right-3 top-1/2 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md opacity-70 transition-opacity duration-fast hover:opacity-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 sm:right-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Banner.displayName = 'Banner';

export { Banner, bannerVariants };
