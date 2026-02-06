import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableFooter,
  DataTableRow,
  DataTableHead,
  DataTableCell,
} from './data-table';

describe('DataTable', () => {
  describe('Basic Rendering', () => {
    it('renders table with proper structure', () => {
      render(
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Name</DataTableHead>
              <DataTableHead>Email</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>John Doe</DataTableCell>
              <DataTableCell>john@example.com</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders empty table', () => {
      render(<DataTable />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Table Structure', () => {
    it('renders header section correctly', () => {
      render(
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Column 1</DataTableHead>
              <DataTableHead>Column 2</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
        </DataTable>
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
      expect(headers[0]).toHaveTextContent('Column 1');
      expect(headers[1]).toHaveTextContent('Column 2');
    });

    it('renders body section correctly', () => {
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Cell 1</DataTableCell>
              <DataTableCell>Cell 2</DataTableCell>
            </DataTableRow>
            <DataTableRow>
              <DataTableCell>Cell 3</DataTableCell>
              <DataTableCell>Cell 4</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(4);
    });

    it('renders footer section correctly', () => {
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Data</DataTableCell>
            </DataTableRow>
          </DataTableBody>
          <DataTableFooter>
            <DataTableRow>
              <DataTableCell>Footer</DataTableCell>
            </DataTableRow>
          </DataTableFooter>
        </DataTable>
      );

      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Multiple Rows', () => {
    it('renders multiple rows in body', () => {
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Row 1</DataTableCell>
            </DataTableRow>
            <DataTableRow>
              <DataTableCell>Row 2</DataTableCell>
            </DataTableRow>
            <DataTableRow>
              <DataTableCell>Row 3</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3);
    });

    it('handles complex table with all sections', () => {
      render(
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Product</DataTableHead>
              <DataTableHead>Price</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Item 1</DataTableCell>
              <DataTableCell>$100</DataTableCell>
            </DataTableRow>
            <DataTableRow>
              <DataTableCell>Item 2</DataTableCell>
              <DataTableCell>$200</DataTableCell>
            </DataTableRow>
          </DataTableBody>
          <DataTableFooter>
            <DataTableRow>
              <DataTableCell>Total</DataTableCell>
              <DataTableCell>$300</DataTableCell>
            </DataTableRow>
          </DataTableFooter>
        </DataTable>
      );

      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct table role', () => {
      render(<DataTable />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('has correct row roles', () => {
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Data</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      expect(screen.getByRole('row')).toBeInTheDocument();
    });

    it('has correct cell roles', () => {
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Data 1</DataTableCell>
              <DataTableCell>Data 2</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(2);
    });

    it('has correct columnheader roles', () => {
      render(
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Header 1</DataTableHead>
              <DataTableHead>Header 2</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
        </DataTable>
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
    });

    it('supports aria-label on table', () => {
      render(<DataTable aria-label="Users table" />);
      expect(screen.getByLabelText('Users table')).toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('supports data-state on rows', () => {
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow data-state="selected">
              <DataTableCell>Selected Row</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      const row = screen.getByRole('row');
      expect(row).toHaveAttribute('data-state', 'selected');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with table styles', () => {
      render(<DataTable className="custom-table" />);
      expect(screen.getByRole('table')).toHaveClass('custom-table');
    });

    it('merges custom className with header styles', () => {
      render(
        <DataTable>
          <DataTableHeader className="custom-header">
            <DataTableRow>
              <DataTableHead>Header</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
        </DataTable>
      );

      const thead = screen.getByRole('columnheader').parentElement?.parentElement;
      expect(thead).toHaveClass('custom-header');
    });

    it('merges custom className with row styles', () => {
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow className="custom-row">
              <DataTableCell>Data</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      expect(screen.getByRole('row')).toHaveClass('custom-row');
    });

    it('merges custom className with cell styles', () => {
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell className="custom-cell">Data</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      expect(screen.getByRole('cell')).toHaveClass('custom-cell');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to table element', () => {
      const ref = { current: null };
      render(<DataTable ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTableElement);
    });

    it('forwards ref to header element', () => {
      const ref = { current: null };
      render(
        <DataTable>
          <DataTableHeader ref={ref}>
            <DataTableRow>
              <DataTableHead>Header</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
        </DataTable>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
    });

    it('forwards ref to row element', () => {
      const ref = { current: null };
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow ref={ref}>
              <DataTableCell>Data</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableRowElement);
    });

    it('forwards ref to cell element', () => {
      const ref = { current: null };
      render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell ref={ref}>Data</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
    });
  });

  describe('Semantic HTML', () => {
    it('uses proper thead element', () => {
      const { container } = render(
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Header</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
        </DataTable>
      );

      expect(container.querySelector('thead')).toBeInTheDocument();
    });

    it('uses proper tbody element', () => {
      const { container } = render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Data</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('uses proper tfoot element', () => {
      const { container } = render(
        <DataTable>
          <DataTableFooter>
            <DataTableRow>
              <DataTableCell>Footer</DataTableCell>
            </DataTableRow>
          </DataTableFooter>
        </DataTable>
      );

      expect(container.querySelector('tfoot')).toBeInTheDocument();
    });

    it('uses proper th elements in header', () => {
      const { container } = render(
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Header</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
        </DataTable>
      );

      expect(container.querySelector('th')).toBeInTheDocument();
    });

    it('uses proper td elements in body', () => {
      const { container } = render(
        <DataTable>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Data</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );

      expect(container.querySelector('td')).toBeInTheDocument();
    });
  });
});
