import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Stepper } from './stepper';

const steps = [
  { label: 'Details', description: 'Order basics' },
  { label: 'Schedule', description: 'Delivery window' },
  { label: 'Review', description: 'Confirm changes' },
];

describe('Stepper', () => {
  it('marks the current step', () => {
    render(<Stepper steps={steps} currentStep={1} />);

    expect(screen.getByText('Schedule').closest('[aria-current="step"]')).toBeInTheDocument();
  });

  it('calls onStepChange when a step is selected', async () => {
    const user = userEvent.setup();
    const handleStepChange = vi.fn();
    render(<Stepper steps={steps} currentStep={0} onStepChange={handleStepChange} />);

    await user.click(screen.getByRole('button', { name: /schedule/i }));

    expect(handleStepChange).toHaveBeenCalledWith(1);
  });
});
