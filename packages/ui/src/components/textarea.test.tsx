import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Textarea, textareaVariants } from './textarea';

describe('Textarea', () => {
  describe('Rendering', () => {
    it('renders textarea element', () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('border-neutral-300');
    });

    it('renders with default rows', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '4');
    });
  });

  describe('Variants', () => {
    it.each([
      ['default', 'border-neutral-300'],
      ['error', 'border-red-500'],
      ['success', 'border-green-500'],
    ])('renders %s variant with correct styles', (variant, expectedClass) => {
      render(<Textarea data-testid="textarea" variant={variant as any} />);
      expect(screen.getByTestId('textarea')).toHaveClass(expectedClass);
    });

    it('applies error variant styles', () => {
      render(<Textarea variant="error" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('border-red-500');
      expect(textarea).toHaveClass('text-red-900');
    });

    it('applies success variant styles', () => {
      render(<Textarea variant="success" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('border-green-500');
      expect(textarea).toHaveClass('text-green-900');
    });
  });

  describe('Sizes', () => {
    it.each([
      ['sm', 'text-sm'],
      ['md', 'text-base'],
      ['lg', 'text-lg'],
    ])('renders %s size with correct text size', (size, expectedClass) => {
      render(<Textarea data-testid="textarea" size={size as any} />);
      expect(screen.getByTestId('textarea')).toHaveClass(expectedClass);
    });
  });

  describe('Resize Prop', () => {
    it('allows resize by default', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).not.toHaveClass('resize-none');
    });

    it('disables resize when resize=false', () => {
      render(<Textarea resize={false} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('resize-none');
    });

    it('enables resize when resize=true', () => {
      render(<Textarea resize={true} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).not.toHaveClass('resize-none');
    });
  });

  describe('Rows Prop', () => {
    it('renders with custom rows', () => {
      render(<Textarea rows={8} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '8');
    });

    it('renders with minimum rows', () => {
      render(<Textarea rows={2} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '2');
    });

    it('renders with many rows', () => {
      render(<Textarea rows={20} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '20');
    });
  });

  describe('User Interactions', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} placeholder="Type here" />);

      const textarea = screen.getByPlaceholderText('Type here');
      await user.type(textarea, 'Hello');

      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue('Hello');
    });

    it('handles multi-line text input', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');

      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });

    it('handles onFocus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Textarea onFocus={handleFocus} placeholder="Focus me" />);

      await user.click(screen.getByPlaceholderText('Focus me'));
      expect(handleFocus).toHaveBeenCalledOnce();
    });

    it('handles onBlur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Textarea onBlur={handleBlur} placeholder="Blur me" />);

      const textarea = screen.getByPlaceholderText('Blur me');
      await user.click(textarea);
      await user.tab();

      expect(handleBlur).toHaveBeenCalledOnce();
    });

    it('supports controlled textarea', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Textarea value="initial" onChange={handleChange} data-testid="textarea" />
      );

      expect(screen.getByTestId('textarea')).toHaveValue('initial');

      rerender(<Textarea value="updated" onChange={handleChange} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveValue('updated');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled textarea', () => {
      render(<Textarea disabled data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Textarea disabled data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('disabled:opacity-50');
    });

    it('does not trigger onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea disabled onChange={handleChange} data-testid="textarea" />);

      await user.type(screen.getByTestId('textarea'), 'text');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct textbox role', () => {
      render(<Textarea aria-label="Message" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Textarea aria-label="Message input" />);
      expect(screen.getByLabelText('Message input')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Textarea aria-describedby="helper-text" data-testid="textarea" />
          <span id="helper-text">Helper text</span>
        </>
      );
      expect(screen.getByTestId('textarea')).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('supports aria-invalid for error state', () => {
      render(<Textarea aria-invalid="true" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Placeholder', () => {
    it('renders placeholder text', () => {
      render(<Textarea placeholder="Enter your message" />);
      expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
    });

    it('applies placeholder styles', () => {
      render(<Textarea placeholder="Text" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('placeholder:text-neutral-500');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to textarea element', () => {
      const ref = { current: null };
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('allows ref access to textarea methods', () => {
      const ref = { current: null as HTMLTextAreaElement | null };
      render(<Textarea ref={ref} />);

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
    });
  });

  describe('CVA Variants', () => {
    it('exports textareaVariants function', () => {
      expect(typeof textareaVariants).toBe('function');
    });

    it('generates correct classes from variants', () => {
      const classes = textareaVariants({ variant: 'error', size: 'lg' });
      expect(classes).toContain('border-red-500');
      expect(classes).toContain('text-lg');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with variant classes', () => {
      render(<Textarea className="custom-textarea" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('custom-textarea');
      expect(textarea).toHaveClass('border-neutral-300');
    });
  });

  describe('Value Prop', () => {
    it('renders with initial value', () => {
      render(<Textarea value="initial value" onChange={() => {}} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveValue('initial value');
    });

    it('renders with defaultValue for uncontrolled textarea', () => {
      render(<Textarea defaultValue="default value" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveValue('default value');
    });

    it('handles multi-line default value', () => {
      const multiLineValue = 'Line 1\nLine 2\nLine 3';
      render(<Textarea defaultValue={multiLineValue} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveValue(multiLineValue);
    });
  });

  describe('MaxLength', () => {
    it('supports maxLength attribute', () => {
      render(<Textarea maxLength={100} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('maxLength', '100');
    });

    it('enforces maxLength limit', async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={10} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'This is a very long text that exceeds limit');

      expect(textarea).toHaveValue('This is a ');
    });
  });
});
