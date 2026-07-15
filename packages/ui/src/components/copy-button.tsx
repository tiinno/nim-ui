import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * CopyButton component for copying a value to the clipboard
 *
 * Ghost icon button with copied feedback: the icon flips to a success check
 * for `timeout` ms and the change is announced via a polite live region.
 * Falls back to document.execCommand('copy') where the Clipboard API is
 * unavailable (non-secure contexts).
 *
 * @example
 * <CopyButton value="ord_2f9c8a71" />
 *
 * @example
 * <CopyButton value={webhookUrl} timeout={1500} onCopied={() => track('copied')} />
 */

const copyButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  {
    variants: {
      size: {
        sm: 'size-6',
        md: 'size-7',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

function copyViaExecCommand(value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function copyToClipboard(value: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    // The Clipboard API can reject even when present (unfocused document,
    // permission policy) — fall back to execCommand instead of failing.
    return navigator.clipboard.writeText(value).catch(() => copyViaExecCommand(value));
  }
  return copyViaExecCommand(value);
}

export interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'>,
    VariantProps<typeof copyButtonVariants> {
  /** Text copied to the clipboard */
  value: string;
  /** How long the copied state shows, in ms */
  timeout?: number;
  /** Called after a successful copy */
  onCopied?: () => void;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ className, value, timeout = 2000, onCopied, onClick, size, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    React.useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      void copyToClipboard(value).then(() => {
        setCopied(true);
        onCopied?.();
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), timeout);
      });
    };

    return (
      <button
        type="button"
        aria-label="Copy to clipboard"
        className={cn(copyButtonVariants({ size }), className)}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {copied ? (
          <svg
            data-testid="copy-button-check"
            className="size-3.5 text-success-600 dark:text-success-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            data-testid="copy-button-icon"
            className="size-3.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
        <span aria-live="polite" className="sr-only">
          {copied ? 'Copied' : ''}
        </span>
      </button>
    );
  }
);
CopyButton.displayName = 'CopyButton';

export { CopyButton, copyButtonVariants };
