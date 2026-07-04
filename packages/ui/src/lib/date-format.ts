import { format as formatDateFns } from 'date-fns';
import type { Locale } from 'date-fns';
import { getDateLib as getBuddhistDateLib } from 'react-day-picker/buddhist';

export type CalendarSystem = 'gregory' | 'buddhist';

export type DateFormatPreset = 'short' | 'medium' | 'long' | 'full' | 'iso';

export type DateFormatInput = DateFormatPreset | string;

type DateStylePreset = Exclude<DateFormatPreset, 'iso'>;

export interface DateDisplayOptions {
  calendar?: CalendarSystem;
  locale?: Locale | string;
  format?: DateFormatInput;
  formatDate?: (date: Date) => string;
}

const intlDateStyleByPreset: Record<
  DateStylePreset,
  Intl.DateTimeFormatOptions['dateStyle']
> = {
  short: 'short',
  medium: 'medium',
  long: 'long',
  full: 'full',
};

const dateFnsLongFormatToPreset: Partial<Record<string, DateFormatPreset>> = {
  P: 'short',
  PP: 'medium',
  PPP: 'long',
  PPPP: 'full',
};

const isDateStylePreset = (format: DateFormatInput): format is DateStylePreset =>
  ['short', 'medium', 'long', 'full'].includes(format);

export const resolveLocaleCode = (
  locale?: Locale | string,
  calendar: CalendarSystem = 'gregory'
) => {
  if (typeof locale === 'string') return locale;
  if (locale?.code) return locale.code;
  return calendar === 'buddhist' ? 'th-TH' : 'en-US';
};

export const formatDateOnlyValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateValue = (
  date: Date,
  {
    calendar = 'gregory',
    locale,
    format = 'medium',
    formatDate,
  }: DateDisplayOptions = {}
) => {
  if (formatDate) return formatDate(date);
  if (format === 'iso') return date.toISOString();

  const localeCode = resolveLocaleCode(locale, calendar);
  const intlCalendar = calendar === 'buddhist' ? 'buddhist' : 'gregory';
  const preset = dateFnsLongFormatToPreset[format] ?? format;

  if (isDateStylePreset(preset)) {
    return new Intl.DateTimeFormat(`${localeCode}-u-ca-${intlCalendar}`, {
      dateStyle: intlDateStyleByPreset[preset],
    }).format(date);
  }

  if (calendar === 'buddhist') {
    return getBuddhistDateLib(
      typeof locale === 'string' ? undefined : { locale }
    ).format(date, format);
  }

  return formatDateFns(
    date,
    format,
    typeof locale === 'string' ? undefined : { locale }
  );
};
