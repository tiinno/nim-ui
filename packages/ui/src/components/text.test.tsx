import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { Text, textVariants } from './text';

describe('Text', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Text>Order queue is empty.</Text>);
      expect(screen.getByText('Order queue is empty.')).toBeInTheDocument();
    });

    it('renders a paragraph by default', () => {
      render(<Text data-testid="text">Default</Text>);
      expect(screen.getByTestId('text').tagName).toBe('P');
    });

    it.each([
      ['h1', 'H1'],
      ['h2', 'H2'],
      ['h3', 'H3'],
      ['h4', 'H4'],
      ['h5', 'H5'],
      ['h6', 'H6'],
      ['p', 'P'],
      ['span', 'SPAN'],
      ['small', 'SMALL'],
      ['blockquote', 'BLOCKQUOTE'],
    ])('renders %s element via as prop', (as, tagName) => {
      render(
        <Text data-testid="text" as={as as any}>
          {as}
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe(tagName);
    });
  });

  describe('Variants', () => {
    it.each([
      ['h1', ['text-2xl', 'tracking-tight', 'font-semibold']],
      ['h2', ['text-xl', 'tracking-tight', 'font-semibold']],
      ['h3', ['text-lg', 'font-semibold']],
      ['h4', ['text-base', 'font-medium']],
      ['h5', ['text-sm', 'font-medium']],
      ['h6', ['text-xs', 'uppercase', 'tracking-wide', 'font-medium']],
      ['p', ['text-sm', 'leading-6', 'font-normal']],
      ['span', ['text-sm', 'font-normal']],
      ['small', ['text-xs', 'leading-5', 'font-normal']],
    ])('styles %s with its default scale and weight', (as, classes) => {
      render(
        <Text data-testid="text" as={as as any}>
          {as}
        </Text>
      );
      const el = screen.getByTestId('text');
      for (const cls of classes as string[]) {
        expect(el).toHaveClass(cls);
      }
    });

    it('styles blockquote with border and italics including dark mode', () => {
      render(
        <Text data-testid="text" as="blockquote">
          Quoted
        </Text>
      );
      const el = screen.getByTestId('text');
      expect(el).toHaveClass('border-l-2');
      expect(el).toHaveClass('border-neutral-200');
      expect(el).toHaveClass('pl-4');
      expect(el).toHaveClass('italic');
      expect(el).toHaveClass('dark:border-neutral-800');
    });

    it('variant overrides visual style while as keeps semantics', () => {
      render(
        <Text data-testid="text" as="h2" variant="h3">
          Shipment details
        </Text>
      );
      const el = screen.getByTestId('text');
      expect(el.tagName).toBe('H2');
      expect(el).toHaveClass('text-lg');
      expect(el).not.toHaveClass('text-xl');
    });

    it('variant override also drives the default weight', () => {
      render(
        <Text data-testid="text" as="span" variant="h1">
          Big span
        </Text>
      );
      const el = screen.getByTestId('text');
      expect(el).toHaveClass('font-semibold');
      expect(el).not.toHaveClass('font-normal');
    });
  });

  describe('Tone', () => {
    it('applies default tone including dark mode', () => {
      render(<Text data-testid="text">Default tone</Text>);
      const el = screen.getByTestId('text');
      expect(el).toHaveClass('text-neutral-900');
      expect(el).toHaveClass('dark:text-neutral-100');
    });

    it.each([
      ['secondary', 'text-neutral-500', 'dark:text-neutral-400'],
      ['success', 'text-success-700', 'dark:text-success-400'],
      ['warning', 'text-warning-700', 'dark:text-warning-400'],
      ['error', 'text-error-700', 'dark:text-error-400'],
    ])('applies %s tone with dark mode classes', (tone, light, dark) => {
      render(
        <Text data-testid="text" tone={tone as any}>
          {tone}
        </Text>
      );
      const el = screen.getByTestId('text');
      expect(el).toHaveClass(light);
      expect(el).toHaveClass(dark);
    });
  });

  describe('Weight', () => {
    it('explicit weight overrides the element default', () => {
      render(
        <Text data-testid="text" as="h1" weight="normal">
          Light heading
        </Text>
      );
      const el = screen.getByTestId('text');
      expect(el).toHaveClass('font-normal');
      expect(el).not.toHaveClass('font-semibold');
    });

    it.each([
      ['normal', 'font-normal'],
      ['medium', 'font-medium'],
      ['semibold', 'font-semibold'],
    ])('applies %s weight', (weight, cls) => {
      render(
        <Text data-testid="text" weight={weight as any}>
          {weight}
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass(cls);
    });
  });

  describe('Truncate', () => {
    it('adds truncate class when enabled', () => {
      render(
        <Text data-testid="text" truncate>
          Long record identifier
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('truncate');
    });

    it('does not truncate by default', () => {
      render(<Text data-testid="text">No truncate</Text>);
      expect(screen.getByTestId('text')).not.toHaveClass('truncate');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the rendered element', () => {
      const ref = createRef<HTMLElement>();
      render(<Text ref={ref}>Paragraph</Text>);
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });

    it('forwards ref to heading elements', () => {
      const ref = createRef<HTMLElement>();
      render(
        <Text ref={ref} as="h1">
          Heading
        </Text>
      );
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });

  describe('textVariants', () => {
    it('returns classes for a variant and tone', () => {
      const result = textVariants({ variant: 'h1', tone: 'secondary', weight: 'semibold' });
      expect(result).toContain('text-2xl');
      expect(result).toContain('text-neutral-500');
      expect(result).toContain('font-semibold');
    });

    it('applies default tone', () => {
      expect(textVariants({ variant: 'p' })).toContain('text-neutral-900');
    });
  });

  describe('Customization', () => {
    it('merges custom className', () => {
      render(
        <Text data-testid="text" className="mt-4">
          Custom
        </Text>
      );
      const el = screen.getByTestId('text');
      expect(el).toHaveClass('mt-4');
      expect(el).toHaveClass('text-sm');
    });

    it('passes through HTML attributes', () => {
      render(
        <Text data-testid="text" id="summary" aria-live="polite">
          Attributes
        </Text>
      );
      const el = screen.getByTestId('text');
      expect(el).toHaveAttribute('id', 'summary');
      expect(el).toHaveAttribute('aria-live', 'polite');
    });
  });
});
