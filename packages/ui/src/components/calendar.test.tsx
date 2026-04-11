import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Calendar } from './calendar';

describe('Calendar', () => {
  describe('Rendering', () => {
    it('renders calendar grid', () => {
      render(<Calendar />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('renders month caption', () => {
      render(<Calendar month={new Date(2025, 0, 15)} />);
      // January 2025
      expect(screen.getByText(/January 2025/i)).toBeInTheDocument();
    });

    it('renders weekday headers', () => {
      render(<Calendar />);
      // react-day-picker renders abbreviated weekday names
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
      render(<Calendar />);
      expect(
        screen.getByRole('button', { name: /previous/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /next/i })
      ).toBeInTheDocument();
    });
  });

  describe('Single mode', () => {
    it('selects a date on click', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(
        <Calendar
          mode="single"
          month={new Date(2025, 0, 1)}
          onSelect={handleSelect}
        />
      );

      const day15 = screen.getByRole('button', { name: /15/ });
      await user.click(day15);
      expect(handleSelect).toHaveBeenCalled();
    });

    it('highlights selected date', () => {
      const selected = new Date(2025, 0, 15);
      render(
        <Calendar mode="single" selected={selected} month={selected} />
      );
      // In react-day-picker v9, the gridcell (<td>) carries data-selected and
      // aria-selected. The day button is its child.
      const dayButton = screen.getByRole('button', { name: /15/ });
      const cell = dayButton.closest('[role="gridcell"]');
      expect(cell).toHaveAttribute('data-selected', 'true');
      expect(cell).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Navigation', () => {
    it('navigates to next month', async () => {
      const user = userEvent.setup();
      // Use defaultMonth (uncontrolled) so clicking next advances the view
      render(<Calendar defaultMonth={new Date(2025, 0, 1)} />);
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/February 2025/i)).toBeInTheDocument();
    });

    it('navigates to previous month', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={new Date(2025, 1, 1)} />);
      await user.click(screen.getByRole('button', { name: /previous/i }));
      expect(screen.getByText(/January 2025/i)).toBeInTheDocument();
    });
  });

  describe('Disabled dates', () => {
    it('disables dates matching disabled prop', () => {
      const disabled = new Date(2025, 0, 15);
      render(
        <Calendar
          mode="single"
          month={new Date(2025, 0, 1)}
          disabled={disabled}
        />
      );
      const day = screen.getByRole('button', { name: /15/ });
      expect(day).toBeDisabled();
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(<Calendar className="custom-calendar" data-testid="calendar" />);
      expect(screen.getByTestId('calendar')).toHaveClass('custom-calendar');
    });
  });
});
