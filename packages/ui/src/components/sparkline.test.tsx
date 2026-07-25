import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { Sparkline, sparklineVariants, sparklineAreaVariants } from './sparkline';

// Fixture geometry that lands on integers:
// width 100 / height 20 / strokeWidth 2 -> pad 1, plotHeight 18, baseline 19, midline 10.
const box = { width: 100, height: 20, strokeWidth: 2 } as const;

describe('Sparkline', () => {
  describe('Rendering', () => {
    it('renders an accessible image with the label as its name', () => {
      render(<Sparkline data={[1, 2, 3]} label="Orders, last 7 days" />);
      const svg = screen.getByRole('img', { name: 'Orders, last 7 days' });
      expect(svg.tagName.toLowerCase()).toBe('svg');
      expect(svg).toHaveAttribute('aria-label', 'Orders, last 7 days');
    });

    it('sets a viewBox and stretches without preserving aspect ratio', () => {
      render(<Sparkline data={[1, 2, 3]} label="Trend" />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('viewBox', '0 0 120 32');
      expect(svg).toHaveAttribute('preserveAspectRatio', 'none');
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('honors custom width and height', () => {
      render(<Sparkline data={[1, 2, 3]} label="Trend" width={200} height={48} />);
      expect(screen.getByRole('img')).toHaveAttribute('viewBox', '0 0 200 48');
    });

    it('keeps the stroke crisp when the box is stretched', () => {
      render(<Sparkline data={[1, 2, 3]} label="Trend" />);
      const line = screen.getByTestId('sparkline-line');
      expect(line).toHaveAttribute('vector-effect', 'non-scaling-stroke');
      expect(line).toHaveAttribute('fill', 'none');
      expect(line).toHaveAttribute('stroke-width', '1.5');
    });

    it('applies the base layout class', () => {
      render(<Sparkline data={[1, 2]} label="Trend" />);
      expect(screen.getByRole('img')).toHaveClass('block');
      expect(screen.getByRole('img')).toHaveClass('max-w-full');
    });

    // Load-bearing, not decorative: the last-point dot is centered at x === width and
    // sized in device pixels, so the SVG viewport would clip half of it without this.
    it('lets the last-point dot overflow the viewport instead of clipping it', () => {
      render(<Sparkline data={[1, 2]} label="Trend" showLastPoint />);
      expect(screen.getByRole('img')).toHaveClass('overflow-visible');
    });
  });

  describe('Point geometry', () => {
    it('maps the series across the full width and inverts the y axis', () => {
      render(<Sparkline data={[0, 5, 10]} label="Ramp" {...box} />);
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,19 50,10 100,1');
    });

    it('plots negative values against a derived domain', () => {
      render(<Sparkline data={[-10, 0, 10]} label="Delta" {...box} />);
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,19 50,10 100,1');
    });

    it('honors an explicit domain and clamps values outside it', () => {
      render(<Sparkline data={[0, 25, 100]} label="Capped" min={0} max={50} {...box} />);
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,19 50,10 100,1');
    });

    // min/max are documented as independently optional, and `min={0}` alone is the
    // headline usage in the docs. Both half-domains need their own assertion —
    // a test that always passes both cannot tell `lo = min` from `hi = min`.
    it('honors min on its own and derives the upper bound from the data', () => {
      render(<Sparkline data={[0, 5, 10]} label="Floor pinned" min={-10} {...box} />);
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,10 50,5.5 100,1');
    });

    it('honors max on its own and derives the lower bound from the data', () => {
      render(<Sparkline data={[0, 5, 10]} label="Ceiling pinned" max={20} {...box} />);
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,19 50,14.5 100,10');
    });

    it('rounds coordinates to two decimals instead of emitting float noise', () => {
      // 4 points across width 100 land on thirds — unrounded these are 33.333333333333336.
      render(<Sparkline data={[0, 1, 2, 3]} label="Thirds" {...box} />);
      const points = screen.getByTestId('sparkline-line').getAttribute('points');
      expect(points).toBe('0,19 33.33,13 66.67,7 100,1');
      expect(points).not.toMatch(/\d\.\d{3,}/);
    });

    it('ignores non-finite entries in the series', () => {
      render(<Sparkline data={[0, Number.NaN, 10, Number.POSITIVE_INFINITY]} label="Dirty" {...box} />);
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,19 100,1');
    });
  });

  describe('Edge cases', () => {
    it('renders an empty but accessible chart for an empty series', () => {
      render(<Sparkline data={[]} label="No data yet" />);
      const svg = screen.getByRole('img', { name: 'No data yet' });
      expect(svg).toHaveAttribute('data-empty', 'true');
      expect(screen.queryByTestId('sparkline-line')).not.toBeInTheDocument();
      expect(svg.outerHTML).not.toContain('NaN');
    });

    it('draws a flat centered line for a single data point', () => {
      render(<Sparkline data={[7]} label="One reading" />);
      const svg = screen.getByRole('img');
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,16 120,16');
      expect(svg).not.toHaveAttribute('data-empty');
      expect(svg.outerHTML).not.toContain('NaN');
    });

    it('draws a flat mid-height line when every value is identical', () => {
      render(<Sparkline data={[5, 5, 5]} label="Flat" />);
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,16 60,16 120,16');
      expect(screen.getByRole('img').outerHTML).not.toContain('NaN');
    });

    it('does not divide by zero when min equals max', () => {
      render(<Sparkline data={[2, 8, 4]} label="Pinned" min={5} max={5} {...box} />);
      expect(screen.getByTestId('sparkline-line')).toHaveAttribute('points', '0,10 50,10 100,10');
      expect(screen.getByRole('img').outerHTML).not.toContain('NaN');
    });

    it('renders the empty chart instead of throwing when data is missing', () => {
      // Series data typically arrives from an API; a null payload must not take
      // down the table row that renders it.
      render(<Sparkline data={undefined as unknown as number[]} label="Missing series" />);
      const svg = screen.getByRole('img', { name: 'Missing series' });
      expect(svg).toHaveAttribute('data-empty', 'true');
      expect(screen.queryByTestId('sparkline-line')).not.toBeInTheDocument();
    });

    it('falls back to defaults for non-positive geometry props', () => {
      render(<Sparkline data={[1, 4]} label="Bad box" width={0} height={-10} strokeWidth={0} />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('viewBox', '0 0 120 32');
      expect(svg.outerHTML).not.toContain('NaN');
    });

    it.each([
      ['empty', [] as number[]],
      ['single', [4]],
      ['identical', [3, 3, 3]],
      ['negative', [-5, -20, -1]],
      ['mixed', [0, -0.5, 12.345]],
    ])('renders no NaN attributes for a %s series', (_name, data) => {
      render(<Sparkline data={data} label="Numeric guard" area showLastPoint />);
      expect(screen.getByRole('img').outerHTML).not.toContain('NaN');
    });
  });

  describe('Area fill', () => {
    it('is hidden by default', () => {
      render(<Sparkline data={[0, 5, 10]} label="No area" />);
      expect(screen.queryByTestId('sparkline-area')).not.toBeInTheDocument();
    });

    it('closes the polygon down to the baseline', () => {
      render(<Sparkline data={[0, 5, 10]} label="Area" area {...box} />);
      const areaShape = screen.getByTestId('sparkline-area');
      expect(areaShape).toHaveAttribute('points', '0,19 50,10 100,1 100,19 0,19');
      expect(areaShape).toHaveAttribute('stroke', 'none');
    });

    it('is softer than the line and themed for dark mode', () => {
      render(<Sparkline data={[0, 5, 10]} label="Area" area />);
      const areaShape = screen.getByTestId('sparkline-area');
      expect(areaShape).toHaveClass('fill-neutral-900/10');
      expect(areaShape).toHaveClass('dark:fill-neutral-100/10');
    });

    it('is omitted for an empty series', () => {
      render(<Sparkline data={[]} label="Area" area />);
      expect(screen.queryByTestId('sparkline-area')).not.toBeInTheDocument();
    });
  });

  describe('Last point emphasis', () => {
    it('is hidden by default', () => {
      render(<Sparkline data={[0, 10]} label="No dot" />);
      expect(screen.queryByTestId('sparkline-point')).not.toBeInTheDocument();
    });

    it('marks the final value without distorting under non-uniform scaling', () => {
      render(<Sparkline data={[0, 10]} label="Dot" showLastPoint {...box} />);
      const dot = screen.getByTestId('sparkline-point');
      expect(dot).toHaveAttribute('d', 'M 100 1 l 0.01 0');
      expect(dot).toHaveAttribute('stroke-linecap', 'round');
      expect(dot).toHaveAttribute('stroke-width', '6');
      expect(dot).toHaveAttribute('vector-effect', 'non-scaling-stroke');
    });

    it('is omitted for an empty series', () => {
      render(<Sparkline data={[]} label="Dot" showLastPoint />);
      expect(screen.queryByTestId('sparkline-point')).not.toBeInTheDocument();
    });
  });

  describe('Tones', () => {
    it('uses ink by default', () => {
      render(<Sparkline data={[1, 2]} label="Ink" />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveClass('stroke-neutral-900');
      expect(svg).toHaveClass('dark:stroke-neutral-100');
    });

    it.each([
      ['ink', 'stroke-neutral-900', 'dark:stroke-neutral-100'],
      ['steel', 'stroke-primary-500', 'dark:stroke-primary-400'],
      ['success', 'stroke-success-600', 'dark:stroke-success-400'],
      ['warning', 'stroke-warning-600', 'dark:stroke-warning-400'],
      ['error', 'stroke-error-600', 'dark:stroke-error-400'],
    ])('renders %s tone in both themes', (tone, light, dark) => {
      render(<Sparkline data={[1, 2]} label={tone} tone={tone as never} />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveClass(light);
      expect(svg).toHaveClass(dark);
    });

    it.each([
      ['steel', 'fill-primary-500/10', 'dark:fill-primary-400/15'],
      ['success', 'fill-success-600/10', 'dark:fill-success-400/15'],
      ['warning', 'fill-warning-600/10', 'dark:fill-warning-400/15'],
      ['error', 'fill-error-600/10', 'dark:fill-error-400/15'],
    ])('renders the %s area fill in both themes', (tone, light, dark) => {
      render(<Sparkline data={[1, 2, 3]} label={tone} tone={tone as never} area />);
      const areaShape = screen.getByTestId('sparkline-area');
      expect(areaShape).toHaveClass(light);
      expect(areaShape).toHaveClass(dark);
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the svg element', () => {
      const ref = createRef<SVGSVGElement>();
      render(<Sparkline ref={ref} data={[1, 2, 3]} label="Ref" />);
      expect(ref.current).toBeInstanceOf(SVGSVGElement);
      expect(ref.current?.tagName.toLowerCase()).toBe('svg');
    });
  });

  describe('Variant functions', () => {
    it('sparklineVariants returns stroke classes', () => {
      const result = sparklineVariants({ tone: 'steel' });
      expect(result).toContain('stroke-primary-500');
      expect(result).toContain('dark:stroke-primary-400');
      expect(result).toContain('block');
    });

    it('sparklineVariants defaults to ink', () => {
      expect(sparklineVariants({})).toContain('stroke-neutral-900');
    });

    it('sparklineAreaVariants returns soft fill classes', () => {
      const result = sparklineAreaVariants({ tone: 'error' });
      expect(result).toContain('fill-error-600/10');
      expect(result).toContain('dark:fill-error-400/15');
    });
  });

  describe('Customization', () => {
    it('merges a custom className with the tone classes', () => {
      render(<Sparkline data={[1, 2]} label="Custom" className="h-8 w-full" />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveClass('h-8');
      expect(svg).toHaveClass('w-full');
      expect(svg).toHaveClass('stroke-neutral-900');
    });

    it('passes through SVG attributes', () => {
      render(<Sparkline data={[1, 2]} label="Attr" id="orders-spark" data-testid="spark-root" />);
      const svg = screen.getByTestId('spark-root');
      expect(svg).toHaveAttribute('id', 'orders-spark');
      expect(svg).toHaveAttribute('role', 'img');
    });
  });
});
