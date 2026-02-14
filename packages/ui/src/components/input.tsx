import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Input component with validation states and sizes
 *
 * @example
 * // Default input
 * <Input placeholder="Enter text..." />
 *
 * @example
 * // Input with error state
 * <Input variant="error" placeholder="Invalid input" />
 *
 * @example
 * // Large success input
 * <Input variant="success" size="lg" placeholder="Valid input" />
 */

const inputVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-base transition-[border-color,box-shadow] duration-fast ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:placeholder:text-neutral-400',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus-visible:ring-primary-500 dark:border-neutral-600 dark:text-neutral-100',
        error: 'border-red-500 focus-visible:ring-red-500 text-red-900 dark:border-red-400 dark:text-red-100',
        success: 'border-green-500 focus-visible:ring-green-500 text-green-900 dark:border-green-400 dark:text-green-100',
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-base',
        lg: 'h-12 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type = 'text', leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 dark:text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
