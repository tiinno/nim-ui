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
 */

const dataTableVariants = cva(
  'w-full caption-bottom text-sm border-collapse',
  {
    variants: {},
    defaultVariants: {},
  }
);

export interface DataTableProps
  extends React.TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof dataTableVariants> {}

const DataTable = React.forwardRef<HTMLTableElement, DataTableProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(dataTableVariants(), className)}
        {...props}
      />
    </div>
  )
);
DataTable.displayName = 'DataTable';

const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
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
    className={cn('border-t bg-neutral-50 font-medium dark:bg-neutral-800', className)}
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
      'border-b border-neutral-200 transition-colors hover:bg-neutral-50 data-[state=selected]:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:data-[state=selected]:bg-neutral-800',
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
      'h-12 px-4 text-left align-middle font-medium text-neutral-600 dark:text-neutral-400 [&:has([role=checkbox])]:pr-0',
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
    className={cn('p-4 align-middle text-neutral-900 dark:text-neutral-100 [&:has([role=checkbox])]:pr-0', className)}
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
