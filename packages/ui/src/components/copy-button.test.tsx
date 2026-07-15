import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { CopyButton, copyButtonVariants } from './copy-button';

describe('CopyButton', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders a button with accessible label', () => {
      render(<CopyButton value="ord_123" />);
      expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    });

    it('shows the copy icon initially', () => {
      render(<CopyButton value="ord_123" />);
      expect(screen.getByTestId('copy-button-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('copy-button-check')).not.toBeInTheDocument();
    });

    it('applies ghost styles including dark mode', () => {
      render(<CopyButton value="ord_123" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-md');
      expect(button).toHaveClass('text-neutral-500');
      expect(button).toHaveClass('hover:bg-neutral-100');
      expect(button).toHaveClass('focus-visible:ring-primary-400');
      expect(button).toHaveClass('dark:text-neutral-400');
      expect(button).toHaveClass('dark:hover:bg-neutral-800');
    });

    it('uses type=button to stay form-safe', () => {
      render(<CopyButton value="ord_123" />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('Sizes', () => {
    it('renders sm size by default', () => {
      render(<CopyButton value="v" />);
      expect(screen.getByRole('button')).toHaveClass('size-6');
    });

    it('renders md size', () => {
      render(<CopyButton value="v" size="md" />);
      expect(screen.getByRole('button')).toHaveClass('size-7');
    });
  });

  describe('Copying', () => {
    it('writes the value to the clipboard', async () => {
      render(<CopyButton value="ord_2f9c8a71" />);
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() =>
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ord_2f9c8a71')
      );
    });

    it('shows the check icon and announces after copying', async () => {
      render(<CopyButton value="v" />);
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => {
        expect(screen.getByTestId('copy-button-check')).toBeInTheDocument();
      });
      expect(screen.getByText('Copied')).toHaveClass('sr-only');
    });

    it('calls onCopied after a successful copy', async () => {
      const onCopied = vi.fn();
      render(<CopyButton value="v" onCopied={onCopied} />);
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => expect(onCopied).toHaveBeenCalledTimes(1));
    });

    it('reverts to the copy icon after the timeout', async () => {
      render(<CopyButton value="v" timeout={50} />);
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => {
        expect(screen.getByTestId('copy-button-check')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('copy-button-icon')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('copy-button-check')).not.toBeInTheDocument();
    });

    it('falls back to execCommand when the Clipboard API is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
      const execCommand = vi.fn().mockReturnValue(true);
      document.execCommand = execCommand;
      render(<CopyButton value="fallback-value" />);
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
      await waitFor(() => {
        expect(screen.getByTestId('copy-button-check')).toBeInTheDocument();
      });
    });

    it('still calls a provided onClick handler', () => {
      const onClick = vi.fn();
      render(<CopyButton value="v" onClick={onClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the button element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<CopyButton value="v" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('copyButtonVariants', () => {
    it('returns classes for a size', () => {
      const result = copyButtonVariants({ size: 'md' });
      expect(result).toContain('size-7');
      expect(result).toContain('rounded-md');
    });
  });

  describe('Customization', () => {
    it('merges custom className', () => {
      render(<CopyButton value="v" className="ml-2" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ml-2');
      expect(button).toHaveClass('rounded-md');
    });

    it('supports overriding the aria-label', () => {
      render(<CopyButton value="v" aria-label="Copy order id" />);
      expect(screen.getByRole('button', { name: 'Copy order id' })).toBeInTheDocument();
    });
  });
});
