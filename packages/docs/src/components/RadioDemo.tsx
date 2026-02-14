import { RadioGroup, RadioGroupItem } from '@nim-ui/components';

export function RadioDefault() {
  return (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="r1" />
        <label htmlFor="r1" className="text-sm font-medium">Option 1</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="r2" />
        <label htmlFor="r2" className="text-sm font-medium">Option 2</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="r3" />
        <label htmlFor="r3" className="text-sm font-medium">Option 3</label>
      </div>
    </RadioGroup>
  );
}

export function RadioHorizontal() {
  return (
    <RadioGroup defaultValue="small" className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="small" id="size-sm" />
        <label htmlFor="size-sm" className="text-sm font-medium">Small</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="medium" id="size-md" />
        <label htmlFor="size-md" className="text-sm font-medium">Medium</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="large" id="size-lg" />
        <label htmlFor="size-lg" className="text-sm font-medium">Large</label>
      </div>
    </RadioGroup>
  );
}

export function RadioDisabledGroup() {
  return (
    <RadioGroup defaultValue="option-1" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="d1" />
        <label htmlFor="d1" className="text-sm font-medium text-gray-400">Option 1</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="d2" />
        <label htmlFor="d2" className="text-sm font-medium text-gray-400">Option 2</label>
      </div>
    </RadioGroup>
  );
}

export function RadioDisabledItem() {
  return (
    <RadioGroup defaultValue="available">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="available" id="a1" />
        <label htmlFor="a1" className="text-sm font-medium">Available</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="unavailable" id="a2" disabled />
        <label htmlFor="a2" className="text-sm font-medium text-gray-400">Unavailable (disabled)</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="other" id="a3" />
        <label htmlFor="a3" className="text-sm font-medium">Other</label>
      </div>
    </RadioGroup>
  );
}
