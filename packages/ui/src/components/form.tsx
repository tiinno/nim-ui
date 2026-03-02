import * as React from 'react';
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

export interface FormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn('flex w-full flex-col gap-4', className)}
      {...props}
    />
  )
);
Form.displayName = 'Form';

export { Form };
