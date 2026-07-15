import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { ScrollArea, ScrollBar } from './scroll-area';

describe('ScrollArea', () => {
  describe('Rendering', () => {
    it('renders children inside the viewport', () => {
      render(
        <ScrollArea className="h-32">
          <div>Activity feed</div>
        </ScrollArea>
      );
      expect(screen.getByText('Activity feed')).toBeInTheDocument();
    });

    it('applies root styles and merges className', () => {
      render(
        <ScrollArea data-testid="scroll" className="h-64 rounded-md">
          Content
        </ScrollArea>
      );
      const root = screen.getByTestId('scroll');
      expect(root).toHaveClass('relative');
      expect(root).toHaveClass('overflow-hidden');
      expect(root).toHaveClass('h-64');
      expect(root).toHaveClass('rounded-md');
    });

    it('wraps content in a rounded-inheriting viewport', () => {
      render(
        <ScrollArea data-testid="scroll">
          <div>Content</div>
        </ScrollArea>
      );
      const viewport = screen.getByTestId('scroll').querySelector(':scope > div');
      expect(viewport).toHaveClass('size-full');
      expect(viewport).toHaveClass('rounded-[inherit]');
    });
  });

  describe('ScrollBar', () => {
    it('applies vertical styles by default', () => {
      render(
        <ScrollArea type="always">
          Content
          <ScrollBar data-testid="bar" forceMount />
        </ScrollArea>
      );
      const bar = screen.getByTestId('bar');
      expect(bar).toHaveClass('flex');
      expect(bar).toHaveClass('touch-none');
      expect(bar).toHaveClass('select-none');
      expect(bar).toHaveClass('h-full');
      expect(bar).toHaveClass('w-2.5');
      expect(bar).toHaveClass('border-l');
    });

    it('applies horizontal styles', () => {
      render(
        <ScrollArea type="always">
          Content
          <ScrollBar data-testid="bar" orientation="horizontal" forceMount />
        </ScrollArea>
      );
      const bar = screen.getByTestId('bar');
      expect(bar).toHaveClass('h-2.5');
      expect(bar).toHaveClass('flex-col');
      expect(bar).toHaveClass('border-t');
    });

    // Thumb rendering needs real layout sizes (verified in-browser);
    // jsdom reports zero dimensions so Radix never mounts the thumb.

    it('merges custom className', () => {
      render(
        <ScrollArea type="always">
          Content
          <ScrollBar data-testid="bar" className="w-3" forceMount />
        </ScrollArea>
      );
      expect(screen.getByTestId('bar')).toHaveClass('w-3');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<ScrollArea ref={ref}>Content</ScrollArea>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Customization', () => {
    it('passes through HTML attributes', () => {
      render(
        <ScrollArea data-testid="scroll" id="feed">
          Content
        </ScrollArea>
      );
      expect(screen.getByTestId('scroll')).toHaveAttribute('id', 'feed');
    });

    it('passes the Radix type prop through', () => {
      render(
        <ScrollArea data-testid="scroll" type="always">
          Content
        </ScrollArea>
      );
      expect(screen.getByTestId('scroll')).toBeInTheDocument();
    });
  });
});
