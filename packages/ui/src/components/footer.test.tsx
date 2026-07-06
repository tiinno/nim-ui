import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Footer, footerVariants } from './footer';

const defaultLinkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
    ],
  },
];

describe('Footer', () => {
  describe('Rendering', () => {
    it('renders as contentinfo landmark', () => {
      render(<Footer brand="Nim UI" />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('renders with brand', () => {
      render(<Footer brand="Nim UI" />);
      expect(screen.getByText('Nim UI')).toBeInTheDocument();
    });

    it('renders custom brand node', () => {
      render(<Footer brand={<span data-testid="logo">Logo</span>} />);
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(
        <Footer brand="Nim UI" description="A modern React component library." />
      );
      expect(
        screen.getByText('A modern React component library.')
      ).toBeInTheDocument();
    });

    it('applies base surface styles', () => {
      render(<Footer brand="Nim UI" data-testid="footer" />);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('w-full');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-neutral-200');
    });
  });

  describe('Variants', () => {
    it('applies default variant', () => {
      render(<Footer brand="Nim UI" data-testid="footer" />);
      expect(screen.getByTestId('footer')).toHaveClass('bg-white');
    });

    it('applies muted variant', () => {
      render(<Footer brand="Nim UI" variant="muted" data-testid="footer" />);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('bg-neutral-50');
      expect(footer).toHaveClass('dark:bg-neutral-900');
    });
  });

  describe('Link Groups', () => {
    it('renders group titles', () => {
      render(<Footer linkGroups={defaultLinkGroups} />);
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('renders group links with hrefs', () => {
      render(<Footer linkGroups={defaultLinkGroups} />);
      expect(screen.getByText('Features')).toHaveAttribute('href', '/features');
      expect(screen.getByText('About')).toHaveAttribute('href', '/about');
    });

    it('group titles use heading elements', () => {
      render(<Footer linkGroups={defaultLinkGroups} />);
      expect(
        screen.getByRole('heading', { name: 'Product' })
      ).toBeInTheDocument();
    });

    it('group links use quiet text with hover', () => {
      render(<Footer linkGroups={defaultLinkGroups} />);
      const link = screen.getByText('Features');
      expect(link).toHaveClass('text-neutral-600');
      expect(link).toHaveClass('hover:text-neutral-950');
    });
  });

  describe('Social Links', () => {
    it('renders social links with accessible labels', () => {
      render(
        <Footer
          brand="Nim UI"
          socialLinks={[
            { label: 'GitHub', href: 'https://github.com/nim-ui' },
            { label: 'Twitter', href: 'https://twitter.com/nim_ui' },
          ]}
        />
      );
      expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
        'href',
        'https://github.com/nim-ui'
      );
      expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument();
    });

    it('renders social link icon when provided', () => {
      render(
        <Footer
          brand="Nim UI"
          socialLinks={[
            {
              label: 'GitHub',
              href: 'https://github.com/nim-ui',
              icon: <svg data-testid="github-icon" />,
            },
          ]}
        />
      );
      expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    });
  });

  describe('Bottom Bar', () => {
    it('renders copyright', () => {
      render(<Footer copyright="© 2026 Nim UI. All rights reserved." />);
      expect(
        screen.getByText('© 2026 Nim UI. All rights reserved.')
      ).toBeInTheDocument();
    });

    it('copyright uses muted text', () => {
      render(<Footer copyright="© 2026 Nim UI" />);
      expect(screen.getByText('© 2026 Nim UI')).toHaveClass(
        'text-neutral-500'
      );
    });

    it('renders legal links', () => {
      render(
        <Footer
          legalLinks={[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ]}
        />
      );
      expect(screen.getByText('Privacy')).toHaveAttribute('href', '/privacy');
      expect(screen.getByText('Terms')).toHaveAttribute('href', '/terms');
    });

    it('separates bottom bar from top section with border', () => {
      render(
        <Footer
          brand="Nim UI"
          linkGroups={defaultLinkGroups}
          copyright="© 2026 Nim UI"
        />
      );
      const copyrightEl = screen.getByText('© 2026 Nim UI');
      expect(copyrightEl.parentElement).toHaveClass('border-t');
      expect(copyrightEl.parentElement).toHaveClass('mt-12');
    });

    it('bottom bar has no divider without a top section', () => {
      render(<Footer copyright="© 2026 Nim UI" />);
      const copyrightEl = screen.getByText('© 2026 Nim UI');
      expect(copyrightEl.parentElement).not.toHaveClass('border-t');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to footer element', () => {
      const ref = { current: null as HTMLElement | null };
      render(<Footer ref={ref} brand="Nim UI" />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('FOOTER');
    });
  });

  describe('CVA Variants', () => {
    it('exports footerVariants function', () => {
      expect(typeof footerVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = footerVariants();
      expect(classes).toContain('w-full');
      expect(classes).toContain('border-t');
    });

    it('generates variant classes', () => {
      expect(footerVariants({ variant: 'default' })).toContain('bg-white');
      expect(footerVariants({ variant: 'muted' })).toContain('bg-neutral-50');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Footer brand="Nim UI" className="shadow-soft" data-testid="footer" />);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('shadow-soft');
      expect(footer).toHaveClass('border-t');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(<Footer brand="Nim UI" data-testid="footer" data-section="footer" />);
      expect(screen.getByTestId('footer')).toHaveAttribute(
        'data-section',
        'footer'
      );
    });

    it('supports aria attributes', () => {
      render(<Footer brand="Nim UI" aria-label="Site footer" data-testid="footer" />);
      expect(screen.getByTestId('footer')).toHaveAttribute(
        'aria-label',
        'Site footer'
      );
    });
  });

  describe('Dark Mode', () => {
    it('applies dark surface classes', () => {
      render(<Footer brand="Nim UI" data-testid="footer" />);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('dark:border-neutral-800');
      expect(footer).toHaveClass('dark:bg-neutral-950');
    });
  });

  describe('Complete Examples', () => {
    it('renders full marketing footer', () => {
      render(
        <Footer
          brand="Nim UI"
          description="A modern React component library."
          linkGroups={defaultLinkGroups}
          socialLinks={[{ label: 'GitHub', href: 'https://github.com/nim-ui' }]}
          legalLinks={[{ label: 'Privacy', href: '/privacy' }]}
          copyright="© 2026 Nim UI"
        />
      );
      expect(screen.getByText('Nim UI')).toBeInTheDocument();
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('© 2026 Nim UI')).toBeInTheDocument();
    });
  });
});
