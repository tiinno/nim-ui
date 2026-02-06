import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Stat, statVariants } from './stat';

describe('Stat', () => {
  describe('Rendering', () => {
    it('renders with value and label', () => {
      render(<Stat value="1,234" label="Total Users" />);
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    it('renders with numeric value', () => {
      render(<Stat value={5000} label="Active Sessions" />);
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    });

    it('renders with string value', () => {
      render(<Stat value="$45,231.50" label="Revenue" />);
      expect(screen.getByText('$45,231.50')).toBeInTheDocument();
    });

    it('applies base layout styles', () => {
      render(<Stat value="100" label="Score" data-testid="stat" />);
      const stat = screen.getByTestId('stat');
      expect(stat).toHaveClass('flex');
      expect(stat).toHaveClass('flex-col');
      expect(stat).toHaveClass('space-y-1');
    });
  });

  describe('Value Styling', () => {
    it('value has large bold styling', () => {
      render(<Stat value="789" label="Items" />);
      const value = screen.getByText('789');
      expect(value).toHaveClass('text-2xl');
      expect(value).toHaveClass('font-bold');
      expect(value).toHaveClass('text-neutral-900');
    });

    it('value supports dark mode', () => {
      render(<Stat value="100" label="Score" />);
      const value = screen.getByText('100');
      expect(value).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Label Styling', () => {
    it('label has small text styling', () => {
      render(<Stat value="100" label="Total" />);
      const label = screen.getByText('Total');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('text-neutral-600');
    });

    it('label supports dark mode', () => {
      render(<Stat value="100" label="Total" />);
      const label = screen.getByText('Total');
      expect(label).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('Value Display', () => {
    it('displays formatted currency value', () => {
      render(<Stat value="$1,234.56" label="Revenue" />);
      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    });

    it('displays percentage value', () => {
      render(<Stat value="98.5%" label="Success Rate" />);
      expect(screen.getByText('98.5%')).toBeInTheDocument();
    });

    it('displays large numbers', () => {
      render(<Stat value="1,234,567" label="Total Views" />);
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('displays decimal numbers', () => {
      render(<Stat value={3.14} label="Pi" />);
      expect(screen.getByText('3.14')).toBeInTheDocument();
    });

    it('displays zero value', () => {
      render(<Stat value={0} label="Errors" />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('displays abbreviated values', () => {
      render(<Stat value="1.2K" label="Followers" />);
      expect(screen.getByText('1.2K')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Stat ref={ref} value="100" label="Score" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('ref can access DOM properties', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Stat ref={ref} value="100" label="Score" />);
      expect(ref.current?.classList).toBeDefined();
    });
  });

  describe('CVA Variants', () => {
    it('exports statVariants function', () => {
      expect(typeof statVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = statVariants();
      expect(classes).toContain('flex');
      expect(classes).toContain('flex-col');
      expect(classes).toContain('space-y-1');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Stat
          value="100"
          label="Score"
          className="text-center"
          data-testid="stat"
        />
      );
      const stat = screen.getByTestId('stat');
      expect(stat).toHaveClass('text-center');
      expect(stat).toHaveClass('flex');
      expect(stat).toHaveClass('flex-col');
    });

    it('allows additional styling', () => {
      render(
        <Stat
          value="100"
          label="Score"
          className="bg-blue-50 p-4"
          data-testid="stat"
        />
      );
      const stat = screen.getByTestId('stat');
      expect(stat).toHaveClass('bg-blue-50');
      expect(stat).toHaveClass('p-4');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <Stat
          value="100"
          label="Score"
          data-testid="stat"
          data-metric="score"
        />
      );
      expect(screen.getByTestId('stat')).toHaveAttribute('data-metric', 'score');
    });

    it('supports aria attributes', () => {
      render(
        <Stat
          value="100"
          label="Score"
          aria-label="Score statistic"
          data-testid="stat"
        />
      );
      expect(screen.getByTestId('stat')).toHaveAttribute(
        'aria-label',
        'Score statistic'
      );
    });

    it('supports id attribute', () => {
      render(<Stat value="100" label="Score" id="score-stat" />);
      expect(document.getElementById('score-stat')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('renders follower count', () => {
      render(<Stat value="1.2K" label="Followers" />);
      expect(screen.getByText('1.2K')).toBeInTheDocument();
      expect(screen.getByText('Followers')).toBeInTheDocument();
    });

    it('renders stat group', () => {
      render(
        <div>
          <Stat value="1.2K" label="Followers" />
          <Stat value="456" label="Following" />
          <Stat value="89" label="Posts" />
        </div>
      );
      expect(screen.getByText('1.2K')).toBeInTheDocument();
      expect(screen.getByText('456')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
    });

    it('renders percentage stat', () => {
      render(<Stat value="98%" label="Success Rate" />);
      expect(screen.getByText('98%')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long value', () => {
      render(<Stat value="123,456,789,012" label="Large Number" />);
      expect(screen.getByText('123,456,789,012')).toBeInTheDocument();
    });

    it('handles empty string value', () => {
      render(<Stat value="" label="Empty" />);
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('handles special characters in label', () => {
      render(<Stat value="100" label="Users (Active/Total)" />);
      expect(screen.getByText('Users (Active/Total)')).toBeInTheDocument();
    });
  });
});
