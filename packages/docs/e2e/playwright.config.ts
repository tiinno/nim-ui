import { defineConfig, devices } from '@playwright/test';

/**
 * Browser-only checks, against the built static export.
 *
 * ## Why this exists as a separate task (NIMUI-68)
 *
 * NIMUI-47 asked for a screen-reader pass. Part of that question needs a human
 * with NVDA or VoiceOver and stays open. The other part — is the markup even in
 * a state where a reader *could* announce correctly — is answerable by a
 * browser, and was answered by hand: computed styles read out of a real
 * Chromium, node identity checked across a React state change, focus watched
 * across a toggle. Run by hand is how a measurement stops being run, which is
 * the same thing NIMUI-67 closed for the MCP server.
 *
 * ## Why it is NOT part of `pnpm test`
 *
 * `pnpm test` must keep running with nothing but `pnpm install`. Folding this
 * in would make a browser download a precondition for the unit suite, on every
 * machine, to run four files. So it is its own turbo task with its own CI step,
 * and the verification gate in CLAUDE.md names it as a fifth command rather
 * than pretending the four still cover everything CI does.
 *
 * ## Two repo-specific traps this layout avoids
 *
 * - **Vitest would claim the file.** Vitest's default include matches `.spec`
 *   as well as `.test`, which would hand this file to the node-environment
 *   runner and fail on the first `test.describe`. It does not, because
 *   `packages/docs/vitest.config.ts` narrows its include to files under
 *   `tests/` whose name ends in `.test.ts`. That narrowing is what makes the
 *   `.spec.ts` suffix safe here — do not widen one without re-checking the
 *   other.
 * - **Tailwind would scan the file.** `app/global.css` does not use
 *   `source(none)`, so automatic detection walks this whole package — and an
 *   accessibility spec is dense with utility-shaped literals. `@source not
 *   '../e2e'` excludes this directory, and
 *   `tests/compiled-utility-inventory.test.ts` asserts that line is still
 *   there. Without it this suite would mint live CSS rules into the shipped
 *   bundle.
 */

// Windows reserves scattered TCP ranges for Hyper-V, and 4319 sits inside one
// of them on at least one dev machine — the server dies with EACCES before a
// single test runs. CI's default stays 4319; override locally when that hits.
//
// Validated rather than coerced: `Number('')` is 0 and `Number('abc')` is NaN,
// and either would surface as a baseURL of `http://127.0.0.1:0` failing for a
// reason that points nowhere near the typo that caused it.
const PORT = (() => {
  const raw = process.env.E2E_PORT;
  if (raw === undefined || raw === '') return 4319;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`E2E_PORT must be an integer from 1 to 65535, got ${JSON.stringify(raw)}`);
  }
  return parsed;
})();

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  // A green run that skipped `test.only` is worse than a red one.
  forbidOnly: Boolean(process.env.CI),
  // No retries on purpose. Every assertion here is a deterministic read of a
  // static build; a retry would convert a real flake into a silent pass.
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node serve-out.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    // Never adopt a stray listener: it could be serving an older `out/`, and
    // the suite would report on a build that is not the one under test.
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 30_000,
  },
});
