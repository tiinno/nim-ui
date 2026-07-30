'use client';
import { useState } from 'react';
import {
  Button,
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableFooter,
  DataTableRow,
  DataTableHead,
  DataTableCell,
  Skeleton,
} from '@nim-ui/components';

/**
 * DataTable demos live in single React islands because Astro renders
 * nested MDX components as separate roots — `<tr>`/`<td>` emitted outside
 * a real `<table>` get stripped by the browser.
 */
export function DataTableBasic() {
  return (
    <DataTable>
      <DataTableHeader>
        <DataTableRow>
          <DataTableHead>Name</DataTableHead>
          <DataTableHead>Email</DataTableHead>
          <DataTableHead>Role</DataTableHead>
        </DataTableRow>
      </DataTableHeader>
      <DataTableBody>
        <DataTableRow>
          <DataTableCell>Alice Johnson</DataTableCell>
          <DataTableCell>alice@example.com</DataTableCell>
          <DataTableCell>Admin</DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableCell>Bob Smith</DataTableCell>
          <DataTableCell>bob@example.com</DataTableCell>
          <DataTableCell>Editor</DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableCell>Carol Davis</DataTableCell>
          <DataTableCell>carol@example.com</DataTableCell>
          <DataTableCell>Viewer</DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  );
}

const SHIPMENTS = [
  { id: 'SHP-100248', customer: 'Northwind Traders', hub: 'Rotterdam DC', status: 'In transit', items: 12, total: '$4,820.00' },
  { id: 'SHP-100249', customer: 'Contoso Industrial', hub: 'Felixstowe DC', status: 'Awaiting pickup', items: 3, total: '$612.40' },
  { id: 'SHP-100250', customer: 'Fabrikam Logistics', hub: 'Rotterdam DC', status: 'Delivered', items: 27, total: '$11,306.75' },
];

/**
 * Toggling demo for DataTable's `loading` prop. The transition is the point, so
 * it needs real state and therefore a client component (a live
 * `<ComponentPreview>` child cannot take a function prop across the RSC
 * boundary).
 *
 * Deliberately wide enough to overflow the docs' preview column: the live
 * region is `sr-only`, i.e. absolutely positioned inside the table's own
 * `overflow-auto` scroller, so a horizontally scrolling table is the case worth
 * exporting and measuring.
 *
 * Note the shape — the table is mounted unconditionally and `loading` flips.
 * The skeleton rows are written out per column, one Skeleton per cell, because
 * `DataTable` does not know its own column count and a `<div>` cannot be a
 * direct child of `<tbody>` or `<tr>`.
 */
export function DataTableLoading() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full min-w-0 space-y-4">
      <DataTable loading={loading} loadingLabel="Loading shipments" aria-label="Shipments">
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead className="whitespace-nowrap">Shipment</DataTableHead>
            <DataTableHead className="whitespace-nowrap">Customer</DataTableHead>
            <DataTableHead className="whitespace-nowrap">Hub</DataTableHead>
            <DataTableHead className="whitespace-nowrap">Status</DataTableHead>
            <DataTableHead className="whitespace-nowrap text-right">Items</DataTableHead>
            <DataTableHead className="whitespace-nowrap text-right">Total</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {loading
            ? [0, 1, 2].map((row) => (
                <DataTableRow key={row}>
                  <DataTableCell>
                    <Skeleton className="h-4 w-24" />
                  </DataTableCell>
                  <DataTableCell>
                    <Skeleton className="h-4 w-36" />
                  </DataTableCell>
                  <DataTableCell>
                    <Skeleton className="h-4 w-28" />
                  </DataTableCell>
                  <DataTableCell>
                    <Skeleton className="h-4 w-20" />
                  </DataTableCell>
                  <DataTableCell>
                    <Skeleton className="ml-auto h-4 w-8" />
                  </DataTableCell>
                  <DataTableCell>
                    <Skeleton className="ml-auto h-4 w-20" />
                  </DataTableCell>
                </DataTableRow>
              ))
            : SHIPMENTS.map((shipment) => (
                <DataTableRow key={shipment.id}>
                  <DataTableCell className="whitespace-nowrap font-medium">{shipment.id}</DataTableCell>
                  <DataTableCell className="whitespace-nowrap">{shipment.customer}</DataTableCell>
                  <DataTableCell className="whitespace-nowrap">{shipment.hub}</DataTableCell>
                  <DataTableCell className="whitespace-nowrap">{shipment.status}</DataTableCell>
                  <DataTableCell className="whitespace-nowrap text-right">{shipment.items}</DataTableCell>
                  <DataTableCell className="whitespace-nowrap text-right">{shipment.total}</DataTableCell>
                </DataTableRow>
              ))}
        </DataTableBody>
      </DataTable>

      <Button size="sm" variant="outline" onClick={() => setLoading((v) => !v)}>
        {loading ? 'Finish loading' : 'Load again'}
      </Button>
    </div>
  );
}

export function DataTableWithFooter() {
  return (
    <DataTable>
      <DataTableHeader>
        <DataTableRow>
          <DataTableHead>Product</DataTableHead>
          <DataTableHead>Qty</DataTableHead>
          <DataTableHead>Price</DataTableHead>
        </DataTableRow>
      </DataTableHeader>
      <DataTableBody>
        <DataTableRow>
          <DataTableCell>Widget A</DataTableCell>
          <DataTableCell>3</DataTableCell>
          <DataTableCell>$30.00</DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableCell>Widget B</DataTableCell>
          <DataTableCell>1</DataTableCell>
          <DataTableCell>$45.00</DataTableCell>
        </DataTableRow>
      </DataTableBody>
      <DataTableFooter>
        <DataTableRow>
          <DataTableCell>Total</DataTableCell>
          <DataTableCell>4</DataTableCell>
          <DataTableCell>$75.00</DataTableCell>
        </DataTableRow>
      </DataTableFooter>
    </DataTable>
  );
}
