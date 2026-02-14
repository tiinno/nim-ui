import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  integrations: [
    starlight({
      title: 'Tiinno UI',
      description: 'Modern, accessible, production-ready React component library',
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/tiinno-ui/tiinno-ui',
      },
      customCss: [
        './src/styles/custom.css',
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'index' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
            { label: 'Configuration', slug: 'getting-started/configuration' },
          ],
        },
        {
          label: 'Components',
          items: [
            {
              label: 'Primitives',
              collapsed: false,
              items: [
                { label: 'Button', slug: 'components/primitives/button' },
                { label: 'Input', slug: 'components/primitives/input' },
                { label: 'Textarea', slug: 'components/primitives/textarea' },
                { label: 'Checkbox', slug: 'components/primitives/checkbox' },
                { label: 'Radio', slug: 'components/primitives/radio' },
                { label: 'Select', slug: 'components/primitives/select' },
                { label: 'Switch', slug: 'components/primitives/switch' },
              ],
            },
            {
              label: 'Layout',
              collapsed: false,
              items: [
                { label: 'Container', slug: 'components/layout/container' },
                { label: 'Grid', slug: 'components/layout/grid' },
                { label: 'Stack', slug: 'components/layout/stack' },
                { label: 'Flex', slug: 'components/layout/flex' },
                { label: 'Spacer', slug: 'components/layout/spacer' },
                { label: 'Card', slug: 'components/layout/card' },
                { label: 'Modal', slug: 'components/layout/modal' },
                { label: 'Drawer', slug: 'components/layout/drawer' },
                { label: 'Tabs', slug: 'components/layout/tabs' },
                { label: 'Accordion', slug: 'components/layout/accordion' },
                { label: 'Separator', slug: 'components/layout/separator' },
              ],
            },
            {
              label: 'Data Display',
              collapsed: false,
              items: [
                { label: 'Badge', slug: 'components/data-display/badge' },
                { label: 'Avatar', slug: 'components/data-display/avatar' },
                { label: 'DataTable', slug: 'components/data-display/data-table' },
                { label: 'DataCard', slug: 'components/data-display/data-card' },
                { label: 'Stat', slug: 'components/data-display/stat' },
              ],
            },
            {
              label: 'Commerce',
              collapsed: false,
              items: [
                { label: 'ProductCard', slug: 'components/commerce/product-card' },
                { label: 'CartItem', slug: 'components/commerce/cart-item' },
                { label: 'PriceTag', slug: 'components/commerce/price-tag' },
                { label: 'QuantitySelector', slug: 'components/commerce/quantity-selector' },
              ],
            },
            {
              label: 'Landing',
              collapsed: false,
              items: [
                { label: 'Hero', slug: 'components/landing/hero' },
                { label: 'FeatureGrid', slug: 'components/landing/feature' },
                { label: 'Testimonial', slug: 'components/landing/testimonial' },
                { label: 'CTA', slug: 'components/landing/cta-section' },
              ],
            },
            {
              label: 'Feedback',
              collapsed: false,
              items: [
                { label: 'Toast', slug: 'components/feedback/toast' },
                { label: 'Tooltip', slug: 'components/feedback/tooltip' },
                { label: 'Popover', slug: 'components/feedback/popover' },
                { label: 'Dropdown Menu', slug: 'components/feedback/dropdown-menu' },
                { label: 'Alert Dialog', slug: 'components/feedback/alert-dialog' },
                { label: 'Alert', slug: 'components/feedback/alert' },
                { label: 'Progress', slug: 'components/feedback/progress' },
                { label: 'Spinner', slug: 'components/feedback/spinner' },
                { label: 'Skeleton', slug: 'components/feedback/skeleton' },
              ],
            },
            {
              label: 'Forms',
              collapsed: false,
              items: [
                { label: 'Form', slug: 'components/forms/form' },
                { label: 'FormField', slug: 'components/forms/form-field' },
              ],
            },
            {
              label: 'Navigation',
              collapsed: false,
              items: [
                { label: 'Breadcrumb', slug: 'components/navigation/breadcrumb' },
              ],
            },
          ],
        },
        {
          label: 'Design System',
          items: [
            { label: 'Colors', slug: 'design-system/colors' },
            { label: 'Typography', slug: 'design-system/typography' },
            { label: 'Spacing', slug: 'design-system/spacing' },
            { label: 'Dark Mode', slug: 'design-system/dark-mode' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Customization', slug: 'guides/customization' },
            { label: 'Theming', slug: 'guides/theming' },
            { label: 'Best Practices', slug: 'guides/best-practices' },
            { label: 'Accessibility', slug: 'guides/accessibility' },
          ],
        },
      ],
      components: {
        Head: './src/components/Head.astro',
      },
      editLink: {
        baseUrl: 'https://github.com/tiinno-ui/tiinno-ui/edit/main/packages/docs/',
      },
      lastUpdated: true,
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
        styleOverrides: {
          borderRadius: '0.5rem',
        },
      },
    }),
    react(),
  ],
});
