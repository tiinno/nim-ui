import Link from 'next/link';
import { Button, Badge, Input } from '@/components/nim';

const features = [
  {
    title: 'Sixty-four components',
    body: 'Primitives, layout, data display, commerce, landing, feedback, forms, and navigation — composed for real operational screens.',
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
  },
];

const categories = [
  ['Primitives', 'Button · Input · Select · Switch · Checkbox · Radio'],
  ['Layout', 'AdminShell · PageHeader · Tabs · Modal · Drawer · Card'],
  ['Data Display', 'DataTable · StatusPill · Timeline · RecordInspector'],
  ['Commerce', 'ProductCard · CartItem · PriceTag · QuantitySelector'],
  ['Feedback', 'Toast · Tooltip · Popover · AlertDialog · Progress'],
  ['Navigation', 'Breadcrumb · SidebarNav · CommandMenu · Pagination'],
];

export default function HomePage() {
  return (
    <main className="fd-home mx-auto w-full max-w-[1080px] px-6 lg:px-10">
      {/* ───────── Hero ───────── */}
      <section className="border-b border-fd-border py-20 md:py-28">
        <p className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.22em] text-fd-muted-foreground">
          React UI Kit
        </p>
        <h1 className="max-w-3xl text-balance text-5xl leading-[1.04] text-fd-foreground md:text-6xl">
          Backoffice interfaces,{' '}
          <em className="font-display italic text-fd-primary">quietly</em> refined.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-fd-muted-foreground">
          A calm, accessible component library for dashboards, backoffice workflows, and
          commerce operations — TypeScript-first, dark-mode native, tuned for dense
          operational screens.
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
          64 components · 8 categories · WCAG 2.1 AA
        </p>
      </section>

      {/* ───────── Specimen ───────── */}
      <section className="border-b border-fd-border py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
            Specimen / 001
          </span>
          <span className="font-mono text-xs tracking-wide text-fd-muted-foreground">
            live components
          </span>
        </div>

        <div className="rounded-xl border border-fd-border bg-fd-card p-8 shadow-soft md:p-12">
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
        </div>
      </section>

      {/* ───────── Features ───────── */}
      <section className="py-16">
        <h2 className="mb-10 text-3xl text-fd-foreground">Built for operators</h2>
        <div className="grid gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className="bg-fd-background p-7">
              <span className="font-mono text-xs text-fd-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-base font-semibold text-fd-foreground">{f.title}</h3>
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
            ['Components', 'Browse all 64 with live examples.', '/components/primitives/button/'],
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
