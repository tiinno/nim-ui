import * as React from 'react';
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '../lib/utils';
import {
  formatDateValue,
  type CalendarSystem,
  type DateFormatInput,
} from '../lib/date-format';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { buttonVariants } from './button';

type HourCycle = '12' | '24';

export interface DateTimeRange {
  from?: Date;
  to?: Date;
}

export interface DateTimeRangePreset {
  label: string;
  value: DateTimeRange | (() => DateTimeRange);
}

export interface DateTimePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  dateFormat?: DateFormatInput;
  calendar?: CalendarSystem;
  locale?: Locale | string;
  formatDate?: (date: Date) => string;
  timeStep?: number;
  hourCycle?: HourCycle;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export interface DateTimeRangePickerProps {
  value?: DateTimeRange;
  defaultValue?: DateTimeRange;
  onChange?: (range: DateTimeRange | undefined) => void;
  placeholder?: string;
  dateFormat?: DateFormatInput;
  calendar?: CalendarSystem;
  locale?: Locale | string;
  formatDate?: (date: Date) => string;
  timeStep?: number;
  hourCycle?: HourCycle;
  disabled?: boolean;
  className?: string;
  id?: string;
  fromName?: string;
  toName?: string;
  presets?: DateTimeRangePreset[];
}

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeToParts = (time: string) => {
  if (!timePattern.test(time)) return [0, 0] as const;
  const parts = time.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return [hours, minutes] as const;
};

const dateToTime = (date?: Date, fallback = '09:00') => {
  if (!date) return fallback;
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
};

const withTime = (date: Date, time: string) => {
  const [hours, minutes] = timeToParts(time);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
};

const formatTimeLabel = (time: string, hourCycle: HourCycle) => {
  const [hours, minutes] = timeToParts(time);
  if (hourCycle === '24') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`;
};

const buildTimeOptions = (step: number) => {
  const interval = Number.isFinite(step) && step > 0 ? step : 15;
  const options: string[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += interval) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    options.push(
      `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
    );
  }

  return options;
};

const TimeSelect = ({
  label,
  value,
  onChange,
  step,
  hourCycle,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
  step: number;
  hourCycle: HourCycle;
  disabled?: boolean;
}) => {
  const options = React.useMemo(() => buildTimeOptions(step), [step]);

  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-neutral-700 dark:text-neutral-200">
        {label}
      </span>
      <select
        className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-control transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatTimeLabel(option, hourCycle)}
          </option>
        ))}
      </select>
    </label>
  );
};

const DateTimePicker = React.forwardRef<HTMLButtonElement, DateTimePickerProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = 'Pick date and time',
      dateFormat = 'PPP',
      calendar = 'gregory',
      locale,
      formatDate,
      timeStep = 15,
      hourCycle = '24',
      disabled,
      className,
      id,
      name,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<Date | undefined>(
      defaultValue
    );
    const selected = value ?? internalValue;

    const commit = (nextValue: Date | undefined) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.(nextValue);
    };

    const handleDateSelect = (date: Date | undefined) => {
      if (!date) {
        commit(undefined);
        return;
      }

      commit(withTime(date, dateToTime(selected)));
    };

    const handleTimeSelect = (time: string) => {
      commit(withTime(selected ?? new Date(), time));
    };

    return (
      <>
        <Popover>
          <PopoverTrigger
            ref={ref}
            id={id}
            disabled={disabled}
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
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
              <path d="M12 14v3l2 1" />
            </svg>
            {selected
              ? `${formatDateValue(selected, {
                  calendar,
                  locale,
                  format: dateFormat,
                  formatDate,
                })} ${formatTimeLabel(dateToTime(selected), hourCycle)}`
              : placeholder}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              calendar={calendar}
              locale={typeof locale === 'string' ? undefined : locale}
              mode="single"
              selected={selected}
              onSelect={handleDateSelect}
              autoFocus
            />
            <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
              <TimeSelect
                label="Time"
                value={dateToTime(selected)}
                onChange={handleTimeSelect}
                step={timeStep}
                hourCycle={hourCycle}
                disabled={disabled}
              />
            </div>
          </PopoverContent>
        </Popover>
        {name && (
          <input
            type="hidden"
            name={name}
            value={selected ? selected.toISOString() : ''}
          />
        )}
      </>
    );
  }
);
DateTimePicker.displayName = 'DateTimePicker';

const resolvePreset = (preset: DateTimeRangePreset) =>
  typeof preset.value === 'function' ? preset.value() : preset.value;

const toDateRange = (range?: DateTimeRange): DateRange | undefined => {
  if (!range?.from && !range?.to) return undefined;
  return { from: range.from, to: range.to };
};

const DateTimeRangePicker = React.forwardRef<
  HTMLButtonElement,
  DateTimeRangePickerProps
>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = 'Pick date and time range',
      dateFormat = 'LLL dd, y',
      calendar = 'gregory',
      locale,
      formatDate,
      timeStep = 15,
      hourCycle = '24',
      disabled,
      className,
      id,
      fromName,
      toName,
      presets,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<
      DateTimeRange | undefined
    >(defaultValue);
    const selected = value ?? internalValue;

    const commit = (nextValue: DateTimeRange | undefined) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.(nextValue);
    };

    const handleRangeSelect = (range: DateRange | undefined) => {
      if (!range?.from && !range?.to) {
        commit(undefined);
        return;
      }

      commit({
        from: range.from
          ? withTime(range.from, dateToTime(selected?.from, '09:00'))
          : undefined,
        to: range.to
          ? withTime(range.to, dateToTime(selected?.to, '17:00'))
          : undefined,
      });
    };

    const handleTimeSelect = (side: 'from' | 'to', time: string) => {
      const base = selected?.[side] ?? new Date();
      commit({ ...selected, [side]: withTime(base, time) });
    };

    const label = React.useMemo(() => {
      if (!selected?.from) return placeholder;
      const fromLabel = `${formatDateValue(selected.from, {
        calendar,
        locale,
        format: dateFormat,
        formatDate,
      })} ${formatTimeLabel(dateToTime(selected.from), hourCycle)}`;
      if (!selected.to) return fromLabel;
      return `${fromLabel} - ${formatDateValue(selected.to, {
        calendar,
        locale,
        format: dateFormat,
        formatDate,
      })} ${formatTimeLabel(dateToTime(selected.to), hourCycle)}`;
    }, [
      selected,
      placeholder,
      dateFormat,
      hourCycle,
      calendar,
      locale,
      formatDate,
    ]);

    return (
      <>
        <Popover>
          <PopoverTrigger
            ref={ref}
            id={id}
            disabled={disabled}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full justify-start text-left font-normal',
              !selected?.from && 'text-neutral-500 dark:text-neutral-400',
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
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
              <path d="M7 14h4" />
              <path d="M13 18h4" />
            </svg>
            <span className="truncate">{label}</span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="flex flex-col sm:flex-row">
              {presets && presets.length > 0 && (
                <div className="flex min-w-40 flex-row gap-1 border-b border-neutral-200 p-2 dark:border-neutral-800 sm:flex-col sm:border-b-0 sm:border-r">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="rounded-sm px-2 py-1.5 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      onClick={() => commit(resolvePreset(preset))}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
              <Calendar
                calendar={calendar}
                locale={typeof locale === 'string' ? undefined : locale}
                mode="range"
                selected={toDateRange(selected)}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                autoFocus
              />
            </div>
            <div className="grid gap-3 border-t border-neutral-200 p-3 dark:border-neutral-800 sm:grid-cols-2">
              <TimeSelect
                label="Start time"
                value={dateToTime(selected?.from, '09:00')}
                onChange={(time) => handleTimeSelect('from', time)}
                step={timeStep}
                hourCycle={hourCycle}
                disabled={disabled}
              />
              <TimeSelect
                label="End time"
                value={dateToTime(selected?.to, '17:00')}
                onChange={(time) => handleTimeSelect('to', time)}
                step={timeStep}
                hourCycle={hourCycle}
                disabled={disabled}
              />
            </div>
          </PopoverContent>
        </Popover>
        {fromName && (
          <input
            type="hidden"
            name={fromName}
            value={selected?.from ? selected.from.toISOString() : ''}
          />
        )}
        {toName && (
          <input
            type="hidden"
            name={toName}
            value={selected?.to ? selected.to.toISOString() : ''}
          />
        )}
      </>
    );
  }
);
DateTimeRangePicker.displayName = 'DateTimeRangePicker';

export { DateTimePicker, DateTimeRangePicker };
