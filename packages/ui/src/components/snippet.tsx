import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { CopyButton } from './copy-button';

/**
 * Snippet component for copyable operational values
 *
 * A quiet mono field for record IDs, API keys, and webhook URLs with a
 * built-in CopyButton. The optional prefix (e.g. "$") is display-only —
 * only `text` is copied.
 *
 * @example
 * <Snippet text="ord_2f9c8a71-44d0-4b7e" />
 *
 * @example
 * // Command with display-only prompt
 * <Snippet prefix="$" text="pnpm add @nim-ui/components" />
 */

const snippetVariants = cva(
  'flex w-full min-w-0 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300',
  {
    variants: {
      size: {
        sm: 'py-1 pl-2.5 pr-1 text-xs',
        md: 'py-1.5 pl-3 pr-1.5 text-xs',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SnippetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof snippetVariants> {
  /** Value shown and copied verbatim */
  text: string;
  /** Display-only lead-in (e.g. "$") — never copied */
  prefix?: string;
}

const Snippet = React.forwardRef<HTMLDivElement, SnippetProps>(
  ({ className, text, prefix, size, ...props }, ref) => (
    <div ref={ref} className={cn(snippetVariants({ size }), className)} {...props}>
      {prefix && (
        <span aria-hidden="true" className="select-none text-neutral-400 dark:text-neutral-600">
          {prefix}
        </span>
      )}
      <span data-testid="snippet-text" className="min-w-0 flex-1 select-all truncate">
        {text}
      </span>
      <CopyButton value={text} />
    </div>
  )
);
Snippet.displayName = 'Snippet';

export { Snippet, snippetVariants };
