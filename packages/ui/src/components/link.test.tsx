import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { Link, linkVariants } from './link';

describe('Link', () => {
  describe('Rendering', () => {
    it('renders an anchor with children', () => {
      render(<Link href="/orders/1042">Order #1042</Link>);
      const link = screen.getByRole('link', { name: 'Order #1042' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/orders/1042');
    });

    it('applies base styles', () => {
      render(<Link href="/a">Base</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('rounded-sm');
      expect(link).toHaveClass('transition-colors');
      expect(link).toHaveClass('focus-visible:outline-none');
      expect(link).toHaveClass('focus-visible:ring-2');
      expect(link).toHaveClass('focus-visible:ring-primary-400');
      expect(link).toHaveClass('focus-visible:ring-offset-2');
    });
  });

  describe('Variants', () => {
    it('renders default variant with steel accent', () => {
      render(<Link href="/a">Default</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-primary-600');
      expect(link).toHaveClass('underline-offset-4');
      expect(link).toHaveClass('hover:underline');
      expect(link).toHaveClass('dark:text-primary-300');
    });

    it('renders subtle variant with quiet underline', () => {
      render(
        <Link href="/a" variant="subtle">
          Subtle
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-neutral-600');
      expect(link).toHaveClass('underline');
      expect(link).toHaveClass('decoration-neutral-300');
      expect(link).toHaveClass('hover:text-neutral-950');
      expect(link).toHaveClass('dark:text-neutral-400');
      expect(link).toHaveClass('dark:decoration-neutral-700');
    });

    it('renders standalone variant with medium weight', () => {
      render(
        <Link href="/a" variant="standalone">
          View all
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('font-medium');
      expect(link).toHaveClass('text-primary-700');
      expect(link).toHaveClass('hover:text-primary-900');
      expect(link).toHaveClass('dark:text-primary-300');
    });
  });

  describe('External links', () => {
    it('sets target and safe rel', () => {
      render(
        <Link href="https://status.example.com" external>
          Status page
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders an aria-hidden external icon', () => {
      render(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      const icon = screen.getByTestId('link-external-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveClass('size-3');
    });

    it('announces new-tab behavior to screen readers', () => {
      render(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      const note = screen.getByText('(opens in new tab)');
      expect(note).toHaveClass('sr-only');
    });

    it('does not add icon or target for internal links', () => {
      render(<Link href="/internal">Internal</Link>);
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
      expect(screen.queryByTestId('link-external-icon')).not.toBeInTheDocument();
    });

    it('respects explicit target when not external', () => {
      render(
        <Link href="/internal" target="_parent">
          Parent target
        </Link>
      );
      expect(screen.getByRole('link')).toHaveAttribute('target', '_parent');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the anchor element', () => {
      const ref = createRef<HTMLAnchorElement>();
      render(
        <Link href="/a" ref={ref}>
          Ref
        </Link>
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe('linkVariants', () => {
    it('returns classes for a variant', () => {
      const result = linkVariants({ variant: 'standalone' });
      expect(result).toContain('font-medium');
      expect(result).toContain('text-primary-700');
    });

    it('applies default variant', () => {
      expect(linkVariants({})).toContain('text-primary-600');
    });
  });

  describe('Customization', () => {
    it('merges custom className', () => {
      render(
        <Link href="/a" className="ml-1">
          Custom
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('ml-1');
      expect(link).toHaveClass('text-primary-600');
    });

    it('passes through HTML attributes', () => {
      render(
        <Link href="/a" data-testid="link" download>
          Download
        </Link>
      );
      expect(screen.getByTestId('link')).toHaveAttribute('download');
    });
  });
});
