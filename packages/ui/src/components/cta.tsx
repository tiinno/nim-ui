import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * CTA (Call to Action) component for landing pages
 *
 * @example
 * // Basic CTA
 * <CTA
 *   title="Ready to get started?"
 *   description="Join thousands of satisfied customers"
 *   buttonText="Sign Up Now"
 *   onButtonClick={() => console.log('clicked')}
 * />
 *
 * @example
 * // CTA with custom styling
 * <CTA
 *   title="Start Your Free Trial"
 *   description="No credit card required"
 *   buttonText="Try for Free"
 *   buttonHref="/signup"
 *   variant="primary"
 * />
 *
 * @example
 * // CTA with secondary action
 * <CTA
 *   title="Boost Your Productivity"
 *   description="Join our community today"
 *   buttonText="Get Started"
 *   onButtonClick={() => {}}
 *   secondaryAction={<a href="/learn-more">Learn More</a>}
 * />
 */

const ctaVariants = cva(
  'relative overflow-hidden rounded-lg px-6 py-16 text-center',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 dark:bg-neutral-800',
        primary: 'bg-primary-600 text-white dark:bg-primary-700',
        gradient: 'bg-gradient-to-r from-primary-600 to-primary-800 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CTAProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ctaVariants> {
  title: string;
  description?: string;
  buttonText: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  secondaryAction?: React.ReactNode;
}

const CTA = React.forwardRef<HTMLDivElement, CTAProps>(
  ({
    className,
    variant,
    title,
    description,
    buttonText,
    buttonHref,
    onButtonClick,
    secondaryAction,
    ...props
  }, ref) => {
    const isColoredVariant = variant === 'primary' || variant === 'gradient';

    return (
      <div
        ref={ref}
        className={cn(ctaVariants({ variant }), className)}
        {...props}
      >
        <div className="mx-auto max-w-2xl space-y-6">
          <h2
            className={cn(
              'text-3xl font-bold tracking-tight sm:text-4xl',
              isColoredVariant
                ? 'text-white'
                : 'text-neutral-900 dark:text-neutral-100'
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                'text-lg',
                isColoredVariant
                  ? 'text-white/90'
                  : 'text-neutral-600 dark:text-neutral-400'
              )}
            >
              {description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href={buttonHref}
              onClick={onButtonClick}
              className={cn(
                'inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md transition-colors',
                isColoredVariant
                  ? 'bg-white text-primary-600 hover:bg-neutral-100'
                  : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600'
              )}
            >
              {buttonText}
            </a>
            {secondaryAction && <div>{secondaryAction}</div>}
          </div>
        </div>
      </div>
    );
  }
);
CTA.displayName = 'CTA';

export { CTA, ctaVariants };
