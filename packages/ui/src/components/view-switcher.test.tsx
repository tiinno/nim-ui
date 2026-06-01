import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  ViewSwitcher,
  ViewSwitcherActions,
  ViewSwitcherCount,
  ViewSwitcherItem,
  ViewSwitcherLabel,
  ViewSwitcherMeta,
} from './view-switcher';

describe('ViewSwitcher', () => {
  it('renders saved views with tab semantics, selected state, counts, and metadata', () => {
    render(
      <ViewSwitcher aria-label="Order views">
        <ViewSwitcherItem value="all" selected count={128} meta="All active orders">
          All orders
        </ViewSwitcherItem>
        <ViewSwitcherItem value="review" count={12} meta="Manual approval needed">
          Needs review
        </ViewSwitcherItem>
      </ViewSwitcher>
    );

    expect(screen.getByRole('tablist', { name: 'Order views' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /All orders/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: /Needs review/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('Manual approval needed')).toBeInTheDocument();
  });

  it('calls onSelect with the selected view value', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ViewSwitcher>
        <ViewSwitcherItem value="failed" onSelect={handleSelect}>
          Failed payments
        </ViewSwitcherItem>
      </ViewSwitcher>
    );

    await user.click(screen.getByRole('tab', { name: 'Failed payments' }));

    expect(handleSelect).toHaveBeenCalledWith('failed');
  });

  it('supports disabled views and prevents selection callbacks', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ViewSwitcher>
        <ViewSwitcherItem value="archived" disabled onSelect={handleSelect}>
          Archived
        </ViewSwitcherItem>
      </ViewSwitcher>
    );

    expect(screen.getByRole('tab', { name: 'Archived' })).toBeDisabled();
    await user.click(screen.getByRole('tab', { name: 'Archived' }));
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('allows explicit label, meta, count, actions, compact density, and custom classes', () => {
    render(
      <div className="flex gap-2">
        <ViewSwitcher density="compact" className="custom-switcher">
          <ViewSwitcherItem value="delayed">
            <ViewSwitcherLabel>Delayed</ViewSwitcherLabel>
            <ViewSwitcherMeta>Breached SLA</ViewSwitcherMeta>
            <ViewSwitcherCount selected={false}>6</ViewSwitcherCount>
          </ViewSwitcherItem>
        </ViewSwitcher>
        <ViewSwitcherActions aria-label="View actions">
          <button type="button">Save view</button>
        </ViewSwitcherActions>
      </div>
    );

    expect(screen.getByRole('tablist')).toHaveClass('custom-switcher');
    expect(screen.getByRole('tab', { name: /Delayed/ })).toHaveClass('text-xs');
    expect(screen.getByText('Breached SLA')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'View actions' })).toBeInTheDocument();
  });
});
