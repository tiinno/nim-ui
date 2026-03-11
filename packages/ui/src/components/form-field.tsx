import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * FormField component for structured form inputs with label and error
 *
 * @example
 * // Basic form field
 * <FormField label="Username" name="username">
 *   <Input type="text" />
 * </FormField>
 *
 * @example
 * // Form field with error
 * <FormField
 *   label="Email"
 *   name="email"
 *   error="Invalid email address"
 * >
 *   <Input type="email" />
 * </FormField>
 *
 * @example
 * // Form field with helper text and required indicator
 * <FormField
 *   label="Password"
 *   name="password"
 *   required
 *   helperText="Must be at least 8 characters"
 * >
 *   <Input type="password" />
 * </FormField>
 */

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  name: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, name, error, helperText, required, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-2', className)}
      {...props}
    >
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
      >
        {label}
        {required && <span className="text-error-600 ml-1">*</span>}
      </label>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              id: (child.props as Record<string, unknown>).id ?? name,
            })
          : child
      )}
      {helperText && !error && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {helperText}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-error-600 dark:text-error-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
);
FormField.displayName = 'FormField';

export { FormField };
