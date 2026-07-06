import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Navbar, navbarVariants } from './navbar';

const defaultLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
];

describe('Navbar', () => {
  describe('Rendering', () => {
    it('renders with brand', () => {
      render(<Navbar brand="Nim UI" />);
      expect(screen.getByText('Nim UI')).toBeInTheDocument();
    });

    it('brand links to brandHref', () => {
      render(<Navbar brand="Nim UI" brandHref="/home" />);
      expect(screen.getByText('Nim UI').closest('a')).toHaveAttribute(
        'href',
        '/home'
      );
    });

    it('brand defaults to root href', () => {
      render(<Navbar brand="Nim UI" />);
      expect(screen.getByText('Nim UI').closest('a')).toHaveAttribute(
        'href',
        '/'
      );
    });

    it('renders custom brand node', () => {
      render(<Navbar brand={<span data-testid="logo">Logo</span>} />);
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('applies base surface styles', () => {
      render(<Navbar brand="Nim UI" data-testid="navbar" />);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveClass('w-full');
      expect(navbar).toHaveClass('border-b');
      expect(navbar).toHaveClass('border-neutral-200');
      expect(navbar).toHaveClass('bg-white');
    });

    it('renders a nav landmark labelled Main', () => {
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    });
  });

  describe('Sticky', () => {
    it('is not sticky by default', () => {
      render(<Navbar brand="Nim UI" data-testid="navbar" />);
      expect(screen.getByTestId('navbar')).not.toHaveClass('sticky');
    });

    it('applies sticky positioning when sticky', () => {
      render(<Navbar sticky brand="Nim UI" data-testid="navbar" />);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveClass('sticky');
      expect(navbar).toHaveClass('top-0');
      expect(navbar).toHaveClass('z-40');
    });
  });

  describe('Links', () => {
    it('renders all links with hrefs', () => {
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      expect(screen.getByText('Features')).toHaveAttribute('href', '/features');
      expect(screen.getByText('Pricing')).toHaveAttribute('href', '/pricing');
      expect(screen.getByText('Docs')).toHaveAttribute('href', '/docs');
    });

    it('marks active link with aria-current', () => {
      render(
        <Navbar
          brand="Nim UI"
          links={[
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing', active: true },
          ]}
        />
      );
      expect(screen.getByText('Pricing')).toHaveAttribute(
        'aria-current',
        'page'
      );
      expect(screen.getByText('Features')).not.toHaveAttribute('aria-current');
    });

    it('active link uses emphasized ink text', () => {
      render(
        <Navbar
          brand="Nim UI"
          links={[{ label: 'Pricing', href: '/pricing', active: true }]}
        />
      );
      const link = screen.getByText('Pricing');
      expect(link).toHaveClass('text-neutral-950');
      expect(link).toHaveClass('dark:text-neutral-50');
    });

    it('inactive link uses quiet text with hover', () => {
      render(
        <Navbar
          brand="Nim UI"
          links={[{ label: 'Features', href: '/features' }]}
        />
      );
      const link = screen.getByText('Features');
      expect(link).toHaveClass('text-neutral-600');
      expect(link).toHaveClass('hover:text-neutral-950');
    });

    it('desktop link container is hidden on mobile', () => {
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      const container = screen.getByText('Features').parentElement;
      expect(container).toHaveClass('hidden');
      expect(container).toHaveClass('md:flex');
    });

    it('does not render link container without links', () => {
      render(<Navbar brand="Nim UI" data-testid="navbar" />);
      expect(
        screen.queryByRole('button', { name: 'Toggle navigation menu' })
      ).not.toBeInTheDocument();
    });
  });

  describe('CTA', () => {
    it('renders CTA as link when href provided', () => {
      render(
        <Navbar brand="Nim UI" cta={{ label: 'Get Started', href: '/signup' }} />
      );
      expect(screen.getByText('Get Started')).toHaveAttribute(
        'href',
        '/signup'
      );
    });

    it('renders CTA as button and calls onClick', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Navbar brand="Nim UI" cta={{ label: 'Sign Up', onClick: handleClick }} />
      );
      await user.click(screen.getByText('Sign Up'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('CTA uses ink primary styling', () => {
      render(<Navbar brand="Nim UI" cta={{ label: 'Get Started' }} />);
      const cta = screen.getByText('Get Started');
      expect(cta).toHaveClass('bg-neutral-950');
      expect(cta).toHaveClass('text-white');
      expect(cta).toHaveClass('hover:bg-neutral-800');
      expect(cta).toHaveClass('dark:bg-neutral-100');
      expect(cta).toHaveClass('dark:text-neutral-950');
    });
  });

  describe('Actions', () => {
    it('renders custom actions slot', () => {
      render(
        <Navbar
          brand="Nim UI"
          actions={<button data-testid="theme-toggle">Theme</button>}
        />
      );
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('renders toggle button when links exist', () => {
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      const toggle = screen.getByRole('button', {
        name: 'Toggle navigation menu',
      });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveClass('md:hidden');
    });

    it('menu is closed by default', () => {
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      const toggle = screen.getByRole('button', {
        name: 'Toggle navigation menu',
      });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getAllByText('Features')).toHaveLength(1);
    });

    it('opens menu on toggle click', async () => {
      const user = userEvent.setup();
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      const toggle = screen.getByRole('button', {
        name: 'Toggle navigation menu',
      });
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getAllByText('Features')).toHaveLength(2);
    });

    it('closes menu on second toggle click', async () => {
      const user = userEvent.setup();
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      const toggle = screen.getByRole('button', {
        name: 'Toggle navigation menu',
      });
      await user.click(toggle);
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getAllByText('Features')).toHaveLength(1);
    });

    it('toggle button controls the menu element', async () => {
      const user = userEvent.setup();
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      const toggle = screen.getByRole('button', {
        name: 'Toggle navigation menu',
      });
      await user.click(toggle);
      const controlsId = toggle.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      expect(document.getElementById(controlsId!)).toBeInTheDocument();
    });

    it('closes menu when a mobile link is clicked', async () => {
      const user = userEvent.setup();
      render(<Navbar brand="Nim UI" links={defaultLinks} />);
      const toggle = screen.getByRole('button', {
        name: 'Toggle navigation menu',
      });
      await user.click(toggle);
      const mobileLink = screen.getAllByText('Features')[1]!;
      await user.click(mobileLink);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders CTA inside open mobile menu', async () => {
      const user = userEvent.setup();
      render(
        <Navbar
          brand="Nim UI"
          links={defaultLinks}
          cta={{ label: 'Get Started', href: '/signup' }}
        />
      );
      await user.click(
        screen.getByRole('button', { name: 'Toggle navigation menu' })
      );
      expect(screen.getAllByText('Get Started')).toHaveLength(2);
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to header element', () => {
      const ref = { current: null as HTMLElement | null };
      render(<Navbar ref={ref} brand="Nim UI" />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('HEADER');
    });
  });

  describe('CVA Variants', () => {
    it('exports navbarVariants function', () => {
      expect(typeof navbarVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = navbarVariants();
      expect(classes).toContain('w-full');
      expect(classes).toContain('border-b');
      expect(classes).toContain('bg-white');
    });

    it('generates sticky classes', () => {
      const classes = navbarVariants({ sticky: true });
      expect(classes).toContain('sticky');
      expect(classes).toContain('top-0');
      expect(classes).toContain('z-40');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Navbar brand="Nim UI" className="shadow-soft" data-testid="navbar" />);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveClass('shadow-soft');
      expect(navbar).toHaveClass('border-b');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(<Navbar brand="Nim UI" data-testid="navbar" data-section="nav" />);
      expect(screen.getByTestId('navbar')).toHaveAttribute(
        'data-section',
        'nav'
      );
    });

    it('supports id attribute', () => {
      render(<Navbar brand="Nim UI" id="site-navbar" />);
      expect(document.getElementById('site-navbar')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark surface classes', () => {
      render(<Navbar brand="Nim UI" data-testid="navbar" />);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveClass('dark:border-neutral-800');
      expect(navbar).toHaveClass('dark:bg-neutral-950');
    });
  });

  describe('Complete Examples', () => {
    it('renders full marketing navbar', () => {
      render(
        <Navbar
          sticky
          brand="Nim UI"
          links={defaultLinks}
          actions={<span data-testid="actions-slot" />}
          cta={{ label: 'Get Started', href: '/signup' }}
          data-testid="navbar"
        />
      );
      expect(screen.getByText('Nim UI')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByTestId('actions-slot')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByTestId('navbar')).toHaveClass('sticky');
    });
  });
});
