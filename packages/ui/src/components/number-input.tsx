import * as React from 'react';
import { cn } from '../lib/utils';
import { inputVariants } from './input';

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'size'
  > {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  showSteppers?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const clamp = (value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
};

const roundToPrecision = (value: number, precision?: number) => {
  if (precision === undefined) return value;
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      precision,
      showSteppers = true,
      size = 'md',
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<
      number | undefined
    >(defaultValue);
    const selected = value ?? internalValue;

    const commit = (nextValue: number | undefined) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.(nextValue);
    };

    const commitNumber = (nextValue: number) => {
      commit(roundToPrecision(clamp(nextValue, min, max), precision));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === '') {
        commit(undefined);
        return;
      }

      const nextValue = Number(event.target.value);
      if (!Number.isNaN(nextValue)) {
        commitNumber(nextValue);
      }
    };

    const stepValue = (direction: 1 | -1) => {
      commitNumber((selected ?? 0) + step * direction);
    };

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type="number"
          value={selected ?? ''}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            inputVariants({ size }),
            showSteppers && 'pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            className
          )}
          onChange={handleInputChange}
          {...props}
        />
        {showSteppers && (
          <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
              aria-label="Decrease value"
              onClick={() => stepValue(-1)}
              disabled={disabled || (min !== undefined && (selected ?? 0) <= min)}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 6h6" />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
              aria-label="Increase value"
              onClick={() => stepValue(1)}
              disabled={disabled || (max !== undefined && (selected ?? 0) >= max)}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 3v6M3 6h6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };
