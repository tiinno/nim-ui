import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Kbd component for displaying keyboard keys and shortcuts
 *
 * Renders a semantic `<kbd>` element styled to match CommandMenuShortcut.
 * Compose multi-key shortcuts with KbdGroup.
 *
 * @example
 * // Single key
 * <Kbd>Esc</Kbd>
 *
 * @example
 * // Key combination
 * <KbdGroup aria-label="Command K">
 *   <Kbd>⌘</Kbd>
 *   <Kbd>K</Kbd>
 * </KbdGroup>
 */

const kbdVariants = cva(
  'inline-flex items-center justify-center rounded border border-neutral-200 bg-neutral-50 font-mono font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400',
  {
    variants: {
      size: {
        sm: 'h-5 min-w-5 px-1 text-[11px]',
        md: 'h-6 min-w-6 px-1.5 text-xs',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, size, ...props }, ref) => (
  <kbd className={cn(kbdVariants({ size }), className)} ref={ref} {...props} />
));
Kbd.displayName = 'Kbd';

export interface KbdGroupProps extends React.HTMLAttributes<HTMLSpanElement> {}

const KbdGroup = React.forwardRef<HTMLSpanElement, KbdGroupProps>(
  ({ className, ...props }, ref) => (
    <span className={cn('inline-flex items-center gap-1', className)} ref={ref} {...props} />
  )
);
KbdGroup.displayName = 'KbdGroup';

export { Kbd, KbdGroup, kbdVariants };
