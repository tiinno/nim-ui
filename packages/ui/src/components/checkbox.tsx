import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Checkbox component built on Radix UI Checkbox
 *
 * @example
 * // Basic checkbox
 * <Checkbox id="terms" />
 *
 * @example
 * // Checkbox with label
 * <Checkbox id="terms" label="Accept terms and conditions" />
 *
 * @example
 * // Controlled checkbox
 * <Checkbox
 *   checked={isChecked}
 *   onCheckedChange={setIsChecked}
 * />
 */

const checkboxVariants = cva(
  'peer relative cursor-pointer shrink-0 rounded-sm border border-neutral-300 transition-[background-color,border-color] duration-fast ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=checked]:text-white data-[state=checked]:border-primary-600 dark:border-neutral-600 dark:data-[state=checked]:bg-primary-700 dark:data-[state=checked]:border-primary-700 after:absolute after:-inset-1.5 after:content-[\'\']',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const checkboxIndicatorVariants = cva('stroke-current', {
  variants: {
    size: {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      id,
      className,
      label,
      description,
      wrapperClassName,
      labelClassName,
      descriptionClassName,
      disabled,
      size,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const hasLabelContent = label != null || description != null;
    const checkboxId = id ?? (hasLabelContent ? `${generatedId}-checkbox` : undefined);
    const labelId = label != null && checkboxId ? `${checkboxId}-label` : undefined;
    const descriptionId = description != null && checkboxId ? `${checkboxId}-description` : undefined;
    const labelledBy = [ariaLabelledBy, labelId].filter(Boolean).join(' ') || undefined;
    const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;

    const control = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(checkboxVariants({ size }), className)}
        disabled={disabled}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <svg
            className={checkboxIndicatorVariants({ size })}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!hasLabelContent) {
      return control;
    }

    return (
      <div
        className={cn(
          'group/checkbox flex min-w-0 items-start gap-3 rounded-md py-1.5 text-left',
          disabled && 'opacity-60',
          wrapperClassName
        )}
      >
        <div className="flex h-6 shrink-0 items-center">
          {control}
        </div>
        <label
          htmlFor={checkboxId}
          className={cn(
            'grid min-w-0 cursor-pointer gap-0.5 pt-0.5 text-sm leading-5',
            disabled && 'cursor-not-allowed',
            labelClassName
          )}
        >
          {label != null && (
            <span
              id={labelId}
              className="font-medium text-neutral-900 dark:text-neutral-100"
            >
              {label}
            </span>
          )}
          {description != null && (
            <span
              id={descriptionId}
              className={cn('text-neutral-500 dark:text-neutral-400', descriptionClassName)}
            >
              {description}
            </span>
          )}
        </label>
      </div>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, checkboxVariants };
