import { FeatureGrid, FeatureCard } from '@tiinno-ui/components';

export function FeatureDefault() {
  return (
    <FeatureGrid>
      <FeatureCard
        icon={<span style={{ fontSize: '1.5rem' }}>⚡</span>}
        title="Lightning Fast"
        description="Optimized for performance with tree-shaking and minimal bundle size."
      />
      <FeatureCard
        icon={<span style={{ fontSize: '1.5rem' }}>🎨</span>}
        title="Fully Customizable"
        description="Extend any component with Tailwind CSS classes and design tokens."
      />
      <FeatureCard
        icon={<span style={{ fontSize: '1.5rem' }}>♿</span>}
        title="Accessible"
        description="WCAG 2.1 AA compliant with full keyboard navigation and screen reader support."
      />
    </FeatureGrid>
  );
}

export function Feature2Cols() {
  return (
    <FeatureGrid columns={2}>
      <FeatureCard
        icon={<span style={{ fontSize: '1.5rem' }}>🔒</span>}
        title="Type Safe"
        description="Built with TypeScript for complete type safety and IDE autocompletion."
      />
      <FeatureCard
        icon={<span style={{ fontSize: '1.5rem' }}>🌙</span>}
        title="Dark Mode"
        description="Built-in dark mode support with smooth transitions across all components."
      />
    </FeatureGrid>
  );
}

export function Feature4Cols() {
  return (
    <FeatureGrid columns={4}>
      <FeatureCard title="24 Components" description="Ready to use out of the box." />
      <FeatureCard title="TypeScript" description="Full type definitions included." />
      <FeatureCard title="Tailwind v4" description="Built on the latest Tailwind." />
      <FeatureCard title="React 19" description="Leveraging the newest features." />
    </FeatureGrid>
  );
}

export function FeatureNoIcons() {
  return (
    <FeatureGrid columns={3}>
      <FeatureCard
        title="Easy Integration"
        description="Install with a single command and start building immediately."
      />
      <FeatureCard
        title="Well Documented"
        description="Comprehensive documentation with live examples for every component."
      />
      <FeatureCard
        title="Community Driven"
        description="Open source and actively maintained by a growing community."
      />
    </FeatureGrid>
  );
}
