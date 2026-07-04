import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { inputVariants } from './input';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof inputVariants> {
  showLabel?: string;
  hideLabel?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      variant,
      size,
      disabled,
      showLabel = 'Show password',
      hideLabel = 'Hide password',
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(inputVariants({ variant, size }), 'pr-10', className)}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-md text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-50"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
        >
          {visible ? (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />
              <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5 0 9 4 10 8a11.8 11.8 0 0 1-2.3 4.1" />
              <path d="M6.2 6.2A11.7 11.7 0 0 0 2 12c1 4 5 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
