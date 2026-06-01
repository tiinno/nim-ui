import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
} from './page-header';

describe('PageHeader', () => {
  it('renders a semantic page title with supporting description', () => {
    render(
      <PageHeader>
        <PageHeaderTitle>Orders</PageHeaderTitle>
        <PageHeaderDescription>
          Review exceptions, fulfillment status, and risk signals.
        </PageHeaderDescription>
      </PageHeader>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByText('Review exceptions, fulfillment status, and risk signals.')).toBeInTheDocument();
  });

  it('places page actions in a labelled action region', () => {
    render(
      <PageHeader>
        <PageHeaderTitle>Inventory</PageHeaderTitle>
        <PageHeaderActions aria-label="Inventory actions">
          <button type="button">Export</button>
          <button type="button">Create item</button>
        </PageHeaderActions>
      </PageHeader>
    );

    expect(screen.getByRole('group', { name: 'Inventory actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create item' })).toBeInTheDocument();
  });

  it('supports compact metadata without changing the main heading level', () => {
    render(
      <PageHeader>
        <PageHeaderMeta>Updated 2 minutes ago</PageHeaderMeta>
        <PageHeaderTitle>Operations cockpit</PageHeaderTitle>
      </PageHeader>
    );

    expect(screen.getByText('Updated 2 minutes ago')).toHaveClass('text-xs');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Operations cockpit');
  });

  it('merges custom className with the default layout classes', () => {
    render(
      <PageHeader className="custom-header">
        <PageHeaderTitle>Reports</PageHeaderTitle>
      </PageHeader>
    );

    expect(screen.getByRole('banner')).toHaveClass('custom-header');
    expect(screen.getByRole('banner')).toHaveClass('gap-4');
  });
});
