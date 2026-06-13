import { Children, isValidElement, type ReactNode } from 'react';

/**
 * PreviewCode — marker สำหรับส่วน code ภายใน ComponentPreview
 * (แทน <Fragment slot="code"> ของ Astro)
 */
export function PreviewCode({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

interface ComponentPreviewProps {
  title?: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function ComponentPreview({
  title,
  description,
  className = '',
  children,
}: ComponentPreviewProps) {
  const items = Children.toArray(children);
  const code = items.filter((c) => isValidElement(c) && c.type === PreviewCode);
  const demo = items.filter((c) => !(isValidElement(c) && c.type === PreviewCode));

  return (
    <div className="not-prose my-8 max-w-full overflow-hidden">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold tracking-normal text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-neutral-200 shadow-soft dark:border-neutral-800">
        <div className={`bg-white p-4 dark:bg-neutral-950 sm:p-10 ${className}`}>
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-4">
            {demo}
          </div>
        </div>

        {code.length > 0 && (
          <details className="group min-w-0 max-w-full">
            <summary className="cursor-pointer list-none border-t border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 transition-transform group-open:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                View Code
              </span>
            </summary>
            <div className="max-w-full overflow-x-auto border-t border-neutral-200 p-4 dark:border-neutral-800 [&_pre]:m-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto">
              {code}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
