import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert', () => {
  it('renders with alert role', () => {
    render(<Alert>Test alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Alert>Alert content</Alert>);
    expect(screen.getByText('Alert content')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Alert variant="destructive">Error</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-error-200');
    expect(alert).toHaveClass('bg-error-50');
  });

  it('applies info variant by default', () => {
    render(<Alert>Info</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-info-50');
  });

  it('renders dismiss button when dismissible', () => {
    render(<Alert dismissible>Dismissible</Alert>);
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Alert dismissible onDismiss={onDismiss}>Dismissible</Alert>);

    await user.click(screen.getByLabelText('Dismiss alert'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('does not render dismiss button when not dismissible', () => {
    render(<Alert>Not dismissible</Alert>);
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Alert ref={ref}>Ref test</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges custom className', () => {
    render(<Alert className="custom-class">Custom</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
});

describe('AlertTitle', () => {
  it('renders heading', () => {
    render(<AlertTitle>Title</AlertTitle>);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('applies font-semibold class', () => {
    render(<AlertTitle>Title</AlertTitle>);
    expect(screen.getByText('Title')).toHaveClass('font-semibold');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<AlertTitle ref={ref}>Title</AlertTitle>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('AlertDescription', () => {
  it('renders description', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('applies text-sm class', () => {
    render(<AlertDescription>Description</AlertDescription>);
    expect(screen.getByText('Description')).toHaveClass('text-sm');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<AlertDescription ref={ref}>Description</AlertDescription>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});
