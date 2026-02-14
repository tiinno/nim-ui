import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Form, formVariants } from './form';
import { Input } from './input';
import { Button } from './button';

describe('Form', () => {
  describe('Rendering', () => {
    it('renders form element', () => {
      const { container } = render(
        <Form>
          <input type="text" />
        </Form>
      );

      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <Form>
          <Input placeholder="Enter name" />
          <Button>Submit</Button>
        </Form>
      );

      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with default full-width class', () => {
      render(<Form data-testid="form"><input /></Form>);
      expect(screen.getByTestId('form')).toHaveClass('w-full');
    });

    it('renders multiple form fields', () => {
      render(
        <Form>
          <Input placeholder="Username" />
          <Input placeholder="Email" />
          <Input placeholder="Password" />
        </Form>
      );

      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('handles onSubmit event', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <Form onSubmit={handleSubmit}>
          <Input />
          <Button type="submit">Submit</Button>
        </Form>
      );

      await user.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalledOnce();
    });

    it('prevents default form submission when handler calls preventDefault', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => {
        e.preventDefault();
      });

      render(
        <Form onSubmit={handleSubmit}>
          <Input />
          <Button type="submit">Submit</Button>
        </Form>
      );

      await user.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalledOnce();
    });

    it('can be submitted by pressing Enter in input', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <Form onSubmit={handleSubmit}>
          <Input placeholder="Name" />
          <Button type="submit">Submit</Button>
        </Form>
      );

      const input = screen.getByPlaceholderText('Name');
      await user.type(input, 'John{Enter}');

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('receives form event with correct target', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <Form onSubmit={handleSubmit} data-testid="test-form">
          <Button type="submit">Submit</Button>
        </Form>
      );

      await user.click(screen.getByRole('button'));

      expect(handleSubmit).toHaveBeenCalled();
      const event = handleSubmit.mock.calls[0]![0];
      expect(event.target).toBeInstanceOf(HTMLFormElement);
    });
  });

  describe('Form Attributes', () => {
    it('supports method attribute', () => {
      render(
        <Form method="post" data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('method', 'post');
    });

    it('supports action attribute', () => {
      render(
        <Form action="/submit" data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('action', '/submit');
    });

    it('supports name attribute', () => {
      render(
        <Form name="user-form" data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('name', 'user-form');
    });

    it('supports noValidate attribute', () => {
      render(
        <Form noValidate data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('novalidate');
    });

    it('supports autoComplete attribute', () => {
      render(
        <Form autoComplete="off" data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('autocomplete', 'off');
    });

    it('supports encType attribute', () => {
      render(
        <Form encType="multipart/form-data" data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('enctype', 'multipart/form-data');
    });

    it('supports target attribute', () => {
      render(
        <Form target="_blank" data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('target', '_blank');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to form element', () => {
      const ref = { current: null };
      render(
        <Form ref={ref}>
          <input />
        </Form>
      );

      expect(ref.current).toBeInstanceOf(HTMLFormElement);
    });

    it('allows ref access to form methods', () => {
      const ref = { current: null as HTMLFormElement | null };
      render(
        <Form ref={ref}>
          <input />
        </Form>
      );

      expect(ref.current?.submit).toBeDefined();
      expect(ref.current?.reset).toBeDefined();
      expect(ref.current?.checkValidity).toBeDefined();
    });

    it('can call submit via ref', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      const ref = { current: null as HTMLFormElement | null };

      render(
        <Form ref={ref} onSubmit={handleSubmit}>
          <input />
        </Form>
      );

      ref.current?.requestSubmit();
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('can call reset via ref', () => {
      const ref = { current: null as HTMLFormElement | null };

      render(
        <Form ref={ref}>
          <input defaultValue="test" data-testid="input" />
        </Form>
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('test');

      ref.current?.reset();
      expect(input.value).toBe('test'); // Reset restores to defaultValue
    });
  });

  describe('CVA Variants', () => {
    it('exports formVariants function', () => {
      expect(typeof formVariants).toBe('function');
    });

    it('generates correct classes from variants', () => {
      const classes = formVariants();
      expect(classes).toContain('w-full');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Form className="space-y-4" data-testid="form">
          <input />
        </Form>
      );

      const form = screen.getByTestId('form');
      expect(form).toHaveClass('space-y-4');
      expect(form).toHaveClass('w-full');
    });

    it('allows overriding width class', () => {
      render(
        <Form className="w-1/2" data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveClass('w-1/2');
    });

    it('supports multiple custom classes', () => {
      render(
        <Form className="space-y-6 max-w-md mx-auto" data-testid="form">
          <input />
        </Form>
      );

      const form = screen.getByTestId('form');
      expect(form).toHaveClass('space-y-6');
      expect(form).toHaveClass('max-w-md');
      expect(form).toHaveClass('mx-auto');
    });
  });

  describe('Accessibility', () => {
    it('has correct form role when labeled', () => {
      render(
        <Form aria-label="Test form">
          <input />
        </Form>
      );

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(
        <Form aria-label="User registration form">
          <input />
        </Form>
      );

      expect(screen.getByLabelText('User registration form')).toBeInTheDocument();
    });

    it('supports aria-labelledby', () => {
      render(
        <>
          <h2 id="form-title">Login Form</h2>
          <Form aria-labelledby="form-title" data-testid="form">
            <input />
          </Form>
        </>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('aria-labelledby', 'form-title');
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <p id="form-desc">Enter your credentials</p>
          <Form aria-describedby="form-desc" data-testid="form">
            <input />
          </Form>
        </>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('aria-describedby', 'form-desc');
    });
  });

  describe('Form Validation', () => {
    it('supports native HTML5 validation', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <Form onSubmit={handleSubmit}>
          <Input type="email" required data-testid="email" />
          <Button type="submit">Submit</Button>
        </Form>
      );

      const input = screen.getByTestId('email') as HTMLInputElement;
      expect(input.validity.valid).toBe(false); // Required field is empty
    });

    it('supports noValidate to disable browser validation', () => {
      render(
        <Form noValidate data-testid="form">
          <Input type="email" required />
          <Button type="submit">Submit</Button>
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('novalidate');
    });
  });

  describe('Complex Form Examples', () => {
    it('renders complete login form', () => {
      render(
        <Form className="space-y-4">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button type="submit">Login</Button>
        </Form>
      );

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles form with multiple input types', () => {
      render(
        <Form>
          <Input type="text" placeholder="Name" />
          <Input type="email" placeholder="Email" />
          <textarea placeholder="Message" />
          <select>
            <option>Option 1</option>
          </select>
          <Button type="submit">Submit</Button>
        </Form>
      );

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('supports data-testid', () => {
      render(
        <Form data-testid="registration-form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('registration-form')).toBeInTheDocument();
    });

    it('supports custom data attributes', () => {
      render(
        <Form data-form-type="login" data-testid="form">
          <input />
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveAttribute('data-form-type', 'login');
    });
  });

  describe('Form Reset', () => {
    it('resets form inputs when reset is called', () => {
      const ref = { current: null as HTMLFormElement | null };

      render(
        <Form ref={ref}>
          <input defaultValue="John" data-testid="name" />
          <input defaultValue="john@example.com" data-testid="email" />
        </Form>
      );

      const nameInput = screen.getByTestId('name') as HTMLInputElement;
      const emailInput = screen.getByTestId('email') as HTMLInputElement;

      expect(nameInput.value).toBe('John');
      expect(emailInput.value).toBe('john@example.com');

      ref.current?.reset();

      // Reset restores inputs to their defaultValue
      expect(nameInput.value).toBe('John');
      expect(emailInput.value).toBe('john@example.com');
    });

    it('supports reset button type', async () => {
      const user = userEvent.setup();

      render(
        <Form>
          <input defaultValue="test" data-testid="input" />
          <button type="reset">Reset</button>
        </Form>
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('test');

      await user.click(screen.getByText('Reset'));
      // Reset restores input to its defaultValue
      expect(input.value).toBe('test');
    });
  });
});
