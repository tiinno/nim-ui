import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  MetricCard,
  MetricCardDelta,
  MetricCardDescription,
  MetricCardFooter,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardValue,
  MetricCardVisual,
} from './metric-card';

describe('MetricCard', () => {
  it('renders a labelled dashboard metric with value, delta, and description', () => {
    render(
      <MetricCard aria-label="Revenue metric" tone="success">
        <MetricCardHeader>
          <MetricCardLabel>Revenue</MetricCardLabel>
          <MetricCardDelta>+12.4%</MetricCardDelta>
        </MetricCardHeader>
        <MetricCardValue>$84.2K</MetricCardValue>
        <MetricCardDescription>Compared with the previous 7 days.</MetricCardDescription>
      </MetricCard>
    );

    expect(screen.getByLabelText('Revenue metric')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$84.2K')).toBeInTheDocument();
    expect(screen.getByText('+12.4%')).toBeInTheDocument();
    expect(screen.getByText('Compared with the previous 7 days.')).toBeInTheDocument();
  });

  it('applies tone styling to the card accent and delta', () => {
    render(
      <MetricCard tone="warning" data-testid="metric-card">
        <MetricCardHeader>
          <MetricCardLabel>Risk queue</MetricCardLabel>
          <MetricCardDelta data-testid="metric-delta">+8</MetricCardDelta>
        </MetricCardHeader>
      </MetricCard>
    );

    expect(screen.getByTestId('metric-card')).toHaveClass('border-warning-200');
    expect(screen.getByTestId('metric-delta')).toHaveClass('text-warning-800');
  });

  it('supports compact density, custom classes, hidden accent, visual slot, and footer', () => {
    render(
      <MetricCard
        density="compact"
        showAccent={false}
        className="custom-metric"
        data-testid="metric-card"
      >
        <MetricCardLabel>Fulfilment SLA</MetricCardLabel>
        <MetricCardValue>96.8%</MetricCardValue>
        <MetricCardVisual aria-label="SLA sparkline" className="custom-visual">
          <span>sparkline</span>
        </MetricCardVisual>
        <MetricCardFooter>
          <span>Updated 2 min ago</span>
          <span>Bangkok warehouse</span>
        </MetricCardFooter>
      </MetricCard>
    );

    const card = screen.getByTestId('metric-card');
    expect(card).toHaveClass('custom-metric');
    expect(card).toHaveClass('p-3');
    expect(screen.getByLabelText('SLA sparkline')).toHaveClass('custom-visual');
    expect(screen.getByText('Updated 2 min ago')).toBeInTheDocument();
    expect(card.querySelector('.h-1')).toBeNull();
  });

  it('lets delta tone override the card tone', () => {
    render(
      <MetricCard tone="info">
        <MetricCardDelta tone="danger" data-testid="metric-delta">
          -3.1%
        </MetricCardDelta>
      </MetricCard>
    );

    expect(screen.getByTestId('metric-delta')).toHaveClass('text-error-700');
  });
});
