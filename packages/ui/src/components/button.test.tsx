import type * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-neutral-950');
    });
  });

  describe('Variants', () => {
    it.each([
      ['default', 'bg-neutral-950'],
      ['primary', 'bg-neutral-950'],
      ['secondary', 'bg-neutral-100'],
      ['outline', 'border'],
      ['ghost', 'bg-transparent'],
      ['destructive', 'bg-error-700'],
    ])('renders %s variant with correct styles', (variant, expectedClass) => {
      render(<Button variant={variant as any}>{variant}</Button>);
      expect(screen.getByRole('button')).toHaveClass(expectedClass);
    });

    it('renders full width when requested', () => {
      render(<Button fullWidth>Full width</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });
  });

  describe('Sizes', () => {
    it.each([
      ['sm', 'h-8'],
      ['md', 'h-9'],
      ['lg', 'h-10'],
      ['xl', 'h-11'],
    ])('renders %s size with correct height', (size, expectedClass) => {
      render(<Button size={size as any}>Size {size}</Button>);
      expect(screen.getByRole('button')).toHaveClass(expectedClass);
    });

    it('size={null} skips the default size so composers can supply their own', () => {
      // Calendar composes buttonVariants and supplies its own h-7/w-7/p-0. It relies
      // on cva skipping defaultVariants for an explicit null — no `size: 'none'`
      // variant is needed, and adding one would put a height-less, padding-less
      // button in the public API.
      const sized = buttonVariants({ variant: 'ghost' });
      const unsized = buttonVariants({ variant: 'ghost', size: null });

      // The default really does emit sizing — proves the null case below is not vacuous.
      expect(sized).toContain('h-9');
      expect(sized).toContain('px-3.5');

      expect(unsized).not.toContain('h-9');
      expect(unsized).not.toContain('px-3.5');
      // Non-sizing base styling still applies.
      expect(unsized).toContain('inline-flex');
      expect(unsized).toContain('rounded-md');
    });
  });

  describe('Interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('does not trigger onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct button role', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    // WCAG 2.2 SC 2.4.3 Focus Order. A native `disabled` element leaves the tab
    // order, so a keyboard user who activates a button that then flips to
    // `loading` loses focus to <body> on the very interaction they triggered —
    // and the `aria-busy` announcement lands on an element they are no longer
    // on. `loading` therefore uses `aria-disabled` and suppresses activation in
    // the handler; the explicit `disabled` prop stays a real native `disabled`,
    // because that is a different, deliberate consumer intent.

    // NOTE: this one is documentation, not a guard. jsdom does not run the
    // "unfocusing steps" when a focused element becomes disabled, so it passes
    // against the old native-`disabled` implementation too. The real regression
    // guards for SC 2.4.3 are the tab-order test and `not.toBeDisabled()` below,
    // both of which fail against the old behaviour.
    it('keeps focus on the button when it enters the loading state', () => {
      const { rerender } = render(<Button>Save</Button>);
      const button = screen.getByRole('button');

      button.focus();
      expect(document.activeElement).toBe(button);

      rerender(<Button loading>Save</Button>);
      expect(document.activeElement).toBe(button);
    });

    it('stays in the tab order while loading', async () => {
      const user = userEvent.setup();
      render(
        <>
          <input aria-label="Before" />
          <Button loading>Save</Button>
        </>
      );

      screen.getByLabelText('Before').focus();
      await user.tab();

      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('is not natively disabled while loading', () => {
      render(<Button loading>Save</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('exposes aria-disabled and aria-busy while loading', () => {
      render(<Button loading>Save</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('sets neither aria-disabled nor aria-busy when not loading', () => {
      render(<Button>Save</Button>);
      const button = screen.getByRole('button');

      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).not.toHaveAttribute('aria-busy');
    });

    it('keeps the explicit disabled prop a real native disabled', () => {
      render(<Button disabled>Save</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).not.toHaveAttribute('aria-busy');
    });

    it('honours a native disabled that is combined with loading', () => {
      render(<Button loading disabled>Save</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not fire a consumer onClick while loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Save</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('fires a consumer onClick once loading clears', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { rerender } = render(<Button loading onClick={handleClick}>Save</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();

      rerender(<Button onClick={handleClick}>Save</Button>);
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    // A native <button> fires `click` for Enter and for Space, so intercepting
    // onClick covers the keyboard too. Asserted rather than assumed.
    it('does not activate on Enter while loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Save</Button>);

      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');

      expect(handleClick).not.toHaveBeenCalled();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('does not activate on Space while loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Save</Button>);

      screen.getByRole('button').focus();
      await user.keyboard('[Space]');

      expect(handleClick).not.toHaveBeenCalled();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('does not submit its form while loading', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Button loading>Save</Button>
        </form>
      );

      await user.click(screen.getByRole('button'));
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('does not submit its form on Enter while loading', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Button loading>Save</Button>
        </form>
      );

      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    // Proves the two form tests above are not vacuous: the default type of a
    // <button> really is submit, so a non-loading button does submit.
    it('submits its form when not loading', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Button>Save</Button>
        </form>
      );

      await user.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalledOnce();
    });

    // Native `disabled` dispatches no click at all, so nothing bubbles. Keeping
    // pointer events (see the cva note about pointer-events-none) means the
    // click is real, so it has to be stopped here as well or an ancestor
    // handler activates for a click that never counted.
    it('does not bubble the click to an ancestor while loading', async () => {
      const user = userEvent.setup();
      const handleAncestorClick = vi.fn();
      render(
        <div onClick={handleAncestorClick}>
          <Button loading>Save</Button>
        </div>
      );

      await user.click(screen.getByRole('button'));
      expect(handleAncestorClick).not.toHaveBeenCalled();
    });

    it('wraps an aria-hidden spinner in a role=status element, matching Spinner', () => {
      render(<Button loading>Save</Button>);
      const button = screen.getByRole('button');

      const status = button.querySelector('[role="status"]');
      expect(status).not.toBeNull();
      expect(status?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders sr-only text only when loadingLabel is passed', () => {
      const { rerender } = render(<Button loading>Save</Button>);
      const button = screen.getByRole('button');

      expect(button.querySelector('.sr-only')).toBeNull();

      rerender(<Button loading loadingLabel="Saving order">Save</Button>);

      const srOnly = screen.getByText('Saving order');
      expect(srOnly).toHaveClass('sr-only');
      expect(button.querySelector('[role="status"]')).toContainElement(srOnly);
    });

    // The accessible name is the contract most likely to break a consumer, and
    // the only mechanism here that reliably speaks: `role="status"` inside a
    // button is pruned (children-presentational) and `aria-busy` support is
    // patchy. A default label would therefore silently rename every loading
    // button AND re-announce it under the user's focus — so it is opt-in.
    it('keeps the accessible name stable across the loading transition', () => {
      const { rerender } = render(<Button>Save</Button>);
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

      rerender(<Button loading>Save</Button>);
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

      rerender(<Button loading loadingLabel="Saving order">Save</Button>);
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Saving order Save' })).toBeInTheDocument();
    });

    it('renders no spinner, no status wrapper and no loading text when not loading', () => {
      render(<Button loadingLabel="Saving order">Save</Button>);
      const button = screen.getByRole('button');

      expect(button.querySelector('[role="status"]')).toBeNull();
      expect(button.querySelector('svg')).toBeNull();
      expect(button.querySelector('.sr-only')).toBeNull();
      expect(screen.queryByText('Saving order')).not.toBeInTheDocument();
    });

    // `aria-disabled` and `aria-busy` carry the whole semantic contract, so they
    // sit after {...props} exactly like onClick. A consumer value landing on top
    // would report *enabled* to assistive tech and drop the dimming, while the
    // handler kept swallowing every click — the worst of the three states.
    it('cannot have aria-disabled or aria-busy clobbered by a consumer while loading', () => {
      render(
        <Button loading aria-disabled={false} aria-busy={false}>
          Save
        </Button>
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('still lets a consumer set aria-disabled when not loading', () => {
      render(<Button aria-disabled>Save</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    // Lockstep with the cva base string — this kit asserts literal classes.
    // `aria-disabled` does NOT trigger `:disabled`, so the disabled-looking
    // styling and the press animation both need explicit counterparts.
    it('carries aria-disabled counterparts for the disabled styling', () => {
      const base = buttonVariants({ variant: 'default' });

      expect(base).toContain('disabled:opacity-50');
      expect(base).toContain('aria-disabled:opacity-50');
      expect(base).toContain('active:scale-[0.98]');
      expect(base).toContain('aria-disabled:active:scale-100');
      expect(base).toContain('aria-disabled:cursor-not-allowed');
    });

    // Deliberate omission: `pointer-events: none` lets a click pass THROUGH to
    // whatever sits underneath the loading button, so the aria-disabled case
    // keeps receiving pointer events and suppresses them in the handler.
    it('does not disable pointer events for the aria-disabled case', () => {
      const base = buttonVariants({ variant: 'default' });

      // Assembled rather than written out — and not spelled out in this comment
      // either: Tailwind scans test files and comments too, so the literal class
      // name would compile a real (dead) rule into dist/styles.css that no
      // component uses.
      const forbidden = ['aria-disabled', 'pointer-events-none'].join(':');

      expect(base).toContain('disabled:pointer-events-none');
      expect(base).not.toContain(forbidden);
    });

    it('applies the loading classes to the rendered button', () => {
      render(<Button loading>Save</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('aria-disabled:opacity-50');
      expect(button).toHaveClass('aria-disabled:cursor-not-allowed');
      expect(button).toHaveClass('aria-disabled:active:scale-100');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Custom className', () => {
    it('merges custom className with variant classes', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-neutral-950');
    });
  });
});
