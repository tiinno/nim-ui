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

    it('marks the trigger as a placeholder so the muted tone outranks the button colour', () => {
      const { rerender } = render(<DatePicker />);
      const trigger = screen.getByRole('button');
      // A plain `text-neutral-500` would lose to buttonVariants' text-neutral-900
      // in CSS order; the data-attribute variant wins on specificity instead.
      expect(trigger).toHaveAttribute('data-placeholder', '');
      expect(trigger).toHaveClass('data-[placeholder]:text-neutral-500');
      expect(trigger).not.toHaveClass('text-neutral-500');

      rerender(<DatePicker value={new Date(2025, 0, 15)} />);
      expect(screen.getByRole('button')).not.toHaveAttribute(
        'data-placeholder'
      );
    });

    it('renders with initial value', () => {
      const date = new Date(2025, 0, 15);
      render(<DatePicker value={date} />);
      // Check label text appears (format 'PPP' -> 'January 15th, 2025')
      expect(screen.getByRole('button')).toHaveTextContent('January');
    });

    it('centers the icon and label as a group inside the trigger', () => {
      const { container } = render(
        <DatePicker value={new Date(2025, 0, 15)} />
      );
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('justify-center', 'text-center');
      expect(container.querySelector('svg')).toHaveClass('shrink-0');
      expect(trigger.querySelector('span')).toHaveClass('min-w-0', 'truncate');
    });

    it('uses custom format string', () => {
      const date = new Date(2025, 0, 15);
      render(<DatePicker value={date} format="yyyy-MM-dd" />);
      expect(screen.getByRole('button')).toHaveTextContent('2025-01-15');
    });

    it('can display Buddhist Era years while keeping Date values unchanged', () => {
      const date = new Date(2025, 0, 15);
      render(
        <DatePicker
          value={date}
          name="date"
          calendar="buddhist"
          format="yyyy-MM-dd"
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('2568-01-15');
      expect(document.querySelector('input[name="date"]')).toHaveValue(
        '2025-01-15'
      );
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
      expect(input).toHaveValue('2025-01-15');
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

    it('centers the icon and range label inside the trigger', () => {
      const { container } = render(
        <DateRangePicker
          value={{ from: new Date(2025, 0, 1), to: new Date(2025, 0, 15) }}
        />
      );
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('justify-center', 'text-center');
      expect(container.querySelector('svg')).toHaveClass('shrink-0');
      expect(trigger.querySelector('span')).toHaveClass('min-w-0', 'truncate');
    });

    it('can display Buddhist Era ranges', () => {
      const from = new Date(2025, 0, 1);
      const to = new Date(2025, 0, 15);
      render(
        <DateRangePicker
          value={{ from, to }}
          calendar="buddhist"
          format="yyyy-MM-dd"
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent(
        '2568-01-01 - 2568-01-15'
      );
    });
  });

  describe('Interactions', () => {
    it('opens calendar on trigger click', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);
      await user.click(screen.getByRole('button'));
      expect(screen.getAllByRole('grid').length).toBeGreaterThan(0);
    });

    it('applies preset ranges', async () => {
      const user = userEvent.setup();
      const from = new Date(2025, 0, 1);
      const to = new Date(2025, 0, 7);
      const handleChange = vi.fn();

      render(
        <DateRangePicker
          onChange={handleChange}
          presets={[{ label: 'First week', value: { from, to } }]}
        />
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: 'First week' }));

      expect(handleChange).toHaveBeenCalledWith({ from, to });
    });
  });

  describe('Form integration', () => {
    it('renders hidden from/to inputs when names are provided', () => {
      const from = new Date(2025, 0, 1);
      const to = new Date(2025, 0, 7);

      render(
        <DateRangePicker
          value={{ from, to }}
          fromName="dateFrom"
          toName="dateTo"
        />
      );

      expect(document.querySelector('input[name="dateFrom"]')).toHaveValue(
        '2025-01-01'
      );
      expect(document.querySelector('input[name="dateTo"]')).toHaveValue(
        '2025-01-07'
      );
    });
  });
});
