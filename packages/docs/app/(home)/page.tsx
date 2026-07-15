import Link from 'next/link';
import {
  Badge,
  Button,
  Dot,
  Input,
  Kbd,
  KbdGroup,
  Meter,
  Snippet,
  StatusPill,
} from '@/components/nim';

const features = [
  {
    title: 'Eighty-five components',
    body: 'Primitives, layout, data display, forms, commerce, landing, feedback, and navigation — composed for real operational screens.',
    tinted: true,
  },
  {
    title: 'Typed to the edges',
    body: 'Authored in TypeScript 5.9 strict mode. Every prop is documented, every variant inferred. IntelliSense that actually helps.',
  },
  {
    title: 'Accessible by default',
    body: 'WCAG 2.1 AA: proper ARIA, full keyboard paths, focus management, and screen-reader semantics built in — not bolted on.',
  },
  {
    title: 'Tailwind v4 native',
    body: 'Styled with Tailwind CSS v4 design tokens in OKLCH. Re-theme the entire kit by moving a handful of variables.',
  },
  {
    title: 'Dark mode, considered',
    body: 'A dual ink palette tuned for long sessions — calibrated contrast, no harsh whites, smooth transitions throughout.',
  },
  {
    title: 'Tree-shakeable ESM',
    body: 'Import only what a screen needs. Clean ESM exports keep operational bundles lean and predictable.',
    tinted: true,
  },
];

const categories = [
  ['Primitives', 'Button · ButtonGroup · Text · Kbd · Input · Select'],
  ['Layout', 'AdminShell · PageHeader · Tabs · Modal · ScrollArea · Card'],
  ['Data Display', 'DataTable · StatusPill · Dot · Meter · Snippet'],
  ['Forms', 'FormLayout · Fieldset · DatePicker · MultiSelect'],
  ['Commerce', 'ProductCard · CartItem · PriceTag · QuantitySelector'],
  ['Feedback', 'Toast · Tooltip · Popover · AlertDialog · Progress'],
  ['Navigation', 'Breadcrumb · SidebarNav · CommandMenu · Pagination'],
  ['Landing', 'Hero · FeatureGrid · Testimonial · CTA'],
];

const queueRows = [
  { id: 'ORD-4821', name: 'Northwind Supply', status: 'warning', label: 'Review', eta: '16:30' },
  { id: 'ORD-4819', name: 'Atlas Retail', status: 'processing', label: 'Picking', eta: '17:10' },
  { id: 'ORD-4815', name: 'Metro Goods', status: 'success', label: 'Packed', eta: '18:00' },
] as const;

function HeroSpecimen() {
  return (
    <div aria-hidden className="relative hidden lg:block">
      {/* Offset backing sheet — quiet layered depth, same family as shadow-soft */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border border-fd-border bg-fd-muted" />
      <div className="relative rounded-xl border border-fd-border bg-fd-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-fd-foreground">Order review queue</p>
            <p className="mt-0.5 text-xs text-fd-muted-foreground">BKK-02, morning shift</p>
          </div>
          <StatusPill status="warning" size="sm">
            17 waiting
          </StatusPill>
        </div>

        <div className="mt-4">
          <Meter value={78} label="Queue capacity" showValue />
        </div>

        <ul className="mt-4 divide-y divide-fd-border border-t border-fd-border text-sm">
          {queueRows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
              <Dot status={row.status}>
                <span className="font-medium text-fd-foreground">{row.id}</span>
                <span className="ml-2 hidden text-fd-muted-foreground xl:inline">{row.name}</span>
              </Dot>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-fd-muted-foreground">{row.label}</span>
                <span className="font-mono text-xs tabular-nums text-fd-muted-foreground">
                  {row.eta}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-fd-border pt-4">
          <Snippet size="sm" text="whsec_Xk92mPq47TzR8vLnW3jY" className="max-w-56" />
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-fd-muted-foreground">
            <KbdGroup aria-label="Command K">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            to search
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="fd-home mx-auto w-full max-w-[1080px] px-6 lg:px-10">
      {/* ───────── Hero ───────── */}
      <section className="border-b border-fd-border py-20 md:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <div>
            <p className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.22em] text-fd-muted-foreground">
              React UI Kit
            </p>
            <h1 className="max-w-3xl text-balance text-4xl leading-[1.08] text-fd-foreground md:text-5xl">
              Backoffice interfaces,{' '}
              <em className="font-display italic text-fd-primary">quietly</em> refined.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-fd-muted-foreground">
              A calm, accessible component library for dashboards, backoffice workflows, and
              commerce operations. TypeScript-first, dark-mode native, tuned for dense screens.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/getting-started/installation/"
                className="inline-flex items-center rounded-md bg-fd-foreground px-5 py-2.5 text-sm font-semibold text-fd-background transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
              <Link
                href="/components/primitives/button/"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-fd-foreground"
              >
                Browse components
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            <p className="mt-10 font-mono text-xs tracking-wide text-fd-muted-foreground">
              85 components, 8 categories, WCAG 2.1 AA
            </p>
          </div>

          <HeroSpecimen />
        </div>
      </section>

      {/* ───────── Specimen ───────── */}
      <section className="border-b border-fd-border py-16">
        <h2 className="mb-10 text-3xl text-fd-foreground">The kit, at a glance</h2>

        <div className="rounded-xl border border-fd-border bg-fd-card p-8 shadow-soft md:p-12">
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md">
                  Primary
                </Button>
                <Button variant="secondary" size="md">
                  Secondary
                </Button>
                <Button variant="outline" size="md">
                  Outline
                </Button>
                <Button variant="ghost" size="md">
                  Ghost
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Badge>Default</Badge>
                <Badge variant="success">Active</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="destructive">Failed</Badge>
                <Badge variant="outline">Draft</Badge>
              </div>

              <div className="max-w-sm">
                <label className="mb-1.5 block text-sm font-medium text-fd-foreground">
                  Workspace
                </label>
                <Input placeholder="acme-operations" />
              </div>
            </div>

            <div className="flex flex-col gap-6 md:border-l md:border-fd-border md:pl-10">
              <div className="space-y-3">
                <Meter value={42} label="Media storage" showValue />
                <Meter value={78} label="Webhook queue" showValue />
                <Meter value={95} label="API rate limit" showValue />
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <Dot status="active">Online</Dot>
                <Dot status="processing" pulse>
                  Syncing
                </Dot>
                <Dot status="failed">Failed</Dot>
              </div>

              <Snippet prefix="$" text="pnpm add @nim-ui/components" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Features ───────── */}
      <section className="py-16">
        <h2 className="mb-10 text-3xl text-fd-foreground">Built for operators</h2>
        <div className="grid gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className={f.tinted ? 'bg-fd-accent p-7' : 'bg-fd-background p-7'}>
              <h3 className="text-base font-semibold text-fd-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Categories ───────── */}
      <section className="border-t border-fd-border py-16">
        <h2 className="mb-10 text-3xl text-fd-foreground">Eight categories</h2>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {categories.map(([name, items]) => (
            <div key={name} className="flex flex-col gap-1.5 border-l border-fd-border pl-5">
              <span className="font-display text-lg text-fd-foreground">{name}</span>
              <span className="text-sm leading-relaxed text-fd-muted-foreground">{items}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Next steps ───────── */}
      <section className="border-t border-fd-border py-16">
        <div className="grid gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border sm:grid-cols-2">
          {[
            ['Installation', 'Add Nim UI and start building.', '/getting-started/installation/'],
            ['Components', 'Browse all 85 with live examples.', '/components/primitives/button/'],
            ['Design System', 'Colors, type, and tokens.', '/design-system/colors/'],
            ['Best Practices', 'Accessible, performant patterns.', '/guides/best-practices/'],
          ].map(([title, body, href]) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center justify-between gap-4 bg-fd-background p-7 transition-colors hover:bg-fd-accent"
            >
              <span>
                <span className="font-display text-lg text-fd-foreground">{title}</span>
                <span className="mt-1 block text-sm text-fd-muted-foreground">{body}</span>
              </span>
              <span className="text-fd-muted-foreground transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
