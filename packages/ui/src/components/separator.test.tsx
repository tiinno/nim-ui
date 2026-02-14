import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders with separator role', () => {
    const { container } = render(<Separator decorative={false} />);
    expect(container.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('renders horizontal by default', () => {
    const { container } = render(<Separator />);
    const sep = container.firstChild;
    expect(sep).toHaveClass('h-px', 'w-full');
  });

  it('renders vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const sep = container.firstChild;
    expect(sep).toHaveClass('h-full', 'w-px');
  });

  it('applies base background class', () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveClass('bg-neutral-200');
  });

  it('merges custom className', () => {
    const { container } = render(<Separator className="my-4" />);
    expect(container.firstChild).toHaveClass('my-4');
    expect(container.firstChild).toHaveClass('bg-neutral-200');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('is decorative by default', () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[role="none"]')).toBeInTheDocument();
  });
});
