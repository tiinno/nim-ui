import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { DateTimePicker, DateTimeRangePicker } from './date-time-picker';

describe('DateTimePicker', () => {
  it('renders a formatted date and time', () => {
    render(<DateTimePicker value={new Date(2025, 0, 15, 10, 30)} />);

    expect(screen.getByRole('button')).toHaveTextContent('January');
    expect(screen.getByRole('button')).toHaveTextContent('10:30');
  });

  it('centers the icon and label as a group inside the trigger', () => {
    const { container } = render(
      <DateTimePicker value={new Date(2025, 0, 15, 10, 30)} />
    );
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('justify-center', 'text-center');
    expect(container.querySelector('svg')).toHaveClass('shrink-0');
    expect(trigger.querySelector('span')).toHaveClass('min-w-0', 'truncate');
  });

  it('marks the empty trigger as a placeholder', () => {
    const { rerender } = render(<DateTimePicker />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('data-placeholder', '');
    expect(trigger).toHaveClass('data-[placeholder]:text-neutral-500');
    // A plain `text-neutral-500` here would lose to buttonVariants'
    // `text-neutral-900` in CSS emission order.
    expect(trigger).not.toHaveClass('text-neutral-500');

    rerender(<DateTimePicker value={new Date(2025, 0, 15, 10, 30)} />);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-placeholder');
  });

  it('updates the Date when time changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <DateTimePicker
        defaultValue={new Date(2025, 0, 15, 10, 30)}
        timeStep={60}
        onChange={handleChange}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.selectOptions(screen.getByLabelText('Time'), '14:00');

    const nextDate = handleChange.mock.calls.at(-1)?.[0] as Date;
    expect(nextDate.getHours()).toBe(14);
    expect(nextDate.getMinutes()).toBe(0);
  });

  it('renders a hidden ISO input when name is provided', () => {
    const date = new Date(2025, 0, 15, 10, 30);
    render(<DateTimePicker value={date} name="publishAt" />);

    expect(document.querySelector('input[name="publishAt"]')).toHaveValue(
      date.toISOString()
    );
  });

  it('can display Buddhist Era dates while keeping hidden inputs ISO', () => {
    const date = new Date(2025, 0, 15, 10, 30);
    render(
      <DateTimePicker
        value={date}
        name="publishAt"
        calendar="buddhist"
        dateFormat="yyyy-MM-dd"
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('2568-01-15 10:30');
    expect(document.querySelector('input[name="publishAt"]')).toHaveValue(
      date.toISOString()
    );
  });
});

describe('DateTimeRangePicker', () => {
  it('centers the icon and range label inside the trigger', () => {
    const { container } = render(
      <DateTimeRangePicker
        value={{
          from: new Date(2025, 0, 15, 9, 0),
          to: new Date(2025, 0, 15, 17, 0),
        }}
      />
    );
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('justify-center', 'text-center');
    expect(container.querySelector('svg')).toHaveClass('shrink-0');
    expect(trigger.querySelector('span')).toHaveClass('min-w-0', 'truncate');
  });

  it('applies presets and hidden range inputs', async () => {
    const user = userEvent.setup();
    const from = new Date(2025, 0, 13, 9, 0);
    const to = new Date(2025, 0, 17, 17, 0);
    const handleChange = vi.fn();

    render(
      <DateTimeRangePicker
        fromName="windowStart"
        toName="windowEnd"
        onChange={handleChange}
        presets={[{ label: 'Business week', value: { from, to } }]}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button', { name: 'Business week' }));

    expect(handleChange).toHaveBeenCalledWith({ from, to });
    expect(document.querySelector('input[name="windowStart"]')).toHaveValue(
      from.toISOString()
    );
    expect(document.querySelector('input[name="windowEnd"]')).toHaveValue(
      to.toISOString()
    );
  });
});
