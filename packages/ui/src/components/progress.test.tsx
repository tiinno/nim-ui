import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Progress } from './progress';

describe('Progress', () => {
  it('renders with correct role', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria attributes correctly', () => {
    render(<Progress value={30} max={200} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '30');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '200');
  });

  it('clamps percentage between 0 and 100', () => {
    const { container } = render(<Progress value={150} />);
    const indicator = container.querySelector('[style]');
    expect(indicator).toHaveStyle({ width: '100%' });
  });

  it('applies variant classes', () => {
    const { container } = render(<Progress value={50} variant="success" />);
    const indicator = container.querySelector('.bg-success-600');
    expect(indicator).toBeInTheDocument();
  });

  it('applies size classes', () => {
    render(<Progress value={50} size="lg" />);
    expect(screen.getByRole('progressbar')).toHaveClass('h-4');
  });

  it('shows label when showLabel and size lg', () => {
    render(<Progress value={75} size="lg" showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Progress ref={ref} value={0} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges custom className', () => {
    render(<Progress value={50} className="custom-class" />);
    expect(screen.getByRole('progressbar')).toHaveClass('custom-class');
  });
});
