import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { FormField, formFieldVariants } from './form-field';
import { Input } from './input';

describe('FormField', () => {
  describe('Rendering', () => {
    it('renders with label and input', () => {
      render(
        <FormField label="Username" name="username">
          <Input />
        </FormField>
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <FormField label="Email" name="email">
          <Input type="email" placeholder="Enter email" />
        </FormField>
      );

      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('applies space-y-2 layout', () => {
      render(
        <FormField label="Name" name="name" data-testid="form-field">
          <Input />
        </FormField>
      );

      expect(screen.getByTestId('form-field')).toHaveClass('space-y-2');
    });
  });

  describe('Label Association', () => {
    it('associates label with input via htmlFor', () => {
      render(
        <FormField label="Email Address" name="email">
          <Input id="email" />
        </FormField>
      );

      const label = screen.getByText('Email Address');
      expect(label).toHaveAttribute('for', 'email');
    });

    it('uses name prop for label htmlFor attribute', () => {
      render(
        <FormField label="Password" name="user-password">
          <Input id="user-password" />
        </FormField>
      );

      const label = screen.getByText('Password');
      expect(label).toHaveAttribute('for', 'user-password');
    });

    it('label is clickable to focus input', () => {
      render(
        <FormField label="Username" name="username">
          <Input id="username" />
        </FormField>
      );

      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'username');
    });
  });

  describe('Required Indicator', () => {
    it('does not show asterisk by default', () => {
      render(
        <FormField label="Username" name="username">
          <Input />
        </FormField>
      );

      const label = screen.getByText('Username');
      expect(label.textContent).toBe('Username');
      expect(label.querySelector('[class*="text-red"]')).not.toBeInTheDocument();
    });

    it('shows red asterisk when required', () => {
      render(
        <FormField label="Username" name="username" required>
          <Input />
        </FormField>
      );

      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-600');
      expect(asterisk).toHaveClass('ml-1');
    });

    it('asterisk is part of label element', () => {
      render(
        <FormField label="Email" name="email" required>
          <Input />
        </FormField>
      );

      const label = screen.getByText('Email').parentElement;
      expect(label?.textContent).toContain('*');
    });
  });

  describe('Helper Text', () => {
    it('displays helper text when provided', () => {
      render(
        <FormField
          label="Password"
          name="password"
          helperText="Must be at least 8 characters"
        >
          <Input />
        </FormField>
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('applies correct helper text styles', () => {
      render(
        <FormField
          label="Email"
          name="email"
          helperText="We'll never share your email"
        >
          <Input />
        </FormField>
      );

      const helperText = screen.getByText("We'll never share your email");
      expect(helperText).toHaveClass('text-sm');
      expect(helperText).toHaveClass('text-neutral-600');
      expect(helperText).toHaveClass('dark:text-neutral-400');
    });

    it('does not display helper text when error is present', () => {
      render(
        <FormField
          label="Email"
          name="email"
          helperText="Enter a valid email"
          error="Invalid email address"
        >
          <Input />
        </FormField>
      );

      expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('does not render helper text element when not provided', () => {
      const { container } = render(
        <FormField label="Name" name="name">
          <Input />
        </FormField>
      );

      const helperTexts = container.querySelectorAll('[class*="text-neutral-600"]');
      expect(helperTexts).toHaveLength(0);
    });
  });

  describe('Error Message', () => {
    it('displays error message when provided', () => {
      render(
        <FormField
          label="Email"
          name="email"
          error="Invalid email address"
        >
          <Input />
        </FormField>
      );

      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('applies correct error styles', () => {
      render(
        <FormField
          label="Password"
          name="password"
          error="Password is too short"
        >
          <Input />
        </FormField>
      );

      const errorText = screen.getByText('Password is too short');
      expect(errorText).toHaveClass('text-sm');
      expect(errorText).toHaveClass('text-red-600');
      expect(errorText).toHaveClass('dark:text-red-400');
    });

    it('error takes priority over helper text', () => {
      render(
        <FormField
          label="Email"
          name="email"
          helperText="Helper text"
          error="Error message"
        >
          <Input />
        </FormField>
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('does not render error element when not provided', () => {
      const { container } = render(
        <FormField label="Name" name="name">
          <Input />
        </FormField>
      );

      const errorTexts = container.querySelectorAll('[class*="text-red-600"]');
      expect(errorTexts).toHaveLength(0);
    });
  });

  describe('Children', () => {
    it('renders input component as children', () => {
      render(
        <FormField label="Username" name="username">
          <Input placeholder="Enter username" />
        </FormField>
      );

      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });

    it('works with textarea component', () => {
      render(
        <FormField label="Message" name="message">
          <textarea placeholder="Enter message" />
        </FormField>
      );

      expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument();
    });

    it('works with select component', () => {
      render(
        <FormField label="Country" name="country">
          <select>
            <option>USA</option>
            <option>UK</option>
          </select>
        </FormField>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('works with multiple children', () => {
      render(
        <FormField label="Name" name="name">
          <div>
            <Input placeholder="First name" />
            <Input placeholder="Last name" />
          </div>
        </FormField>
      );

      expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('label has correct text styles for readability', () => {
      render(
        <FormField label="Email" name="email">
          <Input />
        </FormField>
      );

      const label = screen.getByText('Email');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
      expect(label).toHaveClass('block');
    });

    it('associates label with input for screen readers', () => {
      render(
        <FormField label="Username" name="username">
          <Input id="username" aria-label="Username input" />
        </FormField>
      );

      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('error message is accessible to screen readers', () => {
      render(
        <FormField
          label="Email"
          name="email"
          error="Invalid email"
        >
          <Input id="email" aria-describedby="email-error" />
        </FormField>
      );

      const errorMessage = screen.getByText('Invalid email');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.tagName).toBe('P');
    });

    it('helper text is accessible to screen readers', () => {
      render(
        <FormField
          label="Password"
          name="password"
          helperText="At least 8 characters"
        >
          <Input id="password" />
        </FormField>
      );

      const helperText = screen.getByText('At least 8 characters');
      expect(helperText).toBeInTheDocument();
      expect(helperText.tagName).toBe('P');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode label styles', () => {
      render(
        <FormField label="Email" name="email">
          <Input />
        </FormField>
      );

      const label = screen.getByText('Email');
      expect(label).toHaveClass('dark:text-neutral-100');
    });

    it('applies dark mode helper text styles', () => {
      render(
        <FormField
          label="Email"
          name="email"
          helperText="Helper text"
        >
          <Input />
        </FormField>
      );

      const helperText = screen.getByText('Helper text');
      expect(helperText).toHaveClass('dark:text-neutral-400');
    });

    it('applies dark mode error styles', () => {
      render(
        <FormField
          label="Email"
          name="email"
          error="Error message"
        >
          <Input />
        </FormField>
      );

      const errorText = screen.getByText('Error message');
      expect(errorText).toHaveClass('dark:text-red-400');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to container div', () => {
      const ref = { current: null };
      render(
        <FormField ref={ref} label="Name" name="name">
          <Input />
        </FormField>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('ref can access DOM properties', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(
        <FormField ref={ref} label="Name" name="name">
          <Input />
        </FormField>
      );

      expect(ref.current?.tagName).toBe('DIV');
      expect(ref.current?.classList).toBeDefined();
    });
  });

  describe('CVA Variants', () => {
    it('exports formFieldVariants function', () => {
      expect(typeof formFieldVariants).toBe('function');
    });

    it('generates correct classes from variants', () => {
      const classes = formFieldVariants();
      expect(classes).toContain('space-y-2');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <FormField
          label="Name"
          name="name"
          className="custom-field"
          data-testid="form-field"
        >
          <Input />
        </FormField>
      );

      const field = screen.getByTestId('form-field');
      expect(field).toHaveClass('custom-field');
      expect(field).toHaveClass('space-y-2');
    });

    it('allows additional styling via className', () => {
      render(
        <FormField
          label="Name"
          name="name"
          className="mb-4 p-2"
          data-testid="form-field"
        >
          <Input />
        </FormField>
      );

      const field = screen.getByTestId('form-field');
      expect(field).toHaveClass('mb-4');
      expect(field).toHaveClass('p-2');
    });
  });

  describe('Complete Examples', () => {
    it('renders complete form field with all props', () => {
      render(
        <FormField
          label="Email Address"
          name="email"
          required
          helperText="We'll never share your email"
          data-testid="form-field"
        >
          <Input id="email" type="email" placeholder="you@example.com" />
        </FormField>
      );

      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });

    it('renders form field with error state', () => {
      render(
        <FormField
          label="Password"
          name="password"
          required
          error="Password must be at least 8 characters"
        >
          <Input id="password" type="password" />
        </FormField>
      );

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <FormField
          label="Name"
          name="name"
          data-testid="custom-field"
          data-form="user-form"
        >
          <Input />
        </FormField>
      );

      const field = screen.getByTestId('custom-field');
      expect(field).toHaveAttribute('data-form', 'user-form');
    });

    it('supports aria attributes', () => {
      render(
        <FormField
          label="Name"
          name="name"
          aria-label="User name field"
          data-testid="form-field"
        >
          <Input />
        </FormField>
      );

      expect(screen.getByTestId('form-field')).toHaveAttribute('aria-label', 'User name field');
    });

    it('supports standard div attributes', () => {
      render(
        <FormField
          label="Name"
          name="name"
          data-testid="form-field"
          role="group"
        >
          <Input />
        </FormField>
      );

      expect(screen.getByTestId('form-field')).toHaveAttribute('role', 'group');
    });
  });
});
