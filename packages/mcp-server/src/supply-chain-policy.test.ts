import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '../..');
const WORKFLOW_DIR = join(REPO_ROOT, '.github', 'workflows');

/**
 * Exact-set pin, one entry per workflow file. Listing the workflows rather than
 * walking whatever is on disk is the point: this guard read only `ci.yml` when
 * it was written, so `release.yml` — the workflow that actually uploads to the
 * registry — arrived completely unchecked. A new workflow now fails this test
 * until someone states what it is allowed to run.
 */
const EXPECTED_ACTIONS: Record<string, string[]> = {
  'ci.yml': ['actions/checkout', 'pnpm/action-setup', 'actions/setup-node', 'actions/cache'],
  'release.yml': ['actions/checkout', 'pnpm/action-setup', 'actions/setup-node', 'actions/cache'],
};

describe('supply-chain configuration', () => {
  it('pins every GitHub Action to an immutable commit while keeping the expected steps', () => {
    const workflows = readdirSync(WORKFLOW_DIR)
      .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
      .sort();

    expect(workflows, 'a workflow with no entry in EXPECTED_ACTIONS runs unpinned code').toEqual(
      Object.keys(EXPECTED_ACTIONS).sort()
    );

    for (const file of workflows) {
      const workflow = readFileSync(join(WORKFLOW_DIR, file), 'utf8');
      const actionRefs = [...workflow.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)].map(
        (match) => match[1]!
      );

      expect(actionRefs.map((ref) => ref.split('@')[0]), file).toEqual(EXPECTED_ACTIONS[file]);

      for (const ref of actionRefs) {
        expect(ref, `${file}: ${ref} can move without a reviewed workflow change`).toMatch(
          /^[^@\s]+@[0-9a-f]{40}$/
        );
      }
    }
  });

  it('pins executable npx examples to the package version being documented', () => {
    const packageJson = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')) as {
      version: string;
    };
    const expectedSpec = `@nim-ui/mcp-server@${packageJson.version}`;
    const exampleConfig = JSON.parse(
      readFileSync(join(PACKAGE_ROOT, 'claude-desktop-config.example.json'), 'utf8')
    ) as { mcpServers: { 'nim-ui': { args: string[] } } };
    const readme = readFileSync(join(PACKAGE_ROOT, 'README.md'), 'utf8');
    const documentedSpecs = [
      ...readme.matchAll(/(?:npx\s+-y|"args":\s*\["-y",)\s*"?(@nim-ui\/mcp-server(?:@[^"\s\]]+)?)"?/g),
    ].map((match) => match[1]!);

    expect(exampleConfig.mcpServers['nim-ui'].args).toEqual(['-y', expectedSpec]);
    expect(documentedSpecs.length).toBeGreaterThan(0);
    expect(new Set(documentedSpecs)).toEqual(new Set([expectedSpec]));
  });
});
