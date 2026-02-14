import starlightPlugin from '@astrojs/starlight-tailwind';
import baseConfig from '@nim-ui/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  presets: [baseConfig],
  plugins: [starlightPlugin()],
  theme: {
    extend: {
      colors: {
        // Override Starlight's default accent color
        accent: {
          50: 'var(--sl-color-accent-low)',
          100: 'var(--sl-color-accent-low)',
          200: 'var(--sl-color-accent)',
          300: 'var(--sl-color-accent)',
          400: 'var(--sl-color-accent-high)',
          500: 'var(--sl-color-accent-high)',
          600: 'var(--sl-color-accent-high)',
          700: 'var(--sl-color-accent-high)',
          800: 'var(--sl-color-accent-high)',
          900: 'var(--sl-color-accent-high)',
        },
      },
    },
  },
};
