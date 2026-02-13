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
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option1" id="r1" />
 *     <label htmlFor="r1">Option 1</label>
 *   </div>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option2" id="r2" />
 *     <label htmlFor="r2">Option 2</label>
 *   </div>
 * </RadioGroup>
 *
 * @example
 * // Controlled radio group
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="yes" id="yes" />
 *     <label htmlFor="yes">Yes</label>
 *   </div>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="no" id="no" />
 *     <label htmlFor="no">No</label>
 *   </div>
 * </RadioGroup>
 *
 * @example
 * // Radio group with descriptions
 * <RadioGroup defaultValue="comfortable">
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="default" id="r1" />
 *     <label htmlFor="r1">Default</label>
 *   </div>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="comfortable" id="r2" />
 *     <label htmlFor="r2">Comfortable</label>
 *   </div>
 * </RadioGroup>
 */

const radioGroupVariants = cva(
  'grid gap-2',
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
    className={cn(radioGroupVariants(), className)}
    {...props}
    ref={ref}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const radioGroupItemVariants = cva(
  'aspect-square h-5 w-5 rounded-full border border-neutral-300 text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-primary-400',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(radioGroupItemVariants(), className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div className="h-2.5 w-2.5 rounded-full bg-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem, radioGroupVariants, radioGroupItemVariants };
