import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * QuantitySelector component for selecting product quantities
 *
 * @example
 * // Basic quantity selector
 * <QuantitySelector value={1} onChange={(qty) => console.log(qty)} />
 *
 * @example
 * // Quantity selector with min/max
 * <QuantitySelector
 *   value={5}
 *   min={1}
 *   max={10}
 *   onChange={(qty) => console.log(qty)}
 * />
 *
 * @example
 * // Large quantity selector
 * <QuantitySelector
 *   value={3}
 *   size="lg"
 *   onChange={(qty) => console.log(qty)}
 * />
 */

const quantitySelectorVariants = cva(
  'inline-flex items-center border rounded-md bg-white dark:bg-neutral-900 dark:border-neutral-700',
  {
    variants: {
      size: {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface QuantitySelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof quantitySelectorVariants> {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

const QuantitySelector = React.forwardRef<HTMLDivElement, QuantitySelectorProps>(
  ({ className, value, min = 1, max = 99, size, onChange, ...props }, ref) => {
    const handleDecrement = () => {
      const newValue = Math.max(min, value - 1);
      onChange?.(newValue);
    };

    const handleIncrement = () => {
      const newValue = Math.min(max, value + 1);
      onChange?.(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange?.(newValue);
      }
    };

    const buttonClass = cn(
      'px-3 font-medium transition-colors hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-neutral-800 dark:text-neutral-100',
      size === 'sm' && 'text-sm',
      size === 'md' && 'text-base',
      size === 'lg' && 'text-lg'
    );

    const inputClass = cn(
      'w-12 text-center border-x bg-transparent font-medium text-neutral-900 dark:text-neutral-100 dark:border-neutral-700 focus:outline-none',
      size === 'sm' && 'text-sm',
      size === 'md' && 'text-base',
      size === 'lg' && 'text-lg'
    );

    return (
      <div
        ref={ref}
        className={cn(quantitySelectorVariants({ size }), className)}
        {...props}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={buttonClass}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className={inputClass}
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={buttonClass}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }
);
QuantitySelector.displayName = 'QuantitySelector';

export { QuantitySelector, quantitySelectorVariants };
