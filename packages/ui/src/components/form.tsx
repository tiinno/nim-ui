import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Form component wrapper for form elements
 *
 * @example
 * // Basic form
 * <Form onSubmit={(e) => e.preventDefault()}>
 *   <input type="text" />
 *   <button type="submit">Submit</button>
 * </Form>
 *
 * @example
 * // Form with spacing
 * <Form className="space-y-4">
 *   <FormField label="Name" name="name">
 *     <Input type="text" />
 *   </FormField>
 *   <Button type="submit">Submit</Button>
 * </Form>
 *
 * @example
 * // Controlled form with error handling
 * <Form onSubmit={handleSubmit}>
 *   <FormField label="Email" name="email" error={errors.email}>
 *     <Input type="email" />
 *   </FormField>
 *   <FormField label="Password" name="password" error={errors.password}>
 *     <Input type="password" />
 *   </FormField>
 *   <Button type="submit">Login</Button>
 * </Form>
 */

const formVariants = cva(
  'flex w-full flex-col gap-4',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface FormProps
  extends React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formVariants> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, style, ...props }, ref) => (
    <form
      ref={ref}
      className={cn(formVariants(), className)}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', ...style }}
      {...props}
    />
  )
);
Form.displayName = 'Form';

export { Form, formVariants };
