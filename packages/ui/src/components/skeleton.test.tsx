import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies base animation classes', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('rounded-md');
    expect(container.firstChild).toHaveClass('bg-neutral-200');
  });

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    expect(container.firstChild).toHaveClass('h-8');
    expect(container.firstChild).toHaveClass('w-32');
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes HTML attributes', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'skeleton');
  });
});
