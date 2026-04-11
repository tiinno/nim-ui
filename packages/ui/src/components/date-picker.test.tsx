import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { DatePicker, DateRangePicker } from './date-picker';

describe('DatePicker', () => {
  describe('Rendering', () => {
    it('renders trigger with placeholder', () => {
      render(<DatePicker />);
      expect(screen.getByText('Pick a date')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<DatePicker placeholder="Select a date" />);
      expect(screen.getByText('Select a date')).toBeInTheDocument();
    });

    it('renders with initial value', () => {
      const date = new Date(2025, 0, 15);
      render(<DatePicker value={date} />);
      // Check label text appears (format 'PPP' -> 'January 15th, 2025')
      expect(screen.getByRole('button')).toHaveTextContent('January');
    });

    it('uses custom format string', () => {
      const date = new Date(2025, 0, 15);
      render(<DatePicker value={date} format="yyyy-MM-dd" />);
      expect(screen.getByRole('button')).toHaveTextContent('2025-01-15');
    });
  });

  describe('Interactions', () => {
    it('opens calendar on trigger click', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('calls onChange when date is selected', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <DatePicker
          defaultValue={new Date(2025, 0, 1)}
          onChange={handleChange}
        />
      );
      await user.click(screen.getByRole('button'));
      const day15 = await screen.findByRole('button', { name: /15/ });
      await user.click(day15);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('renders disabled trigger', () => {
      render(<DatePicker disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Form integration', () => {
    it('supports id prop', () => {
      render(<DatePicker id="birthday" />);
      expect(screen.getByRole('button')).toHaveAttribute('id', 'birthday');
    });

    it('renders hidden input when name is provided', () => {
      const date = new Date(2025, 0, 15);
      render(<DatePicker name="date" value={date} />);
      const input = document.querySelector('input[name="date"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'hidden');
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(<DatePicker className="custom-trigger" />);
      expect(screen.getByRole('button')).toHaveClass('custom-trigger');
    });
  });
});

describe('DateRangePicker', () => {
  describe('Rendering', () => {
    it('renders trigger with placeholder', () => {
      render(<DateRangePicker />);
      expect(screen.getByText('Pick a date range')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<DateRangePicker placeholder="Select dates" />);
      expect(screen.getByText('Select dates')).toBeInTheDocument();
    });

    it('renders from date when only from is set', () => {
      const from = new Date(2025, 0, 1);
      render(<DateRangePicker value={{ from }} />);
      expect(screen.getByRole('button')).toHaveTextContent('Jan');
    });

    it('renders range when both from and to are set', () => {
      const from = new Date(2025, 0, 1);
      const to = new Date(2025, 0, 15);
      render(<DateRangePicker value={{ from, to }} />);
      expect(screen.getByRole('button').textContent).toContain('-');
    });
  });

  describe('Interactions', () => {
    it('opens calendar on trigger click', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);
      await user.click(screen.getByRole('button'));
      expect(screen.getAllByRole('grid').length).toBeGreaterThan(0);
    });
  });
});
