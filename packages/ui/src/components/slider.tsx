import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Slider component for selecting a value or range within a bounded interval.
 * Built on Radix UI Slider primitive.
 *
 * @example
 * ```tsx
 * <Slider defaultValue={[50]} min={0} max={100} step={1} />
 * ```
 *
 * @example
 * ```tsx
 * // Range slider
 * <Slider defaultValue={[20, 80]} min={0} max={100} step={5} />
 * ```
 *
 * @example
 * ```tsx
 * // Controlled slider
 * const [value, setValue] = useState([30]);
 * <Slider value={value} onValueChange={setValue} min={0} max={100} />
 * ```
 */

const sliderTrackVariants = cva(
  'relative grow overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-1.5',
        lg: 'h-2',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const sliderThumbVariants = cva(
  'block cursor-pointer rounded-full border-2 border-primary-600 bg-white shadow-sm transition-colors duration-fast dark:border-primary-400 dark:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderTrackVariants> {}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, size, defaultValue, value, ...props }, ref) => {
  const currentValue = value ?? defaultValue ?? [0];
  return (
    <SliderPrimitive.Root
      ref={ref}
      defaultValue={defaultValue}
      value={value}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className={cn(sliderTrackVariants({ size }))}>
        <SliderPrimitive.Range className="absolute h-full bg-primary-600 dark:bg-primary-400" />
      </SliderPrimitive.Track>
      {currentValue.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(sliderThumbVariants({ size }))}
          aria-label={
            currentValue.length > 1
              ? i === 0
                ? 'Minimum value'
                : 'Maximum value'
              : 'Value'
          }
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = 'Slider';

export { Slider, sliderTrackVariants, sliderThumbVariants };
