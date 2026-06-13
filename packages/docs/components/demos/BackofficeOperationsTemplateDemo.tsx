'use client';
import {
  AdminShell,
  AdminShellBody,
  AdminShellHeader,
  AdminShellMain,
  AdminShellPanel,
  AdminShellSidebar,
  BulkActionBar,
  BulkActionBarActions,
  BulkActionBarClear,
  BulkActionBarMeta,
  BulkActionBarSelection,
  Button,
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
  MetricCard,
  MetricCardDelta,
  MetricCardDescription,
  MetricCardFooter,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardValue,
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
  RecordInspector,
  RecordInspectorBody,
  RecordInspectorDescription,
  RecordInspectorFooter,
  RecordInspectorHeader,
  RecordInspectorHeading,
  RecordInspectorMetadata,
  RecordInspectorMetadataItem,
  RecordInspectorMetadataLabel,
  RecordInspectorMetadataValue,
  RecordInspectorSection,
  RecordInspectorSectionDescription,
  RecordInspectorSectionHeader,
  RecordInspectorSectionTitle,
  RecordInspectorStatus,
  RecordInspectorTitle,
  SidebarNav,
  SidebarNavFooter,
  SidebarNavItem,
  SidebarNavList,
  SidebarNavSection,
  SidebarNavSectionTitle,
  StatusPill,
  ViewSwitcher,
  ViewSwitcherActions,
  ViewSwitcherItem,
} from '@nim-ui/components';

const orders = [
  {
    id: 'ORD-4821',
    customer: 'Northwind Supply',
    channel: 'B2B portal',
    status: 'Review',
    tone: 'warning',
    owner: 'Mina',
    eta: 'Today 16:30',
  },
  {
    id: 'ORD-4819',
    customer: 'Atlas Retail',
    channel: 'EDI',
    status: 'Picking',
    tone: 'processing',
    owner: 'Krit',
    eta: 'Tomorrow',
  },
  {
    id: 'ORD-4815',
    customer: 'Metro Goods',
    channel: 'Marketplace',
    status: 'Packed',
    tone: 'success',
    owner: 'Nok',
    eta: 'Today 18:00',
  },
] as const;

const filters = [
  { label: 'Queue', value: 'Needs review' },
  { label: 'Warehouse', value: 'BKK-02' },
  { label: 'SLA', value: '< 4h' },
] as const;

const noop = () => undefined;

export function BackofficeOperationsTemplateDemo() {
  return (
    <AdminShell
      density="compact"
      className="min-h-[760px] overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
    >
      <AdminShellBody className="min-h-[760px]">
        <AdminShellSidebar aria-label="Operations navigation" className="bg-neutral-950 text-neutral-50 dark:bg-neutral-950">
          <div className="border-b border-neutral-800 px-5 py-4">
            <p className="text-sm font-semibold tracking-normal text-white">Nim Ops</p>
            <p className="mt-1 text-xs text-neutral-400">Fulfillment control</p>
          </div>
          <SidebarNav aria-label="Primary">
            <SidebarNavSection>
              <SidebarNavSectionTitle>Operate</SidebarNavSectionTitle>
              <SidebarNavList>
                <SidebarNavItem href="#" active icon={<span>O</span>} badge="12">
                  Orders
                </SidebarNavItem>
                <SidebarNavItem href="#" icon={<span>I</span>}>Inventory</SidebarNavItem>
                <SidebarNavItem href="#" icon={<span>S</span>}>Shipments</SidebarNavItem>
              </SidebarNavList>
            </SidebarNavSection>
            <SidebarNavSection>
              <SidebarNavSectionTitle>Observe</SidebarNavSectionTitle>
              <SidebarNavList>
                <SidebarNavItem href="#" icon={<span>A</span>}>Audit log</SidebarNavItem>
                <SidebarNavItem href="#" icon={<span>R</span>}>Reports</SidebarNavItem>
              </SidebarNavList>
            </SidebarNavSection>
          </SidebarNav>
          <SidebarNavFooter className="border-neutral-800">
            <p className="text-xs text-neutral-400">Shift lead: Bangkok AM</p>
          </SidebarNavFooter>
        </AdminShellSidebar>

        <AdminShellPanel>
          <AdminShellHeader>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-950 dark:text-neutral-50">Operations workspace</p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">Orders, inventory, and shipment risk</p>
            </div>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">Create order</Button>
          </AdminShellHeader>

          <AdminShellMain className="space-y-5 bg-neutral-50 dark:bg-neutral-950">
            <PageHeader>
              <div className="space-y-2">
                <PageHeaderMeta>Exception command center</PageHeaderMeta>
                <PageHeaderTitle>Order review queue</PageHeaderTitle>
                <PageHeaderDescription>
                  Monitor at-risk fulfillment, switch queues, and resolve the selected order from one surface.
                </PageHeaderDescription>
              </div>
              <PageHeaderActions aria-label="Queue actions">
                <Button variant="outline" size="sm">Assign shift</Button>
                <Button size="sm">Approve batch</Button>
              </PageHeaderActions>
            </PageHeader>

            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard tone="warning" density="compact" aria-label="Review queue metric">
                <MetricCardHeader>
                  <MetricCardLabel>Needs review</MetricCardLabel>
                  <MetricCardDelta>+5</MetricCardDelta>
                </MetricCardHeader>
                <MetricCardValue>17</MetricCardValue>
                <MetricCardDescription>SLA risk within 4 hours</MetricCardDescription>
                <MetricCardFooter>
                  <span>Manual queue</span>
                  <span>Updated 2m ago</span>
                </MetricCardFooter>
              </MetricCard>
              <MetricCard tone="success" density="compact" aria-label="On time rate metric">
                <MetricCardHeader>
                  <MetricCardLabel>On-time rate</MetricCardLabel>
                  <MetricCardDelta>+1.8%</MetricCardDelta>
                </MetricCardHeader>
                <MetricCardValue>96.4%</MetricCardValue>
                <MetricCardDescription>Rolling 7 day fulfillment</MetricCardDescription>
                <MetricCardFooter>
                  <span>Target 95%</span>
                  <span>Healthy</span>
                </MetricCardFooter>
              </MetricCard>
              <MetricCard tone="info" density="compact" aria-label="Warehouse load metric">
                <MetricCardHeader>
                  <MetricCardLabel>Warehouse load</MetricCardLabel>
                  <MetricCardDelta tone="neutral">82%</MetricCardDelta>
                </MetricCardHeader>
                <MetricCardValue>BKK-02</MetricCardValue>
                <MetricCardDescription>Primary queue for this shift</MetricCardDescription>
                <MetricCardFooter>
                  <span>3 lanes active</span>
                  <span>12 blockers</span>
                </MetricCardFooter>
              </MetricCard>
            </div>

            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <section className="min-w-0 rounded-md border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <ViewSwitcher aria-label="Order queues" density="compact">
                    <ViewSwitcherItem value="all" count={184}>All</ViewSwitcherItem>
                    <ViewSwitcherItem value="review" selected count={17} meta="Manual">
                      Needs review
                    </ViewSwitcherItem>
                    <ViewSwitcherItem value="delayed" count={6}>Delayed</ViewSwitcherItem>
                    <ViewSwitcherItem value="failed" count={3}>Failed</ViewSwitcherItem>
                  </ViewSwitcher>
                  <ViewSwitcherActions aria-label="Saved view actions" className="ml-0 pl-0 lg:ml-auto lg:pl-2">
                    <Button variant="outline" size="sm">Save view</Button>
                  </ViewSwitcherActions>
                </div>

                <DataToolbar aria-label="Order table controls" className="mt-4">
                  <DataToolbarSearch>
                    <Input className="w-full sm:w-64" aria-label="Search orders" placeholder="Search orders" />
                    <DataToolbarMeta>17 orders</DataToolbarMeta>
                  </DataToolbarSearch>
                  <DataToolbarFilters aria-label="Order filters">
                    <Button variant="outline" size="sm">High risk</Button>
                    <Button variant="outline" size="sm">BKK-02</Button>
                  </DataToolbarFilters>
                  <DataToolbarActions aria-label="Order table actions">
                    <Button variant="outline" size="sm">Bulk assign</Button>
                  </DataToolbarActions>
                </DataToolbar>

                <FilterSummary aria-label="Active order filters" className="mt-3">
                  <FilterSummaryList>
                    {filters.map((filter) => (
                      <FilterSummaryItem
                        key={`${filter.label}-${filter.value}`}
                        label={filter.label}
                        value={filter.value}
                        onRemove={noop}
                      />
                    ))}
                  </FilterSummaryList>
                  <FilterSummaryClear onClear={noop} />
                </FilterSummary>

                <BulkActionBar aria-label="Selected order actions" className="mt-4">
                  <div className="flex flex-col gap-1">
                    <BulkActionBarSelection count={3} label="orders selected" />
                    <BulkActionBarMeta>Priority queue selection</BulkActionBarMeta>
                  </div>
                  <BulkActionBarActions aria-label="Bulk actions">
                    <Button variant="outline" size="sm">Assign</Button>
                    <Button size="sm">Approve</Button>
                  </BulkActionBarActions>
                  <BulkActionBarClear onClear={noop} />
                </BulkActionBar>

                <div className="mt-4 min-w-0">
                  <DataTable>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead>Order</DataTableHead>
                        <DataTableHead>Customer</DataTableHead>
                        <DataTableHead>Status</DataTableHead>
                        <DataTableHead>Owner</DataTableHead>
                        <DataTableHead>ETA</DataTableHead>
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      {orders.map((order) => (
                        <DataTableRow key={order.id} data-state={order.id === 'ORD-4821' ? 'selected' : undefined}>
                          <DataTableCell className="font-medium">{order.id}</DataTableCell>
                          <DataTableCell>
                            <div className="min-w-36">
                              <p className="font-medium">{order.customer}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">{order.channel}</p>
                            </div>
                          </DataTableCell>
                          <DataTableCell>
                            <StatusPill status={order.tone} size="sm" pulse={order.tone === 'processing'}>
                              {order.status}
                            </StatusPill>
                          </DataTableCell>
                          <DataTableCell>{order.owner}</DataTableCell>
                          <DataTableCell>{order.eta}</DataTableCell>
                        </DataTableRow>
                      ))}
                    </DataTableBody>
                  </DataTable>
                </div>
              </section>

              <RecordInspector aria-labelledby="selected-order-title" density="compact">
                <RecordInspectorHeader density="compact">
                  <RecordInspectorHeading>
                    <RecordInspectorTitle id="selected-order-title">ORD-4821</RecordInspectorTitle>
                    <RecordInspectorDescription>Northwind Supply · B2B portal</RecordInspectorDescription>
                  </RecordInspectorHeading>
                  <RecordInspectorStatus>
                    <StatusPill status="warning" size="sm">Review</StatusPill>
                  </RecordInspectorStatus>
                </RecordInspectorHeader>
                <RecordInspectorBody>
                  <RecordInspectorSection density="compact">
                    <RecordInspectorSectionHeader>
                      <RecordInspectorSectionTitle>Fulfillment decision</RecordInspectorSectionTitle>
                      <RecordInspectorSectionDescription>
                        Address mismatch requires manual approval before pick release.
                      </RecordInspectorSectionDescription>
                    </RecordInspectorSectionHeader>
                    <RecordInspectorMetadata columns={2}>
                      <RecordInspectorMetadataItem>
                        <RecordInspectorMetadataLabel>Risk</RecordInspectorMetadataLabel>
                        <RecordInspectorMetadataValue>High</RecordInspectorMetadataValue>
                      </RecordInspectorMetadataItem>
                      <RecordInspectorMetadataItem>
                        <RecordInspectorMetadataLabel>Owner</RecordInspectorMetadataLabel>
                        <RecordInspectorMetadataValue>Mina</RecordInspectorMetadataValue>
                      </RecordInspectorMetadataItem>
                      <RecordInspectorMetadataItem>
                        <RecordInspectorMetadataLabel>Warehouse</RecordInspectorMetadataLabel>
                        <RecordInspectorMetadataValue>BKK-02</RecordInspectorMetadataValue>
                      </RecordInspectorMetadataItem>
                      <RecordInspectorMetadataItem>
                        <RecordInspectorMetadataLabel>ETA</RecordInspectorMetadataLabel>
                        <RecordInspectorMetadataValue>Today 16:30</RecordInspectorMetadataValue>
                      </RecordInspectorMetadataItem>
                    </RecordInspectorMetadata>
                  </RecordInspectorSection>
                  <RecordInspectorSection density="compact">
                    <RecordInspectorSectionHeader>
                      <RecordInspectorSectionTitle>Latest activity</RecordInspectorSectionTitle>
                    </RecordInspectorSectionHeader>
                    <ol className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                      <li>Address warning raised by risk rules.</li>
                      <li>Inventory reserved in lane 3.</li>
                      <li>Customer requested same-day dispatch.</li>
                    </ol>
                  </RecordInspectorSection>
                </RecordInspectorBody>
                <RecordInspectorFooter>
                  <Button variant="outline" size="sm">Escalate</Button>
                  <Button size="sm">Approve release</Button>
                </RecordInspectorFooter>
              </RecordInspector>
            </div>
          </AdminShellMain>
        </AdminShellPanel>
      </AdminShellBody>
    </AdminShell>
  );
}
