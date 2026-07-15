import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { Kbd, KbdGroup, kbdVariants } from './kbd';

describe('Kbd', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Kbd>Esc</Kbd>);
      expect(screen.getByText('Esc')).toBeInTheDocument();
    });

    it('renders a kbd element', () => {
      render(<Kbd data-testid="kbd">K</Kbd>);
      expect(screen.getByTestId('kbd').tagName).toBe('KBD');
    });

    it('applies base styles including dark mode', () => {
      render(<Kbd data-testid="kbd">K</Kbd>);
      const kbd = screen.getByTestId('kbd');
      expect(kbd).toHaveClass('inline-flex');
      expect(kbd).toHaveClass('items-center');
      expect(kbd).toHaveClass('justify-center');
      expect(kbd).toHaveClass('rounded');
      expect(kbd).toHaveClass('border');
      expect(kbd).toHaveClass('border-neutral-200');
      expect(kbd).toHaveClass('bg-neutral-50');
      expect(kbd).toHaveClass('font-mono');
      expect(kbd).toHaveClass('font-medium');
      expect(kbd).toHaveClass('text-neutral-500');
      expect(kbd).toHaveClass('dark:border-neutral-800');
      expect(kbd).toHaveClass('dark:bg-neutral-900');
      expect(kbd).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('Sizes', () => {
    it('renders sm size by default', () => {
      render(<Kbd data-testid="kbd">K</Kbd>);
      const kbd = screen.getByTestId('kbd');
      expect(kbd).toHaveClass('h-5');
      expect(kbd).toHaveClass('min-w-5');
      expect(kbd).toHaveClass('px-1');
      expect(kbd).toHaveClass('text-[11px]');
    });

    it('renders md size', () => {
      render(
        <Kbd data-testid="kbd" size="md">
          K
        </Kbd>
      );
      const kbd = screen.getByTestId('kbd');
      expect(kbd).toHaveClass('h-6');
      expect(kbd).toHaveClass('min-w-6');
      expect(kbd).toHaveClass('px-1.5');
      expect(kbd).toHaveClass('text-xs');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the kbd element', () => {
      const ref = createRef<HTMLElement>();
      render(<Kbd ref={ref}>K</Kbd>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('KBD');
    });
  });

  describe('kbdVariants', () => {
    it('returns classes for a size', () => {
      const result = kbdVariants({ size: 'md' });
      expect(result).toContain('h-6');
      expect(result).toContain('font-mono');
    });

    it('applies sm size by default', () => {
      expect(kbdVariants({})).toContain('h-5');
    });
  });

  describe('Customization', () => {
    it('merges custom className', () => {
      render(
        <Kbd data-testid="kbd" className="ml-2">
          K
        </Kbd>
      );
      const kbd = screen.getByTestId('kbd');
      expect(kbd).toHaveClass('ml-2');
      expect(kbd).toHaveClass('font-mono');
    });

    it('passes through HTML attributes', () => {
      render(
        <Kbd data-testid="kbd" title="Escape key">
          Esc
        </Kbd>
      );
      expect(screen.getByTestId('kbd')).toHaveAttribute('title', 'Escape key');
    });
  });
});

describe('KbdGroup', () => {
  it('renders children keys', () => {
    render(
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    );
    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('applies group layout styles', () => {
    render(<KbdGroup data-testid="group">keys</KbdGroup>);
    const group = screen.getByTestId('group');
    expect(group.tagName).toBe('SPAN');
    expect(group).toHaveClass('inline-flex');
    expect(group).toHaveClass('items-center');
    expect(group).toHaveClass('gap-1');
  });

  it('supports aria-label for the whole shortcut', () => {
    render(
      <KbdGroup aria-label="Command K">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    );
    expect(screen.getByLabelText('Command K')).toBeInTheDocument();
  });

  it('forwards ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<KbdGroup ref={ref}>keys</KbdGroup>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges custom className', () => {
    render(
      <KbdGroup data-testid="group" className="gap-2">
        keys
      </KbdGroup>
    );
    expect(screen.getByTestId('group')).toHaveClass('gap-2');
  });
});
