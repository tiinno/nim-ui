import * as React from 'react';
import { cn } from '../lib/utils';

export type FileUploadRejectReason = 'accept' | 'max-size' | 'max-files';

export interface FileUploadRejection {
  file: File;
  reason: FileUploadRejectReason;
}

export interface FileUploadProps {
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  onReject?: (rejections: FileUploadRejection[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  dropzoneClassName?: string;
  id?: string;
  name?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

const matchesAccept = (file: File, accept?: string) => {
  if (!accept) return true;

  return accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) {
        return file.name.toLowerCase().endsWith(rule.toLowerCase());
      }

      if (rule.endsWith('/*')) {
        return file.type.startsWith(rule.slice(0, -1));
      }

      return file.type === rule;
    });
};

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      value,
      defaultValue = [],
      onChange,
      onReject,
      accept,
      multiple = false,
      maxFiles,
      maxSize,
      disabled,
      className,
      dropzoneClassName,
      id,
      name,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const files = value ?? internalValue;

    const commit = (nextFiles: File[]) => {
      if (value === undefined) setInternalValue(nextFiles);
      onChange?.(nextFiles);
    };

    const addFiles = (incomingFiles: File[]) => {
      if (disabled) return;

      const accepted: File[] = [];
      const rejected: FileUploadRejection[] = [];
      const existingCount = multiple ? files.length : 0;
      const maxCount = maxFiles ?? (multiple ? Infinity : 1);

      for (const file of incomingFiles) {
        if (!matchesAccept(file, accept)) {
          rejected.push({ file, reason: 'accept' });
          continue;
        }

        if (maxSize !== undefined && file.size > maxSize) {
          rejected.push({ file, reason: 'max-size' });
          continue;
        }

        if (existingCount + accepted.length >= maxCount) {
          rejected.push({ file, reason: 'max-files' });
          continue;
        }

        accepted.push(file);
      }

      if (accepted.length > 0) {
        commit(multiple ? [...files, ...accepted] : [accepted[0]!]);
      }

      if (rejected.length > 0) {
        onReject?.(rejected);
      }
    };

    const removeFile = (index: number) => {
      commit(files.filter((_, fileIndex) => fileIndex !== index));
    };

    return (
      <div className={cn('w-full space-y-2', className)}>
        <label
          htmlFor={inputId}
          className={cn(
            'flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-white px-4 py-5 text-center shadow-control transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-within:ring-2 focus-within:ring-primary-400 focus-within:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-800',
            disabled && 'cursor-not-allowed opacity-50',
            dropzoneClassName
          )}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(Array.from(event.dataTransfer.files));
          }}
        >
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="file"
            className="sr-only"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
              event.currentTarget.value = '';
            }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3 h-6 w-6 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          >
            <path d="M12 3v12" />
            <path d="m17 8-5-5-5 5" />
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          </svg>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Drop files here or browse
          </span>
          <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {[
              accept ? accept.replaceAll(',', ', ') : undefined,
              maxSize ? `up to ${formatBytes(maxSize)}` : undefined,
              maxFiles ? `${maxFiles} file${maxFiles === 1 ? '' : 's'} max` : undefined,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </label>
        {files.length > 0 && (
          <ul className="space-y-1.5" aria-label="Selected files">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-neutral-900 dark:text-neutral-100">
                    {file.name}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatBytes(file.size)}
                  </span>
                </span>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <svg
                    className="h-4 w-4"
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
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
FileUpload.displayName = 'FileUpload';

export { FileUpload };
