import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { StatusPill } from './status-pill';

describe('StatusPill', () => {
  it('renders an operational status label with a decorative dot', () => {
    render(<StatusPill status="processing">Picking</StatusPill>);

    expect(screen.getByText('Picking')).toBeInTheDocument();
    expect(screen.getByText('Picking').parentElement).toHaveClass('bg-info-50');
    expect(screen.getByTestId('status-pill-dot')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports common admin status variants', () => {
    render(
      <div>
        <StatusPill status="active">Active</StatusPill>
        <StatusPill status="pending">Pending</StatusPill>
        <StatusPill status="success">Paid</StatusPill>
        <StatusPill status="warning">Needs review</StatusPill>
        <StatusPill status="failed">Failed</StatusPill>
        <StatusPill status="blocked">Blocked</StatusPill>
        <StatusPill status="archived">Archived</StatusPill>
      </div>
    );

    expect(screen.getByText('Active').parentElement).toHaveClass('bg-success-50');
    expect(screen.getByText('Pending').parentElement).toHaveClass('bg-neutral-50');
    expect(screen.getByText('Paid').parentElement).toHaveClass('bg-success-50');
    expect(screen.getByText('Needs review').parentElement).toHaveClass('bg-warning-50');
    expect(screen.getByText('Failed').parentElement).toHaveClass('bg-error-50');
    expect(screen.getByText('Blocked').parentElement).toHaveClass('bg-error-100');
    expect(screen.getByText('Archived').parentElement).toHaveClass('bg-neutral-100');
  });

  it('can hide the dot for compact table cells', () => {
    render(<StatusPill status="success" showDot={false}>Fulfilled</StatusPill>);

    expect(screen.getByText('Fulfilled')).toBeInTheDocument();
    expect(screen.queryByTestId('status-pill-dot')).not.toBeInTheDocument();
  });

  it('supports pulse, size, and custom classes', () => {
    render(
      <StatusPill status="processing" size="lg" pulse className="custom-status">
        Syncing
      </StatusPill>
    );

    expect(screen.getByText('Syncing').parentElement).toHaveClass('text-sm');
    expect(screen.getByText('Syncing').parentElement).toHaveClass('custom-status');
    expect(screen.getByTestId('status-pill-dot')).toHaveClass('animate-pulse');
  });

  // Size-critical utilities live in the size variants, never in the cva base:
  // a base copy is emitted first and wins in CSS order, so the size prop would
  // silently do nothing for padding and font-size.
  it('emits only the selected size padding and font size', () => {
    const { rerender } = render(<StatusPill size="sm">Small</StatusPill>);
    const sm = screen.getByText('Small').parentElement;
    expect(sm).toHaveClass('px-2', 'py-0.5', 'text-xs', 'leading-none');
    expect(sm).not.toHaveClass('px-2.5');
    expect(sm).not.toHaveClass('py-1');

    rerender(<StatusPill size="md">Medium</StatusPill>);
    const md = screen.getByText('Medium').parentElement;
    expect(md).toHaveClass('px-2.5', 'py-1', 'text-xs', 'leading-none');

    rerender(<StatusPill size="lg">Large</StatusPill>);
    const lg = screen.getByText('Large').parentElement;
    expect(lg).toHaveClass('px-3', 'py-1.5', 'text-sm', 'leading-none');
    expect(lg).not.toHaveClass('text-xs');
    expect(lg).not.toHaveClass('px-2.5');
    expect(lg).not.toHaveClass('py-1');
  });
});
