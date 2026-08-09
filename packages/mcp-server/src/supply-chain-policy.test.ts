import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '../..');

describe('supply-chain configuration', () => {
  it('pins every GitHub Action to an immutable commit while keeping the expected steps', () => {
    const workflow = readFileSync(join(REPO_ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
    const actionRefs = [...workflow.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)].map(
      (match) => match[1]!
    );

    expect(actionRefs.map((ref) => ref.split('@')[0])).toEqual([
      'actions/checkout',
      'pnpm/action-setup',
      'actions/setup-node',
      'actions/cache',
    ]);

    for (const ref of actionRefs) {
      expect(ref, `${ref} can move without a reviewed workflow change`).toMatch(/^[^@\s]+@[0-9a-f]{40}$/);
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
