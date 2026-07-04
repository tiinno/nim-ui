import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { TagsInput } from './tags-input';

describe('TagsInput', () => {
  it('adds tags with Enter', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TagsInput onChange={handleChange} placeholder="Add label" />);

    await user.type(screen.getByPlaceholderText('Add label'), 'priority{Enter}');

    expect(handleChange).toHaveBeenCalledWith(['priority']);
  });

  it('renders hidden inputs for tags', () => {
    render(<TagsInput value={['urgent', 'vip']} name="labels" />);

    expect(document.querySelectorAll('input[name="labels"]')).toHaveLength(2);
  });

  it('removes tags', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TagsInput value={['urgent', 'vip']} onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: /remove urgent/i }));

    expect(handleChange).toHaveBeenCalledWith(['vip']);
  });
});
