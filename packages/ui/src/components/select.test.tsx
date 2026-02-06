import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../test/test-utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from './select';

describe('Select', () => {
  describe('Basic Rendering', () => {
    it('renders trigger with placeholder', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('does not show dropdown content initially', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('Opening and Closing', () => {
    it('opens dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });
    });

    it('closes dropdown when item is selected', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByText('Option 1')).toBeInTheDocument());

      await user.click(screen.getByText('Option 1'));

      await waitFor(() => {
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByText('Option 1')).toBeInTheDocument());

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('updates selected value when item is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByText('Option 1')).toBeInTheDocument());

      await user.click(screen.getByText('Option 1'));

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('Option 1');
      });
    });

    it('calls onValueChange when selection changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByText('Option 1')).toBeInTheDocument());

      await user.click(screen.getByText('Option 1'));

      expect(handleChange).toHaveBeenCalledWith('1');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
            <SelectItem value="3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await waitFor(() => expect(screen.getByText('Option 1')).toBeInTheDocument());

      // Navigate with arrow key and select with Enter
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // Verify that an option was selected (any option)
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('selects option with Enter key', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByText('Option 1')).toBeInTheDocument());

      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith('1');
    });
  });

  describe('Disabled State', () => {
    it('does not open when trigger is disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger disabled>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });

    it('applies disabled styles to trigger', () => {
      render(
        <Select>
          <SelectTrigger disabled>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('does not allow selecting disabled items', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2" disabled>
              Option 2
            </SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByText('Option 2')).toBeInTheDocument());

      await user.click(screen.getByText('Option 2'));

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Groups and Labels', () => {
    it('renders select groups with labels', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Fruits')).toBeInTheDocument();
        expect(screen.getByText('Vegetables')).toBeInTheDocument();
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Carrot')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct combobox role', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Choose an option">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByLabelText('Choose an option')).toBeInTheDocument();
    });

    it('indicates expanded state with aria-expanded', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Portal Rendering', () => {
    it('renders dropdown content in portal', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Content should not be in the container
      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('supports controlled value', () => {
      const { rerender } = render(
        <Select value="1">
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('Option 1');

      rerender(
        <Select value="2">
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('Option 2');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with trigger styles', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveClass('custom-trigger');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to trigger element', () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
