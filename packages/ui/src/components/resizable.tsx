import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Resizable component for draggable two-pane splits
 *
 * The backoffice workhorse layout: a record list beside a RecordInspector,
 * with an operator-adjustable divider. Dependency-free — pointer drag plus a
 * full keyboard model on a `role="separator"` handle. Unlike Grid or Flex,
 * which distribute space by a fixed rule, Resizable hands that ratio to the
 * user and reports it back through `onSizeChange`.
 *
 * @example
 * // List beside an inspector
 * <Resizable className="h-96" defaultSize={40}>
 *   <OrderList />
 *   <RecordInspector aria-label="Order inspector">…</RecordInspector>
 * </Resizable>
 *
 * @example
 * // Vertical split — results above a log console
 * <Resizable direction="vertical" className="h-96" defaultSize={65} minSize={25}>
 *   <QueryResults />
 *   <LogConsole />
 * </Resizable>
 *
 * @example
 * // Controlled, so the ratio can be persisted per operator
 * <Resizable className="h-96" size={size} onSizeChange={setSize} handleLabel="Resize inspector">
 *   <OrderList />
 *   <RecordInspector aria-label="Order inspector">…</RecordInspector>
 * </Resizable>
 */

const resizableVariants = cva('flex w-full', {
  variants: {
    direction: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    direction: 'horizontal',
  },
});

const resizableHandleVariants = cva(
  'group relative flex shrink-0 grow-0 touch-none select-none items-center justify-center bg-neutral-200 transition-colors duration-(--duration-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 dark:bg-neutral-800',
  {
    variants: {
      direction: {
        horizontal: 'h-full w-1.5 cursor-col-resize',
        vertical: 'h-1.5 w-full cursor-row-resize',
      },
      disabled: {
        true: 'cursor-default opacity-60',
        false:
          'hover:bg-primary-200 active:bg-primary-300 dark:hover:bg-primary-900 dark:active:bg-primary-800',
      },
    },
    defaultVariants: {
      direction: 'horizontal',
      disabled: false,
    },
  }
);

/** A pane bound is a percentage: keep it inside 0–100, and fall back when it is NaN. */
const toPercent = (value: number, fallback: number): number =>
  Number.isNaN(value) ? fallback : Math.min(100, Math.max(0, value));

const clampSize = (value: number, minSize: number, maxSize: number): number => {
  const low = Math.min(minSize, maxSize);
  const high = Math.max(minSize, maxSize);
  // NaN has no side to clamp to; ±Infinity clamps normally via min/max.
  if (Number.isNaN(value)) return low;
  return Math.min(high, Math.max(low, value));
};

export interface ResizableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof resizableVariants> {
  /** Split axis — horizontal places panes side by side with a vertical handle */
  direction?: 'horizontal' | 'vertical';
  /** Uncontrolled starting size of the first pane, as a percentage */
  defaultSize?: number;
  /** Controlled size of the first pane, as a percentage */
  size?: number;
  /** Called with the new first-pane percentage on every resize */
  onSizeChange?: (size: number) => void;
  /** Smallest allowed first-pane percentage */
  minSize?: number;
  /** Largest allowed first-pane percentage */
  maxSize?: number;
  /** Accessible name for the drag handle */
  handleLabel?: string;
  /** Lock the split — the handle stays focusable but ignores input */
  disabled?: boolean;
  /** Exactly two panes; extras are ignored and fewer render without a handle */
  children?: React.ReactNode;
}

const Resizable = React.forwardRef<HTMLDivElement, ResizableProps>(
  (
    {
      className,
      direction = 'horizontal',
      defaultSize = 50,
      size: controlledSize,
      onSizeChange,
      minSize = 15,
      maxSize = 85,
      handleLabel = 'Resize panes',
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const capturedPointerRef = React.useRef<number | null>(null);
    const paneId = React.useId();

    // Bounds are percentages, so they can never leave 0–100 however they arrive,
    // and a reversed pair (min > max) is normalized rather than trusted.
    const boundA = toPercent(minSize, 0);
    const boundB = toPercent(maxSize, 100);
    const lowerBound = Math.min(boundA, boundB);
    const upperBound = Math.max(boundA, boundB);

    const [uncontrolledSize, setUncontrolledSize] = React.useState(() =>
      clampSize(defaultSize, lowerBound, upperBound)
    );
    const [dragging, setDragging] = React.useState(false);

    const isControlled = controlledSize !== undefined;
    const size = clampSize(isControlled ? controlledSize : uncontrolledSize, lowerBound, upperBound);

    const commitSize = React.useCallback(
      (next: number) => {
        const clamped = clampSize(next, lowerBound, upperBound);
        if (!isControlled) setUncontrolledSize(clamped);
        onSizeChange?.(clamped);
      },
      [isControlled, lowerBound, upperBound, onSizeChange]
    );

    const panes = React.Children.toArray(children);
    const first = panes[0];
    const second = panes[1];
    const hasBothPanes = panes.length >= 2;
    const isHorizontal = direction === 'horizontal';

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref]
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const step = event.shiftKey ? 10 : 1;
      const decrease = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
      const increase = isHorizontal ? 'ArrowRight' : 'ArrowDown';

      switch (event.key) {
        case decrease:
          event.preventDefault();
          commitSize(size - step);
          break;
        case increase:
          event.preventDefault();
          commitSize(size + step);
          break;
        case 'Home':
          event.preventDefault();
          commitSize(lowerBound);
          break;
        case 'End':
          event.preventDefault();
          commitSize(upperBound);
          break;
        case 'Enter':
          event.preventDefault();
          commitSize(defaultSize);
          break;
        default:
          break;
      }
    };

    const sizeFromPointer = (clientX: number, clientY: number): number | null => {
      const container = containerRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      const extent = isHorizontal ? rect.width : rect.height;
      if (!extent || extent <= 0) return null;
      const offset = isHorizontal ? clientX - rect.left : clientY - rect.top;
      return (offset / extent) * 100;
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      const target = event.currentTarget;
      if (typeof target.setPointerCapture === 'function') {
        target.setPointerCapture(event.pointerId);
        capturedPointerRef.current = event.pointerId;
      }
      setDragging(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || !dragging) return;
      const next = sizeFromPointer(event.clientX, event.clientY);
      if (next === null) return;
      commitSize(next);
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
      const captured = capturedPointerRef.current;
      const target = event.currentTarget;
      if (captured !== null && typeof target.releasePointerCapture === 'function') {
        target.releasePointerCapture(captured);
      }
      capturedPointerRef.current = null;
      if (!dragging) return;
      setDragging(false);
    };

    const roundedSize = Math.round(size);

    return (
      <div
        ref={setRefs}
        data-direction={direction}
        data-dragging={dragging ? 'true' : undefined}
        className={cn(
          resizableVariants({ direction }),
          'rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
          dragging && 'select-none',
          dragging && (isHorizontal ? 'cursor-col-resize' : 'cursor-row-resize'),
          className
        )}
        {...props}
      >
        {first !== undefined && (
          <div
            id={paneId}
            data-testid="resizable-pane-1"
            className={cn(
              'shrink-0 grow-0 overflow-hidden',
              isHorizontal ? 'h-full min-w-0' : 'w-full min-h-0'
            )}
            style={hasBothPanes ? { flexBasis: `${size}%` } : { flexBasis: '100%' }}
          >
            {first}
          </div>
        )}

        {hasBothPanes && (
          <div
            role="separator"
            tabIndex={0}
            aria-label={handleLabel}
            aria-controls={paneId}
            aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
            aria-valuenow={roundedSize}
            aria-valuetext={`${roundedSize}%`}
            aria-valuemin={lowerBound}
            aria-valuemax={upperBound}
            aria-disabled={disabled ? true : undefined}
            data-testid="resizable-handle"
            data-dragging={dragging ? 'true' : undefined}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={cn(resizableHandleVariants({ direction, disabled }))}
          >
            <span
              aria-hidden="true"
              data-testid="resizable-grip"
              className={cn(
                'pointer-events-none absolute rounded-full bg-neutral-400 transition-colors duration-(--duration-fast) group-hover:bg-primary-500 dark:bg-neutral-600 dark:group-hover:bg-primary-400',
                isHorizontal ? 'h-8 w-0.5' : 'h-0.5 w-8'
              )}
            />
          </div>
        )}

        {second !== undefined && (
          <div
            data-testid="resizable-pane-2"
            className={cn(
              'flex-1 overflow-hidden',
              isHorizontal ? 'h-full min-w-0' : 'w-full min-h-0'
            )}
          >
            {second}
          </div>
        )}
      </div>
    );
  }
);
Resizable.displayName = 'Resizable';

export { Resizable, resizableVariants, resizableHandleVariants };
