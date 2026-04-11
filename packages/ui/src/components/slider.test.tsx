import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Slider } from './slider';

describe('Slider', () => {
  describe('Rendering', () => {
    it('renders slider', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Slider defaultValue={[30]} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
    });

    it('renders range slider with two thumbs', () => {
      render(<Slider defaultValue={[20, 80]} />);
      const thumbs = screen.getAllByRole('slider');
      expect(thumbs).toHaveLength(2);
    });
  });

  describe('Sizes', () => {
    it.each([['sm'], ['md'], ['lg']] as const)(
      'renders %s size',
      (size) => {
        render(<Slider defaultValue={[50]} size={size} data-testid="slider" />);
        expect(screen.getByTestId('slider')).toBeInTheDocument();
      }
    );
  });

  describe('Props', () => {
    it('respects min and max', () => {
      render(<Slider defaultValue={[5]} min={0} max={10} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
    });

    it('supports step prop', () => {
      render(<Slider defaultValue={[50]} min={0} max={100} step={5} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('supports controlled value', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Slider value={[25]} onValueChange={handleChange} />
      );
      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-valuenow',
        '25'
      );
      rerender(<Slider value={[75]} onValueChange={handleChange} />);
      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-valuenow',
        '75'
      );
    });
  });

  describe('Accessibility', () => {
    it('single thumb has Value label', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.getByLabelText('Value')).toBeInTheDocument();
    });

    it('range thumbs have Minimum/Maximum labels', () => {
      render(<Slider defaultValue={[20, 80]} />);
      expect(screen.getByLabelText('Minimum value')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum value')).toBeInTheDocument();
    });

    it('supports aria-label override on root', () => {
      render(
        <Slider
          defaultValue={[50]}
          aria-label="Volume"
          data-testid="slider"
        />
      );
      expect(screen.getByTestId('slider')).toHaveAttribute(
        'aria-label',
        'Volume'
      );
    });
  });

  describe('Disabled state', () => {
    it('renders disabled slider', () => {
      render(<Slider defaultValue={[50]} disabled data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveAttribute(
        'data-disabled',
        ''
      );
    });
  });

  describe('Orientation', () => {
    it('renders horizontal by default', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      );
    });

    it('supports vertical orientation', () => {
      render(<Slider defaultValue={[50]} orientation="vertical" />);
      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-orientation',
        'vertical'
      );
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(
        <Slider
          defaultValue={[50]}
          className="custom-slider"
          data-testid="slider"
        />
      );
      expect(screen.getByTestId('slider')).toHaveClass('custom-slider');
    });
  });
});
