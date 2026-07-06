import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Footer component for marketing and landing page footers
 *
 * @example
 * // Basic footer with copyright
 * <Footer
 *   brand="Nim UI"
 *   copyright="© 2026 Nim UI. All rights reserved."
 * />
 *
 * @example
 * // Footer with link groups
 * <Footer
 *   brand="Nim UI"
 *   description="A modern React component library."
 *   linkGroups={[
 *     {
 *       title: 'Product',
 *       links: [
 *         { label: 'Features', href: '/features' },
 *         { label: 'Pricing', href: '/pricing' },
 *       ],
 *     },
 *   ]}
 *   copyright="© 2026 Nim UI"
 * />
 *
 * @example
 * // Footer with social and legal links
 * <Footer
 *   brand="Nim UI"
 *   socialLinks={[{ label: 'GitHub', href: 'https://github.com/nim-ui' }]}
 *   legalLinks={[
 *     { label: 'Privacy', href: '/privacy' },
 *     { label: 'Terms', href: '/terms' },
 *   ]}
 *   copyright="© 2026 Nim UI"
 * />
 */

const footerVariants = cva(
  'w-full border-t border-neutral-200 dark:border-neutral-800',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-neutral-950',
        muted: 'bg-neutral-50 dark:bg-neutral-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface FooterProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof footerVariants> {
  brand?: React.ReactNode;
  description?: string;
  linkGroups?: FooterLinkGroup[];
  socialLinks?: FooterSocialLink[];
  legalLinks?: FooterLink[];
  copyright?: string;
}

const footerLinkClasses =
  'text-sm text-neutral-600 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 rounded-sm dark:text-neutral-400 dark:hover:text-neutral-50';

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      className,
      variant,
      brand,
      description,
      linkGroups,
      socialLinks,
      legalLinks,
      copyright,
      ...props
    },
    ref
  ) => {
    const hasTopSection =
      brand ||
      description ||
      (linkGroups && linkGroups.length > 0) ||
      (socialLinks && socialLinks.length > 0);
    const hasBottomBar = copyright || (legalLinks && legalLinks.length > 0);

    return (
      <footer
        ref={ref}
        className={cn(footerVariants({ variant }), className)}
        {...props}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {hasTopSection && (
            <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
              {(brand || description || (socialLinks && socialLinks.length > 0)) && (
                <div className="max-w-sm space-y-4">
                  {brand && (
                    <div className="text-base font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                      {brand}
                    </div>
                  )}
                  {description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {description}
                    </p>
                  )}
                  {socialLinks && socialLinks.length > 0 && (
                    <div className="flex items-center gap-1">
                      {socialLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          aria-label={link.label}
                          className="inline-flex size-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
                        >
                          {link.icon ? (
                            <span aria-hidden="true" className="[&>svg]:size-5">
                              {link.icon}
                            </span>
                          ) : (
                            <span className="text-sm font-medium">
                              {link.label}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {linkGroups && linkGroups.length > 0 && (
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-12">
                  {linkGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                        {group.title}
                      </h3>
                      <ul className="space-y-2">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <a href={link.href} className={footerLinkClasses}>
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {hasBottomBar && (
            <div
              className={cn(
                'flex flex-col-reverse items-center justify-between gap-4 sm:flex-row',
                hasTopSection &&
                  'mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800'
              )}
            >
              {copyright && (
                <p className="text-sm text-neutral-500 dark:text-neutral-500">
                  {copyright}
                </p>
              )}
              {legalLinks && legalLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {legalLinks.map((link) => (
                    <a key={link.href} href={link.href} className={footerLinkClasses}>
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </footer>
    );
  }
);
Footer.displayName = 'Footer';

export { Footer, footerVariants };
