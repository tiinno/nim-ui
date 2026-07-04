import * as React from 'react';
import { cn } from '../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { buttonVariants } from './button';

type HourCycle = '12' | '24';

export interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (time: string | undefined) => void;
  step?: number;
  hourCycle?: HourCycle;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeToMinutes = (time?: string) => {
  if (!time || !timePattern.test(time)) return undefined;
  const parts = time.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
};

const minutesToTime = (total: number) => {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatTimeLabel = (time: string, hourCycle: HourCycle) => {
  const minutes = timeToMinutes(time);
  if (minutes === undefined) return time;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hourCycle === '24') {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
};

const buildTimeOptions = (step: number, min?: string, max?: string) => {
  const interval = Number.isFinite(step) && step > 0 ? step : 15;
  const start = timeToMinutes(min) ?? 0;
  const end = timeToMinutes(max) ?? 23 * 60 + 59;
  const options: string[] = [];

  for (let minutes = start; minutes <= end; minutes += interval) {
    options.push(minutesToTime(minutes));
  }

  return options;
};

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      step = 15,
      hourCycle = '24',
      min,
      max,
      placeholder = 'Pick a time',
      disabled,
      className,
      id,
      name,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string | undefined>(
      defaultValue
    );
    const selected = value ?? internalValue;
    const options = React.useMemo(
      () => buildTimeOptions(step, min, max),
      [step, min, max]
    );

    const handleSelect = (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.(nextValue);
    };

    return (
      <>
        <Popover>
          <PopoverTrigger
            ref={ref}
            id={id}
            disabled={disabled}
            aria-label="Choose time"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full justify-start text-left font-normal',
              !selected && 'text-neutral-500 dark:text-neutral-400',
              className
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {selected ? formatTimeLabel(selected, hourCycle) : placeholder}
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
            <div
              role="listbox"
              aria-label="Time options"
              className="max-h-64 overflow-y-auto"
            >
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected === option}
                  className={cn(
                    'flex h-8 w-full items-center rounded-sm px-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-neutral-200 dark:hover:bg-neutral-800',
                    selected === option &&
                      'bg-neutral-100 font-medium text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50'
                  )}
                  onClick={() => handleSelect(option)}
                >
                  {formatTimeLabel(option, hourCycle)}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {name && <input type="hidden" name={name} value={selected ?? ''} />}
      </>
    );
  }
);
TimePicker.displayName = 'TimePicker';

export { TimePicker };
