import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Button component with multiple variants and sizes
 *
 * @example
 * // Default button
 * <Button>Click me</Button>
 *
 * @example
 * // Button with variant and size
 * <Button variant="outline" size="lg">Large Outline Button</Button>
 *
 * @example
 * // Destructive button
 * <Button variant="destructive">Delete</Button>
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-fast active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600',
        secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus-visible:ring-neutral-400 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600',
        outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-100 focus-visible:ring-neutral-400 dark:border-neutral-600 dark:hover:bg-neutral-800 dark:text-neutral-100',
        ghost: 'bg-transparent hover:bg-neutral-100 focus-visible:ring-neutral-400 dark:hover:bg-neutral-800 dark:text-neutral-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 py-1.5 text-sm',
        md: 'h-10 px-4 py-2 text-base',
        lg: 'h-12 px-6 py-3 text-lg',
        xl: 'h-14 px-8 py-4 text-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
