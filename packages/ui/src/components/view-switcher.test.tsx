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
    const compactTab = screen.getByRole('tab', { name: /Delayed/ });
    expect(compactTab).toHaveClass('text-xs');
    // The base must not also emit `text-sm`, or the density prop's font size
    // would be decided by CSS emission order instead of by the variant.
    expect(compactTab).not.toHaveClass('text-sm');
    expect(screen.getByText('Breached SLA')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'View actions' })).toBeInTheDocument();
  });

  it('paints the same root classes at every density value (NIMUI-90: no vestigial cva group)', () => {
    // `density` feeds ViewSwitcherContext (spent by ViewSwitcherItem) but paints
    // nothing on the root itself. viewSwitcherVariants used to declare a
    // `density` group whose two keys both resolved to '', which is why removing
    // that group cannot change this string: it contributed nothing before, and
    // has nothing left to contribute now.
    const { container: comfortable } = render(
      <ViewSwitcher density="comfortable" aria-label="Density check" />
    );
    const { container: compact } = render(
      <ViewSwitcher density="compact" aria-label="Density check" />
    );
    const { container: defaulted } = render(<ViewSwitcher aria-label="Density check" />);

    const comfortableClass = comfortable.querySelector('[role="tablist"]')?.className;
    const compactClass = compact.querySelector('[role="tablist"]')?.className;
    const defaultClass = defaulted.querySelector('[role="tablist"]')?.className;

    expect(comfortableClass).toBe(
      'flex min-w-0 gap-1 overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900/60'
    );
    expect(compactClass).toBe(comfortableClass);
    expect(defaultClass).toBe(comfortableClass);
  });

  it('gives every tab the steel focus pair', () => {
    render(
      <ViewSwitcher>
        <ViewSwitcherItem value="open" selected>
          <ViewSwitcherLabel>Open</ViewSwitcherLabel>
        </ViewSwitcherItem>
        <ViewSwitcherItem value="closed">
          <ViewSwitcherLabel>Closed</ViewSwitcherLabel>
        </ViewSwitcherItem>
      </ViewSwitcher>
    );

    // NIMUI-55. Selected and unselected tabs share the base string, so both get
    // the contract's pair; the neutral ring they shipped with measured 2.48:1
    // against this component's own 50 strip.
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).toHaveClass('focus-visible:outline-primary-500');
      expect(tab).toHaveClass('dark:focus-visible:outline-primary-400');
    }
  });
});
