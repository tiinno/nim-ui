import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import {
  findComponent,
  renderComponentList,
  renderComponent,
  renderSearch,
  renderExamples,
  type RegistryData,
} from './registry-tools.js';

/**
 * The four registry-backed tools, which had no coverage at all.
 *
 * Two kinds of case here on purpose:
 *
 * - against the **real registry**, because these documents are only useful if
 *   they describe the kit that actually ships, and a fixture cannot tell you
 *   that the 91st component renders
 * - against a **small fixture**, for the branches the real data cannot reach —
 *   an empty search, a component with no examples, and a source file that
 *   fails to read
 */

const UI_SRC = resolve(__dirname, '../../ui/src');

async function realRegistry(): Promise<RegistryData> {
  return JSON.parse(await readFile(join(UI_SRC, 'registry/index.json'), 'utf-8')) as RegistryData;
}

const readRealSource = (file: string) => readFile(join(UI_SRC, file), 'utf-8');

const FIXTURE: RegistryData = {
  version: '0.0.0',
  components: [
    {
      name: 'Widget',
      category: 'primitives',
      description: 'A widget for widgeting',
      keywords: ['widget', 'gadget'],
      file: 'components/widget.tsx',
      variants: [{ name: 'size', values: ['sm', 'lg'] }],
      hasRadixPrimitive: false,
      examples: [{ title: 'Basic', code: '<Widget />' }],
    },
    {
      name: 'Doohickey',
      category: 'layout',
      description: 'Undocumented on purpose',
      keywords: [],
      file: 'components/doohickey.tsx',
      variants: [],
      hasRadixPrimitive: true,
      examples: [],
    },
  ],
};

describe('findComponent', () => {
  it('matches case-insensitively, as the tool schema promises', async () => {
    const registry = await realRegistry();

    expect(findComponent(registry, 'button').name).toBe('Button');
    expect(findComponent(registry, 'BUTTON').name).toBe('Button');
  });

  it('names what was not found', () => {
    expect(() => findComponent(FIXTURE, 'Nonesuch')).toThrow('Component "Nonesuch" not found');
  });
});

describe('renderComponentList', () => {
  it('reports the whole registry when no category is given', async () => {
    const registry = await realRegistry();
    const output = renderComponentList(registry);

    expect(output).toContain(`Total: ${registry.components.length} components`);
    for (const component of registry.components) {
      expect(output, `${component.name} is missing from the list document.`).toContain(`### ${component.name}\n`);
    }
  });

  it('narrows to one category and says so in the heading', async () => {
    const registry = await realRegistry();
    const output = renderComponentList(registry, 'commerce');
    const commerce = registry.components.filter((c) => c.category === 'commerce');

    expect(output).toContain('# Nim UI Components (commerce)');
    expect(output).toContain(`Total: ${commerce.length} component`);
    expect(output).not.toContain('## Primitives');
  });

  it('keeps the count grammatical for a single result', () => {
    expect(renderComponentList(FIXTURE, 'layout')).toContain('Total: 1 component\n');
    expect(renderComponentList(FIXTURE)).toContain('Total: 2 components\n');
  });

  it('omits the variants line for a component that has none', () => {
    const output = renderComponentList(FIXTURE, 'layout');

    expect(output).toContain('### Doohickey');
    expect(output).not.toContain('**Variants**');
  });
});

describe('renderComponent', () => {
  it('embeds the real source of a real component', async () => {
    const output = await renderComponent(await realRegistry(), 'Button', readRealSource);

    expect(output).toContain('# Button');
    expect(output).toContain('## Source Code');
    // Something only the actual file has, so a stub or an empty read fails here.
    expect(output).toContain('buttonVariants');
  });

  it('reads the path from the registry, never from the caller', async () => {
    const asked: string[] = [];
    await renderComponent(FIXTURE, 'widget', async (file) => {
      asked.push(file);
      return '';
    });

    // `name` selects the entry; `file` decides what is read. A caller cannot
    // steer the read by choosing a name.
    expect(asked).toEqual(['components/widget.tsx']);
  });

  it('reports a failed read in place of the source, keeping the metadata', async () => {
    const output = await renderComponent(FIXTURE, 'Widget', () => {
      throw new Error('ENOENT: no such file');
    });

    expect(output).toContain('Error reading source file: ENOENT: no such file');
    expect(output, 'A failed read must not cost the client the metadata it asked for.').toContain(
      '- **Category**: primitives'
    );
  });

  it('omits the variants and examples sections when there are none', async () => {
    const output = await renderComponent(FIXTURE, 'Doohickey', async () => '');

    expect(output).not.toContain('## Variants');
    expect(output).not.toContain('## Examples');
    expect(output).toContain('## Source Code');
  });
});

describe('renderSearch', () => {
  it('finds by keyword across the real registry', async () => {
    const output = renderSearch(await realRegistry(), 'button');

    expect(output).toContain('# Search Results for "button"');
    expect(output).toContain('## Button');
  });

  it('matches on description and category, not only on name', () => {
    expect(renderSearch(FIXTURE, 'widgeting')).toContain('## Widget');
    expect(renderSearch(FIXTURE, 'layout')).toContain('## Doohickey');
    expect(renderSearch(FIXTURE, 'gadget')).toContain('## Widget');
  });

  it('says so plainly when nothing matches', () => {
    expect(renderSearch(FIXTURE, 'zzzz')).toBe('No components found matching "zzzz"');
  });

  it('is case-insensitive on the query', () => {
    expect(renderSearch(FIXTURE, 'WIDGET')).toContain('## Widget');
  });
});

describe('renderExamples', () => {
  it('returns every example when no index is given', async () => {
    const registry = await realRegistry();
    const button = findComponent(registry, 'Button');
    const output = renderExamples(registry, 'Button');

    expect(output).toContain('# Examples for Button');
    for (const [index, example] of button.examples.entries()) {
      expect(output).toContain(`## Example ${index + 1}: ${example.title}`);
    }
  });

  it('returns one example when an index is given', () => {
    const output = renderExamples(FIXTURE, 'Widget', 0);

    expect(output).toContain('## Basic');
    expect(output).toContain('<Widget />');
    expect(output).not.toContain('## Example 1:');
  });

  it('says how many there are when the index is out of range', () => {
    expect(() => renderExamples(FIXTURE, 'Widget', 5)).toThrow(
      'Example index 5 out of range. Component has 1 example(s).'
    );
  });

  it('says so when a component has no examples', () => {
    expect(renderExamples(FIXTURE, 'Doohickey')).toBe(
      'No examples available for component "Doohickey"'
    );
  });
});
