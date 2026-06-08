import { Radio, RadioGroup } from '@nim-ui/components';

export function RadioDefault() {
  return (
    <RadioGroup defaultValue="option-1">
      <Radio value="option-1" label="Standard review" />
      <Radio value="option-2" label="Priority queue" />
      <Radio value="option-3" label="Escalated approval" />
    </RadioGroup>
  );
}

export function RadioHorizontal() {
  return (
    <RadioGroup defaultValue="medium" className="flex flex-wrap gap-5">
      <Radio value="small" label="Compact" />
      <Radio value="medium" label="Balanced" />
      <Radio value="large" label="Spacious" size="lg" />
    </RadioGroup>
  );
}

export function RadioDisabledGroup() {
  return (
    <RadioGroup defaultValue="option-1" disabled>
      <Radio value="option-1" label="Archived queue" disabled />
      <Radio value="option-2" label="Closed queue" disabled />
    </RadioGroup>
  );
}

export function RadioDisabledItem() {
  return (
    <RadioGroup defaultValue="available">
      <Radio value="available" label="Available" />
      <Radio value="unavailable" label="Unavailable" disabled />
      <Radio value="other" label="Other" />
    </RadioGroup>
  );
}
