import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { TimePicker } from './time-picker';

describe('TimePicker', () => {
  it('renders placeholder and opens time options', async () => {
    const user = userEvent.setup();
    render(<TimePicker step={60} />);

    expect(screen.getByText('Pick a time')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /choose time/i }));

    expect(screen.getByRole('listbox', { name: /time options/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '09:00' })).toBeInTheDocument();
  });

  it('calls onChange when a time is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TimePicker step={60} onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: /choose time/i }));
    await user.click(screen.getByRole('option', { name: '09:00' }));

    expect(handleChange).toHaveBeenCalledWith('09:00');
  });

  it('supports hidden form input', () => {
    render(<TimePicker name="cutoffTime" value="17:30" />);

    expect(document.querySelector('input[name="cutoffTime"]')).toHaveValue('17:30');
  });

  it('supports disabled state', () => {
    render(<TimePicker disabled />);

    expect(screen.getByRole('button', { name: /choose time/i })).toBeDisabled();
  });

  it('marks the empty trigger as a placeholder rather than restating the colour', () => {
    const { rerender } = render(<TimePicker />);
    const trigger = screen.getByRole('button', { name: /choose time/i });
    // buttonVariants' `text-neutral-900` is emitted after a plain
    // `text-neutral-500` and wins; the data-attribute variant outranks it.
    expect(trigger).toHaveAttribute('data-placeholder', '');
    expect(trigger).toHaveClass('data-[placeholder]:text-neutral-500');
    expect(trigger).not.toHaveClass('text-neutral-500');

    rerender(<TimePicker value="09:00" />);
    expect(
      screen.getByRole('button', { name: /choose time/i })
    ).not.toHaveAttribute('data-placeholder');
  });

  it('colours the selected option only through the selected branch', async () => {
    const user = userEvent.setup();
    render(<TimePicker step={60} value="09:00" />);

    await user.click(screen.getByRole('button', { name: /choose time/i }));
    const selected = screen.getByRole('option', { name: '09:00' });
    expect(selected).toHaveClass('text-neutral-950', 'dark:text-neutral-50');
    // Unselected colours in the always-on part would be emitted first and the
    // dark one would win, leaving the selected row unhighlighted in dark mode.
    expect(selected).not.toHaveClass('text-neutral-700');
    expect(selected).not.toHaveClass('dark:text-neutral-200');
  });
});
