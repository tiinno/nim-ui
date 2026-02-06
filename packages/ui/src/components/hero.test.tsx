import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Hero, heroVariants } from './hero';

describe('Hero', () => {
  describe('Rendering', () => {
    it('renders with title', () => {
      render(<Hero title="Welcome" />);
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });

    it('renders with title and subtitle', () => {
      render(<Hero title="Welcome" subtitle="Get started today" />);
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Get started today')).toBeInTheDocument();
    });

    it('applies base hero styles', () => {
      render(<Hero title="Title" data-testid="hero" />);
      const hero = screen.getByTestId('hero');
      expect(hero).toHaveClass('relative');
      expect(hero).toHaveClass('flex');
      expect(hero).toHaveClass('flex-col');
      expect(hero).toHaveClass('items-center');
      expect(hero).toHaveClass('justify-center');
      expect(hero).toHaveClass('text-center');
    });

    it('applies gradient background', () => {
      render(<Hero title="Title" data-testid="hero" />);
      const hero = screen.getByTestId('hero');
      expect(hero).toHaveClass('bg-gradient-to-b');
      expect(hero).toHaveClass('from-neutral-50');
      expect(hero).toHaveClass('to-white');
    });
  });

  describe('Title', () => {
    it('renders title text', () => {
      render(<Hero title="Welcome to Our Platform" />);
      expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
    });

    it('applies title styling', () => {
      render(<Hero title="Title" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-4xl');
      expect(title).toHaveClass('font-bold');
      expect(title).toHaveClass('tracking-tight');
    });

    it('title has responsive text sizes', () => {
      render(<Hero title="Title" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('sm:text-5xl');
      expect(title).toHaveClass('md:text-6xl');
    });

    it('title has default color', () => {
      render(<Hero title="Title" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-neutral-900');
      expect(title).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Subtitle', () => {
    it('does not render subtitle when not provided', () => {
      render(<Hero title="Title" />);
      expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<Hero title="Title" subtitle="This is a subtitle" />);
      expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
    });

    it('applies subtitle styling', () => {
      render(<Hero title="Title" subtitle="Subtitle" />);
      const subtitle = screen.getByText('Subtitle');
      expect(subtitle).toHaveClass('text-lg');
      expect(subtitle).toHaveClass('sm:text-xl');
      expect(subtitle).toHaveClass('md:text-2xl');
    });

    it('subtitle has default color', () => {
      render(<Hero title="Title" subtitle="Subtitle" />);
      const subtitle = screen.getByText('Subtitle');
      expect(subtitle).toHaveClass('text-neutral-600');
      expect(subtitle).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('Primary CTA', () => {
    it('does not render primary CTA when not provided', () => {
      render(<Hero title="Title" />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders primary CTA when provided', () => {
      render(
        <Hero
          title="Title"
          primaryCta={{ label: 'Get Started', onClick: () => {} }}
        />
      );
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('calls onClick when primary CTA is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Hero
          title="Title"
          primaryCta={{ label: 'Click Me', onClick: handleClick }}
        />
      );

      await user.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('renders primary CTA with href', () => {
      render(
        <Hero
          title="Title"
          primaryCta={{ label: 'Get Started', href: '/signup' }}
        />
      );
      const link = screen.getByText('Get Started');
      expect(link).toHaveAttribute('href', '/signup');
    });

    it('applies primary CTA styling', () => {
      render(
        <Hero
          title="Title"
          primaryCta={{ label: 'Get Started', onClick: () => {} }}
        />
      );
      const cta = screen.getByText('Get Started');
      expect(cta).toHaveClass('bg-primary-600');
      expect(cta).toHaveClass('text-white');
      expect(cta).toHaveClass('hover:bg-primary-700');
    });
  });

  describe('Secondary CTA', () => {
    it('does not render secondary CTA when not provided', () => {
      render(
        <Hero
          title="Title"
          primaryCta={{ label: 'Primary', onClick: () => {} }}
        />
      );
      expect(screen.queryByText(/Secondary/)).not.toBeInTheDocument();
    });

    it('renders secondary CTA when provided', () => {
      render(
        <Hero
          title="Title"
          secondaryCta={{ label: 'Learn More', onClick: () => {} }}
        />
      );
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('calls onClick when secondary CTA is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Hero
          title="Title"
          secondaryCta={{ label: 'Learn More', onClick: handleClick }}
        />
      );

      await user.click(screen.getByText('Learn More'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('renders secondary CTA with href', () => {
      render(
        <Hero
          title="Title"
          secondaryCta={{ label: 'Learn More', href: '/about' }}
        />
      );
      const link = screen.getByText('Learn More');
      expect(link).toHaveAttribute('href', '/about');
    });

    it('applies secondary CTA styling', () => {
      render(
        <Hero
          title="Title"
          secondaryCta={{ label: 'Learn More', onClick: () => {} }}
        />
      );
      const cta = screen.getByText('Learn More');
      expect(cta).toHaveClass('border-2');
      expect(cta).toHaveClass('border-neutral-300');
    });
  });

  describe('Background Image', () => {
    it('applies background image styles', () => {
      render(<Hero title="Title" backgroundImage="/hero-bg.jpg" data-testid="hero" />);
      const hero = screen.getByTestId('hero');
      expect(hero).toHaveStyle({
        backgroundImage: expect.stringContaining('url(/hero-bg.jpg)'),
      });
    });

    it('title has white color with background image', () => {
      render(<Hero title="Title" backgroundImage="/bg.jpg" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-white');
    });

    it('subtitle has white color with background image', () => {
      render(<Hero title="Title" subtitle="Subtitle" backgroundImage="/bg.jpg" />);
      const subtitle = screen.getByText('Subtitle');
      expect(subtitle).toHaveClass('text-neutral-100');
    });

    it('secondary CTA has white border with background image', () => {
      render(
        <Hero
          title="Title"
          backgroundImage="/bg.jpg"
          secondaryCta={{ label: 'Learn More', onClick: () => {} }}
        />
      );
      const cta = screen.getByText('Learn More');
      expect(cta).toHaveClass('border-white');
      expect(cta).toHaveClass('text-white');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode gradient', () => {
      render(<Hero title="Title" data-testid="hero" />);
      const hero = screen.getByTestId('hero');
      expect(hero).toHaveClass('dark:from-neutral-900');
      expect(hero).toHaveClass('dark:to-neutral-800');
    });

    it('applies dark mode to primary CTA', () => {
      render(
        <Hero
          title="Title"
          primaryCta={{ label: 'Get Started', onClick: () => {} }}
        />
      );
      const cta = screen.getByText('Get Started');
      expect(cta).toHaveClass('dark:bg-primary-700');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Hero ref={ref} title="Title" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports heroVariants function', () => {
      expect(typeof heroVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = heroVariants();
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('bg-gradient-to-b');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Hero title="Title" className="min-h-screen" data-testid="hero" />
      );
      const hero = screen.getByTestId('hero');
      expect(hero).toHaveClass('min-h-screen');
      expect(hero).toHaveClass('flex');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <Hero title="Title" data-testid="hero" data-section="hero" />
      );
      expect(screen.getByTestId('hero')).toHaveAttribute('data-section', 'hero');
    });

    it('supports aria attributes', () => {
      render(
        <Hero title="Title" aria-label="Hero section" data-testid="hero" />
      );
      expect(screen.getByTestId('hero')).toHaveAttribute('aria-label', 'Hero section');
    });

    it('supports id attribute', () => {
      render(<Hero title="Title" id="main-hero" />);
      expect(document.getElementById('main-hero')).toBeInTheDocument();
    });
  });

  describe('Complete Examples', () => {
    it('renders full hero with all props', () => {
      render(
        <Hero
          title="Transform Your Business"
          subtitle="Get started today with our innovative solutions"
          primaryCta={{ label: 'Get Started', href: '/signup' }}
          secondaryCta={{ label: 'Learn More', href: '/about' }}
        />
      );

      expect(screen.getByText('Transform Your Business')).toBeInTheDocument();
      expect(screen.getByText('Get started today with our innovative solutions')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('renders minimal hero with only title', () => {
      render(<Hero title="Welcome" />);
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });

    it('renders hero with background image', () => {
      render(
        <Hero
          title="Beautiful Design"
          subtitle="Experience the future"
          backgroundImage="/hero-bg.jpg"
          primaryCta={{ label: 'Try Now', onClick: () => {} }}
          data-testid="hero"
        />
      );

      const hero = screen.getByTestId('hero');
      expect(hero).toHaveStyle({
        backgroundImage: expect.stringContaining('url(/hero-bg.jpg)'),
      });
    });
  });

  describe('CTA Button Layout', () => {
    it('renders both CTAs in flex container', () => {
      render(
        <Hero
          title="Title"
          primaryCta={{ label: 'Primary', onClick: () => {} }}
          secondaryCta={{ label: 'Secondary', onClick: () => {} }}
        />
      );

      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });
  });
});
