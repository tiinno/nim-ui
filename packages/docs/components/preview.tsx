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
  /** Render the demo edge-to-edge without canvas padding/dots (full templates) */
  fullBleed?: boolean;
  children?: ReactNode;
}

export function ComponentPreview({
  title,
  description,
  className = '',
  fullBleed = false,
  children,
}: ComponentPreviewProps) {
  const items = Children.toArray(children);
  const code = items.filter((c) => isValidElement(c) && c.type === PreviewCode);
  const demo = items.filter((c) => !(isValidElement(c) && c.type === PreviewCode));

  return (
    <figure className="not-prose my-8 max-w-full">
      {/* Section headings already name each example — keep the title for
          assistive tech without repeating it visually. */}
      {(title || description) && (
        <figcaption className="sr-only">
          {title}
          {description ? ` — ${description}` : ''}
        </figcaption>
      )}

      <div className="min-w-0 max-w-full overflow-hidden rounded-xl border border-fd-border bg-white shadow-soft dark:bg-neutral-950">
        {fullBleed ? (
          <div className={`min-w-0 max-w-full ${className}`}>{demo}</div>
        ) : (
          <div
            className={`preview-canvas relative isolate flex min-h-36 min-w-0 max-w-full items-center justify-center overflow-x-auto p-6 sm:p-10 ${className}`}
          >
            <div className="flex w-full min-w-0 max-w-full flex-wrap items-center justify-center gap-4">
              {demo}
            </div>
          </div>
        )}

        {code.length > 0 && (
          <details className="group min-w-0 max-w-full">
            <summary className="flex cursor-pointer list-none items-center justify-between border-t border-fd-border bg-fd-muted px-4 py-2 transition-colors hover:bg-fd-accent [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-medium text-fd-muted-foreground transition-colors group-hover:text-fd-foreground">
                <svg
                  className="size-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="m16 18 6-6-6-6" />
                  <path d="m8 6-6 6 6 6" />
                </svg>
                Code
              </span>
              <svg
                className="size-3.5 text-fd-muted-foreground transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </summary>
            <div className="max-w-full overflow-x-auto border-t border-fd-border p-3 [&_pre]:m-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto">
              {code}
            </div>
          </details>
        )}
      </div>
    </figure>
  );
}
