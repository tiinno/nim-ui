import * as React from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '../lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Calendar } from './calendar';
import { buttonVariants } from './button';

/**
 * DatePicker component: an input trigger with a calendar popover.
 * Composes Popover + Calendar + Button-styled trigger.
 *
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date>();
 * <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
 * ```
 *
 * @example
 * ```tsx
 * // With custom format
 * <DatePicker value={date} onChange={setDate} format="yyyy-MM-dd" />
 * ```
 *
 * @example
 * ```tsx
 * // Range picker
 * const [range, setRange] = useState<DateRange>();
 * <DateRangePicker value={range} onChange={setRange} />
 * ```
 */

// ---------------------------------------------------------------------------
// DatePicker (single)
// ---------------------------------------------------------------------------

export interface DatePickerProps {
  /** Current selected date (controlled). */
  value?: Date;
  /** Default date (uncontrolled). */
  defaultValue?: Date;
  /** Callback when the date changes. */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder text when no date is selected. @default 'Pick a date' */
  placeholder?: string;
  /** date-fns format string for display. @default 'PPP' */
  format?: string;
  /** Disable the input. */
  disabled?: boolean;
  /** Additional class names for the trigger button. */
  className?: string;
  /** Input id (for FormField integration). */
  id?: string;
  /** Name attribute for form submission. */
  name?: string;
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = 'Pick a date',
      format: formatStr = 'PPP',
      disabled,
      className,
      id,
      name,
    },
    ref
  ) => {
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(
      defaultValue
    );
    const date = value ?? internalDate;

    const handleSelect = (selected: Date | undefined) => {
      if (value === undefined) setInternalDate(selected);
      onChange?.(selected);
    };

    return (
      <Popover>
        <PopoverTrigger
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full justify-start text-left font-normal',
            !date && 'text-neutral-500 dark:text-neutral-400',
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {date ? format(date, formatStr) : <span>{placeholder}</span>}
          {name && (
            <input
              type="hidden"
              name={name}
              value={date ? date.toISOString() : ''}
            />
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DatePicker.displayName = 'DatePicker';

// ---------------------------------------------------------------------------
// DateRangePicker
// ---------------------------------------------------------------------------

export interface DateRangePickerProps {
  /** Current selected range (controlled). */
  value?: DateRange;
  /** Default range (uncontrolled). */
  defaultValue?: DateRange;
  /** Callback when the range changes. */
  onChange?: (range: DateRange | undefined) => void;
  /** Placeholder text when no range is selected. @default 'Pick a date range' */
  placeholder?: string;
  /** date-fns format string for display. @default 'LLL dd, y' */
  format?: string;
  /** Disable the input. */
  disabled?: boolean;
  /** Additional class names for the trigger button. */
  className?: string;
  /** Input id (for FormField integration). */
  id?: string;
}

const DateRangePicker = React.forwardRef<
  HTMLButtonElement,
  DateRangePickerProps
>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = 'Pick a date range',
      format: formatStr = 'LLL dd, y',
      disabled,
      className,
      id,
    },
    ref
  ) => {
    const [internalRange, setInternalRange] = React.useState<
      DateRange | undefined
    >(defaultValue);
    const range = value ?? internalRange;

    const handleSelect = (selected: DateRange | undefined) => {
      if (value === undefined) setInternalRange(selected);
      onChange?.(selected);
    };

    const displayLabel = React.useMemo(() => {
      if (!range?.from) return placeholder;
      if (range.to) {
        return `${format(range.from, formatStr)} - ${format(range.to, formatStr)}`;
      }
      return format(range.from, formatStr);
    }, [range, formatStr, placeholder]);

    return (
      <Popover>
        <PopoverTrigger
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full justify-start text-left font-normal',
            !range?.from && 'text-neutral-500 dark:text-neutral-400',
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{displayLabel}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DateRangePicker.displayName = 'DateRangePicker';

export { DatePicker, DateRangePicker };
