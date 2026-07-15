import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Link component for styled anchors
 *
 * Uses the muted steel accent for link color. Export `linkVariants` to
 * compose with routing links (e.g. next/link) without adding a Slot dependency.
 *
 * @example
 * // Inline link in body text
 * <Link href="/orders/1042">Order #1042</Link>
 *
 * @example
 * // External link with icon and rel handling
 * <Link href="https://status.example.com" external>Status page</Link>
 *
 * @example
 * // Compose with a router link
 * <NextLink href="/queues" className={linkVariants({ variant: 'standalone' })}>View all queues</NextLink>
 */

const linkVariants = cva(
  'rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'text-primary-600 underline-offset-4 hover:underline dark:text-primary-300',
        subtle:
          'text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 hover:decoration-neutral-500 dark:text-neutral-400 dark:decoration-neutral-700 dark:hover:text-neutral-50',
        standalone:
          'font-medium text-primary-700 underline-offset-4 hover:text-primary-900 hover:underline dark:text-primary-300 dark:hover:text-primary-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  /** Open in a new tab with safe rel, external icon, and screen-reader note */
  external?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, external, target, rel, children, ...props }, ref) => (
    <a
      className={cn(
        linkVariants({ variant }),
        external && 'inline-flex items-center gap-0.5',
        className
      )}
      target={external ? '_blank' : target}
      rel={external ? 'noopener noreferrer' : rel}
      ref={ref}
      {...props}
    >
      {children}
      {external && (
        <>
          <svg
            className="size-3 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            data-testid="link-external-icon"
          >
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
          </svg>
          <span className="sr-only">(opens in new tab)</span>
        </>
      )}
    </a>
  )
);
Link.displayName = 'Link';

export { Link, linkVariants };
