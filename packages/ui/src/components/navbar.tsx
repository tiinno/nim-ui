import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Navbar component for marketing and landing page top navigation
 *
 * @example
 * // Basic navbar with brand and links
 * <Navbar
 *   brand="Nim UI"
 *   links={[
 *     { label: 'Features', href: '/features' },
 *     { label: 'Pricing', href: '/pricing', active: true },
 *     { label: 'Docs', href: '/docs' },
 *   ]}
 * />
 *
 * @example
 * // Navbar with CTA button
 * <Navbar
 *   brand="Nim UI"
 *   links={[{ label: 'Features', href: '/features' }]}
 *   cta={{ label: 'Get Started', href: '/signup' }}
 * />
 *
 * @example
 * // Sticky navbar with custom actions
 * <Navbar
 *   sticky
 *   brand={<Logo />}
 *   links={[{ label: 'Docs', href: '/docs' }]}
 *   actions={<ThemeToggle />}
 *   cta={{ label: 'Sign Up', onClick: () => {} }}
 * />
 */

const navbarVariants = cva(
  'w-full border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
  {
    variants: {
      sticky: {
        true: 'sticky top-0 z-40',
        false: '',
      },
    },
    defaultVariants: {
      sticky: false,
    },
  }
);

export interface NavbarLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {
  brand?: React.ReactNode;
  brandHref?: string;
  links?: NavbarLink[];
  actions?: React.ReactNode;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const ctaClasses =
  'inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white';

function desktopLinkClasses(active?: boolean): string {
  return cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400',
    active
      ? 'text-neutral-950 dark:text-neutral-50'
      : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50'
  );
}

function mobileLinkClasses(active?: boolean): string {
  return cn(
    'block rounded-md px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400',
    active
      ? 'bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50'
  );
}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      sticky,
      brand,
      brandHref = '/',
      links,
      actions,
      cta,
      ...props
    },
    ref
  ) => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuId = React.useId();

    const renderCta = (extraClasses?: string) =>
      cta &&
      (cta.href ? (
        <a
          href={cta.href}
          onClick={cta.onClick}
          className={cn(ctaClasses, extraClasses)}
        >
          {cta.label}
        </a>
      ) : (
        <button
          type="button"
          onClick={cta.onClick}
          className={cn(ctaClasses, extraClasses)}
        >
          {cta.label}
        </button>
      ));

    return (
      <header
        ref={ref}
        className={cn(navbarVariants({ sticky }), className)}
        {...props}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8"
        >
          {brand && (
            <a
              href={brandHref}
              className="flex shrink-0 items-center gap-2 rounded-md text-base font-semibold tracking-tight text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 dark:text-neutral-50"
            >
              {brand}
            </a>
          )}
          {links && links.length > 0 && (
            <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={link.active ? 'page' : undefined}
                  className={desktopLinkClasses(link.active)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            {actions}
            {renderCta('hidden md:inline-flex')}
            {links && links.length > 0 && (
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                aria-label="Toggle navigation menu"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex size-9 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 md:hidden dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
              >
                {menuOpen ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="size-5"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="size-5"
                  >
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </nav>
        {menuOpen && links && links.length > 0 && (
          <div
            id={menuId}
            className="border-t border-neutral-200 px-4 py-3 md:hidden dark:border-neutral-800"
          >
            <div className="space-y-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={link.active ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={mobileLinkClasses(link.active)}
                >
                  {link.label}
                </a>
              ))}
            </div>
            {cta && <div className="pt-3">{renderCta('w-full')}</div>}
          </div>
        )}
      </header>
    );
  }
);
Navbar.displayName = 'Navbar';

export { Navbar, navbarVariants };
