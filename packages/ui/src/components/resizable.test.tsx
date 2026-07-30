import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent, userEvent } from '../test/test-utils';
import { Resizable, resizableVariants, resizableHandleVariants } from './resizable';

const panes = [<div key="a">List pane</div>, <div key="b">Inspector pane</div>];

// jsdom ships no PointerEvent constructor, so fireEvent would drop pointerId /
// clientX. A MouseEvent-derived stand-in keeps the drag path testable.
class PointerEventStub extends MouseEvent {
  pointerId: number;
  constructor(type: string, params: MouseEventInit & { pointerId?: number } = {}) {
    super(type, params);
    this.pointerId = params.pointerId ?? 0;
  }
}
(globalThis as unknown as { PointerEvent: typeof PointerEventStub }).PointerEvent =
  PointerEventStub;

describe('Resizable', () => {
  describe('Rendering', () => {
    it('renders both panes and a separator handle', () => {
      render(<Resizable>{panes}</Resizable>);
      expect(screen.getByText('List pane')).toBeInTheDocument();
      expect(screen.getByText('Inspector pane')).toBeInTheDocument();
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('exposes the full separator accessibility contract', () => {
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-label', 'Resize panes');
      expect(handle).toHaveAttribute('aria-orientation', 'vertical');
      expect(handle).toHaveAttribute('aria-valuenow', '50');
      expect(handle).toHaveAttribute('aria-valuemin', '15');
      expect(handle).toHaveAttribute('aria-valuemax', '85');
      expect(handle).toHaveAttribute('tabindex', '0');
    });

    it('accepts a custom handle label and bounds', () => {
      render(
        <Resizable handleLabel="Resize inspector" minSize={20} maxSize={70}>
          {panes}
        </Resizable>
      );
      const handle = screen.getByLabelText('Resize inspector');
      expect(handle).toHaveAttribute('aria-valuemin', '20');
      expect(handle).toHaveAttribute('aria-valuemax', '70');
    });

    it('sizes the first pane from defaultSize and lets the second fill', () => {
      render(<Resizable defaultSize={30}>{panes}</Resizable>);
      expect(screen.getByTestId('resizable-pane-1')).toHaveStyle({ flexBasis: '30%' });
      expect(screen.getByTestId('resizable-pane-2')).toHaveClass('flex-1');
    });

    it('applies surface styles including dark mode', () => {
      render(
        <Resizable data-testid="resizable-root">{panes}</Resizable>
      );
      const root = screen.getByTestId('resizable-root');
      expect(root).toHaveClass('flex');
      expect(root).toHaveClass('rounded-md');
      expect(root).toHaveClass('border-neutral-200');
      expect(root).toHaveClass('bg-white');
      expect(root).toHaveClass('dark:border-neutral-800');
      expect(root).toHaveClass('dark:bg-neutral-950');
    });

    it('clamps a defaultSize outside the bounds', () => {
      render(
        <Resizable defaultSize={95} minSize={20} maxSize={80}>
          {panes}
        </Resizable>
      );
      expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '80');
    });

    it('announces the value as a percentage', () => {
      render(<Resizable defaultSize={40}>{panes}</Resizable>);
      expect(screen.getByRole('separator')).toHaveAttribute('aria-valuetext', '40%');
    });

    it('points aria-controls at the pane it sizes', () => {
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      const pane = screen.getByTestId('resizable-pane-1');
      expect(pane.id).toBeTruthy();
      expect(handle).toHaveAttribute('aria-controls', pane.id);
    });
  });

  describe('Degenerate bounds', () => {
    it('never renders a negative or above-100 percentage', async () => {
      const user = userEvent.setup();
      render(
        <Resizable defaultSize={-40} minSize={-20} maxSize={200}>
          {panes}
        </Resizable>
      );
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-valuemin', '0');
      expect(handle).toHaveAttribute('aria-valuemax', '100');
      expect(handle).toHaveAttribute('aria-valuenow', '0');
      expect(screen.getByTestId('resizable-pane-1')).toHaveStyle({ flexBasis: '0%' });

      handle.focus();
      await user.keyboard('{End}');
      expect(handle).toHaveAttribute('aria-valuenow', '100');
      expect(screen.getByTestId('resizable-pane-1')).toHaveStyle({ flexBasis: '100%' });
    });

    it('clamps a non-finite size to the correct bound', () => {
      const { rerender } = render(<Resizable size={Number.POSITIVE_INFINITY}>{panes}</Resizable>);
      expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '85');
      rerender(<Resizable size={Number.NEGATIVE_INFINITY}>{panes}</Resizable>);
      expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '15');
      rerender(<Resizable size={Number.NaN}>{panes}</Resizable>);
      expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '15');
    });

    it('falls back to the full range when a bound is NaN', () => {
      render(
        <Resizable minSize={Number.NaN} maxSize={Number.NaN} defaultSize={50}>
          {panes}
        </Resizable>
      );
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-valuemin', '0');
      expect(handle).toHaveAttribute('aria-valuemax', '100');
      expect(handle).toHaveAttribute('aria-valuenow', '50');
      expect(screen.getByTestId('resizable-pane-1')).toHaveStyle({ flexBasis: '50%' });
    });
  });

  describe('Children edge cases', () => {
    it('renders a single child without a handle', () => {
      render(<Resizable>{[<div key="a">Only pane</div>]}</Resizable>);
      expect(screen.getByText('Only pane')).toBeInTheDocument();
      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    it('renders nothing but the frame when there are no children', () => {
      render(<Resizable data-testid="resizable-root" />);
      expect(screen.getByTestId('resizable-root')).toBeInTheDocument();
      expect(screen.queryByTestId('resizable-pane-1')).not.toBeInTheDocument();
      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    it('uses only the first two of three children', () => {
      render(
        <Resizable>
          <div>One</div>
          <div>Two</div>
          <div>Three</div>
        </Resizable>
      );
      expect(screen.getByText('One')).toBeInTheDocument();
      expect(screen.getByText('Two')).toBeInTheDocument();
      expect(screen.queryByText('Three')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard interaction', () => {
    it('nudges by 1% with ArrowRight and ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{ArrowRight}');
      expect(handle).toHaveAttribute('aria-valuenow', '51');
      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(handle).toHaveAttribute('aria-valuenow', '49');
    });

    it('nudges by 10% with Shift+Arrow', async () => {
      const user = userEvent.setup();
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
      expect(handle).toHaveAttribute('aria-valuenow', '60');
      await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      expect(handle).toHaveAttribute('aria-valuenow', '50');
    });

    it('jumps to minSize on Home and maxSize on End', async () => {
      const user = userEvent.setup();
      render(
        <Resizable minSize={20} maxSize={75}>
          {panes}
        </Resizable>
      );
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{Home}');
      expect(handle).toHaveAttribute('aria-valuenow', '20');
      await user.keyboard('{End}');
      expect(handle).toHaveAttribute('aria-valuenow', '75');
    });

    it('resets to defaultSize on Enter', async () => {
      const user = userEvent.setup();
      render(<Resizable defaultSize={35}>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{End}');
      expect(handle).toHaveAttribute('aria-valuenow', '85');
      await user.keyboard('{Enter}');
      expect(handle).toHaveAttribute('aria-valuenow', '35');
    });

    it('clamps at both bounds instead of overshooting', async () => {
      const user = userEvent.setup();
      render(
        <Resizable defaultSize={16} minSize={15} maxSize={85}>
          {panes}
        </Resizable>
      );
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      expect(handle).toHaveAttribute('aria-valuenow', '15');
      await user.keyboard('{ArrowLeft}');
      expect(handle).toHaveAttribute('aria-valuenow', '15');
    });

    it('responds to ArrowUp/ArrowDown and ignores horizontal keys when vertical', async () => {
      const user = userEvent.setup();
      render(<Resizable direction="vertical">{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{ArrowDown}');
      expect(handle).toHaveAttribute('aria-valuenow', '51');
      await user.keyboard('{ArrowUp}{ArrowUp}');
      expect(handle).toHaveAttribute('aria-valuenow', '49');
      await user.keyboard('{ArrowRight}{ArrowLeft}');
      expect(handle).toHaveAttribute('aria-valuenow', '49');
    });

    it('ignores unrelated keys', async () => {
      const user = userEvent.setup();
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{Escape}a');
      expect(handle).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('Controlled mode', () => {
    it('renders the controlled size and does not self-move', async () => {
      const user = userEvent.setup();
      const onSizeChange = vi.fn();
      render(
        <Resizable size={40} onSizeChange={onSizeChange}>
          {panes}
        </Resizable>
      );
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{ArrowRight}');
      expect(handle).toHaveAttribute('aria-valuenow', '40');
      expect(onSizeChange).toHaveBeenCalledWith(41);
    });

    it('clamps an out-of-range controlled size', () => {
      render(
        <Resizable size={5} minSize={20} maxSize={80}>
          {panes}
        </Resizable>
      );
      expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '20');
      expect(screen.getByTestId('resizable-pane-1')).toHaveStyle({ flexBasis: '20%' });
    });

    it('calls onSizeChange in uncontrolled mode too', async () => {
      const user = userEvent.setup();
      const onSizeChange = vi.fn();
      render(<Resizable onSizeChange={onSizeChange}>{panes}</Resizable>);
      screen.getByRole('separator').focus();
      await user.keyboard('{Home}');
      expect(onSizeChange).toHaveBeenCalledWith(15);
    });
  });

  describe('Disabled', () => {
    it('marks the handle disabled but keeps it focusable', () => {
      render(<Resizable disabled>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveAttribute('aria-disabled', 'true');
      expect(handle).toHaveAttribute('tabindex', '0');
      expect(handle).toHaveClass('cursor-default');
      expect(handle).toHaveClass('opacity-60');
    });

    it('ignores keyboard input', async () => {
      const user = userEvent.setup();
      const onSizeChange = vi.fn();
      render(
        <Resizable disabled onSizeChange={onSizeChange}>
          {panes}
        </Resizable>
      );
      const handle = screen.getByRole('separator');
      handle.focus();
      await user.keyboard('{ArrowRight}{End}');
      expect(handle).toHaveAttribute('aria-valuenow', '50');
      expect(onSizeChange).not.toHaveBeenCalled();
    });

    it('ignores pointer input', () => {
      render(<Resizable disabled>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      const setPointerCapture = vi.fn();
      Object.assign(handle, { setPointerCapture });
      fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
      expect(setPointerCapture).not.toHaveBeenCalled();
      expect(handle).not.toHaveAttribute('data-dragging');
    });
  });

  describe('Direction variants', () => {
    it('renders horizontal layout classes on root and handle', () => {
      render(<Resizable data-testid="resizable-root">{panes}</Resizable>);
      const root = screen.getByTestId('resizable-root');
      const handle = screen.getByRole('separator');
      expect(root).toHaveClass('flex-row');
      expect(root).toHaveAttribute('data-direction', 'horizontal');
      expect(handle).toHaveClass('w-1.5');
      expect(handle).toHaveClass('cursor-col-resize');
      expect(handle).toHaveClass('bg-neutral-200');
      expect(handle).toHaveClass('dark:bg-neutral-800');
    });

    it('renders vertical layout classes on root and handle', () => {
      render(
        <Resizable direction="vertical" data-testid="resizable-root">
          {panes}
        </Resizable>
      );
      const root = screen.getByTestId('resizable-root');
      const handle = screen.getByRole('separator');
      expect(root).toHaveClass('flex-col');
      expect(root).toHaveAttribute('data-direction', 'vertical');
      expect(handle).toHaveClass('h-1.5');
      expect(handle).toHaveClass('cursor-row-resize');
      expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('applies the steel focus ring and hover tint in both themes', () => {
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveClass('focus-visible:outline-none');
      expect(handle).toHaveClass('focus-visible:ring-2');
      expect(handle).toHaveClass('focus-visible:ring-offset-2');
      // Both halves of the pair — neither step clears 3:1 in both themes alone.
      expect(handle).toHaveClass('focus-visible:ring-primary-500');
      expect(handle).toHaveClass('dark:focus-visible:ring-primary-400');
      expect(handle).toHaveClass('hover:bg-primary-200');
      expect(handle).toHaveClass('dark:hover:bg-primary-900');
    });

    it('opts the handle out of touch scrolling and text selection', () => {
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      expect(handle).toHaveClass('touch-none');
      expect(handle).toHaveClass('select-none');
    });

    it('renders a grip with light and dark styling', () => {
      render(<Resizable>{panes}</Resizable>);
      const grip = screen.getByTestId('resizable-grip');
      expect(grip).toHaveClass('bg-neutral-400');
      expect(grip).toHaveClass('dark:bg-neutral-600');
      expect(grip).toHaveClass('group-hover:bg-primary-500');
      expect(grip).toHaveClass('dark:group-hover:bg-primary-400');
      expect(grip).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Pointer interaction', () => {
    it('captures the pointer on pointerdown without throwing', () => {
      render(<Resizable data-testid="resizable-root">{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      const setPointerCapture = vi.fn();
      Object.assign(handle, { setPointerCapture });
      expect(() => fireEvent.pointerDown(handle, { pointerId: 7, clientX: 120 })).not.toThrow();
      expect(setPointerCapture).toHaveBeenCalledWith(7);
      expect(handle).toHaveAttribute('data-dragging', 'true');
      expect(screen.getByTestId('resizable-root')).toHaveClass('select-none');
    });

    it('survives pointerdown when the browser lacks pointer capture', () => {
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      expect(() => fireEvent.pointerDown(handle, { pointerId: 1, clientX: 10 })).not.toThrow();
    });

    it('does not produce NaN when the container has zero width', () => {
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      Object.assign(handle, { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() });
      fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 250 });
      expect(handle).toHaveAttribute('aria-valuenow', '50');
      expect(screen.getByTestId('resizable-pane-1')).toHaveStyle({ flexBasis: '50%' });
    });

    it('releases the drag on pointerup', () => {
      render(<Resizable>{panes}</Resizable>);
      const handle = screen.getByRole('separator');
      Object.assign(handle, { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() });
      fireEvent.pointerDown(handle, { pointerId: 3, clientX: 40 });
      expect(handle).toHaveAttribute('data-dragging', 'true');
      fireEvent.pointerUp(handle, { pointerId: 3 });
      expect(handle).not.toHaveAttribute('data-dragging');
    });

    it('updates size from a measured container during drag', () => {
      render(<Resizable data-testid="resizable-root">{panes}</Resizable>);
      const root = screen.getByTestId('resizable-root');
      const handle = screen.getByRole('separator');
      Object.assign(handle, { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() });
      root.getBoundingClientRect = () =>
        ({ left: 0, top: 0, width: 400, height: 200, right: 400, bottom: 200, x: 0, y: 0 }) as DOMRect;
      fireEvent.pointerDown(handle, { pointerId: 5, clientX: 200 });
      fireEvent.pointerMove(handle, { pointerId: 5, clientX: 120 });
      expect(handle).toHaveAttribute('aria-valuenow', '30');
      fireEvent.pointerMove(handle, { pointerId: 5, clientX: 396 });
      expect(handle).toHaveAttribute('aria-valuenow', '85');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Resizable ref={ref}>{panes}</Resizable>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass('flex-row');
    });

    it('supports a callback ref', () => {
      const seen: (HTMLDivElement | null)[] = [];
      render(
        <Resizable
          ref={(node) => {
            seen.push(node);
          }}
        >
          {panes}
        </Resizable>
      );
      expect(seen[0]).toBeInstanceOf(HTMLDivElement);
      expect(seen[0]).toHaveAttribute('data-direction', 'horizontal');
    });
  });

  describe('Variant functions', () => {
    it('resizableVariants returns direction classes', () => {
      expect(resizableVariants({ direction: 'vertical' })).toContain('flex-col');
      expect(resizableVariants({ direction: 'horizontal' })).toContain('flex-row');
    });

    it('resizableHandleVariants returns handle classes', () => {
      const enabled = resizableHandleVariants({ direction: 'horizontal', disabled: false });
      expect(enabled).toContain('cursor-col-resize');
      expect(enabled).toContain('focus-visible:ring-primary-500');
      expect(enabled).toContain('dark:focus-visible:ring-primary-400');
      const off = resizableHandleVariants({ direction: 'vertical', disabled: true });
      expect(off).toContain('cursor-row-resize');
      expect(off).toContain('opacity-60');
    });
  });

  describe('Customization', () => {
    it('merges custom className on the root', () => {
      render(
        <Resizable className="h-96" data-testid="resizable-root">
          {panes}
        </Resizable>
      );
      const root = screen.getByTestId('resizable-root');
      expect(root).toHaveClass('h-96');
      expect(root).toHaveClass('flex');
    });

    it('passes through HTML attributes', () => {
      render(
        <Resizable data-testid="resizable-root" id="order-split" aria-label="Order workspace">
          {panes}
        </Resizable>
      );
      const root = screen.getByTestId('resizable-root');
      expect(root).toHaveAttribute('id', 'order-split');
      expect(root).toHaveAttribute('aria-label', 'Order workspace');
    });
  });
});
