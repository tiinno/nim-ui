import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test/test-utils';
import {
  FilterSummary,
  FilterSummaryClear,
  FilterSummaryItem,
  FilterSummaryList,
} from './filter-summary';

describe('FilterSummary', () => {
  it('renders active filter labels and values in a labelled region', () => {
    render(
      <FilterSummary aria-label="Active order filters">
        <FilterSummaryList>
          <FilterSummaryItem label="Status" value="Open" onRemove={() => undefined} />
          <FilterSummaryItem label="Risk" value="High" onRemove={() => undefined} />
        </FilterSummaryList>
      </FilterSummary>
    );

    expect(screen.getByRole('region', { name: 'Active order filters' })).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Risk')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('calls the item remove callback with an accessible button label', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <FilterSummary aria-label="Active filters">
        <FilterSummaryList>
          <FilterSummaryItem label="Warehouse" value="Bangkok" onRemove={onRemove} />
        </FilterSummaryList>
      </FilterSummary>
    );

    await user.click(screen.getByRole('button', { name: 'Remove Warehouse filter Bangkok' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('supports clear all behavior', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(
      <FilterSummary aria-label="Active filters">
        <FilterSummaryList>
          <FilterSummaryItem label="Payment" value="Failed" onRemove={() => undefined} />
        </FilterSummaryList>
        <FilterSummaryClear onClear={onClear} />
      </FilterSummary>
    );

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders a compact empty state when there are no active filters', () => {
    render(
      <FilterSummary aria-label="Active filters">
        <FilterSummaryList emptyText="No filters applied" />
      </FilterSummary>
    );

    expect(screen.getByText('No filters applied')).toHaveClass('text-neutral-500');
  });

  it('merges custom className with the wrapping layout classes', () => {
    render(
      <FilterSummary aria-label="Active filters" className="custom-summary">
        <FilterSummaryList>
          <FilterSummaryItem label="Channel" value="Wholesale" onRemove={() => undefined} />
        </FilterSummaryList>
      </FilterSummary>
    );

    expect(screen.getByRole('region')).toHaveClass('custom-summary');
    expect(screen.getByRole('region')).toHaveClass('gap-2');
  });
});
