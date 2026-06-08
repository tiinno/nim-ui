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
  'inline-flex items-center justify-center rounded-md font-medium shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition-all duration-fast active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:ring-primary-400 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white',
        default: 'bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:ring-primary-400 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-primary-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
        outline: 'border border-neutral-200 bg-white/70 text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:ring-primary-300 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-900',
        ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:ring-primary-300 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50',
        destructive: 'bg-error-700 text-white hover:bg-error-800 focus-visible:ring-error-400 dark:bg-error-300 dark:text-error-950 dark:hover:bg-error-200',
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
  fullWidth?: boolean;
}

const spinnerSizeMap: Record<string, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, fullWidth, children, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
      ref={ref}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg
          className={cn('animate-spin -ml-1 mr-2', spinnerSizeMap[size ?? 'md'])}
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
