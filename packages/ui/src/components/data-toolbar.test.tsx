import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  DataToolbar,
  DataToolbarActions,
  DataToolbarFilters,
  DataToolbarMeta,
  DataToolbarSearch,
} from './data-toolbar';

describe('DataToolbar', () => {
  it('renders a labelled toolbar for table controls', () => {
    render(
      <DataToolbar aria-label="Order table controls">
        <DataToolbarSearch>
          <input aria-label="Search orders" />
        </DataToolbarSearch>
      </DataToolbar>
    );

    expect(screen.getByRole('toolbar', { name: 'Order table controls' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search orders' })).toBeInTheDocument();
  });

  it('groups filters and actions with accessible labels', () => {
    render(
      <DataToolbar aria-label="Inventory controls">
        <DataToolbarFilters aria-label="Inventory filters">
          <button type="button">Open only</button>
        </DataToolbarFilters>
        <DataToolbarActions aria-label="Inventory actions">
          <button type="button">Export</button>
        </DataToolbarActions>
      </DataToolbar>
    );

    expect(screen.getByRole('group', { name: 'Inventory filters' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Inventory actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open only' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('supports compact metadata for result counts or freshness', () => {
    render(
      <DataToolbar aria-label="Report controls">
        <DataToolbarMeta>184 results</DataToolbarMeta>
      </DataToolbar>
    );

    expect(screen.getByText('184 results')).toHaveClass('text-sm');
  });

  it('merges custom className with the default layout classes', () => {
    render(
      <DataToolbar aria-label="Custom controls" className="custom-toolbar">
        <DataToolbarMeta>Synced now</DataToolbarMeta>
      </DataToolbar>
    );

    expect(screen.getByRole('toolbar')).toHaveClass('custom-toolbar');
    expect(screen.getByRole('toolbar')).toHaveClass('gap-3');
  });
});
