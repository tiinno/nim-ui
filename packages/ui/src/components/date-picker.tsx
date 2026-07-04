import * as React from 'react';
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '../lib/utils';
import {
  formatDateOnlyValue,
  formatDateValue,
  type CalendarSystem,
  type DateFormatInput,
} from '../lib/date-format';
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
  /** Preset or date-fns format string for display. @default 'PPP' */
  format?: DateFormatInput;
  /** Display calendar years in Gregorian CE or Buddhist Era (BE). @default 'gregory' */
  calendar?: CalendarSystem;
  /** Display locale. Strings are used with Intl; date-fns Locale objects also localize the calendar UI. */
  locale?: Locale | string;
  /** Escape hatch for product-specific display policies. Hidden inputs still submit ISO strings. */
  formatDate?: (date: Date) => string;
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
      calendar = 'gregory',
      locale,
      formatDate,
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
          {date ? (
            formatDateValue(date, {
              calendar,
              locale,
              format: formatStr,
              formatDate,
            })
          ) : (
            <span>{placeholder}</span>
          )}
          {name && (
            <input
              type="hidden"
              name={name}
              value={date ? formatDateOnlyValue(date) : ''}
            />
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            calendar={calendar}
            locale={typeof locale === 'string' ? undefined : locale}
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

export interface DateRangePickerPreset {
  label: string;
  value: DateRange | (() => DateRange);
}

export interface DateRangePickerProps {
  /** Current selected range (controlled). */
  value?: DateRange;
  /** Default range (uncontrolled). */
  defaultValue?: DateRange;
  /** Callback when the range changes. */
  onChange?: (range: DateRange | undefined) => void;
  /** Placeholder text when no range is selected. @default 'Pick a date range' */
  placeholder?: string;
  /** Preset or date-fns format string applied to both boundary dates. @default 'LLL dd, y' */
  format?: DateFormatInput;
  /** Display calendar years in Gregorian CE or Buddhist Era (BE). @default 'gregory' */
  calendar?: CalendarSystem;
  /** Display locale. Strings are used with Intl; date-fns Locale objects also localize the calendar UI. */
  locale?: Locale | string;
  /** Escape hatch for product-specific display policies. Hidden inputs still submit ISO strings. */
  formatDate?: (date: Date) => string;
  /** Disable the input. */
  disabled?: boolean;
  /** Additional class names for the trigger button. */
  className?: string;
  /** Input id (for FormField integration). */
  id?: string;
  /** Preset ranges shown beside the calendar. */
  presets?: DateRangePickerPreset[];
  /** Show preset range buttons when presets are provided. @default true */
  showPresets?: boolean;
  /** Name attribute for the hidden start-date input. */
  fromName?: string;
  /** Name attribute for the hidden end-date input. */
  toName?: string;
}

const resolveDateRangePreset = (preset: DateRangePickerPreset) =>
  typeof preset.value === 'function' ? preset.value() : preset.value;

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
      calendar = 'gregory',
      locale,
      formatDate,
      disabled,
      className,
      id,
      presets,
      showPresets = true,
      fromName,
      toName,
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

    const handlePresetSelect = (preset: DateRangePickerPreset) => {
      handleSelect(resolveDateRangePreset(preset));
    };

    const displayLabel = React.useMemo(() => {
      if (!range?.from) return placeholder;
      if (range.to) {
        return `${formatDateValue(range.from, {
          calendar,
          locale,
          format: formatStr,
          formatDate,
        })} - ${formatDateValue(range.to, {
          calendar,
          locale,
          format: formatStr,
          formatDate,
        })}`;
      }
      return formatDateValue(range.from, {
        calendar,
        locale,
        format: formatStr,
        formatDate,
      });
    }, [range, formatStr, placeholder, calendar, locale, formatDate]);

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
            <span className="truncate">{displayLabel}</span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="flex flex-col sm:flex-row">
              {showPresets && presets && presets.length > 0 && (
                <div className="flex min-w-36 flex-row gap-1 border-b border-neutral-200 p-2 dark:border-neutral-800 sm:flex-col sm:border-b-0 sm:border-r">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="rounded-sm px-2 py-1.5 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      onClick={() => handlePresetSelect(preset)}
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
                selected={range}
                onSelect={handleSelect}
                numberOfMonths={2}
                autoFocus
              />
            </div>
          </PopoverContent>
        </Popover>
        {fromName && (
          <input
            type="hidden"
            name={fromName}
            value={range?.from ? formatDateOnlyValue(range.from) : ''}
          />
        )}
        {toName && (
          <input
            type="hidden"
            name={toName}
            value={range?.to ? formatDateOnlyValue(range.to) : ''}
          />
        )}
      </>
    );
  }
);
DateRangePicker.displayName = 'DateRangePicker';

export { DatePicker, DateRangePicker };
