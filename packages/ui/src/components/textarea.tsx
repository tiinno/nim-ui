import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Textarea component with validation states and sizes
 *
 * @example
 * // Default textarea
 * <Textarea placeholder="Enter your message..." />
 *
 * @example
 * // Textarea with error state
 * <Textarea variant="error" placeholder="Invalid input" />
 *
 * @example
 * // Large textarea with no resize
 * <Textarea size="lg" resize={false} rows={6} />
 */

const textareaVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-base transition-[border-color,box-shadow] duration-fast ease-in-out placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:placeholder:text-neutral-400',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus-visible:ring-primary-500 dark:border-neutral-600 dark:text-neutral-100',
        error: 'border-red-500 focus-visible:ring-red-500 text-red-900 dark:border-red-400 dark:text-red-100',
        success: 'border-green-500 focus-visible:ring-green-500 text-green-900 dark:border-green-400 dark:text-green-100',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  resize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, resize = true, rows = 4, ...props }, ref) => (
    <textarea
      className={cn(
        textareaVariants({ variant, size }),
        !resize && 'resize-none',
        className
      )}
      ref={ref}
      rows={rows}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
