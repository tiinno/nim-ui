'use client';
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableFooter,
  DataTableRow,
  DataTableHead,
  DataTableCell,
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
