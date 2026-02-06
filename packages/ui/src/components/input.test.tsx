import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Input, inputVariants } from './input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-neutral-300');
    });

    it('renders with default type as text', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });
  });

  describe('Variants', () => {
    it.each([
      ['default', 'border-neutral-300'],
      ['error', 'border-red-500'],
      ['success', 'border-green-500'],
    ])('renders %s variant with correct styles', (variant, expectedClass) => {
      render(<Input data-testid="input" variant={variant as any} />);
      expect(screen.getByTestId('input')).toHaveClass(expectedClass);
    });

    it('applies error variant styles', () => {
      render(<Input variant="error" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveClass('text-red-900');
    });

    it('applies success variant styles', () => {
      render(<Input variant="success" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-green-500');
      expect(input).toHaveClass('text-green-900');
    });
  });

  describe('Sizes', () => {
    it.each([
      ['sm', 'h-8'],
      ['md', 'h-10'],
      ['lg', 'h-12'],
    ])('renders %s size with correct height', (size, expectedClass) => {
      render(<Input data-testid="input" size={size as any} />);
      expect(screen.getByTestId('input')).toHaveClass(expectedClass);
    });

    it('applies correct text size for sm', () => {
      render(<Input size="sm" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('text-sm');
    });

    it('applies correct text size for lg', () => {
      render(<Input size="lg" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('text-lg');
    });
  });

  describe('Input Types', () => {
    it('supports text type', () => {
      render(<Input type="text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });

    it('supports email type', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('supports password type', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('supports number type', () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });
  });

  describe('User Interactions', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} placeholder="Type here" />);

      const input = screen.getByPlaceholderText('Type here');
      await user.type(input, 'Hello');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('Hello');
    });

    it('handles onFocus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} placeholder="Focus me" />);

      await user.click(screen.getByPlaceholderText('Focus me'));
      expect(handleFocus).toHaveBeenCalledOnce();
    });

    it('handles onBlur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} placeholder="Blur me" />);

      const input = screen.getByPlaceholderText('Blur me');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalledOnce();
    });

    it('supports controlled input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { rerender } = render(
        <Input value="initial" onChange={handleChange} data-testid="input" />
      );

      expect(screen.getByTestId('input')).toHaveValue('initial');

      rerender(<Input value="updated" onChange={handleChange} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('updated');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled input', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('disabled:opacity-50');
    });

    it('does not trigger onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} data-testid="input" />);

      await user.type(screen.getByTestId('input'), 'text');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct textbox role', () => {
      render(<Input aria-label="Text input" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="helper-text" data-testid="input" />
          <span id="helper-text">Helper text</span>
        </>
      );
      expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('supports aria-invalid for error state', () => {
      render(<Input aria-invalid="true" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Placeholder', () => {
    it('renders placeholder text', () => {
      render(<Input placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('applies placeholder styles', () => {
      render(<Input placeholder="Text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('placeholder:text-neutral-500');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = { current: null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('allows ref access to input methods', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
    });
  });

  describe('CVA Variants', () => {
    it('exports inputVariants function', () => {
      expect(typeof inputVariants).toBe('function');
    });

    it('generates correct classes from variants', () => {
      const classes = inputVariants({ variant: 'error', size: 'lg' });
      expect(classes).toContain('border-red-500');
      expect(classes).toContain('h-12');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with variant classes', () => {
      render(<Input className="custom-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-input');
      expect(input).toHaveClass('border-neutral-300');
    });
  });

  describe('Value Prop', () => {
    it('renders with initial value', () => {
      render(<Input value="initial value" onChange={() => {}} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('initial value');
    });

    it('renders with defaultValue for uncontrolled input', () => {
      render(<Input defaultValue="default value" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('default value');
    });
  });

  describe('File Input', () => {
    it('supports file input type', () => {
      render(<Input type="file" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'file');
    });

    it('applies file input styles', () => {
      render(<Input type="file" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('file:border-0');
    });
  });
});
