import * as React from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import type { Locale } from 'date-fns';
import {
  getDateLib as getBuddhistDateLib,
  th as buddhistThaiLocale,
} from 'react-day-picker/buddhist';
import { cn } from '../lib/utils';
import type { CalendarSystem } from '../lib/date-format';
import { buttonVariants } from './button';

/**
 * Calendar component for date selection.
 * Built on react-day-picker v9 with OKLCH-themed styling.
 *
 * @example
 * ```tsx
 * <Calendar mode="single" selected={date} onSelect={setDate} />
 * ```
 *
 * @example
 * ```tsx
 * // Range selection
 * <Calendar mode="range" selected={range} onSelect={setRange} />
 * ```
 *
 * @example
 * ```tsx
 * // Multiple selection
 * <Calendar mode="multiple" selected={dates} onSelect={setDates} />
 * ```
 */

export type CalendarProps = DayPickerProps & {
  /** Display calendar years in Gregorian CE or Buddhist Era (BE). @default 'gregory' */
  calendar?: CalendarSystem;
};

function Calendar({
  calendar = 'gregory',
  className,
  classNames,
  showOutsideDays = true,
  locale,
  dateLib,
  ...props
}: CalendarProps) {
  const resolvedLocale =
    calendar === 'buddhist' && locale === undefined ? buddhistThaiLocale : locale;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={resolvedLocale}
      dateLib={
        dateLib ??
        (calendar === 'buddhist'
          ? getBuddhistDateLib({ locale: resolvedLocale as Locale })
          : undefined)
      }
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        // `size: null` makes cva skip its defaultVariants, so the h-7/w-7/p-0 below
        // are the only sizing classes emitted. `ghost` is transparent in both themes,
        // so the border is added explicitly rather than using `outline`, whose
        // background would otherwise win over a later `bg-transparent`.
        // These border tokens intentionally mirror buttonVariants' `outline` — keep
        // them in sync if the design contract's control border ever changes.
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: null }),
          'absolute left-1 h-7 w-7 border border-neutral-200 p-0 text-sm opacity-50 hover:opacity-100 dark:border-neutral-800'
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: null }),
          'absolute right-1 h-7 w-7 border border-neutral-200 p-0 text-sm opacity-50 hover:opacity-100 dark:border-neutral-800'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'text-neutral-500 dark:text-neutral-400 rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20'
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost', size: null }),
          'h-9 w-9 p-0 text-sm font-normal aria-selected:opacity-100'
        ),
        range_start: 'day-range-start',
        range_end: 'day-range-end',
        selected:
          'bg-primary-600 text-white hover:bg-primary-700 focus:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 [&>button]:bg-primary-600 [&>button]:text-white [&>button]:hover:bg-primary-700 [&>button]:hover:text-white [&>button]:focus:bg-primary-700 [&>button]:focus:text-white dark:[&>button]:bg-primary-700 dark:[&>button]:hover:bg-primary-600',
        today: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
        outside:
          'day-outside text-neutral-400 opacity-50 aria-selected:bg-neutral-100/50 aria-selected:text-neutral-500 aria-selected:opacity-30 dark:text-neutral-500 dark:aria-selected:bg-neutral-800/50 aria-selected:[&>button]:text-neutral-500 dark:aria-selected:[&>button]:text-neutral-400',
        disabled: 'text-neutral-400 opacity-50 dark:text-neutral-500',
        range_middle:
          'aria-selected:bg-neutral-100 aria-selected:text-neutral-900 aria-selected:[&>button]:bg-neutral-100 aria-selected:[&>button]:text-neutral-900 dark:aria-selected:bg-neutral-800 dark:aria-selected:text-neutral-100 dark:aria-selected:[&>button]:bg-neutral-800 dark:aria-selected:[&>button]:text-neutral-100',
        hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
