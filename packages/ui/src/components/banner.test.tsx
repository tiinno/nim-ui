import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, userEvent } from '../test/test-utils';
import { Banner, bannerVariants } from './banner';

describe('Banner', () => {
  describe('Rendering', () => {
    it('renders the title and supporting copy', () => {
      render(
        <Banner title="Scheduled maintenance">Order sync pauses Sunday 02:00 UTC.</Banner>
      );
      expect(screen.getByText('Scheduled maintenance')).toBeInTheDocument();
      expect(screen.getByText('Order sync pauses Sunday 02:00 UTC.')).toBeInTheDocument();
    });

    it('renders the title in medium weight', () => {
      render(<Banner title="Read-only mode" />);
      expect(screen.getByText('Read-only mode')).toHaveClass('font-medium');
      expect(screen.getByText('Read-only mode')).toHaveClass('leading-snug');
    });

    it('applies full-bleed chrome layout classes', () => {
      render(<Banner title="Chrome" />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('relative');
      expect(banner).toHaveClass('flex');
      expect(banner).toHaveClass('w-full');
      expect(banner).toHaveClass('border-b');
      expect(banner).toHaveClass('px-4');
      expect(banner).toHaveClass('py-2.5');
    });

    it('has no corner radius — it is chrome, not a card', () => {
      render(<Banner title="No radius" />);
      expect(screen.getByRole('status').className).not.toContain('rounded');
    });

    it('renders a trailing action slot', () => {
      render(<Banner title="Trial ending" action={<button type="button">Upgrade</button>} />);
      expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
      expect(screen.getByTestId('banner-action')).toHaveClass('shrink-0');
      expect(screen.getByTestId('banner-action')).toHaveClass('ml-auto');
    });
  });

  describe('ARIA role mapping', () => {
    it.each([
      ['neutral', 'status'],
      ['info', 'status'],
      ['success', 'status'],
    ])('uses role="status" for the %s tone', (tone, role) => {
      render(<Banner tone={tone as any} title={tone} />);
      expect(screen.getByRole(role)).toBeInTheDocument();
    });

    it.each([['warning'], ['error']])(
      'uses role="alert" for the urgent %s tone',
      (tone) => {
        render(<Banner tone={tone as any} title={tone} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      }
    );

    it('allows an explicit role override', () => {
      render(<Banner tone="error" role="region" aria-label="Outage" title="Outage" />);
      expect(screen.getByRole('region', { name: 'Outage' })).toBeInTheDocument();
    });
  });

  describe('Tones', () => {
    it('renders the neutral surface treatment by default', () => {
      render(<Banner title="Neutral" />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('border-neutral-200');
      expect(banner).toHaveClass('bg-white');
      expect(banner).toHaveClass('text-neutral-700');
      expect(banner).toHaveClass('dark:border-neutral-800');
      expect(banner).toHaveClass('dark:bg-neutral-950');
      expect(banner).toHaveClass('dark:text-neutral-300');
    });

    it('renders the info tone in light and dark', () => {
      render(<Banner tone="info" title="Info" />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('border-info-200');
      expect(banner).toHaveClass('bg-info-50');
      expect(banner).toHaveClass('text-info-700');
      expect(banner).toHaveClass('dark:border-info-900/60');
      expect(banner).toHaveClass('dark:bg-info-950/40');
      expect(banner).toHaveClass('dark:text-info-300');
    });

    it('renders the success tone in light and dark', () => {
      render(<Banner tone="success" title="Success" />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('border-success-200');
      expect(banner).toHaveClass('bg-success-50');
      expect(banner).toHaveClass('text-success-700');
      expect(banner).toHaveClass('dark:border-success-900/60');
      expect(banner).toHaveClass('dark:bg-success-950/40');
      expect(banner).toHaveClass('dark:text-success-300');
    });

    it('renders the warning tone in light and dark', () => {
      render(<Banner tone="warning" title="Warning" />);
      const banner = screen.getByRole('alert');
      expect(banner).toHaveClass('border-warning-200');
      expect(banner).toHaveClass('bg-warning-50');
      expect(banner).toHaveClass('text-warning-700');
      expect(banner).toHaveClass('dark:border-warning-900/60');
      expect(banner).toHaveClass('dark:bg-warning-950/40');
      expect(banner).toHaveClass('dark:text-warning-300');
    });

    it('renders the error tone in light and dark', () => {
      render(<Banner tone="error" title="Error" />);
      const banner = screen.getByRole('alert');
      expect(banner).toHaveClass('border-error-200');
      expect(banner).toHaveClass('bg-error-50');
      expect(banner).toHaveClass('text-error-700');
      expect(banner).toHaveClass('dark:border-error-900/60');
      expect(banner).toHaveClass('dark:bg-error-950/40');
      expect(banner).toHaveClass('dark:text-error-300');
    });
  });

  describe('Icon slot', () => {
    it('renders a default tone icon', () => {
      render(<Banner tone="warning" title="Degraded" />);
      const icon = screen.getByTestId('banner-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('shrink-0');
      expect(icon.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('suppresses the icon when icon is null', () => {
      render(<Banner tone="info" title="No icon" icon={null} />);
      expect(screen.queryByTestId('banner-icon')).not.toBeInTheDocument();
    });

    it('renders a custom icon', () => {
      render(<Banner title="Custom" icon={<span data-testid="custom-icon">*</span>} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('does not hide a consumer-supplied icon from assistive tech', () => {
      render(
        <Banner
          title="Custom"
          icon={<img src="/logo.svg" alt="Acme status" data-testid="custom-icon" />}
        />
      );
      expect(screen.getByTestId('banner-icon')).not.toHaveAttribute('aria-hidden');
      expect(screen.getByAltText('Acme status')).toBeInTheDocument();
    });
  });

  describe('Dismissal', () => {
    it('does not render a dismiss button by default', () => {
      render(<Banner title="Persistent" />);
      expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    });

    it('renders a dismiss button with an accessible name', () => {
      render(<Banner title="Dismissible" dismissible />);
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('supports a custom dismiss label', () => {
      render(<Banner title="Custom label" dismissible dismissLabel="Hide notice" />);
      expect(screen.getByRole('button', { name: 'Hide notice' })).toBeInTheDocument();
    });

    it('unmounts itself and calls onDismiss when dismissed', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      render(<Banner title="Trial ending" dismissible onDismiss={onDismiss} />);

      await user.click(screen.getByRole('button', { name: 'Dismiss' }));

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByText('Trial ending')).not.toBeInTheDocument();
    });

    it('dismisses without an onDismiss handler', async () => {
      const user = userEvent.setup();
      render(<Banner title="No handler" dismissible />);
      await user.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.queryByText('No handler')).not.toBeInTheDocument();
    });

    it('dismisses on keyboard activation', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      render(<Banner title="Keyboard" dismissible onDismiss={onDismiss} />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toHaveFocus();
      await user.keyboard('{Enter}');

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Keyboard')).not.toBeInTheDocument();
    });

    it('gives the dismiss button the standard focus ring', () => {
      render(<Banner title="Focus ring" dismissible />);
      const button = screen.getByRole('button', { name: 'Dismiss' });
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
      expect(button).toHaveClass('focus-visible:ring-primary-400');
    });

    it('reserves trailing space for the dismiss button', () => {
      render(<Banner title="Padded" dismissible />);
      expect(screen.getByRole('status')).toHaveClass('pr-12');
      expect(screen.getByRole('status')).toHaveClass('sm:pr-14');
    });

    it('reserves the space symmetrically so centered copy stays centered', () => {
      render(<Banner title="Centered" align="center" dismissible />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('px-12');
      expect(banner).toHaveClass('sm:px-14');
      // asymmetric reservation would push centered copy off true center
      expect(banner.className).not.toContain('pr-12');
    });
  });

  describe('Sticky', () => {
    it('is not sticky by default', () => {
      render(<Banner title="Static" />);
      expect(screen.getByRole('status')).not.toHaveClass('sticky');
    });

    it('pins above app chrome when sticky', () => {
      render(<Banner title="Pinned" sticky />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('sticky');
      expect(banner).toHaveClass('top-0');
      expect(banner).toHaveClass('z-30');
    });
  });

  describe('Alignment', () => {
    it('aligns to the start by default', () => {
      render(<Banner title="Start" />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('justify-start');
      expect(banner).toHaveClass('text-left');
      expect(screen.getByText('Start').parentElement).toHaveClass('flex-1');
    });

    it('centers content when align is center', () => {
      render(<Banner title="Center" align="center" />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('justify-center');
      expect(banner).toHaveClass('text-center');
      expect(screen.getByText('Center').parentElement).not.toHaveClass('flex-1');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Banner ref={ref} title="Ref" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'status');
    });
  });

  describe('Variant functions', () => {
    it('bannerVariants returns the default neutral classes', () => {
      const result = bannerVariants({});
      expect(result).toContain('border-b');
      expect(result).toContain('bg-white');
      expect(result).toContain('justify-start');
    });

    it('bannerVariants returns tonal classes', () => {
      const result = bannerVariants({ tone: 'error', align: 'center' });
      expect(result).toContain('bg-error-50');
      expect(result).toContain('dark:bg-error-950/40');
      expect(result).toContain('justify-center');
    });
  });

  describe('Customization', () => {
    it('merges custom className on the root', () => {
      render(<Banner title="Custom class" className="max-w-5xl" />);
      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('max-w-5xl');
      expect(banner).toHaveClass('border-b');
      expect(banner).toHaveClass('bg-white');
    });

    it('passes through HTML attributes', () => {
      render(<Banner title="Attrs" id="system-banner" data-testid="banner-root" />);
      const banner = screen.getByTestId('banner-root');
      expect(banner).toHaveAttribute('id', 'system-banner');
    });
  });
});
