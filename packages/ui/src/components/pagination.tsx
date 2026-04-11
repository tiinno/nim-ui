import * as React from 'react';
import { cn } from '../lib/utils';
import { buttonVariants } from './button';

/**
 * Pagination component for navigating through pages of content.
 *
 * Composable building blocks (shadcn-style). Works with any routing
 * library by rendering anchor elements or buttons.
 *
 * @example
 * ```tsx
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem>
 *       <PaginationPrevious href="?page=1" />
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink href="?page=1">1</PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink href="?page=2" isActive>2</PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationEllipsis />
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationNext href="?page=3" />
 *     </PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 * ```
 *
 * @example
 * ```tsx
 * // Using the usePagination helper
 * const pages = usePagination({ totalPages: 20, currentPage: 5 });
 * return (
 *   <Pagination>
 *     <PaginationContent>
 *       {pages.map((page, i) => (
 *         <PaginationItem key={i}>
 *           {page === 'ellipsis' ? (
 *             <PaginationEllipsis />
 *           ) : (
 *             <PaginationLink isActive={page === currentPage}>
 *               {page}
 *             </PaginationLink>
 *           )}
 *         </PaginationItem>
 *       ))}
 *     </PaginationContent>
 *   </Pagination>
 * );
 * ```
 */

// ---------------------------------------------------------------------------
// usePagination hook
// ---------------------------------------------------------------------------

export interface UsePaginationOptions {
  /** Total number of pages. */
  totalPages: number;
  /** Current page (1-indexed). */
  currentPage: number;
  /** Number of sibling pages on each side of the current page. @default 1 */
  siblingCount?: number;
  /** Always show first and last page. @default true */
  showEdges?: boolean;
}

export type PaginationItemValue = number | 'ellipsis';

/**
 * Compute a pagination range with first/last pages and ellipsis markers.
 *
 * @example
 * usePagination({ totalPages: 20, currentPage: 10, siblingCount: 1 })
 * // => [1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]
 */
export function usePagination({
  totalPages,
  currentPage,
  siblingCount = 1,
  showEdges = true,
}: UsePaginationOptions): PaginationItemValue[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const range = (start: number, end: number): number[] =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // When total pages is small enough to show everything
  const totalSlots = siblingCount * 2 + (showEdges ? 5 : 3);
  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = showEdges ? leftSibling > 2 : leftSibling > 1;
  const showRightEllipsis = showEdges
    ? rightSibling < totalPages - 1
    : rightSibling < totalPages;

  const items: PaginationItemValue[] = [];

  if (showEdges) {
    items.push(1);
  }
  if (showLeftEllipsis) {
    items.push('ellipsis');
  } else if (showEdges && leftSibling > 1) {
    // Fill gap when no ellipsis needed
    for (let p = 2; p < leftSibling; p++) items.push(p);
  }

  for (const p of range(leftSibling, rightSibling)) {
    if (showEdges && (p === 1 || p === totalPages)) continue;
    items.push(p);
  }

  if (showRightEllipsis) {
    items.push('ellipsis');
  } else if (showEdges && rightSibling < totalPages) {
    for (let p = rightSibling + 1; p < totalPages; p++) items.push(p);
  }
  if (showEdges) {
    items.push(totalPages);
  }

  return items;
}

// ---------------------------------------------------------------------------
// Pagination root (nav)
// ---------------------------------------------------------------------------

export interface PaginationProps extends React.ComponentProps<'nav'> {}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
);
Pagination.displayName = 'Pagination';

// ---------------------------------------------------------------------------
// PaginationContent (ul)
// ---------------------------------------------------------------------------

export interface PaginationContentProps extends React.ComponentProps<'ul'> {}

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  PaginationContentProps
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

// ---------------------------------------------------------------------------
// PaginationItem (li)
// ---------------------------------------------------------------------------

export interface PaginationItemProps extends React.ComponentProps<'li'> {}

const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
);
PaginationItem.displayName = 'PaginationItem';

// ---------------------------------------------------------------------------
// PaginationLink
// ---------------------------------------------------------------------------

export interface PaginationLinkProps extends React.ComponentProps<'a'> {
  /** Mark this page as the active/current page. */
  isActive?: boolean;
  /** Size of the link button. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, size = 'md', ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        'min-w-9 cursor-pointer',
        className
      )}
      {...props}
    />
  )
);
PaginationLink.displayName = 'PaginationLink';

// ---------------------------------------------------------------------------
// PaginationPrevious
// ---------------------------------------------------------------------------

export interface PaginationPreviousProps extends PaginationLinkProps {}

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  PaginationPreviousProps
>(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
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
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
    {children ?? <span>Previous</span>}
  </PaginationLink>
));
PaginationPrevious.displayName = 'PaginationPrevious';

// ---------------------------------------------------------------------------
// PaginationNext
// ---------------------------------------------------------------------------

export interface PaginationNextProps extends PaginationLinkProps {}

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  PaginationNextProps
>(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    {children ?? <span>Next</span>}
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
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </PaginationLink>
));
PaginationNext.displayName = 'PaginationNext';

// ---------------------------------------------------------------------------
// PaginationEllipsis
// ---------------------------------------------------------------------------

export interface PaginationEllipsisProps extends React.ComponentProps<'span'> {}

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  PaginationEllipsisProps
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    className={cn(
      'flex h-9 w-9 items-center justify-center text-neutral-500 dark:text-neutral-400',
      className
    )}
    {...props}
  >
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
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
    <span className="sr-only">More pages</span>
  </span>
));
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
