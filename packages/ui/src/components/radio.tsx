import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Radio component built on Radix UI RadioGroup
 *
 * @example
 * // Basic radio group
 * <RadioGroup defaultValue="option1">
 *   <Radio value="option1" label="Option 1" />
 *   <Radio value="option2" label="Option 2" />
 * </RadioGroup>
 *
 * @example
 * // Controlled radio group
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <Radio value="yes" label="Yes" />
 *   <Radio value="no" label="No" />
 * </RadioGroup>
 *
 * @example
 * // Radio group with descriptions
 * <RadioGroup defaultValue="comfortable">
 *   <Radio value="default" label="Default" />
 *   <Radio
 *     value="comfortable"
 *     label="Comfortable"
 *     description="Adds a little more breathing room for operators."
 *   />
 * </RadioGroup>
 */

const radioGroupVariants = cva(
  'grid gap-2.5',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof radioGroupVariants> {}

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn(
      !/\b(?:flex|grid|inline-flex|inline-grid)\b/.test(className ?? '') &&
        radioGroupVariants(),
      className
    )}
    {...props}
    ref={ref}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const radioGroupItemVariants = cva(
  'relative aspect-square shrink-0 cursor-pointer rounded-full border border-neutral-300 text-primary-600 transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-primary-400 after:absolute after:-inset-1.5 after:content-[\'\']',
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

const radioGroupIndicatorVariants = cva('rounded-full bg-current', {
  variants: {
    size: {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(radioGroupItemVariants({ size }), className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div className={radioGroupIndicatorVariants({ size })} />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export interface RadioProps extends RadioGroupItemProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}

const Radio = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(
  (
    {
      id,
      label,
      description,
      className,
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
    const radioId = id ?? (hasLabelContent ? `${generatedId}-radio` : undefined);
    const labelId = label != null && radioId ? `${radioId}-label` : undefined;
    const descriptionId = description != null && radioId ? `${radioId}-description` : undefined;
    const labelledBy = [ariaLabelledBy, labelId].filter(Boolean).join(' ') || undefined;
    const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;

    const item = (
      <RadioGroupItem
        ref={ref}
        id={radioId}
        className={className}
        disabled={disabled}
        size={size}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        {...props}
      />
    );

    if (!hasLabelContent) {
      return item;
    }

    return (
      <div
        className={cn(
          'group/radio flex min-w-0 items-start gap-3 rounded-md py-1.5 text-left',
          disabled && 'opacity-60',
          wrapperClassName
        )}
      >
        <div className="flex h-6 shrink-0 items-center">
          {item}
        </div>
        <label
          htmlFor={radioId}
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
Radio.displayName = 'Radio';

export { RadioGroup, RadioGroupItem, Radio, radioGroupVariants, radioGroupItemVariants };
