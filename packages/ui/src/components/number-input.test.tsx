import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { NumberInput } from './number-input';

describe('NumberInput', () => {
  it('increments and decrements values', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<NumberInput defaultValue={2} onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: /increase value/i }));
    await user.click(screen.getByRole('button', { name: /decrease value/i }));

    expect(handleChange).toHaveBeenNthCalledWith(1, 3);
    expect(handleChange).toHaveBeenNthCalledWith(2, 2);
  });

  it('clamps to max', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<NumberInput defaultValue={10} max={10} onChange={handleChange} />);

    expect(screen.getByRole('button', { name: /increase value/i })).toBeDisabled();

    await user.clear(screen.getByRole('spinbutton'));
    await user.type(screen.getByRole('spinbutton'), '20');

    expect(handleChange).toHaveBeenLastCalledWith(10);
  });
});
