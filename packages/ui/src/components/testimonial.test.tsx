import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Testimonial, testimonialVariants } from './testimonial';

describe('Testimonial', () => {
  describe('Rendering', () => {
    it('renders with quote and author', () => {
      render(<Testimonial quote="This product changed my life!" author="John Doe" />);
      expect(screen.getByText('This product changed my life!')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('applies base testimonial styles', () => {
      render(
        <Testimonial
          quote="Great product"
          author="John"
          data-testid="testimonial"
        />
      );
      const testimonial = screen.getByTestId('testimonial');
      expect(testimonial).toHaveClass('rounded-lg');
      expect(testimonial).toHaveClass('border');
      expect(testimonial).toHaveClass('bg-white');
      expect(testimonial).toHaveClass('p-6');
      expect(testimonial).toHaveClass('shadow-sm');
    });

    it('renders quote icon', () => {
      const { container } = render(
        <Testimonial quote="Quote" author="Author" />
      );
      const quoteIcon = container.querySelector('svg[aria-hidden="true"]');
      expect(quoteIcon).toBeInTheDocument();
    });
  });

  describe('Quote', () => {
    it('renders quote text', () => {
      render(
        <Testimonial
          quote="Excellent service and support. Highly recommended!"
          author="Jane Smith"
        />
      );
      expect(screen.getByText('Excellent service and support. Highly recommended!')).toBeInTheDocument();
    });

    it('applies quote styling', () => {
      render(<Testimonial quote="Quote text" author="Author" />);
      const quote = screen.getByText('Quote text');
      expect(quote).toHaveClass('text-lg');
      expect(quote).toHaveClass('text-neutral-900');
    });

    it('quote has dark mode styles', () => {
      render(<Testimonial quote="Quote text" author="Author" />);
      const quote = screen.getByText('Quote text');
      expect(quote).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Author', () => {
    it('renders author name', () => {
      render(<Testimonial quote="Quote" author="Mike Johnson" />);
      expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
    });

    it('applies author styling', () => {
      render(<Testimonial quote="Quote" author="Author Name" />);
      const author = screen.getByText('Author Name');
      expect(author).toHaveClass('font-semibold');
      expect(author).toHaveClass('text-neutral-900');
    });

    it('author has dark mode styles', () => {
      render(<Testimonial quote="Quote" author="Author Name" />);
      const author = screen.getByText('Author Name');
      expect(author).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Optional Role', () => {
    it('does not render role when not provided', () => {
      render(<Testimonial quote="Quote" author="John Doe" />);
      expect(screen.queryByText(/CEO|Manager|Director/)).not.toBeInTheDocument();
    });

    it('renders role when provided', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Mike Johnson"
          role="CEO"
        />
      );
      expect(screen.getByText(/CEO/)).toBeInTheDocument();
    });

    it('applies role styling', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          role="CEO"
        />
      );
      const roleElement = screen.getByText(/CEO/);
      expect(roleElement).toHaveClass('text-sm');
      expect(roleElement).toHaveClass('text-neutral-600');
    });
  });

  describe('Optional Company', () => {
    it('does not render company when not provided', () => {
      render(<Testimonial quote="Quote" author="John Doe" />);
      expect(screen.queryByText(/Corp|Inc|Ltd/)).not.toBeInTheDocument();
    });

    it('renders company when provided', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          company="Acme Corp"
        />
      );
      expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    });

    it('renders role and company together', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          role="CEO"
          company="TechStart Inc"
        />
      );
      const metadata = screen.getByText(/CEO.*TechStart Inc/);
      expect(metadata).toBeInTheDocument();
    });

    it('separates role and company with comma', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          role="CEO"
          company="Company"
        />
      );
      expect(screen.getByText(/CEO, Company/)).toBeInTheDocument();
    });
  });

  describe('Optional Avatar', () => {
    it('does not render avatar when not provided', () => {
      render(<Testimonial quote="Quote" author="John Doe" />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders avatar when provided', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Jane Smith"
          avatar="/avatar.jpg"
        />
      );
      const avatar = screen.getByAltText('Jane Smith');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', '/avatar.jpg');
    });

    it('avatar has correct styling', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          avatar="/avatar.jpg"
        />
      );
      const avatar = screen.getByAltText('Author');
      expect(avatar).toHaveClass('h-full');
      expect(avatar).toHaveClass('w-full');
      expect(avatar).toHaveClass('object-cover');
    });

    it('avatar container has correct styling', () => {
      const { container } = render(
        <Testimonial
          quote="Quote"
          author="Author"
          avatar="/avatar.jpg"
        />
      );
      const avatarContainer = container.querySelector('[class*="h-12 w-12"]');
      expect(avatarContainer).toHaveClass('h-12');
      expect(avatarContainer).toHaveClass('w-12');
      expect(avatarContainer).toHaveClass('rounded-full');
      expect(avatarContainer).toHaveClass('overflow-hidden');
    });
  });

  describe('Quote Icon', () => {
    it('renders quote icon with correct color', () => {
      const { container } = render(
        <Testimonial quote="Quote" author="Author" />
      );
      const iconContainer = container.querySelector('[class*="text-primary-600"]');
      expect(iconContainer).toHaveClass('text-primary-600');
      expect(iconContainer).toHaveClass('dark:text-primary-400');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode card styles', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          data-testid="testimonial"
        />
      );
      const testimonial = screen.getByTestId('testimonial');
      expect(testimonial).toHaveClass('dark:bg-neutral-900');
      expect(testimonial).toHaveClass('dark:border-neutral-700');
    });

    it('applies dark mode to role/company', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          role="CEO"
        />
      );
      const role = screen.getByText(/CEO/);
      expect(role).toHaveClass('dark:text-neutral-400');
    });

    it('avatar container has dark mode background', () => {
      const { container } = render(
        <Testimonial
          quote="Quote"
          author="Author"
          avatar="/avatar.jpg"
        />
      );
      const avatarContainer = container.querySelector('[class*="h-12 w-12"]');
      expect(avatarContainer).toHaveClass('dark:bg-neutral-700');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Testimonial ref={ref} quote="Quote" author="Author" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports testimonialVariants function', () => {
      expect(typeof testimonialVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = testimonialVariants();
      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('border');
      expect(classes).toContain('bg-white');
      expect(classes).toContain('shadow-sm');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          className="max-w-md"
          data-testid="testimonial"
        />
      );
      const testimonial = screen.getByTestId('testimonial');
      expect(testimonial).toHaveClass('max-w-md');
      expect(testimonial).toHaveClass('rounded-lg');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          data-testid="testimonial"
          data-customer="vip"
        />
      );
      expect(screen.getByTestId('testimonial')).toHaveAttribute('data-customer', 'vip');
    });

    it('supports aria attributes', () => {
      render(
        <Testimonial
          quote="Quote"
          author="Author"
          aria-label="Customer testimonial"
          data-testid="testimonial"
        />
      );
      expect(screen.getByTestId('testimonial')).toHaveAttribute(
        'aria-label',
        'Customer testimonial'
      );
    });

    it('supports id attribute', () => {
      render(<Testimonial quote="Quote" author="Author" id="testimonial-1" />);
      expect(document.getElementById('testimonial-1')).toBeInTheDocument();
    });
  });

  describe('Complete Examples', () => {
    it('renders basic testimonial', () => {
      render(
        <Testimonial
          quote="This product changed my life!"
          author="John Doe"
        />
      );

      expect(screen.getByText('This product changed my life!')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders testimonial with avatar and company', () => {
      render(
        <Testimonial
          quote="Excellent service and support. Highly recommended!"
          author="Jane Smith"
          company="Acme Corp"
          avatar="/avatar.jpg"
        />
      );

      expect(screen.getByText('Excellent service and support. Highly recommended!')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
      expect(screen.getByAltText('Jane Smith')).toBeInTheDocument();
    });

    it('renders testimonial with role', () => {
      render(
        <Testimonial
          quote="The best tool we've ever used for our team."
          author="Mike Johnson"
          role="CEO"
          company="TechStart Inc"
          avatar="/mike.jpg"
        />
      );

      expect(screen.getByText("The best tool we've ever used for our team.")).toBeInTheDocument();
      expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
      expect(screen.getByText(/CEO.*TechStart Inc/)).toBeInTheDocument();
      expect(screen.getByAltText('Mike Johnson')).toBeInTheDocument();
    });

    it('renders minimal testimonial', () => {
      render(
        <Testimonial
          quote="Great!"
          author="User"
        />
      );

      expect(screen.getByText('Great!')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('quote icon is at the start', () => {
      const { container } = render(
        <Testimonial quote="Quote" author="Author" />
      );
      const iconContainer = container.querySelector('[class*="flex items-start"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('author section has correct spacing', () => {
      const { container } = render(
        <Testimonial quote="Quote" author="Author" avatar="/avatar.jpg" />
      );
      const authorSection = container.querySelector('[class*="flex items-center gap-4"]');
      expect(authorSection).toHaveClass('gap-4');
    });
  });
});
