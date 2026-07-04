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
});
