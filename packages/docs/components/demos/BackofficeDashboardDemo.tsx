'use client';
import {
  Badge,
  BulkActionBar,
  BulkActionBarActions,
  BulkActionBarClear,
  BulkActionBarMeta,
  BulkActionBarSelection,
  Button,
  Card,
  CardContent,
  CardHeader,
  DataCard,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataToolbar,
  DataToolbarActions,
  DataToolbarFilters,
  DataToolbarMeta,
  DataToolbarSearch,
  FilterSummary,
  FilterSummaryClear,
  FilterSummaryItem,
  FilterSummaryList,
  Input,
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
  StatusPill,
} from '@nim-ui/components';

const orders = [
  {
    id: 'ORD-4821',
    customer: 'Northwind Supply',
    status: 'Review',
    statusTone: 'warning',
    risk: 'High',
    eta: 'Today, 16:30',
  },
  {
    id: 'ORD-4819',
    customer: 'Atlas Retail',
    status: 'Picking',
    statusTone: 'processing',
    risk: 'Low',
    eta: 'Tomorrow',
  },
  {
    id: 'ORD-4815',
    customer: 'Metro Goods',
    status: 'Packed',
    statusTone: 'success',
    risk: 'Medium',
    eta: 'Today, 18:00',
  },
] as const;

const activeFilters = [
  { label: 'Status', value: 'Open' },
  { label: 'Risk', value: 'High' },
  { label: 'Warehouse', value: 'BKK-02' },
] as const;

const clearSelection = () => undefined;
const clearFilter = () => undefined;
const clearFilters = () => undefined;

const riskVariant = {
  High: 'destructive',
  Medium: 'warning',
  Low: 'success',
} as const;

export function BackofficeDashboardDemo() {
  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50">
      <PageHeader className="border-neutral-200 dark:border-neutral-800">
        <div className="space-y-2">
          <PageHeaderMeta>Operations cockpit</PageHeaderMeta>
          <PageHeaderTitle>Order exceptions</PageHeaderTitle>
          <PageHeaderDescription>
            Triage fulfillment risk, export the queue, and push urgent orders to the floor.
          </PageHeaderDescription>
        </div>
        <PageHeaderActions aria-label="Order actions">
          <Button variant="outline" size="sm">Export</Button>
          <Button variant="primary" size="sm">Create order</Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <DataCard value="184" label="Open orders" description="Across all warehouses" trend="+12" trendDirection="up" />
        <DataCard value="17" label="Need review" description="SLA risk within 4 hours" trend="+5" trendDirection="down" />
        <DataCard value="96.4%" label="On-time rate" description="Rolling 7 days" trend="+1.8%" trendDirection="up" />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">Exception queue</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Focused list for the operations shift lead.</p>
          </div>
        </CardHeader>
        <CardContent>
          <DataToolbar aria-label="Order table controls" className="mb-4">
            <DataToolbarSearch>
              <Input className="w-full sm:w-64" placeholder="Search orders" aria-label="Search orders" />
              <DataToolbarMeta>184 results</DataToolbarMeta>
            </DataToolbarSearch>
            <DataToolbarFilters aria-label="Order filters">
              <Button variant="outline" size="sm">Open only</Button>
              <Button variant="outline" size="sm">High risk</Button>
            </DataToolbarFilters>
            <DataToolbarActions aria-label="Order table actions">
              <Button variant="outline" size="sm">Bulk assign</Button>
            </DataToolbarActions>
          </DataToolbar>
          <FilterSummary aria-label="Active order filters" className="mb-4">
            <FilterSummaryList>
              {activeFilters.map((filter) => (
                <FilterSummaryItem
                  key={`${filter.label}-${filter.value}`}
                  label={filter.label}
                  value={filter.value}
                  onRemove={clearFilter}
                />
              ))}
            </FilterSummaryList>
            <FilterSummaryClear onClear={clearFilters} />
          </FilterSummary>
          <BulkActionBar aria-label="Selected order actions" className="mb-4">
            <div className="flex flex-col gap-1">
              <BulkActionBarSelection count={3} label="orders selected" />
              <BulkActionBarMeta>High-risk review queue</BulkActionBarMeta>
            </div>
            <BulkActionBarActions aria-label="Bulk order actions">
              <Button variant="outline" size="sm">Assign</Button>
              <Button variant="primary" size="sm">Approve</Button>
            </BulkActionBarActions>
            <BulkActionBarActions aria-label="Danger actions" variant="destructive">
              <Button variant="destructive" size="sm">Cancel</Button>
            </BulkActionBarActions>
            <BulkActionBarClear onClear={clearSelection} />
          </BulkActionBar>
          <DataTable>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Order</DataTableHead>
                <DataTableHead>Customer</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead>Risk</DataTableHead>
                <DataTableHead>ETA</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {orders.map((order) => (
                <DataTableRow key={order.id}>
                  <DataTableCell className="font-medium">{order.id}</DataTableCell>
                  <DataTableCell>{order.customer}</DataTableCell>
                  <DataTableCell>
                    <StatusPill status={order.statusTone} size="sm" pulse={order.statusTone === 'processing'}>
                      {order.status}
                    </StatusPill>
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant={riskVariant[order.risk as keyof typeof riskVariant]} size="sm">
                      {order.risk}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell>{order.eta}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}
