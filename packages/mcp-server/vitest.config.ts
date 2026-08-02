import { defineConfig } from 'vitest/config';

/**
 * This package had no test task at all, so turbo skipped it and the repo-wide
 * gate still reported success. Node environment: what is covered here is a
 * module loader and a string renderer, neither of which wants a DOM.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
