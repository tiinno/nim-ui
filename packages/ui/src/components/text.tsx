import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Text component for standardized typography
 *
 * Renders semantic text elements with a compact operational type scale.
 * `as` controls the rendered element (semantics), `variant` controls the
 * visual style and defaults to the `as` value — so an `h2` can render with
 * `h3` styling without losing its heading level.
 *
 * @example
 * // Paragraph (default)
 * <Text>Order queue is empty.</Text>
 *
 * @example
 * // Semantic h2 styled as h3
 * <Text as="h2" variant="h3">Shipment details</Text>
 *
 * @example
 * // Secondary tone with truncation
 * <Text tone="secondary" truncate>Long record identifier…</Text>
 */

const textVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-2xl tracking-tight',
      h2: 'text-xl tracking-tight',
      h3: 'text-lg',
      h4: 'text-base',
      h5: 'text-sm',
      h6: 'text-xs uppercase tracking-wide',
      p: 'text-sm leading-6',
      span: 'text-sm',
      small: 'text-xs leading-5',
      blockquote: 'border-l-2 border-neutral-200 pl-4 text-sm italic dark:border-neutral-800',
    },
    tone: {
      default: 'text-neutral-900 dark:text-neutral-100',
      secondary: 'text-neutral-500 dark:text-neutral-400',
      success: 'text-success-700 dark:text-success-400',
      warning: 'text-warning-700 dark:text-warning-400',
      error: 'text-error-700 dark:text-error-400',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    truncate: {
      true: 'truncate',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});

type TextElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'small'
  | 'blockquote';

// Font weight lives outside the variant strings so an explicit `weight` prop
// always wins — `cn` is plain clsx and cannot resolve conflicting font-* classes.
const defaultWeights: Record<TextElement, 'normal' | 'medium' | 'semibold'> = {
  h1: 'semibold',
  h2: 'semibold',
  h3: 'semibold',
  h4: 'medium',
  h5: 'medium',
  h6: 'medium',
  p: 'normal',
  span: 'normal',
  small: 'normal',
  blockquote: 'normal',
};

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  /** Rendered HTML element; also the default visual variant */
  as?: TextElement;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, as = 'p', variant, tone, weight, truncate, ...props }, ref) => {
    const resolvedVariant = variant ?? as;
    const resolvedWeight = weight ?? defaultWeights[resolvedVariant];
    return React.createElement(as, {
      ref,
      className: cn(
        textVariants({ variant: resolvedVariant, tone, weight: resolvedWeight, truncate }),
        className
      ),
      ...props,
    });
  }
);
Text.displayName = 'Text';

export { Text, textVariants };
