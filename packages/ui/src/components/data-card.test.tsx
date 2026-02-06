import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { DataCard, dataCardVariants } from './data-card';

describe('DataCard', () => {
  describe('Rendering', () => {
    it('renders with value and label', () => {
      render(<DataCard value="1,234" label="Total Users" />);
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    it('renders with numeric value', () => {
      render(<DataCard value={5000} label="Active Sessions" />);
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    });

    it('renders with string value', () => {
      render(<DataCard value="$45,231.50" label="Revenue" />);
      expect(screen.getByText('$45,231.50')).toBeInTheDocument();
    });

    it('applies default card styles', () => {
      render(<DataCard value="100" label="Score" data-testid="card" />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('shadow-sm');
      expect(card).toHaveClass('p-6');
    });
  });

  describe('Required Props', () => {
    it('displays value prop', () => {
      render(<DataCard value="123" label="Count" />);
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('displays label prop', () => {
      render(<DataCard value="456" label="Visitors" />);
      expect(screen.getByText('Visitors')).toBeInTheDocument();
    });

    it('value has large bold styling', () => {
      render(<DataCard value="789" label="Items" />);
      const value = screen.getByText('789');
      expect(value).toHaveClass('text-3xl');
      expect(value).toHaveClass('font-bold');
      expect(value).toHaveClass('text-neutral-900');
    });

    it('label has small medium styling', () => {
      render(<DataCard value="100" label="Total" />);
      const label = screen.getByText('Total');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
      expect(label).toHaveClass('text-neutral-600');
    });
  });

  describe('Optional Description', () => {
    it('does not render description when not provided', () => {
      const { container } = render(<DataCard value="100" label="Score" />);
      const descriptions = container.querySelectorAll('[class*="text-neutral-500"]');
      expect(descriptions.length).toBe(0);
    });

    it('renders description when provided', () => {
      render(
        <DataCard
          value="98.5%"
          label="Uptime"
          description="Last 30 days"
        />
      );
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('applies correct description styling', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          description="Current month"
        />
      );
      const description = screen.getByText('Current month');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-neutral-500');
    });
  });

  describe('Optional Trend', () => {
    it('does not render trend when not provided', () => {
      render(<DataCard value="100" label="Score" />);
      expect(screen.queryByText(/[+\-]/)).not.toBeInTheDocument();
    });

    it('renders trend when provided', () => {
      render(
        <DataCard
          value="1,234"
          label="Users"
          trend="+12.5%"
        />
      );
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
    });

    it('renders negative trend', () => {
      render(
        <DataCard
          value="500"
          label="Errors"
          trend="-5.2%"
        />
      );
      expect(screen.getByText('-5.2%')).toBeInTheDocument();
    });

    it('applies trend text styling', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          trend="+10%"
        />
      );
      const trend = screen.getByText('+10%');
      expect(trend).toHaveClass('text-sm');
      expect(trend).toHaveClass('font-medium');
    });
  });

  describe('Trend Direction - Colors', () => {
    it('applies green color for up trend', () => {
      render(
        <DataCard
          value="1,234"
          label="Users"
          trend="+12.5%"
          trendDirection="up"
        />
      );
      const trend = screen.getByText('+12.5%');
      expect(trend).toHaveClass('text-green-600');
      expect(trend).toHaveClass('dark:text-green-400');
    });

    it('applies red color for down trend', () => {
      render(
        <DataCard
          value="500"
          label="Errors"
          trend="-5.2%"
          trendDirection="down"
        />
      );
      const trend = screen.getByText('-5.2%');
      expect(trend).toHaveClass('text-red-600');
      expect(trend).toHaveClass('dark:text-red-400');
    });

    it('applies neutral color for neutral trend', () => {
      render(
        <DataCard
          value="100"
          label="Stable"
          trend="0%"
          trendDirection="neutral"
        />
      );
      const trend = screen.getByText('0%');
      expect(trend).toHaveClass('text-neutral-600');
      expect(trend).toHaveClass('dark:text-neutral-400');
    });

    it('defaults to neutral when trendDirection not specified', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          trend="+5%"
        />
      );
      const trend = screen.getByText('+5%');
      expect(trend).toHaveClass('text-neutral-600');
    });
  });

  describe('Value Display', () => {
    it('displays formatted currency value', () => {
      render(<DataCard value="$1,234.56" label="Revenue" />);
      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    });

    it('displays percentage value', () => {
      render(<DataCard value="98.5%" label="Success Rate" />);
      expect(screen.getByText('98.5%')).toBeInTheDocument();
    });

    it('displays large numbers', () => {
      render(<DataCard value="1,234,567" label="Total Views" />);
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('displays decimal numbers', () => {
      render(<DataCard value={3.14159} label="Pi" />);
      expect(screen.getByText('3.14159')).toBeInTheDocument();
    });

    it('displays zero value', () => {
      render(<DataCard value={0} label="Errors" />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode card styles', () => {
      render(<DataCard value="100" label="Score" data-testid="card" />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('dark:bg-neutral-900');
      expect(card).toHaveClass('dark:border-neutral-700');
    });

    it('applies dark mode label styles', () => {
      render(<DataCard value="100" label="Total" />);
      const label = screen.getByText('Total');
      expect(label).toHaveClass('dark:text-neutral-400');
    });

    it('applies dark mode value styles', () => {
      render(<DataCard value="100" label="Score" />);
      const value = screen.getByText('100');
      expect(value).toHaveClass('dark:text-neutral-100');
    });

    it('applies dark mode description styles', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          description="Last week"
        />
      );
      const description = screen.getByText('Last week');
      expect(description).toHaveClass('dark:text-neutral-500');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to card element', () => {
      const ref = { current: null };
      render(<DataCard ref={ref} value="100" label="Score" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('ref can access DOM properties', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<DataCard ref={ref} value="100" label="Score" />);
      expect(ref.current?.classList).toBeDefined();
    });
  });

  describe('CVA Variants', () => {
    it('exports dataCardVariants function', () => {
      expect(typeof dataCardVariants).toBe('function');
    });

    it('generates correct classes from variants', () => {
      const classes = dataCardVariants();
      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('border');
      expect(classes).toContain('p-6');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          className="max-w-sm"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('max-w-sm');
      expect(card).toHaveClass('rounded-lg');
    });

    it('allows additional styling', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          className="hover:shadow-lg"
          data-testid="card"
        />
      );
      expect(screen.getByTestId('card')).toHaveClass('hover:shadow-lg');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          data-testid="metric-card"
          data-metric="score"
        />
      );
      const card = screen.getByTestId('metric-card');
      expect(card).toHaveAttribute('data-metric', 'score');
    });

    it('supports aria attributes', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          aria-label="Score metric card"
          data-testid="card"
        />
      );
      expect(screen.getByTestId('card')).toHaveAttribute(
        'aria-label',
        'Score metric card'
      );
    });

    it('supports id attribute', () => {
      render(<DataCard value="100" label="Score" id="score-card" />);
      expect(document.getElementById('score-card')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('uses flex column layout', () => {
      render(<DataCard value="100" label="Score" data-testid="card" />);
      const card = screen.getByTestId('card');
      const innerDiv = card.firstChild as HTMLElement;
      expect(innerDiv).toHaveClass('flex');
      expect(innerDiv).toHaveClass('flex-col');
      expect(innerDiv).toHaveClass('space-y-2');
    });

    it('value and trend are on same baseline', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          trend="+10%"
          data-testid="card"
        />
      );
      const card = screen.getByTestId('card');
      const valueContainer = card.querySelector('[class*="items-baseline"]');
      expect(valueContainer).toBeInTheDocument();
      expect(valueContainer).toHaveClass('flex');
      expect(valueContainer).toHaveClass('gap-2');
    });
  });

  describe('Complete Examples', () => {
    it('renders revenue card with all props', () => {
      render(
        <DataCard
          value="$45,231"
          label="Revenue"
          description="This month"
          trend="+12.5%"
          trendDirection="up"
        />
      );

      expect(screen.getByText('$45,231')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('This month')).toBeInTheDocument();
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
    });

    it('renders users card with up trend', () => {
      render(
        <DataCard
          value="1,234"
          label="Total Users"
          trend="+20%"
          trendDirection="up"
        />
      );

      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      const trend = screen.getByText('+20%');
      expect(trend).toHaveClass('text-green-600');
    });

    it('renders error card with down trend', () => {
      render(
        <DataCard
          value="5"
          label="Critical Errors"
          trend="-60%"
          trendDirection="down"
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Critical Errors')).toBeInTheDocument();
      const trend = screen.getByText('-60%');
      expect(trend).toHaveClass('text-red-600');
    });

    it('renders simple metric without extras', () => {
      render(<DataCard value="42" label="Active Tasks" />);

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long value', () => {
      render(
        <DataCard
          value="123,456,789,012,345"
          label="Large Number"
        />
      );
      expect(screen.getByText('123,456,789,012,345')).toBeInTheDocument();
    });

    it('handles empty string value', () => {
      render(<DataCard value="" label="Empty" />);
      const card = screen.getByText('Empty').closest('div');
      expect(card).toBeInTheDocument();
    });

    it('handles special characters in label', () => {
      render(<DataCard value="100" label="Users (Active/Total)" />);
      expect(screen.getByText('Users (Active/Total)')).toBeInTheDocument();
    });

    it('handles multiline description', () => {
      render(
        <DataCard
          value="100"
          label="Score"
          description="Based on last 7 days of activity"
        />
      );
      expect(screen.getByText('Based on last 7 days of activity')).toBeInTheDocument();
    });
  });
});
