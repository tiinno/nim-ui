import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import {
  DateRangePicker,
  type DateRangePickerPreset,
  type DateRangePickerProps,
} from './date-picker';

export interface DateFilterProps
  extends Omit<
    DateRangePickerProps,
    'presets' | 'showPresets' | 'placeholder' | 'value' | 'defaultValue' | 'onChange'
  > {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  presets?: DateRangePickerPreset[];
}

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const daysAgo = (days: number) => {
  const date = startOfToday();
  date.setDate(date.getDate() - days);
  return date;
};

const startOfMonth = () => {
  const date = startOfToday();
  date.setDate(1);
  return date;
};

const defaultDateFilterPresets: DateRangePickerPreset[] = [
  {
    label: 'Today',
    value: () => ({ from: startOfToday(), to: endOfToday() }),
  },
  {
    label: 'Last 7 days',
    value: () => ({ from: daysAgo(6), to: endOfToday() }),
  },
  {
    label: 'This month',
    value: () => ({ from: startOfMonth(), to: endOfToday() }),
  },
];

const DateFilter = React.forwardRef<HTMLButtonElement, DateFilterProps>(
  (
    {
      placeholder = 'Filter by date',
      presets = defaultDateFilterPresets,
      ...props
    },
    ref
  ) => (
    <DateRangePicker
      ref={ref}
      placeholder={placeholder}
      presets={presets}
      showPresets
      {...props}
    />
  )
);
DateFilter.displayName = 'DateFilter';

export { DateFilter, defaultDateFilterPresets };
