import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { Meter, meterVariants, meterFillVariants } from './meter';

describe('Meter', () => {
  describe('Rendering', () => {
    it('renders a meter with accessible attributes', () => {
      render(<Meter value={40} label="Storage used" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-label', 'Storage used');
      expect(meter).toHaveAttribute('aria-valuenow', '40');
      expect(meter).toHaveAttribute('aria-valuemin', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '100');
      expect(meter).toHaveAttribute('aria-valuetext', '40% used');
    });

    it('applies track styles including dark mode', () => {
      render(<Meter value={40} label="Track" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveClass('relative');
      expect(meter).toHaveClass('w-full');
      expect(meter).toHaveClass('overflow-hidden');
      expect(meter).toHaveClass('rounded-full');
      expect(meter).toHaveClass('bg-neutral-200');
      expect(meter).toHaveClass('dark:bg-neutral-800');
    });

    it('sets fill width from value', () => {
      render(<Meter value={40} label="Fill" />);
      expect(screen.getByTestId('meter-fill')).toHaveStyle({ width: '40%' });
    });

    it('supports a custom max', () => {
      render(<Meter value={450} max={500} label="API calls" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-valuemax', '500');
      expect(screen.getByTestId('meter-fill')).toHaveStyle({ width: '90%' });
    });
  });

  describe('Clamping', () => {
    it('clamps values above max to 100%', () => {
      render(<Meter value={130} label="Over" />);
      expect(screen.getByTestId('meter-fill')).toHaveStyle({ width: '100%' });
    });

    it('clamps negative values to 0%', () => {
      render(<Meter value={-10} label="Under" />);
      expect(screen.getByTestId('meter-fill')).toHaveStyle({ width: '0%' });
    });

    it('treats a non-positive max as empty', () => {
      render(<Meter value={10} max={0} label="Zero max" />);
      expect(screen.getByTestId('meter-fill')).toHaveStyle({ width: '0%' });
    });
  });

  describe('Auto threshold coloring', () => {
    it('uses success below the warning threshold', () => {
      render(<Meter value={69} label="Low" />);
      const fill = screen.getByTestId('meter-fill');
      expect(fill).toHaveClass('bg-success-500');
      expect(fill).toHaveClass('dark:bg-success-400');
    });

    it('shifts to warning exactly at the warning threshold', () => {
      render(<Meter value={70} label="Warn" />);
      const fill = screen.getByTestId('meter-fill');
      expect(fill).toHaveClass('bg-warning-500');
      expect(fill).toHaveClass('dark:bg-warning-400');
    });

    it('shifts to error exactly at the critical threshold', () => {
      render(<Meter value={90} label="Critical" />);
      const fill = screen.getByTestId('meter-fill');
      expect(fill).toHaveClass('bg-error-600');
      expect(fill).toHaveClass('dark:bg-error-400');
    });

    it('respects custom thresholds', () => {
      render(
        <Meter value={85} thresholds={{ warning: 0.8, critical: 0.95 }} label="Custom" />
      );
      expect(screen.getByTestId('meter-fill')).toHaveClass('bg-warning-500');
    });
  });

  describe('Fixed tones', () => {
    it.each([
      ['success', 'bg-success-500'],
      ['warning', 'bg-warning-500'],
      ['error', 'bg-error-600'],
      ['neutral', 'bg-neutral-400'],
    ])('renders %s tone regardless of value', (tone, cls) => {
      render(<Meter value={10} tone={tone as any} label={tone} />);
      expect(screen.getByTestId('meter-fill')).toHaveClass(cls);
    });

    it('neutral tone includes dark mode class', () => {
      render(<Meter value={10} tone="neutral" label="Neutral" />);
      expect(screen.getByTestId('meter-fill')).toHaveClass('dark:bg-neutral-500');
    });
  });

  describe('Sizes', () => {
    it('renders sm height by default', () => {
      render(<Meter value={40} label="Default size" />);
      expect(screen.getByRole('meter')).toHaveClass('h-1.5');
    });

    it('renders md height', () => {
      render(<Meter value={40} size="md" label="Md size" />);
      expect(screen.getByRole('meter')).toHaveClass('h-2.5');
    });
  });

  describe('Value display', () => {
    it('shows the percentage when showValue is set', () => {
      render(<Meter value={82} label="Storage" showValue />);
      const value = screen.getByText('82%');
      expect(value).toHaveClass('text-xs');
      expect(value).toHaveClass('tabular-nums');
      expect(value).toHaveClass('text-neutral-500');
      expect(value).toHaveClass('dark:text-neutral-400');
    });

    it('hides the percentage by default', () => {
      render(<Meter value={82} label="Storage" />);
      expect(screen.queryByText('82%')).not.toBeInTheDocument();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Meter ref={ref} value={40} label="Ref" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Variant functions', () => {
    it('meterVariants returns track classes', () => {
      const result = meterVariants({ size: 'md' });
      expect(result).toContain('h-2.5');
      expect(result).toContain('rounded-full');
    });

    it('meterFillVariants returns fill classes', () => {
      const result = meterFillVariants({ tone: 'error' });
      expect(result).toContain('bg-error-600');
      expect(result).toContain('transition-all');
    });
  });

  describe('Customization', () => {
    it('merges custom className on the root', () => {
      render(<Meter value={40} label="Custom" className="max-w-48" data-testid="meter-root" />);
      const root = screen.getByTestId('meter-root');
      expect(root).toHaveClass('max-w-48');
      expect(root).toHaveClass('flex');
    });

    it('passes through HTML attributes', () => {
      render(<Meter value={40} label="Attr" data-testid="meter-root" id="disk-meter" />);
      expect(screen.getByTestId('meter-root')).toHaveAttribute('id', 'disk-meter');
    });
  });
});
