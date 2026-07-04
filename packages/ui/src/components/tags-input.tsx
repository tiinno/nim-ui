import * as React from 'react';
import { cn } from '../lib/utils';

export interface TagsInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
}

const normalizeTag = (tag: string) => tag.trim();

const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  (
    {
      value,
      defaultValue = [],
      onChange,
      placeholder = 'Add tag...',
      maxTags,
      allowDuplicates = false,
      disabled,
      className,
      inputClassName,
      id,
      name,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [draft, setDraft] = React.useState('');
    const tags = value ?? internalValue;
    const limitReached = maxTags !== undefined && tags.length >= maxTags;

    const commit = (nextValue: string[]) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.(nextValue);
    };

    const addTag = (tag: string) => {
      const nextTag = normalizeTag(tag);
      if (!nextTag || disabled || limitReached) return;

      if (
        !allowDuplicates &&
        tags.some((item) => item.toLowerCase() === nextTag.toLowerCase())
      ) {
        setDraft('');
        return;
      }

      commit([...tags, nextTag]);
      setDraft('');
    };

    const removeTag = (index: number) => {
      commit(tags.filter((_, tagIndex) => tagIndex !== index));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        addTag(draft);
        return;
      }

      if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
        commit(tags.slice(0, -1));
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      const text = event.clipboardData.getData('text');
      if (!text.includes(',')) return;

      event.preventDefault();
      const pastedTags = text
        .split(',')
        .map(normalizeTag)
        .filter(Boolean);

      const nextTags = [...tags];
      for (const tag of pastedTags) {
        if (maxTags !== undefined && nextTags.length >= maxTags) break;
        if (
          allowDuplicates ||
          !nextTags.some((item) => item.toLowerCase() === tag.toLowerCase())
        ) {
          nextTags.push(tag);
        }
      }

      commit(nextTags);
    };

    return (
      <div className="w-full">
        <div
          className={cn(
            'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm shadow-control transition-[border-color,box-shadow] focus-within:ring-2 focus-within:ring-primary-400 focus-within:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          onClick={() => {
            if (!disabled) {
              document.getElementById(inputId)?.focus();
            }
          }}
        >
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(index)}
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
          ))}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-6 min-w-28 flex-1 bg-transparent px-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed dark:text-neutral-100 dark:placeholder:text-neutral-400',
              inputClassName
            )}
            value={draft}
            placeholder={tags.length === 0 ? placeholder : undefined}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => addTag(draft)}
            disabled={disabled || limitReached}
          />
        </div>
        {name &&
          tags.map((tag, index) => (
            <input
              key={`${tag}-${index}`}
              type="hidden"
              name={name}
              value={tag}
            />
          ))}
      </div>
    );
  }
);
TagsInput.displayName = 'TagsInput';

export { TagsInput };
