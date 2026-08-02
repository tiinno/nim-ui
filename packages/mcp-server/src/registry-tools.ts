/**
 * The documents the registry-backed tools return.
 *
 * Extracted from `index.ts` for the reason `tokens-source.ts` was: that file
 * self-starts a stdio server on import, so nothing in it can be reached by a
 * test. These four tools — list, get, search, example — are what an AI client
 * actually spends its time in, and none of them had any coverage.
 *
 * Everything here is a pure function of the registry. The one impure step,
 * reading a component's source off disk, is injected so a test can exercise the
 * document without a filesystem and can drive the failure branch, which is
 * otherwise only reachable by breaking the repo.
 */

export interface ComponentVariant {
  name: string;
  values: string[];
}

export interface ComponentExample {
  title: string;
  code: string;
}

export interface Component {
  name: string;
  category: string;
  description: string;
  keywords: string[];
  file: string;
  variants: ComponentVariant[];
  hasRadixPrimitive: boolean;
  examples: ComponentExample[];
}

export interface RegistryData {
  version: string;
  components: Component[];
}

/** Reads a component's source, given its registry-relative `file`. */
export type ReadComponentSource = (file: string) => Promise<string>;

const plural = (n: number) => (n !== 1 ? 's' : '');
const heading = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/**
 * Find a component by name, case-insensitively.
 *
 * Throws rather than returning null: every caller treats "not found" as an
 * error, and the tool layer turns a thrown message into the client's reply.
 */
export function findComponent(registry: RegistryData, name: string): Component {
  const component = registry.components.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (component === undefined) throw new Error(`Component "${name}" not found`);
  return component;
}

/** `ui_list_components` — every component, or one category, grouped. */
export function renderComponentList(registry: RegistryData, category?: string): string {
  const components = category
    ? registry.components.filter((c) => c.category === category)
    : registry.components;

  const grouped: Record<string, Component[]> = {};
  for (const component of components) {
    (grouped[component.category] ??= []).push(component);
  }

  let output = `# Nim UI Components${category ? ` (${category})` : ''}\n\n`;
  output += `Total: ${components.length} component${plural(components.length)}\n\n`;

  for (const [cat, comps] of Object.entries(grouped)) {
    output += `## ${heading(cat)}\n\n`;
    for (const comp of comps) {
      output += `### ${comp.name}\n`;
      output += `${comp.description}\n`;
      output += `- **File**: ${comp.file}\n`;
      output += `- **Radix Primitive**: ${comp.hasRadixPrimitive ? 'Yes' : 'No'}\n`;
      if (comp.variants.length > 0) {
        output += `- **Variants**: ${comp.variants
          .map((v) => `${v.name} (${v.values.join(', ')})`)
          .join('; ')}\n`;
      }
      output += `- **Keywords**: ${comp.keywords.join(', ')}\n\n`;
    }
  }

  return output;
}

/**
 * `ui_get_component` — metadata, variants, examples and the source itself.
 *
 * The path comes from the registry's own `file` field, never from the caller's
 * `name`; the name only selects which entry to read. A failed read is reported
 * in place of the source rather than thrown, so a client still gets the
 * metadata it asked for.
 */
export async function renderComponent(
  registry: RegistryData,
  name: string,
  readSource: ReadComponentSource
): Promise<string> {
  const component = findComponent(registry, name);

  let sourceCode: string;
  try {
    sourceCode = await readSource(component.file);
  } catch (error) {
    sourceCode = `Error reading source file: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  let output = `# ${component.name}\n\n`;
  output += `${component.description}\n\n`;
  output += `## Metadata\n\n`;
  output += `- **Category**: ${component.category}\n`;
  output += `- **File**: ${component.file}\n`;
  output += `- **Radix Primitive**: ${component.hasRadixPrimitive ? 'Yes' : 'No'}\n`;
  output += `- **Keywords**: ${component.keywords.join(', ')}\n\n`;

  if (component.variants.length > 0) {
    output += `## Variants\n\n`;
    for (const variant of component.variants) {
      output += `- **${variant.name}**: ${variant.values.join(', ')}\n`;
    }
    output += `\n`;
  }

  if (component.examples.length > 0) {
    output += `## Examples\n\n`;
    for (const example of component.examples) {
      output += `### ${example.title}\n\n`;
      output += `\`\`\`tsx\n${example.code}\n\`\`\`\n\n`;
    }
  }

  output += `## Source Code\n\n`;
  output += `\`\`\`typescript\n${sourceCode}\n\`\`\`\n`;

  return output;
}

/** `ui_search_components` — substring match across name, description, category and keywords. */
export function renderSearch(registry: RegistryData, query: string): string {
  const term = query.toLowerCase();
  const results = registry.components.filter(
    (component) =>
      component.name.toLowerCase().includes(term) ||
      component.description.toLowerCase().includes(term) ||
      component.category.toLowerCase().includes(term) ||
      component.keywords.some((keyword) => keyword.toLowerCase().includes(term))
  );

  if (results.length === 0) return `No components found matching "${query}"`;

  let output = `# Search Results for "${query}"\n\n`;
  output += `Found ${results.length} component${plural(results.length)}\n\n`;

  for (const component of results) {
    output += `## ${component.name}\n`;
    output += `${component.description}\n`;
    output += `- **Category**: ${component.category}\n`;
    output += `- **File**: ${component.file}\n`;
    output += `- **Keywords**: ${component.keywords.join(', ')}\n\n`;
  }

  return output;
}

/** `ui_get_example` — one example by index, or all of them. */
export function renderExamples(registry: RegistryData, name: string, exampleIndex?: number): string {
  const component = findComponent(registry, name);

  if (component.examples.length === 0) {
    return `No examples available for component "${component.name}"`;
  }

  let output = `# Examples for ${component.name}\n\n`;

  if (exampleIndex !== undefined) {
    if (exampleIndex >= component.examples.length) {
      throw new Error(
        `Example index ${exampleIndex} out of range. Component has ${component.examples.length} example(s).`
      );
    }
    const example = component.examples[exampleIndex] as ComponentExample;
    output += `## ${example.title}\n\n`;
    output += `\`\`\`tsx\n${example.code}\n\`\`\`\n`;
  } else {
    component.examples.forEach((example, idx) => {
      output += `## Example ${idx + 1}: ${example.title}\n\n`;
      output += `\`\`\`tsx\n${example.code}\n\`\`\`\n\n`;
    });
  }

  return output;
}
