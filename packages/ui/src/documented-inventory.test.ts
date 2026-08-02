import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import registry from './registry/index.json';

/**
 * The component counts stated in prose must equal the registry.
 *
 * ## Why
 *
 * `CLAUDE.md`'s "Adding a component" checklist ends with a manual step:
 *
 * > Bump counts in `llms.txt` (header, category heading, component line,
 * > footer), `README.md`, and `packages/docs/app/(home)/page.tsx`.
 *
 * That is four files and eleven separate claims kept in agreement by a
 * checklist. It is the same shape as the token drift NIMUI-29 guarded, and the
 * same shape as the `--spacing-*` fiction NIMUI-61 removed: a number restated in
 * several places, with nothing mechanical keeping the restatements true.
 *
 * Nothing has drifted yet — every count checked out on the day this was written,
 * which is exactly when a guard is cheap to add. What HAD drifted is the one
 * number no guard can reach: `CLAUDE.md` claimed 2078 tests against an actual
 * 3085. That claim is gone rather than corrected, because a figure that moves
 * with every commit and cannot be checked will simply rot again.
 *
 * ## What is checked
 *
 * - the total, wherever it is stated
 * - `llms.txt`'s per-category counts
 * - `llms.txt`'s per-category component NAMES, which is the stronger check: a
 *   component added to the registry and never written into the reference is
 *   invisible to a count that was bumped by hand at the same time
 *
 * ## What is not
 *
 * Descriptions. `llms.txt` summarises each component in its own words, and
 * requiring those to match the registry verbatim would make the reference a
 * copy rather than a summary. Only names and counts are structural.
 */

const repoRoot = resolve(__dirname, '../../..');

const components = registry.components as ReadonlyArray<{ name: string; category: string }>;

/** Registry categories in the order `llms.txt` presents them. */
const CATEGORY_HEADINGS: ReadonlyArray<{ heading: string; category: string }> = [
  { heading: 'Primitives', category: 'primitives' },
  { heading: 'Layout', category: 'layout' },
  { heading: 'Data Display', category: 'data-display' },
  { heading: 'Commerce', category: 'commerce' },
  { heading: 'Landing', category: 'landing' },
  { heading: 'Forms', category: 'forms' },
  { heading: 'Feedback', category: 'feedback' },
  { heading: 'Navigation', category: 'navigation' },
];

function read(relativePath: string): string {
  return readFileSync(resolve(repoRoot, relativePath), 'utf-8');
}

const llmsTxt = read('llms.txt');
const readme = read('README.md');
const homePage = read('packages/docs/app/(home)/page.tsx');
const claudeMd = read('CLAUDE.md');

const registryByCategory = new Map<string, string[]>();
for (const component of components) {
  const list = registryByCategory.get(component.category) ?? [];
  list.push(component.name);
  registryByCategory.set(component.category, list);
}

/**
 * Every "<n> component(s)" and "<n> Components" claim in a document.
 *
 * Deliberately greedy: the point is to catch a stated total wherever someone
 * put it, including a sentence nobody remembered to update.
 */
function statedTotals(text: string): number[] {
  return [...text.matchAll(/(\d+)\s+components?\b/gi)].map((m) => Number(m[1]));
}

/** The component names listed under an `### Heading (n)` section of llms.txt. */
function llmsSection(heading: string): { declared: number | null; names: string[] } {
  const start = new RegExp(`^### ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\((\\d+)\\)$`, 'm').exec(llmsTxt);
  if (start === null) return { declared: null, names: [] };

  const from = start.index + start[0].length;
  const next = llmsTxt.slice(from).search(/^#{2,3} /m);
  const body = next === -1 ? llmsTxt.slice(from) : llmsTxt.slice(from, from + next);

  return {
    declared: Number(start[1]),
    names: [...body.matchAll(/^- ([A-Za-z][\w]*):/gm)].map((m) => m[1] as string),
  };
}

describe('the documented component inventory matches the registry', () => {
  // ---- vacuity guards -----------------------------------------------------

  it('reads a registry with components in it', () => {
    expect(
      components.length,
      'The registry parsed to (almost) nothing, so every comparison below is against an empty ' +
        'set and passes by finding no disagreement.'
    ).toBeGreaterThan(50);
  });

  it('finds a stated total in every document that should carry one', () => {
    const missing = (
      [
        ['llms.txt', llmsTxt],
        ['README.md', readme],
        ['packages/docs/app/(home)/page.tsx', homePage],
        ['CLAUDE.md', claudeMd],
      ] as const
    )
      .filter(([, text]) => statedTotals(text).length === 0)
      .map(([path]) => path);

    expect(
      missing,
      'These documents state no component count at all. Either the wording changed and this ' +
        'guard is now looking for the wrong shape, or a claim was dropped — both worth knowing, ' +
        'because a guard that finds nothing to check reports success.'
    ).toEqual([]);
  });

  // ---- the totals ---------------------------------------------------------

  it('states the registry total wherever a total is stated', () => {
    const wrong: string[] = [];
    for (const [path, text] of [
      ['llms.txt', llmsTxt],
      ['README.md', readme],
      ['packages/docs/app/(home)/page.tsx', homePage],
      ['CLAUDE.md', claudeMd],
    ] as const) {
      for (const stated of statedTotals(text)) {
        if (stated !== components.length) wrong.push(`${path}: says ${stated}, registry has ${components.length}`);
      }
    }

    expect(
      wrong,
      'A document states a component count the registry disagrees with. `CLAUDE.md`\'s ' +
        '"Adding a component" checklist asks for these to be bumped by hand in four files; this ' +
        'is what happens when one is missed.'
    ).toEqual([]);
  });

  // ---- llms.txt, per category --------------------------------------------

  it('covers every registry category with a section', () => {
    const covered = new Set(CATEGORY_HEADINGS.map((c) => c.category));
    const uncovered = [...registryByCategory.keys()].filter((c) => !covered.has(c));

    expect(
      uncovered,
      'The registry has categories this guard does not know about. A new category needs a ' +
        'heading in `llms.txt` and an entry in CATEGORY_HEADINGS, or its components are ' +
        'undocumented and unchecked.'
    ).toEqual([]);
  });

  it('declares the right count on every llms.txt category heading', () => {
    const wrong: string[] = [];
    for (const { heading, category } of CATEGORY_HEADINGS) {
      const { declared } = llmsSection(heading);
      const actual = registryByCategory.get(category)?.length ?? 0;
      if (declared === null) wrong.push(`### ${heading} (n)   <- no such heading in llms.txt`);
      else if (declared !== actual) wrong.push(`### ${heading}: says ${declared}, registry has ${actual}`);
    }

    expect(wrong, 'An llms.txt category heading disagrees with the registry.').toEqual([]);
  });

  it('lists exactly the registry components under each llms.txt category', () => {
    const wrong: string[] = [];
    for (const { heading, category } of CATEGORY_HEADINGS) {
      const listed = new Set(llmsSection(heading).names);
      const expected = new Set(registryByCategory.get(category) ?? []);

      for (const name of expected) if (!listed.has(name)) wrong.push(`${heading}: ${name} is in the registry but not in llms.txt`);
      for (const name of listed) if (!expected.has(name)) wrong.push(`${heading}: ${name} is in llms.txt but not in the registry`);
    }

    expect(
      wrong,
      'The reference and the registry describe different sets of components. This is the check ' +
        'the counts cannot do: a component added to the registry and never written into ' +
        '`llms.txt` is invisible to a heading number that was bumped by hand in the same commit.'
    ).toEqual([]);
  });
});
