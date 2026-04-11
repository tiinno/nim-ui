import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from './combobox';

function BasicCombobox({
  onSelect,
}: {
  onSelect?: (value: string) => void;
}) {
  return (
    <Combobox defaultOpen>
      <ComboboxTrigger>Select fruit</ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search..." />
        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxGroup heading="Fruits">
            <ComboboxItem value="apple" onSelect={onSelect}>
              Apple
            </ComboboxItem>
            <ComboboxItem value="banana" onSelect={onSelect}>
              Banana
            </ComboboxItem>
            <ComboboxItem value="cherry" onSelect={onSelect}>
              Cherry
            </ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function getTriggerButton() {
  // cmdk's internal wrapper also carries role="combobox"; filter to the <button>.
  const all = screen.getAllByRole('combobox');
  const button = all.find((el) => el.tagName === 'BUTTON');
  if (!button) throw new Error('No button with role="combobox" found');
  return button;
}

describe('Combobox', () => {
  describe('Rendering', () => {
    it('renders trigger with combobox role', () => {
      render(<BasicCombobox />);
      expect(getTriggerButton()).toBeInTheDocument();
    });

    it('renders input when open', () => {
      render(<BasicCombobox />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('renders all items when open', () => {
      render(<BasicCombobox />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Cherry')).toBeInTheDocument();
    });

    it('renders group heading', () => {
      render(<BasicCombobox />);
      expect(screen.getByText('Fruits')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters items based on input', async () => {
      const user = userEvent.setup();
      render(<BasicCombobox />);
      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'ban');
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });

    it('shows empty state when no match', async () => {
      const user = userEvent.setup();
      render(<BasicCombobox />);
      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'xyznothing');
      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onSelect when item is clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<BasicCombobox onSelect={handleSelect} />);
      await user.click(screen.getByText('Apple'));
      expect(handleSelect).toHaveBeenCalledWith('apple');
    });
  });

  describe('Accessibility', () => {
    it('trigger has combobox role', () => {
      render(<BasicCombobox />);
      expect(getTriggerButton()).toHaveAttribute('role', 'combobox');
    });

    it('input is focusable', async () => {
      render(<BasicCombobox />);
      const input = screen.getByPlaceholderText('Search...');
      input.focus();
      expect(input).toHaveFocus();
    });
  });
});
