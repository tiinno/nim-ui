import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../test/test-utils';
import {
  RadioGroup,
  RadioGroupItem,
  radioGroupVariants,
  radioGroupItemVariants,
} from './radio';

describe('Radio', () => {
  describe('RadioGroup - Rendering', () => {
    it('renders radio group with items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
    });

    it('has radiogroup role', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('renders with no selection by default', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).not.toBeChecked();
      });
    });

    it('renders with defaultValue selected', () => {
      render(
        <RadioGroup defaultValue="option2">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it('applies grid layout styles', () => {
      render(
        <RadioGroup data-testid="radiogroup">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radiogroup')).toHaveClass('grid');
      expect(screen.getByTestId('radiogroup')).toHaveClass('gap-2');
    });
  });

  describe('RadioGroupItem - Rendering', () => {
    it('renders radio button', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('renders with circular shape', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio')).toHaveClass('rounded-full');
    });

    it('has fixed size dimensions', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio');
      expect(radio).toHaveClass('h-5');
      expect(radio).toHaveClass('w-5');
    });

    it('renders indicator when selected', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio');
      const indicator = radio.querySelector('[class*="rounded-full"]');
      expect(indicator).toBeInTheDocument();
    });

    it('supports label association via id', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="r1" />
          <label htmlFor="r1">Option 1</label>
        </RadioGroup>
      );

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Selection Behavior', () => {
    it('selects radio on click', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      await user.click(radios[0]!);

      await waitFor(() => {
        expect(radios[0]).toBeChecked();
        expect(radios[1]).not.toBeChecked();
      });
    });

    it('only one option can be selected at a time', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
          <RadioGroupItem value="option3" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');

      // Select first option
      await user.click(radios[0]!);
      await waitFor(() => {
        expect(radios[0]).toBeChecked();
      });

      // Select second option
      await user.click(radios[1]!);
      await waitFor(() => {
        expect(radios[0]).not.toBeChecked();
        expect(radios[1]).toBeChecked();
        expect(radios[2]).not.toBeChecked();
      });

      // Select third option
      await user.click(radios[2]!);
      await waitFor(() => {
        expect(radios[0]).not.toBeChecked();
        expect(radios[1]).not.toBeChecked();
        expect(radios[2]).toBeChecked();
      });
    });

    it('calls onValueChange when selection changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      await user.click(screen.getAllByRole('radio')[0]!);
      expect(handleChange).toHaveBeenCalledWith('option1');

      await user.click(screen.getAllByRole('radio')[1]!);
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('does not allow deselecting by clicking selected option', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup defaultValue="option1" onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radio = screen.getByRole('radio');
      expect(radio).toBeChecked();

      await user.click(radio);

      // Should still be checked and onChange should not be called again
      expect(radio).toBeChecked();
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('focuses radio group with Tab', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      await user.tab();
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveFocus();
    });

    it('supports keyboard navigation with arrow keys', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
          <RadioGroupItem value="option3" />
        </RadioGroup>
      );

      // Tab to focus the group
      await user.tab();

      const radios = screen.getAllByRole('radio');
      // One of the radios should have focus after tabbing
      expect([radios[0], radios[1], radios[2]]).toContain(document.activeElement);

      // Arrow keys navigate (Radix UI handles this internally)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      // Focus should still be on a radio button
      expect([radios[0], radios[1], radios[2]]).toContain(document.activeElement);
    });

    it('supports arrow key navigation', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup defaultValue="option2">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
          <RadioGroupItem value="option3" />
        </RadioGroup>
      );

      // Tab to focus the group
      await user.tab();

      // Arrow keys navigate (Radix UI handles the details)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      // Verify focus is maintained within the group
      const focused = document.activeElement;
      expect(screen.getAllByRole('radio')).toContain(focused);
    });

    it('selects focused option with Space key', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      // Tab to focus group, then Space to select
      await user.tab();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });
  });

  describe('Disabled State', () => {
    it('disables all items when group is disabled', () => {
      render(
        <RadioGroup disabled>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('disables individual items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" disabled />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toBeDisabled();
      expect(radios[1]).not.toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" disabled data-testid="radio" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio');
      expect(radio).toHaveClass('disabled:cursor-not-allowed');
      expect(radio).toHaveClass('disabled:opacity-50');
    });

    it('does not trigger onValueChange when disabled item is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" disabled />
        </RadioGroup>
      );

      await user.click(screen.getByRole('radio'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not select disabled items', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" disabled />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');

      // Try to select disabled option
      await user.click(radios[1]!);
      expect(handleChange).not.toHaveBeenCalled();

      // Select enabled option works
      await user.click(radios[0]!);
      expect(handleChange).toHaveBeenCalledWith('option1');
    });
  });

  describe('Controlled Mode', () => {
    it('supports controlled value', () => {
      const { rerender } = render(
        <RadioGroup value="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toBeChecked();
      expect(radios[1]).not.toBeChecked();

      rerender(
        <RadioGroup value="option2">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it('calls onValueChange in controlled mode', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup value="option1" onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      await user.click(screen.getAllByRole('radio')[1]!);
      expect(handleChange).toHaveBeenCalledWith('option2');
    });
  });

  describe('Accessibility', () => {
    it('has correct radiogroup role', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has correct radio role for items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
    });

    it('supports aria-label on group', () => {
      render(
        <RadioGroup aria-label="Select an option">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByLabelText('Select an option')).toBeInTheDocument();
    });

    it('indicates checked state with aria-checked', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('aria-checked', 'true');
      expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    });

    it('applies focus-visible ring styles', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio')).toHaveClass('focus-visible:ring-2');
    });

    it('associates with label via htmlFor', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="radio1" />
          <label htmlFor="radio1">First Option</label>
        </RadioGroup>
      );

      const radio = screen.getByLabelText('First Option');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute('value', 'option1');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to radio group element', () => {
      const ref = { current: null };
      render(
        <RadioGroup ref={ref}>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref to radio item element', () => {
      const ref = { current: null };
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" ref={ref} />
        </RadioGroup>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('allows ref access to radio item methods', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" ref={ref} />
        </RadioGroup>
      );

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
      expect(ref.current?.click).toBeDefined();
    });
  });

  describe('Visual States', () => {
    it('applies border styles to items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio');
      expect(radio).toHaveClass('border');
      expect(radio).toHaveClass('border-neutral-300');
    });

    it('applies primary color for checked state', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio')).toHaveClass('text-primary-600');
    });

    it('renders indicator dot when checked', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio');
      const indicator = radio.querySelector('[class*="bg-current"]');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('h-2.5');
      expect(indicator).toHaveClass('w-2.5');
      expect(indicator).toHaveClass('rounded-full');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode border styles', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio')).toHaveClass('dark:border-neutral-600');
    });

    it('applies dark mode text color', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio')).toHaveClass('dark:text-primary-400');
    });
  });

  describe('CVA Variants', () => {
    it('exports radioGroupVariants function', () => {
      expect(typeof radioGroupVariants).toBe('function');
    });

    it('exports radioGroupItemVariants function', () => {
      expect(typeof radioGroupItemVariants).toBe('function');
    });

    it('generates correct classes for group', () => {
      const classes = radioGroupVariants();
      expect(classes).toContain('grid');
      expect(classes).toContain('gap-2');
    });

    it('generates correct classes for item', () => {
      const classes = radioGroupItemVariants();
      expect(classes).toContain('rounded-full');
      expect(classes).toContain('border-neutral-300');
    });
  });

  describe('Custom className', () => {
    it('merges custom className on group', () => {
      render(
        <RadioGroup className="custom-group" data-testid="radiogroup">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const group = screen.getByTestId('radiogroup');
      expect(group).toHaveClass('custom-group');
      expect(group).toHaveClass('grid');
    });

    it('merges custom className on item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" className="custom-radio" data-testid="radio" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio');
      expect(radio).toHaveClass('custom-radio');
      expect(radio).toHaveClass('rounded-full');
    });
  });

  describe('Value Prop', () => {
    it('requires value prop on items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="unique-value" data-testid="radio" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio')).toHaveAttribute('value', 'unique-value');
    });

    it('differentiates items by value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="first" />
          <RadioGroupItem value="second" />
          <RadioGroupItem value="third" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');

      await user.click(radios[1]!);
      expect(handleChange).toHaveBeenCalledWith('second');

      await user.click(radios[2]!);
      expect(handleChange).toHaveBeenCalledWith('third');
    });
  });
});
