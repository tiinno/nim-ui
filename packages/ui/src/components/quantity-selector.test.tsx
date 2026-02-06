import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { QuantitySelector, quantitySelectorVariants } from './quantity-selector';

describe('QuantitySelector', () => {
  describe('Rendering', () => {
    it('renders with value', () => {
      render(<QuantitySelector value={1} onChange={() => {}} />);
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    it('renders decrement button', () => {
      render(<QuantitySelector value={1} onChange={() => {}} />);
      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
    });

    it('renders increment button', () => {
      render(<QuantitySelector value={1} onChange={() => {}} />);
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
    });

    it('renders input field', () => {
      render(<QuantitySelector value={5} onChange={() => {}} />);
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('applies base layout styles', () => {
      render(<QuantitySelector value={1} onChange={() => {}} data-testid="selector" />);
      const selector = screen.getByTestId('selector');
      expect(selector).toHaveClass('inline-flex');
      expect(selector).toHaveClass('items-center');
      expect(selector).toHaveClass('border');
      expect(selector).toHaveClass('rounded-md');
    });
  });

  describe('Sizes', () => {
    it('applies default (md) size', () => {
      render(<QuantitySelector value={1} onChange={() => {}} data-testid="selector" />);
      expect(screen.getByTestId('selector')).toHaveClass('h-10');
    });

    it.each([
      ['sm', 'h-8'],
      ['md', 'h-10'],
      ['lg', 'h-12'],
    ])('renders %s size with correct height', (size, expectedClass) => {
      render(
        <QuantitySelector
          value={1}
          size={size as any}
          onChange={() => {}}
          data-testid="selector"
        />
      );
      expect(screen.getByTestId('selector')).toHaveClass(expectedClass);
    });

    it('applies small size', () => {
      render(
        <QuantitySelector value={1} size="sm" onChange={() => {}} data-testid="selector" />
      );
      expect(screen.getByTestId('selector')).toHaveClass('h-8');
    });

    it('applies large size', () => {
      render(
        <QuantitySelector value={1} size="lg" onChange={() => {}} data-testid="selector" />
      );
      expect(screen.getByTestId('selector')).toHaveClass('h-12');
    });
  });

  describe('Value Display', () => {
    it('displays current value', () => {
      render(<QuantitySelector value={5} onChange={() => {}} />);
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('displays min value', () => {
      render(<QuantitySelector value={1} min={1} onChange={() => {}} />);
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    it('displays max value', () => {
      render(<QuantitySelector value={10} max={10} onChange={() => {}} />);
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('updates display when value changes', () => {
      const { rerender } = render(<QuantitySelector value={1} onChange={() => {}} />);
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();

      rerender(<QuantitySelector value={5} onChange={() => {}} />);
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });
  });

  describe('Increment Button', () => {
    it('calls onChange with incremented value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={5} onChange={handleChange} />);

      await user.click(screen.getByLabelText('Increase quantity'));

      expect(handleChange).toHaveBeenCalledWith(6);
    });

    it('respects max value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={10} max={10} onChange={handleChange} />);

      await user.click(screen.getByLabelText('Increase quantity'));

      // Button is disabled at max, so onChange is not called
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('disables when at max', () => {
      render(<QuantitySelector value={10} max={10} onChange={() => {}} />);
      expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
    });

    it('enables when below max', () => {
      render(<QuantitySelector value={9} max={10} onChange={() => {}} />);
      expect(screen.getByLabelText('Increase quantity')).not.toBeDisabled();
    });
  });

  describe('Decrement Button', () => {
    it('calls onChange with decremented value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={5} onChange={handleChange} />);

      await user.click(screen.getByLabelText('Decrease quantity'));

      expect(handleChange).toHaveBeenCalledWith(4);
    });

    it('respects min value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={1} min={1} onChange={handleChange} />);

      await user.click(screen.getByLabelText('Decrease quantity'));

      // Button is disabled at min, so onChange is not called
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('disables when at min', () => {
      render(<QuantitySelector value={1} min={1} onChange={() => {}} />);
      expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
    });

    it('enables when above min', () => {
      render(<QuantitySelector value={2} min={1} onChange={() => {}} />);
      expect(screen.getByLabelText('Decrease quantity')).not.toBeDisabled();
    });
  });

  describe('Input Field', () => {
    it('accepts direct input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={5} onChange={handleChange} />);

      const input = screen.getByLabelText('Quantity');
      // Type directly replaces selection
      await user.click(input);
      await user.keyboard('{Control>}a{/Control}');
      await user.keyboard('8');

      expect(handleChange).toHaveBeenCalledWith(8);
    });

    it('validates input against min', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={5} min={1} onChange={handleChange} />);

      const input = screen.getByLabelText('Quantity');
      await user.click(input);
      await user.keyboard('{Control>}a{/Control}');
      await user.keyboard('0');

      // Value below min is rejected
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('validates input against max', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={5} max={10} onChange={handleChange} />);

      const input = screen.getByLabelText('Quantity');
      await user.click(input);
      await user.keyboard('{Control>}a{/Control}');
      await user.keyboard('99');

      // Value above max (99 > 10) is rejected
      expect(handleChange).not.toHaveBeenCalledWith(99);
    });

    it('ignores non-numeric input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={5} onChange={handleChange} />);

      const input = screen.getByLabelText('Quantity');
      await user.click(input);
      await user.keyboard('{Control>}a{/Control}');
      await user.keyboard('abc');

      // Non-numeric input is rejected
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('has min and max attributes', () => {
      render(<QuantitySelector value={5} min={1} max={99} onChange={() => {}} />);
      const input = screen.getByLabelText('Quantity') as HTMLInputElement;
      expect(input.min).toBe('1');
      expect(input.max).toBe('99');
    });
  });

  describe('Min/Max Props', () => {
    it('uses default min value of 1', () => {
      render(<QuantitySelector value={1} onChange={() => {}} />);
      const input = screen.getByLabelText('Quantity') as HTMLInputElement;
      expect(input.min).toBe('1');
    });

    it('uses default max value of 99', () => {
      render(<QuantitySelector value={1} onChange={() => {}} />);
      const input = screen.getByLabelText('Quantity') as HTMLInputElement;
      expect(input.max).toBe('99');
    });

    it('accepts custom min value', () => {
      render(<QuantitySelector value={5} min={5} onChange={() => {}} />);
      const input = screen.getByLabelText('Quantity') as HTMLInputElement;
      expect(input.min).toBe('5');
    });

    it('accepts custom max value', () => {
      render(<QuantitySelector value={5} max={20} onChange={() => {}} />);
      const input = screen.getByLabelText('Quantity') as HTMLInputElement;
      expect(input.max).toBe('20');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode styles', () => {
      render(<QuantitySelector value={1} onChange={() => {}} data-testid="selector" />);
      const selector = screen.getByTestId('selector');
      expect(selector).toHaveClass('dark:bg-neutral-900');
      expect(selector).toHaveClass('dark:border-neutral-700');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<QuantitySelector ref={ref} value={1} onChange={() => {}} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports quantitySelectorVariants function', () => {
      expect(typeof quantitySelectorVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = quantitySelectorVariants();
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('border');
      expect(classes).toContain('rounded-md');
    });

    it('generates correct size classes', () => {
      const smClasses = quantitySelectorVariants({ size: 'sm' });
      expect(smClasses).toContain('h-8');

      const lgClasses = quantitySelectorVariants({ size: 'lg' });
      expect(lgClasses).toContain('h-12');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <QuantitySelector
          value={1}
          onChange={() => {}}
          className="my-4"
          data-testid="selector"
        />
      );
      const selector = screen.getByTestId('selector');
      expect(selector).toHaveClass('my-4');
      expect(selector).toHaveClass('inline-flex');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <QuantitySelector
          value={1}
          onChange={() => {}}
          data-testid="selector"
          data-product-id="123"
        />
      );
      expect(screen.getByTestId('selector')).toHaveAttribute('data-product-id', '123');
    });

    it('supports aria attributes', () => {
      render(
        <QuantitySelector
          value={1}
          onChange={() => {}}
          aria-label="Product quantity"
          data-testid="selector"
        />
      );
      expect(screen.getByTestId('selector')).toHaveAttribute(
        'aria-label',
        'Product quantity'
      );
    });

    it('supports id attribute', () => {
      render(<QuantitySelector value={1} onChange={() => {}} id="qty-selector" />);
      expect(document.getElementById('qty-selector')).toBeInTheDocument();
    });
  });

  describe('Complete Examples', () => {
    it('renders full quantity selector with all props', () => {
      render(
        <QuantitySelector
          value={5}
          min={1}
          max={10}
          size="lg"
          onChange={() => {}}
          data-testid="selector"
        />
      );

      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByTestId('selector')).toHaveClass('h-12');
    });

    it('handles typical shopping cart scenario', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<QuantitySelector value={1} min={1} max={10} onChange={handleChange} />);

      await user.click(screen.getByLabelText('Increase quantity'));
      expect(handleChange).toHaveBeenCalledWith(2);

      await user.click(screen.getByLabelText('Increase quantity'));
      expect(handleChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles min equals max', () => {
      render(<QuantitySelector value={5} min={5} max={5} onChange={() => {}} />);
      expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
      expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
    });

    it('handles large values', () => {
      render(<QuantitySelector value={999} max={1000} onChange={() => {}} />);
      expect(screen.getByDisplayValue('999')).toBeInTheDocument();
    });

    it('button text is - and +', () => {
      render(<QuantitySelector value={5} onChange={() => {}} />);
      expect(screen.getByLabelText('Decrease quantity')).toHaveTextContent('-');
      expect(screen.getByLabelText('Increase quantity')).toHaveTextContent('+');
    });
  });

  describe('Accessibility', () => {
    it('buttons have aria-labels', () => {
      render(<QuantitySelector value={5} onChange={() => {}} />);
      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
    });

    it('input has aria-label', () => {
      render(<QuantitySelector value={5} onChange={() => {}} />);
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('disabled buttons are not interactive', () => {
      render(<QuantitySelector value={1} min={1} onChange={() => {}} />);
      const decrementBtn = screen.getByLabelText('Decrease quantity');
      expect(decrementBtn).toBeDisabled();
      expect(decrementBtn).toHaveClass('disabled:opacity-50');
      expect(decrementBtn).toHaveClass('disabled:cursor-not-allowed');
    });
  });
});
