import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * DataTable component for displaying tabular data
 *
 * @example
 * // Basic table
 * <DataTable>
 *   <DataTableHeader>
 *     <DataTableRow>
 *       <DataTableHead>Name</DataTableHead>
 *       <DataTableHead>Status</DataTableHead>
 *     </DataTableRow>
 *   </DataTableHeader>
 *   <DataTableBody>
 *     <DataTableRow>
 *       <DataTableCell>John Doe</DataTableCell>
 *       <DataTableCell>Active</DataTableCell>
 *     </DataTableRow>
 *   </DataTableBody>
 * </DataTable>
 *
 * @example
 * // Table with footer
 * <DataTable>
 *   <DataTableHeader>
 *     <DataTableRow>
 *       <DataTableHead>Product</DataTableHead>
 *       <DataTableHead>Price</DataTableHead>
 *     </DataTableRow>
 *   </DataTableHeader>
 *   <DataTableBody>
 *     <DataTableRow>
 *       <DataTableCell>Item 1</DataTableCell>
 *       <DataTableCell>$100</DataTableCell>
 *     </DataTableRow>
 *   </DataTableBody>
 *   <DataTableFooter>
 *     <DataTableRow>
 *       <DataTableCell>Total</DataTableCell>
 *       <DataTableCell>$100</DataTableCell>
 *     </DataTableRow>
 *   </DataTableFooter>
 * </DataTable>
 *
 * @example
 * // Loading — the table owns the announcement, the caller owns the rows
 * <DataTable loading={isLoading} loadingLabel="Loading orders">
 *   <DataTableHeader>
 *     <DataTableRow>
 *       <DataTableHead>Order</DataTableHead>
 *       <DataTableHead>Total</DataTableHead>
 *     </DataTableRow>
 *   </DataTableHeader>
 *   <DataTableBody>
 *     {isLoading
 *       ? [0, 1, 2].map((i) => (
 *           <DataTableRow key={i}>
 *             <DataTableCell><Skeleton className="h-4 w-24" /></DataTableCell>
 *             <DataTableCell><Skeleton className="h-4 w-16" /></DataTableCell>
 *           </DataTableRow>
 *         ))
 *       : orders.map((o) => (
 *           <DataTableRow key={o.id}>
 *             <DataTableCell>{o.ref}</DataTableCell>
 *             <DataTableCell>{o.total}</DataTableCell>
 *           </DataTableRow>
 *         ))}
 *   </DataTableBody>
 * </DataTable>
 */

const dataTableVariants = cva(
  'w-full caption-bottom border-collapse text-sm tabular-nums',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface DataTableProps
  extends React.TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof dataTableVariants> {
  /**
   * Whether the table body is still loading.
   *
   * Omit the prop entirely to opt out: no live region is rendered and no
   * `aria-busy` is written, so a table that never loads keeps byte-identical
   * DOM. Passing `false` opts *in* — the region mounts empty, which is what
   * makes the later text change an announcement rather than an insertion.
   *
   * `DataTable` owns only the announcement and `aria-busy`. It has no
   * `columns` prop and does not introspect its children, so it cannot know how
   * many placeholder cells a row needs — **you** render the skeleton rows, one
   * `<Skeleton />` per `DataTableCell`, which is also what buys per-column
   * widths. A `<div>` (and therefore `Skeleton` or `SkeletonGroup`) is not
   * valid content for `<tbody>` or `<tr>`; the HTML parser foster-parents it
   * out of the table entirely, so it must always sit inside a cell.
   */
  loading?: boolean;
  /**
   * Live-region text held while `loading`.
   *
   * Same default as `SkeletonGroup.label` (`'Loading'`) — the two must not
   * drift. The *name* follows `Button.loadingLabel` rather than
   * `SkeletonGroup.label` because this component already has a `label`-shaped
   * neighbourhood of table captions and `aria-label`; do not "align" it by
   * changing the default.
   *
   * A default is safe here for the same reason it is safe on `SkeletonGroup`
   * and unsafe on `Button`: this span contributes to no element's accessible
   * name.
   *
   * @default 'Loading'
   */
  loadingLabel?: string;
  /**
   * Live-region text after loading finishes.
   *
   * Left `undefined` (renders `''`) on purpose: a refetching dashboard would
   * announce "Loaded" on every poll. Set it only when the completion genuinely
   * needs to be spoken.
   *
   * @default undefined
   */
  loadedLabel?: string;
}

/**
 * Two things about the loading shape are load-bearing. Please do not
 * "simplify" them:
 *
 * 1. **The live region is a *sibling* of the `aria-busy` host, never a
 *    descendant** — the same invariant `SkeletonGroup` documents. `aria-busy`
 *    tells assistive tech to *defer* announcements for its own subtree, which
 *    is exactly the window we are trying to announce in. Both the region and
 *    the table sit inside the existing scroller, so nothing new is nested
 *    inside the table's content model.
 * 2. **`aria-busy` is written AFTER the prop spread**, like `Button`'s and
 *    unlike `Skeleton`'s `aria-hidden`: here `loading` IS the semantic
 *    contract, so a consumer `aria-busy={false}` must not be able to report
 *    *idle* while the caller is showing placeholder rows. The `||` falls
 *    through to the consumer's own value when not loading, so
 *    `<DataTable aria-busy>` keeps working exactly as before.
 *
 * Mount `DataTable` unconditionally and flip `loading`.
 * `{isLoading ? <Spinner /> : <DataTable … />}` unmounts the region together
 * with its text, which screen readers handle inconsistently — and because the
 * region is invisible in consumer code there is no visual cue that it broke.
 */
const DataTable = React.forwardRef<HTMLTableElement, DataTableProps>(
  ({ className, loading, loadingLabel = 'Loading', loadedLabel, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      {loading !== undefined && (
        <span role="status" className="sr-only">
          {loading ? loadingLabel : (loadedLabel ?? '')}
        </span>
      )}
      <table
        ref={ref}
        className={cn(dataTableVariants(), className)}
        {...props}
        // After the spread, deliberately — see note 2 above.
        aria-busy={loading || props['aria-busy']}
      />
    </div>
  )
);
DataTable.displayName = 'DataTable';

const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-neutral-50 dark:bg-neutral-900/50 [&_tr]:border-b', className)} {...props} />
));
DataTableHeader.displayName = 'DataTableHeader';

const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
DataTableBody.displayName = 'DataTableBody';

const DataTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-neutral-200 bg-neutral-50 font-medium dark:border-neutral-800 dark:bg-neutral-900', className)}
    {...props}
  />
));
DataTableFooter.displayName = 'DataTableFooter';

const DataTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-neutral-200 transition-colors hover:bg-neutral-50 data-[state=selected]:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900 dark:data-[state=selected]:bg-neutral-800',
      className
    )}
    {...props}
  />
));
DataTableRow.displayName = 'DataTableRow';

const DataTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-9 px-3 text-left align-middle text-xs font-semibold text-neutral-600 dark:text-neutral-400 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
DataTableHead.displayName = 'DataTableHead';

const DataTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-3 py-2.5 align-middle text-neutral-900 dark:text-neutral-100 [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
DataTableCell.displayName = 'DataTableCell';

export {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableFooter,
  DataTableRow,
  DataTableHead,
  DataTableCell,
  dataTableVariants,
};
