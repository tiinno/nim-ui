import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('renders with status role', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has default sr-only label', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading')).toHaveClass('sr-only');
  });

  it('accepts custom label', () => {
    render(<Spinner label="Processing" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container } = render(<Spinner size="xl" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('applies variant classes', () => {
    const { container } = render(<Spinner variant="success" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-success-600');
  });

  it('has animate-spin class', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('merges custom className', () => {
    const { container } = render(<Spinner className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  it('forwards ref to SVG', () => {
    const ref = { current: null };
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });
});
