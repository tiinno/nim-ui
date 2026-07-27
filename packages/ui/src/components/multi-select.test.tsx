import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { MultiSelect, type MultiSelectOption } from './multi-select';

const options: MultiSelectOption[] = [
  { value: 'ops', label: 'Operations', description: 'Backoffice work' },
  { value: 'billing', label: 'Billing' },
  { value: 'support', label: 'Support', disabled: true },
];

describe('MultiSelect', () => {
  it('selects options and calls onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<MultiSelect options={options} onChange={handleChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Operations'));

    expect(handleChange).toHaveBeenCalledWith(['ops']);
  });

  it('switches the trigger tone between placeholder and selection', () => {
    const { rerender } = render(<MultiSelect options={options} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('text-neutral-500', 'dark:text-neutral-400');
    // A base `text-neutral-900` is emitted after the placeholder tone and wins,
    // so the empty trigger would render at full contrast.
    expect(trigger).not.toHaveClass('text-neutral-900');

    rerender(<MultiSelect options={options} value={['ops']} />);
    const filled = screen.getByRole('combobox');
    expect(filled).toHaveClass('text-neutral-900', 'dark:text-neutral-100');
    expect(filled).not.toHaveClass('text-neutral-500');
  });

  it('renders selected chips and hidden inputs', () => {
    render(
      <MultiSelect
        options={options}
        value={['ops', 'billing']}
        name="teams"
      />
    );

    expect(screen.getByText('Operations')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(document.querySelectorAll('input[name="teams"]')).toHaveLength(2);
  });

  it('removes selected chips', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        value={['ops', 'billing']}
        onChange={handleChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /remove operations/i }));

    expect(handleChange).toHaveBeenCalledWith(['billing']);
  });
});
