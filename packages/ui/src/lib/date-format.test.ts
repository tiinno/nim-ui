import { describe, expect, it } from 'vitest';
import { formatDateOnlyValue, formatDateValue } from './date-format';

describe('formatDateValue', () => {
  it('formats Gregorian dates by default', () => {
    expect(
      formatDateValue(new Date(2025, 0, 15), { format: 'yyyy-MM-dd' })
    ).toBe('2025-01-15');
  });

  it('formats Buddhist Era years without changing the Date value', () => {
    expect(
      formatDateValue(new Date(2025, 0, 15), {
        calendar: 'buddhist',
        format: 'yyyy-MM-dd',
      })
    ).toBe('2568-01-15');
  });

  it('keeps ISO output Gregorian for form-safe values', () => {
    const date = new Date(2025, 0, 15, 10, 30);
    expect(formatDateValue(date, { calendar: 'buddhist', format: 'iso' })).toBe(
      date.toISOString()
    );
  });

  it('serializes date-only values without UTC timezone shifts', () => {
    expect(formatDateOnlyValue(new Date(2025, 0, 15))).toBe('2025-01-15');
  });

  it('allows product-specific formatting overrides', () => {
    expect(
      formatDateValue(new Date(2025, 0, 15), {
        calendar: 'buddhist',
        formatDate: () => 'policy-date',
      })
    ).toBe('policy-date');
  });
});
