import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from './empty-state';

describe('EmptyState', () => {
  it('renders a calm status message with title and description', () => {
    render(
      <EmptyState aria-label="No orders">
        <EmptyStateTitle>No orders found</EmptyStateTitle>
        <EmptyStateDescription>
          Adjust filters or create the first order for this warehouse.
        </EmptyStateDescription>
      </EmptyState>
    );

    expect(screen.getByRole('status', { name: 'No orders' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'No orders found' })).toBeInTheDocument();
    expect(screen.getByText('Adjust filters or create the first order for this warehouse.')).toBeInTheDocument();
  });

  it('keeps decorative icons hidden from assistive technology', () => {
    render(
      <EmptyState>
        <EmptyStateIcon>
          <span>Icon</span>
        </EmptyStateIcon>
        <EmptyStateTitle>No reports</EmptyStateTitle>
      </EmptyState>
    );

    expect(screen.getByText('Icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('groups recovery actions with an accessible label', () => {
    render(
      <EmptyState>
        <EmptyStateTitle>No products</EmptyStateTitle>
        <EmptyStateActions aria-label="Empty products actions">
          <button type="button">Clear filters</button>
          <button type="button">Create product</button>
        </EmptyStateActions>
      </EmptyState>
    );

    expect(screen.getByRole('group', { name: 'Empty products actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create product' })).toBeInTheDocument();
  });

  it('merges custom className with the default layout classes', () => {
    render(
      <EmptyState className="custom-empty-state">
        <EmptyStateTitle>No rows</EmptyStateTitle>
      </EmptyState>
    );

    expect(screen.getByRole('status')).toHaveClass('custom-empty-state');
    expect(screen.getByRole('status')).toHaveClass('items-center');
  });
});
