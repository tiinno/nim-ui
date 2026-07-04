import * as React from 'react';
import { cn } from '../lib/utils';

export type StepperStepStatus = 'complete' | 'current' | 'pending' | 'error';

export interface StepperStep {
  id?: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  status?: StepperStepStatus;
}

export interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  steps: StepperStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const getStatus = (
  step: StepperStep,
  index: number,
  currentStep: number
): StepperStepStatus => {
  if (step.status) return step.status;
  if (index < currentStep) return 'complete';
  if (index === currentStep) return 'current';
  return 'pending';
};

const statusStyles: Record<StepperStepStatus, string> = {
  complete:
    'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500 dark:text-neutral-950',
  current:
    'border-neutral-950 bg-neutral-950 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950',
  pending:
    'border-neutral-300 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400',
  error:
    'border-error-600 bg-error-600 text-white dark:border-error-400 dark:bg-error-400 dark:text-error-950',
};

const StepIcon = ({
  status,
  index,
}: {
  status: StepperStepStatus;
  index: number;
}) => {
  if (status === 'complete') {
    return (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 6.5 5 9l4.5-6" />
      </svg>
    );
  }

  if (status === 'error') {
    return (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 2v5" />
        <path d="M6 10h.01" />
      </svg>
    );
  }

  return <span>{index + 1}</span>;
};

const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  ({ className, steps, currentStep = 0, onStepChange, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        'grid gap-3 md:grid-flow-col md:auto-cols-fr md:gap-4',
        className
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const status = getStatus(step, index, currentStep);
        const content = (
          <>
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold shadow-sm',
                statusStyles[status]
              )}
              aria-hidden="true"
            >
              <StepIcon status={status} index={index} />
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  'block truncate text-sm font-medium',
                  status === 'pending'
                    ? 'text-neutral-600 dark:text-neutral-400'
                    : 'text-neutral-950 dark:text-neutral-50'
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {step.description}
                </span>
              )}
            </span>
          </>
        );

        return (
          <li
            key={step.id ?? index}
            className="relative min-w-0 md:after:absolute md:after:left-[calc(50%+2rem)] md:after:top-3.5 md:after:h-px md:after:w-[calc(100%-4rem)] md:after:bg-neutral-200 md:after:content-[''] md:last:after:hidden dark:md:after:bg-neutral-800"
          >
            {onStepChange ? (
              <button
                type="button"
                className="relative z-10 flex min-w-0 items-center gap-3 rounded-md text-left outline-none transition-colors hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:hover:text-neutral-50"
                aria-current={status === 'current' ? 'step' : undefined}
                onClick={() => onStepChange(index)}
              >
                {content}
              </button>
            ) : (
              <div
                className="relative z-10 flex min-w-0 items-center gap-3"
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  )
);
Stepper.displayName = 'Stepper';

export { Stepper };
