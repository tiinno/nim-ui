'use client';
import {
  Form,
  FormField,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Button,
} from '@nim-ui/components';

/**
 * Complete form demo with Select and Checkbox.
 *
 * Lives in a single React island because Radix compound components
 * (Select / SelectTrigger / SelectValue) share context that cannot
 * cross Astro's per-component SSR boundaries when inlined in MDX.
 */
export function FormWithSelect() {
  return (
    <Form className="mx-auto max-w-md gap-5">
      <FormField label="Full name" name="signup-name">
        <Input placeholder="Nim Operations" />
      </FormField>
      <FormField label="Work email" name="signup-email">
        <Input type="email" placeholder="ops@example.com" />
      </FormField>
      <div className="space-y-2">
        <label
          htmlFor="signup-plan"
          className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
        >
          Plan
        </label>
        <Select>
          <SelectTrigger id="signup-plan" className="w-full">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Checkbox id="signup-terms" label="I agree to the terms and conditions" />
      <Button type="submit" variant="primary" fullWidth>
        Sign Up
      </Button>
    </Form>
  );
}
