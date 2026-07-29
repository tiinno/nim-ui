import { defineConfig } from 'vitest/config';

/**
 * The docs package has no component unit tests — these suites assert the
 * BUILT static export (`out/`), so they run in the node environment with no
 * jsdom and no setup file. Turbo's `test:run` task declares
 * `dependsOn: ["build"]`, so `pnpm test` from the repo root always produces
 * `out/` before this config runs.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'out', 'dist', '.next', '.source'],
  },
});
