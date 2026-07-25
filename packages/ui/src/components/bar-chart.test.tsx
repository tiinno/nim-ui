import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { BarChart, barChartVariants, barChartBarVariants } from './bar-chart';

const data = [
  { label: 'Web', value: 100 },
  { label: 'POS', value: 50 },
  { label: 'API', value: 25 },
];

describe('BarChart', () => {
  describe('Rendering', () => {
    it('renders an image role with the accessible name', () => {
      render(<BarChart label="Orders by channel" data={data} />);
      const chart = screen.getByRole('img', { name: 'Orders by channel' });
      expect(chart).toBeInTheDocument();
      expect(chart).toHaveAttribute('aria-label', 'Orders by channel');
    });

    it('describes the chart with a screen-reader enumeration of the data', () => {
      render(<BarChart label="Orders by channel" data={data} />);
      const chart = screen.getByRole('img');
      const description = screen.getByText('Orders by channel: Web: 100, POS: 50, API: 25');
      expect(description).toHaveClass('sr-only');
      expect(chart).toHaveAttribute('aria-describedby', description.id);
    });

    it('renders one bar per datum with widths relative to the largest value', () => {
      render(<BarChart label="Channels" data={data} />);
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars).toHaveLength(3);
      expect(bars[0]).toHaveStyle({ height: '100%' });
      expect(bars[1]).toHaveStyle({ height: '50%' });
      expect(bars[2]).toHaveStyle({ height: '25%' });
    });

    it('renders quiet category labels', () => {
      render(<BarChart label="Channels" data={data} />);
      const category = screen.getByText('Web');
      expect(category).toHaveClass('text-xs');
      expect(category).toHaveClass('text-neutral-500');
      expect(category).toHaveClass('dark:text-neutral-400');
    });

    it('hides the plot from assistive tech in favor of the description', () => {
      render(<BarChart label="Channels" data={data} />);
      expect(screen.getByTestId('bar-chart-plot')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Scale', () => {
    it('uses an explicit max instead of the data maximum', () => {
      render(<BarChart label="SLA" max={200} data={[{ label: 'Tier 1', value: 100 }]} />);
      expect(screen.getAllByTestId('bar-chart-bar')[0]).toHaveStyle({ height: '50%' });
    });

    it('clamps values above max to 100%', () => {
      render(<BarChart label="Over" max={50} data={[{ label: 'Spike', value: 120 }]} />);
      expect(screen.getAllByTestId('bar-chart-bar')[0]).toHaveStyle({ height: '100%' });
    });

    it('clamps negative values to 0% and omits the minimum extent', () => {
      render(<BarChart label="Under" data={[{ label: 'Drift', value: -20 }, { label: 'Base', value: 10 }]} />);
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars[0]).toHaveStyle({ height: '0%' });
      expect(bars[0]).not.toHaveClass('min-h-px');
    });

    it('renders every bar at 0% when all values are zero', () => {
      render(
        <BarChart label="Idle" data={[{ label: 'A', value: 0 }, { label: 'B', value: 0 }]} />
      );
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars[0]).toHaveStyle({ height: '0%' });
      expect(bars[1]).toHaveStyle({ height: '0%' });
    });

    it('treats an explicit max of 0 as an empty scale without NaN', () => {
      render(<BarChart label="Zero max" max={0} data={[{ label: 'A', value: 40 }]} />);
      const bar = screen.getAllByTestId('bar-chart-bar')[0]!;
      expect(bar).toHaveStyle({ height: '0%' });
      expect(bar.getAttribute('style')).not.toContain('NaN');
    });

    it('gives a positive but tiny value a minimum visible extent', () => {
      render(
        <BarChart label="Tiny" data={[{ label: 'A', value: 1000 }, { label: 'B', value: 1 }]} />
      );
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars[1]).toHaveStyle({ height: '0.1%' });
      expect(bars[1]).toHaveClass('min-h-px');
    });

    it('renders a single datum at full extent', () => {
      render(<BarChart label="Solo" data={[{ label: 'Only', value: 7 }]} />);
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars).toHaveLength(1);
      expect(bars[0]).toHaveStyle({ height: '100%' });
    });

    it('treats a NaN value as zero instead of poisoning the shared scale', () => {
      render(
        <BarChart label="Feed" data={[{ label: 'A', value: Number.NaN }, { label: 'B', value: 10 }]} />
      );
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars[0]).toHaveStyle({ height: '0%' });
      expect(bars[1]).toHaveStyle({ height: '100%' });
      expect(screen.getByText('Feed: A: 0, B: 10')).toHaveClass('sr-only');
    });

    it('treats an infinite value as zero instead of flattening every other bar', () => {
      render(
        <BarChart
          label="Spike"
          data={[{ label: 'A', value: Number.POSITIVE_INFINITY }, { label: 'B', value: 10 }]}
        />
      );
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars[0]).toHaveStyle({ height: '0%' });
      expect(bars[1]).toHaveStyle({ height: '100%' });
      expect(screen.getByText('Spike: A: 0, B: 10')).toHaveClass('sr-only');
    });

    it('renders no bars and a no-data description for empty data', () => {
      render(<BarChart label="Refunds" data={[]} />);
      expect(screen.queryAllByTestId('bar-chart-bar')).toHaveLength(0);
      expect(screen.getByText('Refunds: no data')).toHaveClass('sr-only');
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Tones', () => {
    it.each([
      ['ink', 'bg-neutral-900', 'dark:bg-neutral-100'],
      ['steel', 'bg-primary-500', 'dark:bg-primary-400'],
      ['success', 'bg-success-500', 'dark:bg-success-400'],
      ['warning', 'bg-warning-500', 'dark:bg-warning-400'],
      ['error', 'bg-error-600', 'dark:bg-error-400'],
    ])('renders %s tone in light and dark', (tone, light, dark) => {
      render(
        <BarChart label="Tone" tone={tone as any} data={[{ label: 'A', value: 10 }]} />
      );
      const bar = screen.getAllByTestId('bar-chart-bar')[0];
      expect(bar).toHaveClass(light);
      expect(bar).toHaveClass(dark);
    });

    it('defaults to the ink tone', () => {
      render(<BarChart label="Default tone" data={[{ label: 'A', value: 10 }]} />);
      expect(screen.getAllByTestId('bar-chart-bar')[0]).toHaveClass('bg-neutral-900');
    });

    it('lets a datum override the chart tone', () => {
      render(
        <BarChart
          label="Mixed"
          tone="ink"
          data={[
            { label: 'A', value: 10 },
            { label: 'B', value: 8, tone: 'error' },
          ]}
        />
      );
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars[0]).toHaveClass('bg-neutral-900');
      expect(bars[1]).toHaveClass('bg-error-600');
      expect(bars[1]).toHaveClass('dark:bg-error-400');
    });

    it('keeps bars square-cornered rather than pill-shaped', () => {
      render(<BarChart label="Radius" data={data} />);
      const bar = screen.getAllByTestId('bar-chart-bar')[0];
      expect(bar).toHaveClass('rounded-sm');
      expect(bar).not.toHaveClass('rounded-full');
    });
  });

  describe('Orientation', () => {
    it('renders vertical layout by default', () => {
      render(<BarChart label="Vertical" data={data} data-testid="chart" />);
      expect(screen.getByTestId('chart')).toHaveClass('gap-2');
      expect(screen.getByTestId('bar-chart-plot')).toHaveClass('items-end');
    });

    it('applies the height prop to the vertical plot', () => {
      render(<BarChart label="Tall" data={data} height={200} />);
      expect(screen.getByTestId('bar-chart-plot')).toHaveStyle({ height: '200px' });
    });

    it('defaults the vertical plot height to 120px', () => {
      render(<BarChart label="Default height" data={data} />);
      expect(screen.getByTestId('bar-chart-plot')).toHaveStyle({ height: '120px' });
    });

    it('falls back to the default plot height when height is not a finite number', () => {
      render(<BarChart label="Bad height" data={data} height={Number.NaN} />);
      const plot = screen.getByTestId('bar-chart-plot');
      expect(plot).toHaveStyle({ height: '120px' });
      expect(plot.getAttribute('style')).not.toContain('NaN');
    });

    it('falls back to the default plot height for a non-positive height', () => {
      render(<BarChart label="Negative height" data={data} height={-40} />);
      expect(screen.getByTestId('bar-chart-plot')).toHaveStyle({ height: '120px' });
    });

    it('renders horizontal rows with leading labels and width-driven bars', () => {
      render(<BarChart label="Horizontal" orientation="horizontal" data={data} data-testid="chart" />);
      expect(screen.getByTestId('chart')).toHaveClass('gap-1.5');
      expect(screen.queryByTestId('bar-chart-plot')).not.toBeInTheDocument();
      const bars = screen.getAllByTestId('bar-chart-bar');
      expect(bars[1]).toHaveStyle({ width: '50%' });
      expect(bars[1]).toHaveClass('h-full');
    });

    it('renders a quiet track behind horizontal bars in both themes', () => {
      render(<BarChart label="Track" orientation="horizontal" data={data} />);
      const track = screen.getAllByTestId('bar-chart-bar')[0]!.parentElement as HTMLElement;
      expect(track).toHaveClass('bg-neutral-200');
      expect(track).toHaveClass('dark:bg-neutral-800');
      expect(track).toHaveClass('overflow-hidden');
    });

    it('gives horizontal rows an equal-width value column so bar lengths stay comparable', () => {
      render(
        <BarChart
          label="Comparable"
          orientation="horizontal"
          showValues
          data={[{ label: 'Wide', value: 1200 }, { label: 'Narrow', value: 7 }]}
        />
      );
      // A shrink-to-fit value column would make each row's track a different
      // width, so 50% in one row would not be the same pixel length as 50% in
      // another. The column is fixed so the tracks line up.
      for (const value of [screen.getByText('1200'), screen.getByText('7')]) {
        expect(value).toHaveClass('w-14');
        expect(value).toHaveClass('shrink-0');
        expect(value).toHaveClass('text-right');
        expect(value).toHaveClass('tabular-nums');
      }
    });
  });

  describe('Values', () => {
    it('hides values by default', () => {
      render(<BarChart label="No values" data={data} />);
      expect(screen.queryByText('100')).not.toBeInTheDocument();
    });

    it('prints values with tabular numerals when showValues is set', () => {
      render(<BarChart label="With values" data={data} showValues />);
      const value = screen.getByText('50');
      expect(value).toHaveClass('tabular-nums');
      expect(value).toHaveClass('text-neutral-700');
      expect(value).toHaveClass('dark:text-neutral-300');
    });

    it('reserves room for values above the vertical plot', () => {
      render(<BarChart label="Padded" data={data} showValues />);
      expect(screen.getByTestId('bar-chart-plot')).toHaveClass('pt-5');
    });

    it('applies valueFormatter to displayed values and the description', () => {
      render(
        <BarChart
          label="Revenue"
          data={[{ label: 'Web', value: 1200 }]}
          valueFormatter={(v) => `$${v.toLocaleString('en-US')}`}
          showValues
        />
      );
      expect(screen.getByText('$1,200')).toBeInTheDocument();
      expect(screen.getByText('Revenue: Web: $1,200')).toHaveClass('sr-only');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<BarChart ref={ref} label="Ref" data={data} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'img');
    });
  });

  describe('Variant functions', () => {
    it('barChartVariants returns orientation classes', () => {
      expect(barChartVariants({ orientation: 'vertical' })).toContain('gap-2');
      expect(barChartVariants({ orientation: 'horizontal' })).toContain('gap-1.5');
      expect(barChartVariants({})).toContain('w-full');
    });

    it('barChartBarVariants returns tone classes', () => {
      const result = barChartBarVariants({ tone: 'steel' });
      expect(result).toContain('bg-primary-500');
      expect(result).toContain('dark:bg-primary-400');
      expect(barChartBarVariants({})).toContain('bg-neutral-900');
    });
  });

  describe('Customization', () => {
    it('merges custom className on the root', () => {
      render(<BarChart label="Custom" data={data} className="max-w-sm" data-testid="chart" />);
      const chart = screen.getByTestId('chart');
      expect(chart).toHaveClass('max-w-sm');
      expect(chart).toHaveClass('w-full');
    });

    it('passes through HTML attributes', () => {
      render(<BarChart label="Attr" data={data} id="channels-chart" data-testid="chart" />);
      expect(screen.getByTestId('chart')).toHaveAttribute('id', 'channels-chart');
    });

    it('respects a caller-supplied aria-describedby', () => {
      render(
        <>
          <span id="chart-note">Last 7 days</span>
          <BarChart label="Attr" data={data} aria-describedby="chart-note" />
        </>
      );
      expect(screen.getByRole('img')).toHaveAttribute('aria-describedby', 'chart-note');
    });
  });
});
