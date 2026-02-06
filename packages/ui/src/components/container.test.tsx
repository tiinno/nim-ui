import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Container, containerVariants } from './container';

describe('Container', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Container>Test Content</Container>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies base container styles', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('mx-auto');
      expect(container).toHaveClass('w-full');
    });

    it('applies default max-width (xl)', () => {
      render(<Container data-testid="container">Content</Container>);
      expect(screen.getByTestId('container')).toHaveClass('max-w-screen-xl');
    });

    it('applies default padding', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('px-4');
      expect(container).toHaveClass('sm:px-6');
      expect(container).toHaveClass('lg:px-8');
    });
  });

  describe('Max-Width Variants', () => {
    it.each([
      ['sm', 'max-w-screen-sm'],
      ['md', 'max-w-screen-md'],
      ['lg', 'max-w-screen-lg'],
      ['xl', 'max-w-screen-xl'],
      ['2xl', 'max-w-screen-2xl'],
      ['full', 'max-w-full'],
    ])('renders %s max-width variant', (maxWidth, expectedClass) => {
      render(
        <Container maxWidth={maxWidth as any} data-testid="container">
          Content
        </Container>
      );
      expect(screen.getByTestId('container')).toHaveClass(expectedClass);
    });

    it('applies small max-width', () => {
      render(<Container maxWidth="sm" data-testid="container">Content</Container>);
      expect(screen.getByTestId('container')).toHaveClass('max-w-screen-sm');
    });

    it('applies medium max-width', () => {
      render(<Container maxWidth="md" data-testid="container">Content</Container>);
      expect(screen.getByTestId('container')).toHaveClass('max-w-screen-md');
    });

    it('applies large max-width', () => {
      render(<Container maxWidth="lg" data-testid="container">Content</Container>);
      expect(screen.getByTestId('container')).toHaveClass('max-w-screen-lg');
    });

    it('applies 2xl max-width', () => {
      render(<Container maxWidth="2xl" data-testid="container">Content</Container>);
      expect(screen.getByTestId('container')).toHaveClass('max-w-screen-2xl');
    });

    it('applies full max-width', () => {
      render(<Container maxWidth="full" data-testid="container">Content</Container>);
      expect(screen.getByTestId('container')).toHaveClass('max-w-full');
    });
  });

  describe('Padding Variant', () => {
    it('applies padding by default', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('px-4');
    });

    it('applies padding when explicitly true', () => {
      render(<Container padding={true} data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('px-4');
      expect(container).toHaveClass('sm:px-6');
      expect(container).toHaveClass('lg:px-8');
    });

    it('removes padding when false', () => {
      render(<Container padding={false} data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).not.toHaveClass('px-4');
      expect(container).not.toHaveClass('sm:px-6');
      expect(container).not.toHaveClass('lg:px-8');
    });
  });

  describe('Responsive Padding', () => {
    it('has responsive padding classes', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('px-4');
      expect(container).toHaveClass('sm:px-6');
      expect(container).toHaveClass('lg:px-8');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Container ref={ref}>Content</Container>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports containerVariants function', () => {
      expect(typeof containerVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = containerVariants();
      expect(classes).toContain('mx-auto');
      expect(classes).toContain('w-full');
    });

    it('generates correct max-width classes', () => {
      const smClasses = containerVariants({ maxWidth: 'sm' });
      expect(smClasses).toContain('max-w-screen-sm');

      const lgClasses = containerVariants({ maxWidth: 'lg' });
      expect(lgClasses).toContain('max-w-screen-lg');
    });

    it('generates correct padding classes', () => {
      const withPadding = containerVariants({ padding: true });
      expect(withPadding).toContain('px-4');

      const withoutPadding = containerVariants({ padding: false });
      expect(withoutPadding).not.toContain('px-4');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Container className="bg-gray-100" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('bg-gray-100');
      expect(container).toHaveClass('mx-auto');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <Container data-testid="container" data-section="main">
          Content
        </Container>
      );
      expect(screen.getByTestId('container')).toHaveAttribute('data-section', 'main');
    });

    it('supports aria attributes', () => {
      render(
        <Container aria-label="Main content" data-testid="container">
          Content
        </Container>
      );
      expect(screen.getByTestId('container')).toHaveAttribute('aria-label', 'Main content');
    });

    it('supports id attribute', () => {
      render(<Container id="main-container">Content</Container>);
      expect(document.getElementById('main-container')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('renders default page container', () => {
      render(
        <Container>
          <h1>Page Title</h1>
          <p>Page content</p>
        </Container>
      );
      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page content')).toBeInTheDocument();
    });

    it('renders narrow content container', () => {
      render(
        <Container maxWidth="sm" data-testid="container">
          <article>Article content</article>
        </Container>
      );
      expect(screen.getByTestId('container')).toHaveClass('max-w-screen-sm');
    });

    it('renders full-width container without padding', () => {
      render(
        <Container maxWidth="full" padding={false} data-testid="container">
          <div>Full width content</div>
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('max-w-full');
      expect(container).not.toHaveClass('px-4');
    });
  });

  describe('Nested Content', () => {
    it('supports complex nested content', () => {
      render(
        <Container>
          <header>
            <h1>Title</h1>
          </header>
          <main>
            <p>Content</p>
          </main>
          <footer>
            <p>Footer</p>
          </footer>
        </Container>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
