import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Switch, switchVariants, switchThumbVariants } from './switch';

describe('Switch', () => {
  describe('Rendering', () => {
    it('renders unchecked by default', () => {
      render(<Switch />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toBeInTheDocument();
      expect(switchEl).not.toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<Switch checked />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('renders with data-state attribute', () => {
      const { rerender } = render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('data-state', 'unchecked');

      rerender(<Switch checked data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('data-state', 'checked');
    });

    it('renders thumb element', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="rounded-full"]');
      expect(thumb).toBeInTheDocument();
    });

    it('renders with default size', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('h-6');
      expect(screen.getByTestId('switch')).toHaveClass('w-11');
    });
  });

  describe('User Interactions', () => {
    it('toggles checked state on click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch onCheckedChange={handleChange} />);

      const switchEl = screen.getByRole('switch');
      await user.click(switchEl);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch checked onCheckedChange={handleChange} />);

      const switchEl = screen.getByRole('switch');
      await user.click(switchEl);

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('toggles multiple times', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch onCheckedChange={handleChange} />);

      const switchEl = screen.getByRole('switch');

      await user.click(switchEl);
      expect(handleChange).toHaveBeenCalledWith(true);

      await user.click(switchEl);
      expect(handleChange).toHaveBeenCalledWith(false);

      await user.click(switchEl);
      expect(handleChange).toHaveBeenCalledWith(true);

      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be focused with Tab', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      await user.tab();
      expect(screen.getByRole('switch')).toHaveFocus();
    });

    it('toggles on Space key press', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch onCheckedChange={handleChange} />);

      const switchEl = screen.getByRole('switch');
      switchEl.focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('toggles on Enter key press', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch onCheckedChange={handleChange} />);

      const switchEl = screen.getByRole('switch');
      switchEl.focus();
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('maintains focus after toggling', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchEl = screen.getByRole('switch');
      await user.click(switchEl);

      expect(switchEl).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has correct switch role', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Switch aria-label="Enable notifications" />);
      expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
    });

    it('supports id attribute for label association', () => {
      render(
        <>
          <Switch id="notifications" />
          <label htmlFor="notifications">Enable notifications</label>
        </>
      );
      expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
    });

    it('indicates checked state with aria-checked', () => {
      const { rerender } = render(<Switch />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

      rerender(<Switch checked />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('indicates disabled state to screen readers', () => {
      render(<Switch disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('applies focus-visible ring styles', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Disabled State', () => {
    it('renders as disabled', () => {
      render(<Switch disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Switch disabled data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('disabled:cursor-not-allowed');
      expect(switchEl).toHaveClass('disabled:opacity-50');
    });

    it('does not trigger onCheckedChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch disabled onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch disabled onCheckedChange={handleChange} />);

      const switchEl = screen.getByRole('switch');
      switchEl.focus();
      await user.keyboard(' ');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it.each([
      ['sm', 'h-5', 'w-9'],
      ['md', 'h-6', 'w-11'],
      ['lg', 'h-7', 'w-[3.25rem]'],
    ])('renders %s size with correct dimensions', (size, heightClass, widthClass) => {
      render(<Switch data-testid="switch" size={size as any} />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass(heightClass);
      expect(switchEl).toHaveClass(widthClass);
    });

    it('applies default md size when size prop is omitted', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('h-6');
      expect(switchEl).toHaveClass('w-11');
    });
  });

  describe('Controlled Mode', () => {
    it('supports controlled checked state', () => {
      const { rerender } = render(<Switch checked={false} />);
      expect(screen.getByRole('switch')).not.toBeChecked();

      rerender(<Switch checked={true} />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('updates when controlled value changes', () => {
      const { rerender } = render(<Switch checked={false} />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('data-state', 'unchecked');

      rerender(<Switch checked={true} />);
      expect(switchEl).toHaveAttribute('data-state', 'checked');

      rerender(<Switch checked={false} />);
      expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onCheckedChange in controlled mode', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch checked={false} onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to switch element', () => {
      const ref = { current: null };
      render(<Switch ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('allows ref access to switch methods', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Switch ref={ref} />);

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
      expect(ref.current?.click).toBeDefined();
    });
  });

  describe('Visual States', () => {
    it('applies checked background color via data-state', () => {
      render(<Switch checked data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('data-[state=checked]:bg-primary-600');
    });

    it('applies unchecked background color via data-state', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('data-[state=unchecked]:bg-neutral-200');
    });

    it('has rounded-full shape', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('rounded-full');
    });

    it('has inline-flex display', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('inline-flex');
    });
  });

  describe('Thumb Component', () => {
    it('renders thumb with rounded-full shape', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="rounded-full"]');
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveClass('rounded-full');
    });

    it('thumb has white background', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="bg-white"]');
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveClass('bg-white');
    });

    it('thumb translates when checked - sm size', () => {
      render(<Switch checked size="sm" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="translate-x"]');
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-4');
    });

    it('thumb translates when checked - md size', () => {
      render(<Switch checked size="md" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="translate-x"]');
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-5');
    });

    it('thumb translates when checked - lg size', () => {
      render(<Switch checked size="lg" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="translate-x"]');
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-6');
    });

    it('thumb stays at zero position when unchecked', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="translate-x"]');
      expect(thumb).toHaveClass('data-[state=unchecked]:translate-x-0');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode checked background', () => {
      render(<Switch checked data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('dark:data-[state=checked]:bg-primary-700');
    });

    it('applies dark mode unchecked background', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('dark:data-[state=unchecked]:bg-neutral-700');
    });

    it('applies dark mode thumb background', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="bg-white"]');
      expect(thumb).toHaveClass('dark:bg-neutral-100');
    });
  });

  describe('CVA Variants', () => {
    it('exports switchVariants function', () => {
      expect(typeof switchVariants).toBe('function');
    });

    it('exports switchThumbVariants function', () => {
      expect(typeof switchThumbVariants).toBe('function');
    });

    it('generates correct classes for switch', () => {
      const classes = switchVariants({ size: 'md' });
      expect(classes).toContain('rounded-full');
      expect(classes).toContain('h-6');
      expect(classes).toContain('w-11');
    });

    it('generates correct classes for thumb', () => {
      const classes = switchThumbVariants({ size: 'lg' });
      expect(classes).toContain('rounded-full');
      expect(classes).toContain('h-6');
      expect(classes).toContain('w-6');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Switch className="custom-switch" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('custom-switch');
      expect(switchEl).toHaveClass('rounded-full');
    });

    it('allows overriding default classes', () => {
      render(<Switch className="bg-red-500" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('bg-red-500');
    });
  });

  describe('Transitions', () => {
    it('applies transition classes to switch', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('transition-colors');
    });

    it('applies transition classes to thumb', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[class*="transition"]');
      expect(thumb).toHaveClass('transition-transform');
    });
  });

  describe('defaultChecked', () => {
    it('supports defaultChecked for uncontrolled mode', () => {
      render(<Switch defaultChecked />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('calls onCheckedChange when toggling uncontrolled switch', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch defaultChecked onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });
});
