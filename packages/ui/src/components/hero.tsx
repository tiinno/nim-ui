import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Hero component for landing page headers
 *
 * @example
 * // Basic hero
 * <Hero
 *   title="Welcome to Our Platform"
 *   subtitle="Build amazing things with our tools"
 * />
 *
 * @example
 * // Hero with CTA buttons
 * <Hero
 *   title="Transform Your Business"
 *   subtitle="Get started today with our innovative solutions"
 *   primaryCta={{ label: "Get Started", onClick: () => {} }}
 *   secondaryCta={{ label: "Learn More", onClick: () => {} }}
 * />
 *
 * @example
 * // Hero with background image
 * <Hero
 *   title="Beautiful Design"
 *   subtitle="Experience the future"
 *   backgroundImage="/hero-bg.jpg"
 *   primaryCta={{ label: "Try Now", onClick: () => {} }}
 * />
 */

const heroVariants = cva(
  'relative flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface HeroProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof heroVariants> {
  title: string;
  subtitle?: string;
  primaryCta?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryCta?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  backgroundImage?: string;
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({
    className,
    title,
    subtitle,
    primaryCta,
    secondaryCta,
    backgroundImage,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(heroVariants(), className)}
      style={
        backgroundImage
          ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
      {...props}
    >
      <div className="max-w-4xl space-y-6">
        <h1
          className={cn(
            'text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl',
            backgroundImage
              ? 'text-white'
              : 'text-neutral-900 dark:text-neutral-100'
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              'text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto',
              backgroundImage
                ? 'text-neutral-100'
                : 'text-neutral-600 dark:text-neutral-400'
            )}
          >
            {subtitle}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {primaryCta && (
              <a
                href={primaryCta.href}
                onClick={primaryCta.onClick}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                onClick={secondaryCta.onClick}
                className={cn(
                  'inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md transition-colors',
                  backgroundImage
                    ? 'text-white border-2 border-white hover:bg-white/10'
                    : 'text-neutral-900 border-2 border-neutral-300 hover:bg-neutral-100 dark:text-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800'
                )}
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
);
Hero.displayName = 'Hero';

export { Hero, heroVariants };
