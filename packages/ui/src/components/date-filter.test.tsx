import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { DateFilter } from './date-filter';

describe('DateFilter', () => {
  it('applies a default preset', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<DateFilter onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: /filter by date/i }));
    await user.click(screen.getByRole('button', { name: 'Today' }));

    expect(handleChange).toHaveBeenCalledWith({
      from: expect.any(Date),
      to: expect.any(Date),
    });
  });
});
