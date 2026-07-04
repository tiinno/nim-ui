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
