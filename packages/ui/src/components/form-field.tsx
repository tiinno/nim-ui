import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
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

const formFieldVariants = cva(
  'space-y-2',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
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
      className={cn(formFieldVariants(), className)}
      {...props}
    >
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      {helperText && !error && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
);
FormField.displayName = 'FormField';

export { FormField, formFieldVariants };
