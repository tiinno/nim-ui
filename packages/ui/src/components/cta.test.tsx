import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { CTA, ctaVariants } from './cta';

describe('CTA', () => {
  describe('Rendering', () => {
    it('renders with title and button', () => {
      render(<CTA title="Get Started" buttonText="Sign Up" />);
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('renders with title, description, and button', () => {
      render(
        <CTA
          title="Ready to get started?"
          description="Join thousands of satisfied customers"
          buttonText="Sign Up Now"
        />
      );
      expect(screen.getByText('Ready to get started?')).toBeInTheDocument();
      expect(screen.getByText('Join thousands of satisfied customers')).toBeInTheDocument();
      expect(screen.getByText('Sign Up Now')).toBeInTheDocument();
    });

    it('applies base CTA styles', () => {
      render(<CTA title="Title" buttonText="Button" data-testid="cta" />);
      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('relative');
      expect(cta).toHaveClass('overflow-hidden');
      expect(cta).toHaveClass('rounded-lg');
      expect(cta).toHaveClass('text-center');
    });

    it('applies default variant (default)', () => {
      render(<CTA title="Title" buttonText="Button" data-testid="cta" />);
      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('bg-neutral-100');
      expect(cta).toHaveClass('dark:bg-neutral-800');
    });
  });

  describe('Title', () => {
    it('renders title text', () => {
      render(<CTA title="Start Your Free Trial" buttonText="Sign Up" />);
      expect(screen.getByText('Start Your Free Trial')).toBeInTheDocument();
    });

    it('applies title styling', () => {
      render(<CTA title="Title" buttonText="Button" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-3xl');
      expect(title).toHaveClass('font-bold');
      expect(title).toHaveClass('tracking-tight');
      expect(title).toHaveClass('sm:text-4xl');
    });

    it('title has default color for default variant', () => {
      render(<CTA title="Title" buttonText="Button" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-neutral-900');
      expect(title).toHaveClass('dark:text-neutral-100');
    });

    it('title has white color for primary variant', () => {
      render(<CTA title="Title" buttonText="Button" variant="primary" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-white');
    });

    it('title has white color for gradient variant', () => {
      render(<CTA title="Title" buttonText="Button" variant="gradient" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-white');
    });
  });

  describe('Description', () => {
    it('does not render description when not provided', () => {
      render(<CTA title="Title" buttonText="Button" />);
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          description="No credit card required"
        />
      );
      expect(screen.getByText('No credit card required')).toBeInTheDocument();
    });

    it('applies description styling', () => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          description="Description"
        />
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-lg');
    });

    it('description has default color for default variant', () => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          description="Description"
        />
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-neutral-600');
    });

    it('description has white color for colored variants', () => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          variant="primary"
          description="Description"
        />
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-white/90');
    });
  });

  describe('Button', () => {
    it('renders button with text', () => {
      render(<CTA title="Title" buttonText="Click Me" />);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('calls onButtonClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <CTA
          title="Title"
          buttonText="Click Me"
          onButtonClick={handleClick}
        />
      );

      await user.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('renders button with href', () => {
      render(
        <CTA
          title="Title"
          buttonText="Sign Up"
          buttonHref="/signup"
        />
      );
      const button = screen.getByText('Sign Up');
      expect(button).toHaveAttribute('href', '/signup');
    });

    it('button has primary styling for default variant', () => {
      render(<CTA title="Title" buttonText="Button" />);
      const button = screen.getByText('Button');
      expect(button).toHaveClass('bg-primary-600');
      expect(button).toHaveClass('text-white');
    });

    it('button has white background for colored variants', () => {
      render(<CTA title="Title" buttonText="Button" variant="primary" />);
      const button = screen.getByText('Button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('text-primary-600');
    });
  });

  describe('Variants', () => {
    it.each([
      ['default', 'bg-neutral-100'],
      ['primary', 'bg-primary-600'],
      ['gradient', 'bg-gradient-to-r'],
    ])('renders %s variant', (variant, expectedClass) => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          variant={variant as any}
          data-testid="cta"
        />
      );
      expect(screen.getByTestId('cta')).toHaveClass(expectedClass);
    });

    it('applies default variant', () => {
      render(<CTA title="Title" buttonText="Button" data-testid="cta" />);
      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('bg-neutral-100');
    });

    it('applies primary variant', () => {
      render(
        <CTA title="Title" buttonText="Button" variant="primary" data-testid="cta" />
      );
      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('bg-primary-600');
      expect(cta).toHaveClass('text-white');
    });

    it('applies gradient variant', () => {
      render(
        <CTA title="Title" buttonText="Button" variant="gradient" data-testid="cta" />
      );
      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('bg-gradient-to-r');
      expect(cta).toHaveClass('from-primary-600');
      expect(cta).toHaveClass('to-primary-800');
      expect(cta).toHaveClass('text-white');
    });
  });

  describe('Secondary Action', () => {
    it('does not render secondary action when not provided', () => {
      render(<CTA title="Title" buttonText="Button" />);
      const button = screen.getByText('Button');
      expect(button.parentElement?.children.length).toBe(1);
    });

    it('renders secondary action when provided', () => {
      render(
        <CTA
          title="Title"
          buttonText="Sign Up"
          secondaryAction={<a href="/learn-more">Learn More</a>}
        />
      );
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('renders custom secondary action', () => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          secondaryAction={<span data-testid="custom">Custom Action</span>}
        />
      );
      expect(screen.getByTestId('custom')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<CTA ref={ref} title="Title" buttonText="Button" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports ctaVariants function', () => {
      expect(typeof ctaVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = ctaVariants();
      expect(classes).toContain('relative');
      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('text-center');
    });

    it('generates correct variant classes', () => {
      const defaultVar = ctaVariants({ variant: 'default' });
      expect(defaultVar).toContain('bg-neutral-100');

      const primary = ctaVariants({ variant: 'primary' });
      expect(primary).toContain('bg-primary-600');

      const gradient = ctaVariants({ variant: 'gradient' });
      expect(gradient).toContain('bg-gradient-to-r');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          className="shadow-xl"
          data-testid="cta"
        />
      );
      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('shadow-xl');
      expect(cta).toHaveClass('rounded-lg');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          data-testid="cta"
          data-section="cta"
        />
      );
      expect(screen.getByTestId('cta')).toHaveAttribute('data-section', 'cta');
    });

    it('supports aria attributes', () => {
      render(
        <CTA
          title="Title"
          buttonText="Button"
          aria-label="Call to action"
          data-testid="cta"
        />
      );
      expect(screen.getByTestId('cta')).toHaveAttribute('aria-label', 'Call to action');
    });

    it('supports id attribute', () => {
      render(<CTA title="Title" buttonText="Button" id="main-cta" />);
      expect(document.getElementById('main-cta')).toBeInTheDocument();
    });
  });

  describe('Complete Examples', () => {
    it('renders basic CTA', () => {
      render(
        <CTA
          title="Ready to get started?"
          description="Join thousands of satisfied customers"
          buttonText="Sign Up Now"
          onButtonClick={() => {}}
        />
      );

      expect(screen.getByText('Ready to get started?')).toBeInTheDocument();
      expect(screen.getByText('Join thousands of satisfied customers')).toBeInTheDocument();
      expect(screen.getByText('Sign Up Now')).toBeInTheDocument();
    });

    it('renders CTA with custom styling', () => {
      render(
        <CTA
          title="Start Your Free Trial"
          description="No credit card required"
          buttonText="Try for Free"
          buttonHref="/signup"
          variant="primary"
          data-testid="cta"
        />
      );

      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('bg-primary-600');
    });

    it('renders CTA with secondary action', () => {
      render(
        <CTA
          title="Boost Your Productivity"
          description="Join our community today"
          buttonText="Get Started"
          onButtonClick={() => {}}
          secondaryAction={<a href="/learn-more">Learn More</a>}
        />
      );

      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode for default variant', () => {
      render(<CTA title="Title" buttonText="Button" data-testid="cta" />);
      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('dark:bg-neutral-800');
    });

    it('applies dark mode for primary variant', () => {
      render(
        <CTA title="Title" buttonText="Button" variant="primary" data-testid="cta" />
      );
      const cta = screen.getByTestId('cta');
      expect(cta).toHaveClass('dark:bg-primary-700');
    });
  });
});
