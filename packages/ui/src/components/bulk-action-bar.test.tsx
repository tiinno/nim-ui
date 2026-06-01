import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  BulkActionBar,
  BulkActionBarActions,
  BulkActionBarClear,
  BulkActionBarMeta,
  BulkActionBarSelection,
} from './bulk-action-bar';

describe('BulkActionBar', () => {
  it('renders selected-row context and grouped actions', () => {
    render(
      <BulkActionBar aria-label="Selected order actions">
        <BulkActionBarSelection count={3} label="orders selected" />
        <BulkActionBarMeta>Review queue</BulkActionBarMeta>
        <BulkActionBarActions aria-label="Bulk order actions">
          <button type="button">Assign</button>
          <button type="button">Export</button>
        </BulkActionBarActions>
      </BulkActionBar>
    );

    expect(screen.getByRole('toolbar', { name: 'Selected order actions' })).toBeInTheDocument();
    expect(screen.getByLabelText('3 orders selected')).toBeInTheDocument();
    expect(screen.getByText('Review queue')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Bulk order actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('calls the clear handler from the built-in clear control', async () => {
    const handleClear = vi.fn();
    const user = userEvent.setup();

    render(
      <BulkActionBar aria-label="Selected inventory actions">
        <BulkActionBarSelection count={12} />
        <BulkActionBarClear onClear={handleClear} />
      </BulkActionBar>
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('keeps destructive actions visually separated from standard actions', () => {
    render(
      <BulkActionBar aria-label="Selected users actions">
        <BulkActionBarSelection count={2} label="users selected" />
        <BulkActionBarActions aria-label="Standard actions">
          <button type="button">Export</button>
        </BulkActionBarActions>
        <BulkActionBarActions aria-label="Danger actions" variant="destructive">
          <button type="button">Suspend</button>
        </BulkActionBarActions>
      </BulkActionBar>
    );

    expect(screen.getByRole('group', { name: 'Danger actions' })).toHaveClass('border-error-200');
    expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument();
  });

  it('merges custom className with the default sticky layout classes', () => {
    render(
      <BulkActionBar aria-label="Custom bulk actions" className="custom-bulk-bar">
        <BulkActionBarSelection count={1} />
      </BulkActionBar>
    );

    expect(screen.getByRole('toolbar')).toHaveClass('custom-bulk-bar');
    expect(screen.getByRole('toolbar')).toHaveClass('sticky');
  });
});
