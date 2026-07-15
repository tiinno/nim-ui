import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import {
  Fieldset,
  FieldsetLegend,
  FieldsetDescription,
  FieldsetContent,
  FieldsetFooter,
} from './fieldset';

describe('Fieldset', () => {
  describe('Rendering', () => {
    it('renders a semantic fieldset with legend', () => {
      render(
        <Fieldset data-testid="fieldset">
          <FieldsetLegend>Shipping address</FieldsetLegend>
          <FieldsetContent>Fields</FieldsetContent>
        </Fieldset>
      );
      const fieldset = screen.getByTestId('fieldset');
      expect(fieldset.tagName).toBe('FIELDSET');
      expect(screen.getByText('Shipping address').tagName).toBe('LEGEND');
    });

    it('announces the group by its legend', () => {
      render(
        <Fieldset>
          <FieldsetLegend>Shipping address</FieldsetLegend>
          <FieldsetContent>
            <input aria-label="Street" />
          </FieldsetContent>
        </Fieldset>
      );
      expect(screen.getByRole('group', { name: 'Shipping address' })).toBeInTheDocument();
    });

    it('applies container styles including dark mode', () => {
      render(<Fieldset data-testid="fieldset">Content</Fieldset>);
      const fieldset = screen.getByTestId('fieldset');
      expect(fieldset).toHaveClass('min-w-0');
      expect(fieldset).toHaveClass('rounded-md');
      expect(fieldset).toHaveClass('border');
      expect(fieldset).toHaveClass('border-neutral-200');
      expect(fieldset).toHaveClass('bg-white');
      expect(fieldset).toHaveClass('shadow-control');
      expect(fieldset).toHaveClass('dark:border-neutral-800');
      expect(fieldset).toHaveClass('dark:bg-neutral-950');
    });
  });

  describe('Native disabled propagation', () => {
    it('disables every descendant control', () => {
      render(
        <Fieldset disabled>
          <FieldsetLegend>Section</FieldsetLegend>
          <FieldsetContent>
            <input aria-label="Street" />
            <button>Save</button>
          </FieldsetContent>
        </Fieldset>
      );
      expect(screen.getByLabelText('Street')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('applies disabled opacity styling', () => {
      render(<Fieldset data-testid="fieldset" disabled>Content</Fieldset>);
      expect(screen.getByTestId('fieldset')).toHaveClass('disabled:opacity-60');
    });

    it('leaves controls enabled by default', () => {
      render(
        <Fieldset>
          <FieldsetContent>
            <input aria-label="Street" />
          </FieldsetContent>
        </Fieldset>
      );
      expect(screen.getByLabelText('Street')).toBeEnabled();
    });
  });

  describe('FieldsetLegend', () => {
    it('applies layout normalization and typography', () => {
      render(
        <Fieldset>
          <FieldsetLegend data-testid="legend">Title</FieldsetLegend>
        </Fieldset>
      );
      const legend = screen.getByTestId('legend');
      expect(legend).toHaveClass('float-left');
      expect(legend).toHaveClass('w-full');
      expect(legend).toHaveClass('px-5');
      expect(legend).toHaveClass('pt-4');
      expect(legend).toHaveClass('text-sm');
      expect(legend).toHaveClass('font-semibold');
      expect(legend).toHaveClass('text-neutral-950');
      expect(legend).toHaveClass('dark:text-neutral-50');
    });
  });

  describe('FieldsetDescription', () => {
    it('renders supporting text with clear-both', () => {
      render(
        <Fieldset>
          <FieldsetLegend>Title</FieldsetLegend>
          <FieldsetDescription data-testid="desc">Used for carrier labels.</FieldsetDescription>
        </Fieldset>
      );
      const desc = screen.getByTestId('desc');
      expect(desc.tagName).toBe('P');
      expect(desc).toHaveClass('clear-both');
      expect(desc).toHaveClass('text-neutral-500');
      expect(desc).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('FieldsetContent', () => {
    it('applies spacing and clear-both', () => {
      render(
        <Fieldset>
          <FieldsetContent data-testid="content">Fields</FieldsetContent>
        </Fieldset>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('clear-both');
      expect(content).toHaveClass('space-y-4');
      expect(content).toHaveClass('px-5');
      expect(content).toHaveClass('py-4');
    });
  });

  describe('FieldsetFooter', () => {
    it('applies footer band styles including dark mode', () => {
      render(
        <Fieldset>
          <FieldsetFooter data-testid="footer">
            <span>Hint</span>
            <button>Save</button>
          </FieldsetFooter>
        </Fieldset>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('justify-between');
      expect(footer).toHaveClass('rounded-b-md');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-neutral-200');
      expect(footer).toHaveClass('bg-neutral-50');
      expect(footer).toHaveClass('dark:border-neutral-800');
      expect(footer).toHaveClass('dark:bg-neutral-900/50');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards refs on all five parts', () => {
      const fieldsetRef = createRef<HTMLFieldSetElement>();
      const legendRef = createRef<HTMLLegendElement>();
      const descRef = createRef<HTMLParagraphElement>();
      const contentRef = createRef<HTMLDivElement>();
      const footerRef = createRef<HTMLDivElement>();
      render(
        <Fieldset ref={fieldsetRef}>
          <FieldsetLegend ref={legendRef}>Title</FieldsetLegend>
          <FieldsetDescription ref={descRef}>Description</FieldsetDescription>
          <FieldsetContent ref={contentRef}>Fields</FieldsetContent>
          <FieldsetFooter ref={footerRef}>Footer</FieldsetFooter>
        </Fieldset>
      );
      expect(fieldsetRef.current).toBeInstanceOf(HTMLFieldSetElement);
      expect(legendRef.current).toBeInstanceOf(HTMLLegendElement);
      expect(descRef.current).toBeInstanceOf(HTMLParagraphElement);
      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
      expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Customization', () => {
    it('merges custom className on the root', () => {
      render(
        <Fieldset data-testid="fieldset" className="max-w-lg">
          Content
        </Fieldset>
      );
      const fieldset = screen.getByTestId('fieldset');
      expect(fieldset).toHaveClass('max-w-lg');
      expect(fieldset).toHaveClass('rounded-md');
    });

    it('passes through HTML attributes', () => {
      render(
        <Fieldset data-testid="fieldset" name="shipping">
          Content
        </Fieldset>
      );
      expect(screen.getByTestId('fieldset')).toHaveAttribute('name', 'shipping');
    });
  });
});
