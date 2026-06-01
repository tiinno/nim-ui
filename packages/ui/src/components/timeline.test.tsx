import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from './timeline';

describe('Timeline', () => {
  it('renders activity history as a semantic list', () => {
    render(
      <Timeline aria-label="Order activity">
        <TimelineItem>
          <TimelineMarker />
          <TimelineContent>
            <TimelineTitle>Order packed</TimelineTitle>
            <TimelineDescription>Warehouse team completed final scan.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineMarker />
          <TimelineContent>
            <TimelineTitle>Label printed</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    expect(screen.getByRole('list', { name: 'Order activity' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Order packed')).toBeInTheDocument();
    expect(screen.getByText('Warehouse team completed final scan.')).toBeInTheDocument();
  });

  it('renders timestamps with dateTime metadata', () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineContent>
            <TimelineTime dateTime="2026-05-24T08:30:00Z">08:30</TimelineTime>
            <TimelineTitle>Payment captured</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    expect(screen.getByText('08:30')).toHaveAttribute('dateTime', '2026-05-24T08:30:00Z');
  });

  it('keeps markers decorative and supports status variants', () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineMarker variant="success">Packed</TimelineMarker>
          <TimelineContent>
            <TimelineTitle>Packed</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const marker = screen.getByText('Packed', { selector: 'span' });
    expect(marker).toHaveAttribute('aria-hidden', 'true');
    expect(marker).toHaveClass('bg-success-600');
  });

  it('merges custom className with default layout classes', () => {
    render(
      <Timeline className="custom-timeline">
        <TimelineItem>
          <TimelineContent>
            <TimelineTitle>Created</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    expect(screen.getByRole('list')).toHaveClass('custom-timeline');
    expect(screen.getByRole('list')).toHaveClass('space-y-5');
  });
});
