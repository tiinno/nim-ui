import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Card, CardHeader, CardContent, CardFooter, cardVariants } from './card';

describe('Card', () => {
  describe('Card - Rendering', () => {
    it('renders card element', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<Card>Card content here</Card>);
      expect(screen.getByText('Card content here')).toBeInTheDocument();
    });

    it('applies default card styles', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('shadow-sm');
    });

    it('applies dark mode styles', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('dark:bg-neutral-900');
      expect(card).toHaveClass('dark:border-neutral-700');
    });
  });

  describe('CardHeader - Rendering', () => {
    it('renders header element', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders header content', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Card Title</h3>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('applies header styles', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('space-y-1.5');
      expect(header).toHaveClass('p-6');
    });

    it('supports complex header content', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Title</h3>
            <p>Subtitle</p>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
  });

  describe('CardContent - Rendering', () => {
    it('renders content element', () => {
      render(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders content text', () => {
      render(
        <Card>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      );
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    });

    it('applies content styles', () => {
      render(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
    });

    it('supports complex content', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
            </div>
          </CardContent>
        </Card>
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });

  describe('CardFooter - Rendering', () => {
    it('renders footer element', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders footer content', () => {
      render(
        <Card>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies footer styles', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0');
    });

    it('supports multiple actions in footer', () => {
      render(
        <Card>
          <CardFooter>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Composition', () => {
    it('renders complete card with all sections', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Title</h3>
          </CardHeader>
          <CardContent>
            <p>Content</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders card with only content', () => {
      render(
        <Card>
          <CardContent>Just content</CardContent>
        </Card>
      );

      expect(screen.getByText('Just content')).toBeInTheDocument();
    });

    it('renders card with header and content', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders card with content and footer', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('maintains proper spacing between sections', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">Header</CardHeader>
          <CardContent data-testid="content">Content</CardContent>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );

      const header = screen.getByTestId('header');
      const content = screen.getByTestId('content');
      const footer = screen.getByTestId('footer');

      expect(header).toHaveClass('p-6');
      expect(content).toHaveClass('p-6', 'pt-0');
      expect(footer).toHaveClass('p-6', 'pt-0');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to Card element', () => {
      const ref = { current: null };
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref to CardHeader element', () => {
      const ref = { current: null };
      render(
        <Card>
          <CardHeader ref={ref}>Header</CardHeader>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref to CardContent element', () => {
      const ref = { current: null };
      render(
        <Card>
          <CardContent ref={ref}>Content</CardContent>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref to CardFooter element', () => {
      const ref = { current: null };
      render(
        <Card>
          <CardFooter ref={ref}>Footer</CardFooter>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports cardVariants function', () => {
      expect(typeof cardVariants).toBe('function');
    });

    it('generates correct classes from variants', () => {
      const classes = cardVariants();
      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('border');
      expect(classes).toContain('bg-white');
      expect(classes).toContain('shadow-sm');
    });
  });

  describe('Custom className', () => {
    it('merges custom className on Card', () => {
      render(<Card className="max-w-md" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('max-w-md');
      expect(card).toHaveClass('rounded-lg');
    });

    it('merges custom className on CardHeader', () => {
      render(
        <Card>
          <CardHeader className="border-b" data-testid="header">
            Header
          </CardHeader>
        </Card>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('p-6');
    });

    it('merges custom className on CardContent', () => {
      render(
        <Card>
          <CardContent className="text-center" data-testid="content">
            Content
          </CardContent>
        </Card>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('text-center');
      expect(content).toHaveClass('p-6');
    });

    it('merges custom className on CardFooter', () => {
      render(
        <Card>
          <CardFooter className="justify-end" data-testid="footer">
            Footer
          </CardFooter>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('justify-end');
      expect(footer).toHaveClass('flex');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes on Card', () => {
      render(
        <Card data-testid="card" data-card-type="info">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('data-card-type', 'info');
    });

    it('supports aria attributes on Card', () => {
      render(
        <Card aria-label="Information card" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('aria-label', 'Information card');
    });

    it('supports id attribute', () => {
      render(<Card id="main-card">Content</Card>);
      expect(document.getElementById('main-card')).toBeInTheDocument();
    });

    it('supports role attribute', () => {
      render(
        <Card role="article" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('role', 'article');
    });
  });

  describe('Complex Examples', () => {
    it('renders product card example', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Product Name</h3>
            <p>$99.99</p>
          </CardHeader>
          <CardContent>
            <p>Product description goes here</p>
          </CardContent>
          <CardFooter>
            <button>Add to Cart</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Product Name')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('Product description goes here')).toBeInTheDocument();
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('renders profile card example', () => {
      render(
        <Card>
          <CardHeader>
            <h3>John Doe</h3>
            <p>Software Engineer</p>
          </CardHeader>
          <CardContent>
            <p>Email: john@example.com</p>
            <p>Location: San Francisco, CA</p>
          </CardContent>
          <CardFooter>
            <button>View Profile</button>
            <button>Message</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('renders notification card example', () => {
      render(
        <Card>
          <CardContent>
            <p>Your order has been shipped!</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Your order has been shipped!')).toBeInTheDocument();
    });
  });

  describe('Nested Content', () => {
    it('supports nested elements in header', () => {
      render(
        <Card>
          <CardHeader>
            <div>
              <h3>Title</h3>
              <span>Badge</span>
            </div>
            <p>Subtitle</p>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Badge')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('supports nested elements in content', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <p>First paragraph</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('supports images in content', () => {
      render(
        <Card>
          <CardContent>
            <img src="/test.jpg" alt="Test" />
          </CardContent>
        </Card>
      );

      expect(screen.getByAltText('Test')).toBeInTheDocument();
    });
  });
});
