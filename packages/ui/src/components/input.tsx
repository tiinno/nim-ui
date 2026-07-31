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
 *
 * Validation state is carried by the BORDER (and the text colour); the focus
 * indicator stays steel in every variant. The error and success variants used
 * to tint the ring to match their border, and NIMUI-55 ruled against it: the
 * error 500 step measures 2.99:1 against the 800 surface in dark mode, under
 * the 3:1 WCAG 2.2 SC 1.4.11 (AA) asks of a focus indicator, and the tint was
 * paying that in exchange for nothing — validity is already stated by the
 * border, by the text colour and, for assistive technology, by `aria-invalid`
 * and the field's message, none of which a ring colour reaches. Keeping the two
 * states on two different channels also lets a user read them independently:
 * the steel ring says WHERE the caret is, the coloured border says WHAT the
 * field thinks of its value.
 */

const inputVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 transition-[border-color] duration-(--duration-fast) ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:placeholder:text-neutral-400',
  {
    variants: {
      variant: {
        default:'border-neutral-300 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 focus-visible:outline-primary-500 dark:focus-visible:outline-primary-400 dark:border-neutral-600 dark:text-neutral-100',
        error:'border-error-500 focus-visible:outline-primary-500 dark:focus-visible:outline-primary-400 text-error-900 dark:border-error-400 dark:text-error-100',
        success:'border-success-500 focus-visible:outline-primary-500 dark:focus-visible:outline-primary-400 text-success-900 dark:border-success-400 dark:text-success-100',
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-9 text-sm',
        lg: 'h-10 text-base',
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
