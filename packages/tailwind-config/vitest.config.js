import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './packages/tailwind-config',
    include: ['src/**/*.{test,spec}.{js,mjs}'],
    exclude: ['node_modules', 'dist'],
  },
});
