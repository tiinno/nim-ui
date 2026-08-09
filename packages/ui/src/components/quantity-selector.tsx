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
  'inline-flex items-center overflow-hidden rounded-md border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900',
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
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof quantitySelectorVariants> {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

const QuantitySelector = React.forwardRef<
  HTMLDivElement,
  QuantitySelectorProps
>(({ className, value, min = 1, max = 99, size, onChange, ...props }, ref) => {
  const resolvedSize = size ?? 'md';

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
    'flex h-full cursor-pointer items-center justify-center font-medium leading-none text-neutral-700 transition-colors duration-(--duration-fast) active:scale-[0.97] hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-neutral-500 disabled:hover:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-primary-400 dark:disabled:text-neutral-400 dark:disabled:hover:bg-transparent',
    resolvedSize === 'sm' && 'px-2.5 text-sm',
    resolvedSize === 'md' && 'px-3 text-base',
    resolvedSize === 'lg' && 'px-3.5 text-lg'
  );

  const inputClass = cn(
    'h-full border-x border-neutral-300 bg-transparent text-center font-medium tabular-nums text-neutral-900 [appearance:textfield] focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 dark:border-neutral-700 dark:text-neutral-100 dark:focus-visible:outline-primary-400 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
    resolvedSize === 'sm' && 'w-10 text-sm',
    resolvedSize === 'md' && 'w-12 text-base',
    resolvedSize === 'lg' && 'w-14 text-lg'
  );

  return (
    <div
      ref={ref}
      className={cn(
        quantitySelectorVariants({ size: resolvedSize }),
        className
      )}
      {...props}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={buttonClass}
        aria-label="Decrease quantity"
      >
        −
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
});
QuantitySelector.displayName = 'QuantitySelector';

export { QuantitySelector, quantitySelectorVariants };
