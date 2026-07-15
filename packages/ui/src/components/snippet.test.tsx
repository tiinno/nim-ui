import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { Snippet, snippetVariants } from './snippet';

describe('Snippet', () => {
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
    it('renders the text value', () => {
      render(<Snippet text="ord_2f9c8a71-44d0-4b7e" />);
      expect(screen.getByText('ord_2f9c8a71-44d0-4b7e')).toBeInTheDocument();
    });

    it('applies mono field styles including dark mode', () => {
      render(<Snippet data-testid="snippet" text="value" />);
      const snippet = screen.getByTestId('snippet');
      expect(snippet).toHaveClass('flex');
      expect(snippet).toHaveClass('w-full');
      expect(snippet).toHaveClass('rounded-md');
      expect(snippet).toHaveClass('border');
      expect(snippet).toHaveClass('border-neutral-200');
      expect(snippet).toHaveClass('bg-neutral-50');
      expect(snippet).toHaveClass('font-mono');
      expect(snippet).toHaveClass('dark:border-neutral-800');
      expect(snippet).toHaveClass('dark:bg-neutral-900');
    });

    it('makes the value easy to select manually', () => {
      render(<Snippet text="value" />);
      const text = screen.getByTestId('snippet-text');
      expect(text).toHaveClass('select-all');
      expect(text).toHaveClass('truncate');
    });

    it('includes a copy button', () => {
      render(<Snippet text="value" />);
      expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    });
  });

  describe('Prefix', () => {
    it('renders a display-only prefix', () => {
      render(<Snippet prefix="$" text="pnpm add @nim-ui/components" />);
      const prefix = screen.getByText('$');
      expect(prefix).toHaveAttribute('aria-hidden', 'true');
      expect(prefix).toHaveClass('select-none');
    });

    it('omits the prefix element when not provided', () => {
      render(<Snippet data-testid="snippet" text="value" />);
      expect(screen.getByTestId('snippet').querySelector('.select-none')).toBeNull();
    });
  });

  describe('Copying', () => {
    it('copies only the text, never the prefix', async () => {
      render(<Snippet prefix="$" text="pnpm add @nim-ui/components" />);
      fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));
      await waitFor(() =>
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('pnpm add @nim-ui/components')
      );
    });
  });

  describe('Sizes', () => {
    it('renders md size by default', () => {
      render(<Snippet data-testid="snippet" text="value" />);
      const snippet = screen.getByTestId('snippet');
      expect(snippet).toHaveClass('py-1.5');
      expect(snippet).toHaveClass('pl-3');
    });

    it('renders sm size', () => {
      render(<Snippet data-testid="snippet" text="value" size="sm" />);
      const snippet = screen.getByTestId('snippet');
      expect(snippet).toHaveClass('py-1');
      expect(snippet).toHaveClass('pl-2.5');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Snippet ref={ref} text="value" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('snippetVariants', () => {
    it('returns classes for a size', () => {
      const result = snippetVariants({ size: 'sm' });
      expect(result).toContain('py-1');
      expect(result).toContain('font-mono');
    });
  });

  describe('Customization', () => {
    it('merges custom className', () => {
      render(<Snippet data-testid="snippet" text="value" className="max-w-sm" />);
      const snippet = screen.getByTestId('snippet');
      expect(snippet).toHaveClass('max-w-sm');
      expect(snippet).toHaveClass('font-mono');
    });

    it('passes through HTML attributes', () => {
      render(<Snippet data-testid="snippet" text="value" id="order-id" />);
      expect(screen.getByTestId('snippet')).toHaveAttribute('id', 'order-id');
    });
  });
});
