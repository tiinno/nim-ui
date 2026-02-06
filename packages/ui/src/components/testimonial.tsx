import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Testimonial component for displaying customer reviews
 *
 * @example
 * // Basic testimonial
 * <Testimonial
 *   quote="This product changed my life!"
 *   author="John Doe"
 * />
 *
 * @example
 * // Testimonial with avatar and company
 * <Testimonial
 *   quote="Excellent service and support. Highly recommended!"
 *   author="Jane Smith"
 *   company="Acme Corp"
 *   avatar="/avatar.jpg"
 * />
 *
 * @example
 * // Testimonial with role
 * <Testimonial
 *   quote="The best tool we've ever used for our team."
 *   author="Mike Johnson"
 *   role="CEO"
 *   company="TechStart Inc"
 *   avatar="/mike.jpg"
 * />
 */

const testimonialVariants = cva(
  'rounded-lg border bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-700',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface TestimonialProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof testimonialVariants> {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
}

const Testimonial = React.forwardRef<HTMLDivElement, TestimonialProps>(
  ({ className, quote, author, role, company, avatar, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(testimonialVariants(), className)}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-1 text-primary-600 dark:text-primary-400">
          <svg
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        <blockquote className="text-lg text-neutral-900 dark:text-neutral-100">
          {quote}
        </blockquote>
        <div className="flex items-center gap-4 pt-2">
          {avatar && (
            <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <img
                src={avatar}
                alt={author}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {author}
            </p>
            {(role || company) && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {role}
                {role && company && ', '}
                {company}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
);
Testimonial.displayName = 'Testimonial';

export { Testimonial, testimonialVariants };
