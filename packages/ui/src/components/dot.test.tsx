import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { Dot, dotVariants } from './dot';

describe('Dot', () => {
  describe('Rendering', () => {
    it('renders a label alongside the dot', () => {
      render(<Dot status="active">Online</Dot>);
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByTestId('dot-indicator')).toBeInTheDocument();
    });

    it('renders a bare dot without a label span', () => {
      render(<Dot data-testid="dot" status="failed" />);
      const root = screen.getByTestId('dot');
      expect(root.querySelector('.truncate')).toBeNull();
      expect(screen.getByTestId('dot-indicator')).toBeInTheDocument();
    });

    it('applies wrapper layout styles including dark mode', () => {
      render(<Dot data-testid="dot">Label</Dot>);
      const root = screen.getByTestId('dot');
      expect(root).toHaveClass('inline-flex');
      expect(root).toHaveClass('min-w-0');
      expect(root).toHaveClass('items-center');
      expect(root).toHaveClass('gap-1.5');
      expect(root).toHaveClass('text-sm');
      expect(root).toHaveClass('text-neutral-700');
      expect(root).toHaveClass('dark:text-neutral-300');
    });

    it('truncates the label', () => {
      render(<Dot>Very long operational label</Dot>);
      expect(screen.getByText('Very long operational label')).toHaveClass('truncate');
    });
  });

  describe('Statuses', () => {
    it.each([
      ['active', 'bg-success-500'],
      ['pending', 'bg-neutral-400'],
      ['processing', 'bg-info-500'],
      ['success', 'bg-success-500'],
      ['warning', 'bg-warning-500'],
      ['failed', 'bg-error-500'],
      ['blocked', 'bg-error-600'],
      ['archived', 'bg-neutral-400'],
    ])('renders %s status with correct color', (status, cls) => {
      render(<Dot status={status as any}>{status}</Dot>);
      expect(screen.getByTestId('dot-indicator')).toHaveClass(cls);
    });

    it('defaults to pending', () => {
      render(<Dot>Default</Dot>);
      expect(screen.getByTestId('dot-indicator')).toHaveClass('bg-neutral-400');
    });
  });

  describe('Sizes', () => {
    it.each([
      ['sm', 'size-1.5'],
      ['md', 'size-2'],
      ['lg', 'size-2.5'],
    ])('renders %s size', (size, cls) => {
      render(<Dot size={size as any}>{size}</Dot>);
      expect(screen.getByTestId('dot-indicator')).toHaveClass(cls);
    });

    it('defaults to sm for table density', () => {
      render(<Dot>Default</Dot>);
      expect(screen.getByTestId('dot-indicator')).toHaveClass('size-1.5');
    });
  });

  describe('Pulse', () => {
    it('animates when pulse is set', () => {
      render(
        <Dot status="processing" pulse>
          Syncing
        </Dot>
      );
      expect(screen.getByTestId('dot-indicator')).toHaveClass('animate-pulse');
    });

    it('does not animate by default', () => {
      render(<Dot>Static</Dot>);
      expect(screen.getByTestId('dot-indicator')).not.toHaveClass('animate-pulse');
    });
  });

  describe('Accessibility', () => {
    it('hides the dot indicator from assistive tech', () => {
      render(<Dot>Label</Dot>);
      expect(screen.getByTestId('dot-indicator')).toHaveAttribute('aria-hidden', 'true');
    });

    // Replaces a vacuous test that asserted `getByLabelText('Failed')` against
    // `<Dot aria-label="Failed" />`. That was green against markup that does not
    // work: the wrapper is a role-less <span>, whose implicit `generic` role
    // PROHIBITS an accessible name, so browsers never expose the label — but
    // Testing Library matches `aria-label` regardless of role. The status has to
    // be real text in the tree instead.
    it('carries the status of a visually bare dot as sr-only text', () => {
      render(<Dot data-testid="dot" status="failed" srLabel="Failed" />);
      const label = screen.getByText('Failed');
      expect(label).toHaveClass('sr-only');
      expect(screen.getByTestId('dot')).toContainElement(label);
      // The invariant, not just the presence: the label must be a DIRECT child
      // of the flex wrapper. Inside `.truncate` it becomes an in-flow flex item
      // and `gap-1.5` doubles a bare dot's width from 6px to 12px — measured in
      // Chromium. An absolutely-positioned direct child is not a flex item and
      // costs nothing. Same shape as spinner.tsx.
      expect(label.closest('.truncate')).toBeNull();
      expect(label.parentElement).toBe(screen.getByTestId('dot'));
    });

    // An srLabel next to a visible label would announce the status twice.
    it('ignores srLabel when children are present', () => {
      render(
        <Dot data-testid="dot" status="failed" srLabel="Failed">
          Payment failed
        </Dot>
      );
      expect(screen.queryByText('Failed')).toBeNull();
      expect(screen.getByTestId('dot').querySelector('.sr-only')).toBeNull();
      expect(screen.getByText('Payment failed')).toHaveClass('truncate');
    });

    it('renders no sr-only span when srLabel is omitted', () => {
      render(<Dot data-testid="dot" status="failed" />);
      expect(screen.getByTestId('dot').querySelector('.sr-only')).toBeNull();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the wrapper span', () => {
      const ref = createRef<HTMLSpanElement>();
      render(<Dot ref={ref}>Label</Dot>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('dotVariants', () => {
    it('returns classes for status, size, and pulse', () => {
      const result = dotVariants({ status: 'blocked', size: 'lg', pulse: true });
      expect(result).toContain('bg-error-600');
      expect(result).toContain('size-2.5');
      expect(result).toContain('animate-pulse');
    });

    it('applies defaults', () => {
      const result = dotVariants({});
      expect(result).toContain('bg-neutral-400');
      expect(result).toContain('size-1.5');
    });
  });

  describe('Customization', () => {
    it('merges custom className on the wrapper', () => {
      render(
        <Dot data-testid="dot" className="ml-2">
          Custom
        </Dot>
      );
      const root = screen.getByTestId('dot');
      expect(root).toHaveClass('ml-2');
      expect(root).toHaveClass('inline-flex');
    });

    it('passes through HTML attributes', () => {
      render(
        <Dot data-testid="dot" title="Status">
          Attr
        </Dot>
      );
      expect(screen.getByTestId('dot')).toHaveAttribute('title', 'Status');
    });
  });
});
