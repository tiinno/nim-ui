'use client';
import { useState } from 'react';
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from '@nim-ui/components';

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
];

export function ComboboxBasicDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const selected = frameworks.find((f) => f.value === value);

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger className="w-64">
        {selected?.label ?? 'Select a framework…'}
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search frameworks…" />
        <ComboboxList>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxGroup heading="Frameworks">
            {frameworks.map((framework) => (
              <ComboboxItem
                key={framework.value}
                value={framework.value}
                onSelect={(current) => {
                  setValue(current === value ? '' : current);
                  setOpen(false);
                }}
              >
                {framework.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
