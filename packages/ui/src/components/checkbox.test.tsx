import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Checkbox, checkboxVariants } from './checkbox';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders unchecked by default', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<Checkbox checked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders with data-state attribute', () => {
      const { rerender } = render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-state', 'unchecked');

      rerender(<Checkbox checked data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-state', 'checked');
    });

    it('displays checkmark indicator when checked', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole('checkbox');

      // Check for the SVG checkmark indicator
      const svg = checkbox.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('toggles checked state on click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox checked onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('toggles multiple times', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(false);

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);

      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be focused with Tab', async () => {
      const user = userEvent.setup();
      render(<Checkbox />);

      await user.tab();
      expect(screen.getByRole('checkbox')).toHaveFocus();
    });

    it('toggles on Space key press', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('maintains focus after toggling', async () => {
      const user = userEvent.setup();
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(checkbox).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has correct checkbox role', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Checkbox aria-label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    it('supports id attribute for label association', () => {
      render(
        <>
          <Checkbox id="terms" />
          <label htmlFor="terms">Accept terms</label>
        </>
      );
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    it('indicates checked state with aria-checked', () => {
      const { rerender } = render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');

      rerender(<Checkbox checked />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('indicates disabled state to screen readers', () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('applies focus-visible ring styles', () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Disabled State', () => {
    it('renders as disabled', () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Checkbox disabled data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed');
      expect(checkbox).toHaveClass('disabled:opacity-50');
    });

    it('does not trigger onCheckedChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await user.keyboard(' ');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Controlled Mode', () => {
    it('supports controlled checked state', () => {
      const { rerender } = render(<Checkbox checked={false} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();

      rerender(<Checkbox checked={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('updates when controlled value changes', () => {
      const { rerender } = render(<Checkbox checked={false} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      rerender(<Checkbox checked={true} />);
      expect(checkbox).toHaveAttribute('data-state', 'checked');

      rerender(<Checkbox checked={false} />);
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onCheckedChange in controlled mode', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to checkbox element', () => {
      const ref = { current: null };
      render(<Checkbox ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('allows ref access to checkbox methods', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Checkbox ref={ref} />);

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
      expect(ref.current?.click).toBeDefined();
    });
  });

  describe('Visual States', () => {
    it('applies checked styles via data-state', () => {
      render(<Checkbox checked data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('data-[state=checked]:bg-primary-600');
      expect(checkbox).toHaveClass('data-[state=checked]:border-primary-600');
    });

    it('applies border styles', () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('border');
      expect(checkbox).toHaveClass('border-neutral-300');
    });

    it('has fixed size dimensions', () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('h-5');
      expect(checkbox).toHaveClass('w-5');
    });

    it('has rounded corners', () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveClass('rounded-sm');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode border styles', () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveClass('dark:border-neutral-600');
    });

    it('applies dark mode checked styles', () => {
      render(<Checkbox checked data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('dark:data-[state=checked]:bg-primary-700');
      expect(checkbox).toHaveClass('dark:data-[state=checked]:border-primary-700');
    });
  });

  describe('CVA Variants', () => {
    it('exports checkboxVariants function', () => {
      expect(typeof checkboxVariants).toBe('function');
    });

    it('generates correct classes from variants', () => {
      const classes = checkboxVariants();
      expect(classes).toContain('border-neutral-300');
      expect(classes).toContain('rounded-sm');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
      expect(checkbox).toHaveClass('border-neutral-300');
    });

    it('allows overriding default classes', () => {
      render(<Checkbox className="border-red-500" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('border-red-500');
    });
  });

  describe('Indeterminate State', () => {
    it('supports indeterminate state', () => {
      render(<Checkbox checked="indeterminate" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });

    it('calls onCheckedChange when clicking indeterminate checkbox', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox checked="indeterminate" onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Indicator', () => {
    it('renders indicator element', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole('checkbox');
      const indicator = checkbox.querySelector('[class*="items-center"]');
      expect(indicator).toBeInTheDocument();
    });

    it('indicator contains SVG checkmark', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole('checkbox');
      const svg = checkbox.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-4');
      expect(svg).toHaveClass('w-4');
    });

    it('checkmark has correct path', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole('checkbox');
      const path = checkbox.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', 'M5 13l4 4L19 7');
    });
  });
});
