import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from '../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const getLabels = (options: MultiSelectOption[], values: string[]) =>
  values
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter(Boolean) as string[];

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value,
      defaultValue = [],
      onChange,
      placeholder = 'Select options',
      searchPlaceholder = 'Search options...',
      emptyText = 'No options found.',
      disabled,
      className,
      id,
      name,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const selected = value ?? internalValue;
    const selectedLabels = getLabels(options, selected);

    const commit = (nextValue: string[]) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.(nextValue);
    };

    const toggleValue = (nextValue: string) => {
      const option = options.find((item) => item.value === nextValue);
      if (option?.disabled) return;

      commit(
        selected.includes(nextValue)
          ? selected.filter((item) => item !== nextValue)
          : [...selected, nextValue]
      );
    };

    const removeValue = (nextValue: string) => {
      commit(selected.filter((item) => item !== nextValue));
    };

    const label =
      selectedLabels.length === 0
        ? placeholder
        : selectedLabels.length <= 2
          ? selectedLabels.join(', ')
          : `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2}`;

    return (
      <div className="w-full">
        <Popover>
          <PopoverTrigger
            ref={ref}
            id={id}
            role="combobox"
            disabled={disabled}
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-left text-sm text-neutral-900 shadow-control transition-colors duration-fast hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
              selectedLabels.length === 0 && 'text-neutral-500 dark:text-neutral-400',
              className
            )}
          >
            <span className="min-w-0 truncate">{label}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2 shrink-0 opacity-50"
              aria-hidden="true"
            >
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </svg>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] overflow-hidden p-0">
            <CommandPrimitive className="flex flex-col overflow-hidden rounded-md bg-transparent text-neutral-900 dark:text-neutral-100">
              <div
                className="flex items-center border-b border-neutral-200 px-3 dark:border-neutral-800"
                cmdk-input-wrapper=""
              >
                <CommandPrimitive.Input
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-neutral-400"
                  placeholder={searchPlaceholder}
                />
              </div>
              <CommandPrimitive.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                <CommandPrimitive.Empty className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  {emptyText}
                </CommandPrimitive.Empty>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value);

                  return (
                    <CommandPrimitive.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={() => toggleValue(option.value)}
                      className="relative flex cursor-pointer select-none items-start gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors duration-fast data-[selected=true]:bg-neutral-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 dark:data-[selected=true]:bg-neutral-800"
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-neutral-300 text-white dark:border-neutral-700',
                          isSelected && 'border-primary-600 bg-primary-600'
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2.5 6.5 5 9l4.5-6" />
                          </svg>
                        )}
                      </span>
                      <span className="grid min-w-0 gap-0.5">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {option.description}
                          </span>
                        )}
                      </span>
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.List>
            </CommandPrimitive>
          </PopoverContent>
        </Popover>
        {selected.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selected.map((item) => {
              const itemLabel =
                options.find((option) => option.value === item)?.label ?? item;

              return (
                <span
                  key={item}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  <span className="truncate">{itemLabel}</span>
                  <button
                    type="button"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                    aria-label={`Remove ${itemLabel}`}
                    onClick={() => removeValue(item)}
                    disabled={disabled}
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3l6 6M9 3 3 9" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}
        {name &&
          selected.map((item) => (
            <input key={item} type="hidden" name={name} value={item} />
          ))}
      </div>
    );
  }
);
MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
