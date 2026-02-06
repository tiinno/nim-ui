import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Spacer, spacerVariants } from './spacer';

describe('Spacer', () => {
  describe('Rendering', () => {
    it('renders spacer element', () => {
      render(<Spacer data-testid="spacer" />);
      expect(screen.getByTestId('spacer')).toBeInTheDocument();
    });

    it('has aria-hidden attribute', () => {
      render(<Spacer data-testid="spacer" />);
      expect(screen.getByTestId('spacer')).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders as div element', () => {
      const { container } = render(<Spacer />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Size Variants', () => {
    it.each([
      ['xs', 'h-1', 'w-1'],
      ['sm', 'h-2', 'w-2'],
      ['md', 'h-4', 'w-4'],
      ['lg', 'h-6', 'w-6'],
      ['xl', 'h-8', 'w-8'],
      ['2xl', 'h-12', 'w-12'],
    ])('renders %s size variant', (size, heightClass, widthClass) => {
      render(<Spacer size={size as any} data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass(heightClass);
      expect(spacer).toHaveClass(widthClass);
    });

    it('applies extra small size', () => {
      render(<Spacer size="xs" data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('h-1');
      expect(spacer).toHaveClass('w-1');
    });

    it('applies small size', () => {
      render(<Spacer size="sm" data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('h-2');
      expect(spacer).toHaveClass('w-2');
    });

    it('applies medium size', () => {
      render(<Spacer size="md" data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('h-4');
      expect(spacer).toHaveClass('w-4');
    });

    it('applies large size', () => {
      render(<Spacer size="lg" data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('h-6');
      expect(spacer).toHaveClass('w-6');
    });

    it('applies extra large size', () => {
      render(<Spacer size="xl" data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('h-8');
      expect(spacer).toHaveClass('w-8');
    });

    it('applies 2xl size', () => {
      render(<Spacer size="2xl" data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('h-12');
      expect(spacer).toHaveClass('w-12');
    });
  });

  describe('Flex Variant', () => {
    it('does not apply flex-1 by default', () => {
      render(<Spacer data-testid="spacer" />);
      expect(screen.getByTestId('spacer')).not.toHaveClass('flex-1');
    });

    it('applies flex-1 when flex is true', () => {
      render(<Spacer flex={true} data-testid="spacer" />);
      expect(screen.getByTestId('spacer')).toHaveClass('flex-1');
    });

    it('does not apply flex-1 when flex is false', () => {
      render(<Spacer flex={false} data-testid="spacer" />);
      expect(screen.getByTestId('spacer')).not.toHaveClass('flex-1');
    });
  });

  describe('Size and Flex Combination', () => {
    it('can have both size and flex', () => {
      render(<Spacer size="md" flex={true} data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('h-4');
      expect(spacer).toHaveClass('w-4');
      expect(spacer).toHaveClass('flex-1');
    });

    it('flex overrides size for flexible spacing', () => {
      render(<Spacer flex={true} data-testid="spacer" />);
      expect(screen.getByTestId('spacer')).toHaveClass('flex-1');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Spacer ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports spacerVariants function', () => {
      expect(typeof spacerVariants).toBe('function');
    });

    it('generates correct size classes', () => {
      const small = spacerVariants({ size: 'sm' });
      expect(small).toContain('h-2');
      expect(small).toContain('w-2');

      const large = spacerVariants({ size: 'lg' });
      expect(large).toContain('h-6');
      expect(large).toContain('w-6');
    });

    it('generates correct flex classes', () => {
      const flexed = spacerVariants({ flex: true });
      expect(flexed).toContain('flex-1');

      const notFlexed = spacerVariants({ flex: false });
      expect(notFlexed).not.toContain('flex-1');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with variant classes', () => {
      render(
        <Spacer className="bg-gray-200" size="md" data-testid="spacer" />
      );
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('bg-gray-200');
      expect(spacer).toHaveClass('h-4');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(<Spacer data-testid="spacer" data-type="vertical" />);
      expect(screen.getByTestId('spacer')).toHaveAttribute('data-type', 'vertical');
    });

    it('supports id attribute', () => {
      render(<Spacer id="my-spacer" />);
      expect(document.getElementById('my-spacer')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('renders as fixed-size vertical spacer', () => {
      render(<Spacer size="lg" data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('h-6');
      expect(spacer).toHaveClass('w-6');
    });

    it('renders as flexible spacer in flex container', () => {
      render(
        <div style={{ display: 'flex' }}>
          <div>Left</div>
          <Spacer flex data-testid="spacer" />
          <div>Right</div>
        </div>
      );
      expect(screen.getByTestId('spacer')).toHaveClass('flex-1');
    });

    it('renders small spacing between elements', () => {
      render(
        <div>
          <p>Paragraph 1</p>
          <Spacer size="sm" />
          <p>Paragraph 2</p>
        </div>
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('is hidden from screen readers', () => {
      render(<Spacer data-testid="spacer" />);
      expect(screen.getByTestId('spacer')).toHaveAttribute('aria-hidden', 'true');
    });

    it('maintains aria-hidden with custom props', () => {
      render(<Spacer size="lg" flex data-testid="spacer" />);
      expect(screen.getByTestId('spacer')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('renders without size or flex', () => {
      render(<Spacer data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toBeInTheDocument();
      expect(spacer).not.toHaveClass('flex-1');
    });

    it('handles only flex without size', () => {
      render(<Spacer flex data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveClass('flex-1');
      expect(spacer).not.toHaveClass('h-4');
    });
  });
});
