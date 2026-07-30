import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Guards `src/registry/index.json` against advertising something the source
 * does not have.
 *
 * ## The defect this exists for (NIMUI-49)
 *
 * The registry is not documentation a human skims. `packages/mcp-server` serves
 * it to coding agents as the canonical description of every component, so it is
 * **input to code generation**. A false entry there does not mislead one reader
 * once; it manufactures wrong code every time an agent consults it. The entry
 * for `DataTable` advertised a `variant` of two values while the source declares
 * an empty `cva` variants object and no such prop, so an agent asked for a
 * zebra-striped operations grid was told the prop existed, wrote it, and shipped
 * markup that does nothing. TypeScript rejects it — but only after the wrong
 * code exists, and the failure reads as the agent's mistake rather than the
 * registry's.
 *
 * That entry turned out to be one of a class. Every field in this file is
 * hand-maintained and, until this suite, nothing compared any of it to the
 * components: entries named values that were renamed years of commits ago,
 * groups for props no component in the family declares, and examples composing
 * subcomponents that were never exported by anything.
 *
 * ## What this asserts
 *
 * For every entry, per component source file:
 *
 * 1. **Soundness** — every value a variant group advertises is declared, in the
 *    same file, either as a key of a `cva` variants group of that name or as a
 *    string-literal member of a union-typed prop of that name (directly, or via
 *    a one-level type alias) declared in an exported `…Props` type. This is the
 *    half that fails on the original defect.
 * 2. **Completeness** — every value the source declares for a group the registry
 *    already lists must be listed. Half the drift found was a renamed value
 *    where the entry kept the old spelling *and* hid the new one, which only a
 *    two-way comparison sees.
 * 3. **Examples name real components** — every capitalised JSX tag in every
 *    example must be a symbol some component file exports.
 * 4. **Examples use advertised values** — a string-valued attribute on a tag of
 *    the entry's own family, whose name resolves to a backed group, must carry
 *    one of that group's values.
 * 5. **Shape** — every field the registry schema requires is present and typed,
 *    and `category` is one of the literals `registry/schema.ts` itself lists.
 *
 * ## What this provably does NOT cover
 *
 * - **Arbitrary props.** Only variant *groups* are checked, and only against
 *   `cva` keys and locally declared string-literal unions. A prop of any other
 *   type (a callback, a record, a numeric range) is invisible here, and the
 *   registry has no field describing one anyway.
 * - **The values of inherited groups.** Six groups name a prop that reaches the
 *   consumer from a third-party primitive's props type rather than from anything
 *   this repo writes down (`react-day-picker`, three Radix packages). Their
 *   names are pinned in `INHERITED_GROUPS` below with the upstream source; their
 *   *values* are asserted by nobody. Reading them out would need real type
 *   resolution across `node_modules`, which this package has no dependable way
 *   to do — and a check that appeared to cover them while silently resolving
 *   nothing is worse than an honest hole, as NIMUI-30 and NIMUI-48 both showed.
 * - **Groups the registry omits entirely.** A source can declare a `cva` group
 *   no entry mentions and stay green; only groups an entry already lists are
 *   compared value-for-value. Fourteen entries are in that state today, mostly
 *   for two-state groups, and whether the registry should describe those at all
 *   is a schema decision, not a defect.
 * - **Descriptions.** Free prose, unverifiable. Three descriptions claimed
 *   capabilities (a sorting affordance, a search affordance, a trend indicator)
 *   that no line of the corresponding file implements; they were rewritten by
 *   hand in the same commit and nothing stops the next one.
 * - **`hasRadixPrimitive`.** Five entries claim it while importing no Radix
 *   package directly, reaching one only through a composed sibling; one entry in
 *   exactly that position claims the opposite. The convention is genuinely
 *   ambiguous, so this suite does not pretend to adjudicate it — and unlike a
 *   variant value, no generated code depends on the answer.
 * - **The form an example writes a value in.** Only quoted attributes are read,
 *   and they are compared by spelling. A group keyed by a number (a column
 *   count) therefore reads as correct when an example quotes the value instead of
 *   passing it in braces, which is a type error in the consumer's editor. One
 *   entry was in exactly that state.
 * - **Whether an example would compile.** Examples are snippets over undeclared
 *   identifiers, so type-checking them needs per-example stubs — not something
 *   to mechanise dependably. The examples this commit rewrote were checked
 *   against `tsc` once, by hand, through a scratch file that was then deleted.
 *
 * ## Why nothing here is written as a literal class or value name
 *
 * Tailwind used to scan this file exactly like a component, and a bare word that
 * reads as a utility compiles a real rule into the published stylesheet — twice
 * already, once from a comment. NIMUI-52 took test files out of the scan, but the
 * subject of this suite did not go with them: `registry/index.json` is still
 * read, so a value named here as a literal would still be one edit away from the
 * scanned side of the comparison. So every variant value this suite talks about
 * is derived at runtime from the two sides it compares, and the failure messages
 * are assembled from what was found. The pinned inventories below hold group
 * *names*, counts and file names only.
 */

const srcDir = resolve(__dirname);
const componentsDir = join(srcDir, 'components');
const registryPath = join(srcDir, 'registry/index.json');
const schemaPath = join(srcDir, 'registry/schema.ts');

// ---------------------------------------------------------------------------
// Pinned inventories
// ---------------------------------------------------------------------------

/**
 * Registry group names that are not a bare prop name — a subcomponent
 * qualifier, written informally, in one of two shapes ("<owner word> <prop>",
 * "<prop> (<Owner>)").
 *
 * Normalised rather than rewritten: the registry has no field for the owning
 * subcomponent, and requalifying four entries while ~20 other subcomponent
 * props stay bare would make a machine-read file inconsistent in a new way.
 * Pinned exactly so a fifth spelling has to be added here deliberately instead
 * of quietly becoming a name the normaliser mangles.
 */
const INFORMAL_GROUP_NAMES = [
  'actions variant',
  'marker variant',
  'metadata columns',
  'orientation (ScrollBar)',
];

/**
 * `<Component>.<group>` for every group whose prop is inherited from a
 * third-party primitive's props type, with the package it comes from. Nothing
 * in the component file declares these, so only their names are verified — see
 * the docblock.
 *
 * Asserted as an EXACT set, not a floor: an exemption that outlives the thing it
 * exempts is how a guard quietly stops guarding.
 */
const INHERITED_GROUPS = [
  'Calendar.mode', // react-day-picker DayPickerProps
  'Popover.side', // @radix-ui/react-popover Content
  'ScrollArea.orientation (ScrollBar)', // @radix-ui/react-scroll-area ScrollAreaScrollbar
  'ScrollArea.type', // @radix-ui/react-scroll-area Root
  'Separator.orientation', // @radix-ui/react-separator Root
  'Tooltip.side', // @radix-ui/react-tooltip Content
];

/**
 * Capitalised tags an example may use that this package does not export.
 *
 * One entry, and it earns it: composing the kit's link styling onto a router's
 * own link component is the point of that example, and the tag names the foreign
 * framework openly. An illustrative placeholder that merely *looks* like a kit
 * component does not belong here — an agent cannot tell it apart from a real
 * export, which is the whole failure this file exists to stop.
 */
const FOREIGN_EXAMPLE_TAGS = ['NextLink'];

/**
 * Vacuity pins. Every parser here is hand-rolled over TSX, and a hand-rolled
 * parser goes blind *silently*: the first draft of this scan read numeric group
 * keys as nothing and reported three components as implementing zero values,
 * which as an assertion would have read "the registry advertises values the
 * source lacks" — a plausible-looking failure with a parser bug behind it.
 *
 * Exact counts, so both directions of drift surface in review.
 */
const EXPECTED_SCAN = {
  /** Component files under src/components (excluding tests). */
  componentFiles: 91,
  /** Files declaring at least one `cva` variants group. */
  filesWithCvaGroups: 54,
  /** Distinct `<file>:<group>` cva variant groups across all files. */
  cvaGroups: 95,
  /** Variant groups the registry advertises, across all entries. */
  registryGroups: 91,
};

// ---------------------------------------------------------------------------
// Source scanning
// ---------------------------------------------------------------------------

/**
 * Characters/keywords after which a `/` starts a regex literal rather than a
 * division — `hero.tsx` holds a regex containing an unbalanced quote, which
 * walks a naive scanner off the rails.
 *
 * Same list as `test/class-scan.ts`. Not imported from there because that module
 * returns string *contents* and this one needs the opposite: the structure
 * around them, with string bodies made inert.
 */
const REGEX_ALLOWED_AFTER =
  /(^|[=(,:[!&|?{};+\-*%<>~^]|\b(?:return|typeof|case|in|of|new|delete|void|do|else|yield|await))\s*$/;

/**
 * Drop comments and regex literals, and neutralise brackets inside string
 * literals, leaving a source whose braces balance and whose keys are intact.
 *
 * Comments must go: several components discuss their own props in prose, and a
 * scan that counted prose would let a docblock satisfy a requirement the code
 * does not meet. String bodies must stay readable (object keys can be quoted)
 * but must not contribute brackets — class strings are full of them.
 */
function stripToStructure(source: string): string {
  let out = '';
  let i = 0;

  while (i < source.length) {
    const c = source[i];

    if (c === '/' && source[i + 1] === '/') {
      const nl = source.indexOf('\n', i);
      out += '\n';
      i = nl === -1 ? source.length : nl + 1;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    if (c === '/' && REGEX_ALLOWED_AFTER.test(out.slice(-12))) {
      let j = i + 1;
      let inClass = false;
      while (j < source.length) {
        const d = source[j];
        if (d === '\\') j += 2;
        else if (d === '[') { inClass = true; j++; }
        else if (d === ']') { inClass = false; j++; }
        else if (d === '/' && !inClass) break;
        else if (d === '\n') break;
        else j++;
      }
      out += '0';
      i = j + 1;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      let j = i + 1;
      let body = '';
      while (j < source.length) {
        const d = source[j];
        if (d === '\\') { body += '  '; j += 2; continue; }
        if (d === quote) break;
        if (d === '\n' && quote !== '`') break;
        body += d;
        j++;
      }
      out += quote + body.replace(/[{}()[\]]/g, '~') + quote;
      i = j + 1;
      continue;
    }

    out += c;
    i++;
  }

  return out;
}

/** The balanced `{ … }` (or `( … )`) block at or after `from`. */
function balanced(
  source: string,
  from: number,
  open = '{',
  close = '}'
): { body: string; end: number } | null {
  const start = source.indexOf(open, from);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    if (source[i] === open) depth++;
    else if (source[i] === close) {
      depth--;
      if (depth === 0) return { body: source.slice(start + 1, i), end: i };
    }
  }
  return null;
}

interface ObjectEntry {
  key: string;
  /** Offset in the body where the value starts. */
  valueAt: number;
}

/**
 * Top-level `key: value` entries of an object body. Keys may be bare
 * identifiers, quoted, or numeric — `cva` groups keyed by a column count are all
 * three at once in this kit, and missing the numeric ones is exactly how the
 * first draft of this scan went blind.
 */
function objectEntries(body: string): ObjectEntry[] {
  const entries: ObjectEntry[] = [];
  let depth = 0;
  let i = 0;

  while (i < body.length) {
    const c = body[i] as string;

    if ('{[('.includes(c)) { depth++; i++; continue; }
    if ('}])'.includes(c)) { depth--; i++; continue; }

    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      let text = '';
      while (j < body.length && body[j] !== c) { text += body[j]; j++; }
      if (depth === 0) {
        const colon = /^\s*:/.exec(body.slice(j + 1));
        if (colon) entries.push({ key: text, valueAt: j + 1 + colon[0].length });
      }
      i = j + 1;
      continue;
    }

    if (depth === 0 && /[\w$]/.test(c)) {
      const pair = /^([\w$]+)\s*:/.exec(body.slice(i));
      if (pair) {
        entries.push({ key: pair[1] as string, valueAt: i + pair[0].length });
        i += pair[0].length;
        continue;
      }
      const word = /^[\w$]+/.exec(body.slice(i));
      i += word ? word[0].length : 1;
      continue;
    }

    i++;
  }

  return entries;
}

/** Every `cva` variants group in a structural source: group name → values. */
function cvaGroups(structure: string): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();
  let at = 0;

  for (;;) {
    at = structure.indexOf('cva(', at);
    if (at === -1) break;
    const call = balanced(structure, at + 3, '(', ')');
    at = call ? call.end : at + 4;
    if (!call) break;

    // The options object is the first top-level `{` of the call's arguments;
    // the base class string comes before it.
    let options: { body: string; end: number } | null = null;
    let depth = 0;
    for (let i = 0; i < call.body.length; i++) {
      const c = call.body[i] as string;
      if (c === "'" || c === '"' || c === '`') {
        i++;
        while (i < call.body.length && call.body[i] !== c) i++;
        continue;
      }
      if (c === '{' && depth === 0) { options = balanced(call.body, i); break; }
      if ('(['.includes(c)) depth++;
      if (')]'.includes(c)) depth--;
    }
    if (!options) continue;

    for (const option of objectEntries(options.body)) {
      if (option.key !== 'variants') continue;
      const block = balanced(options.body, option.valueAt);
      if (!block) continue;
      for (const group of objectEntries(block.body)) {
        const values = balanced(block.body, group.valueAt);
        if (!values) continue;
        const set = groups.get(group.key) ?? new Set<string>();
        for (const value of objectEntries(values.body)) set.add(value.key);
        groups.set(group.key, set);
      }
    }
  }

  return groups;
}

/** `'a' | 'b' | 'c'` (leading `|` allowed) → the members, or null. */
function literalUnion(text: string): string[] | null {
  const trimmed = text.trim().replace(/^\|/, '').trim();
  if (!/^'[^']*'(\s*\|\s*'[^']*')*$/.test(trimmed)) return null;
  return trimmed.split('|').map((part) => part.trim().slice(1, -1));
}

/**
 * The regions of a source that declare a component's own props: the body of every
 * exported `…Props` interface, and every exported `…Props` type alias.
 *
 * Scoping the union scan to these is what stops a union-typed field on a *data*
 * type from reading as a prop. One entry advertised a group whose four values are
 * real — but they belong to a field on the objects passed to a `steps` array, and
 * the component itself accepts no prop of that name at all. A file-wide scan
 * blessed it, which is the original defect with a union type on top.
 */
function propsRegions(structure: string): string[] {
  const regions: string[] = [];

  for (const match of structure.matchAll(
    /export\s+(interface|type)\s+[A-Za-z_$][\w$]*Props\b/g
  )) {
    const at = (match.index ?? 0) + match[0].length;
    if (match[1] === 'interface') {
      const block = balanced(structure, at);
      if (block) regions.push(block.body);
      continue;
    }
    const end = structure.indexOf(';', at);
    regions.push(structure.slice(at, end === -1 ? undefined : end));
  }

  return regions;
}

/**
 * Props whose declared type is a union of string literals: prop name → members.
 *
 * Covers the two forms the kit uses — the union written at the declaration, and
 * a one-level alias to a union declared in the same file. Both are what makes a
 * prop like the one this kit resolves from thresholds (a value the class factory
 * never sees, so it appears in no `cva` group) verifiable at all.
 *
 * Aliases are collected file-wide (they are only lists of values); the props that
 * reference them are read from `propsRegions` only.
 */
function unionProps(structure: string): Map<string, Set<string>> {
  const aliases = new Map<string, string[]>();
  for (const match of structure.matchAll(/\btype\s+([A-Za-z_$][\w$]*)\s*=([^;]*);/g)) {
    const members = literalUnion(match[2] as string);
    if (members) aliases.set(match[1] as string, members);
  }

  const props = new Map<string, Set<string>>();
  const declarations = propsRegions(structure).join('\n;\n');
  const record = (name: string, members: string[]) => {
    const set = props.get(name) ?? new Set<string>();
    for (const member of members) set.add(member);
    props.set(name, set);
  };

  for (const match of declarations.matchAll(
    /(?:^|[\s;{,(])([A-Za-z_$][\w$]*)\s*\?\s*:\s*((?:'[^']*'\s*\|\s*)+'[^']*')\s*[;,)]/g
  )) {
    const members = literalUnion(match[2] as string);
    if (members) record(match[1] as string, members);
  }

  for (const match of declarations.matchAll(
    /(?:^|[\s;{,(])([A-Za-z_$][\w$]*)\s*\??\s*:\s*([A-Za-z_$][\w$]*)\s*[;,)]/g
  )) {
    const members = aliases.get(match[2] as string);
    if (members) record(match[1] as string, members);
  }

  return props;
}

/** Names this file exports, from `export { … }` lists and inline declarations. */
function exportedNames(structure: string): Set<string> {
  const names = new Set<string>();

  for (const match of structure.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of (match[1] as string).split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim().replace(/^type\s+/, '');
      if (name) names.add(name);
    }
  }
  for (const match of structure.matchAll(
    /export\s+(?:declare\s+)?(?:const|function|class|type|interface)\s+([A-Za-z_$][\w$]*)/g
  )) {
    names.add(match[1] as string);
  }

  return names;
}

interface ScannedComponent {
  file: string;
  structureLength: number;
  cva: Map<string, Set<string>>;
  unions: Map<string, Set<string>>;
  exports: Set<string>;
}

const componentFiles = readdirSync(componentsDir)
  .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
  .sort();

const scanned = new Map<string, ScannedComponent>(
  componentFiles.map((file) => {
    const structure = stripToStructure(readFileSync(join(componentsDir, file), 'utf-8'));
    return [
      `components/${file}`,
      {
        file,
        structureLength: structure.length,
        cva: cvaGroups(structure),
        unions: unionProps(structure),
        exports: exportedNames(structure),
      },
    ];
  })
);

const kitExports = new Set([...scanned.values()].flatMap((s) => [...s.exports]));

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

interface RegistryVariant {
  name: string;
  values: string[];
}

interface RegistryEntry {
  name: string;
  category: string;
  description: string;
  keywords: string[];
  file: string;
  variants: RegistryVariant[];
  hasRadixPrimitive: boolean;
  examples: { title: string; code: string }[];
}

const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
  version: string;
  components: RegistryEntry[];
};

/** Categories `registry/schema.ts` itself lists, so the two cannot drift. */
const schemaCategories = (() => {
  const schema = stripToStructure(readFileSync(schemaPath, 'utf-8'));
  const at = schema.indexOf('category');
  const declaration = schema.slice(at, schema.indexOf(';', at));
  return new Set(literalUnion(declaration.slice(declaration.indexOf(':') + 1)) ?? []);
})();

/** The bare prop name behind a registry group name. */
function propName(groupName: string): string {
  return (
    groupName
      .replace(/\s*\([^)]*\)\s*$/, '')
      .trim()
      .split(/\s+/)
      .pop() ?? ''
  );
}

interface BackedGroup {
  entry: string;
  /** The group name as the registry writes it. */
  group: string;
  /** Values the source declares, from either backing. */
  declared: Set<string>;
  /** Values declared by a `cva` group specifically. */
  cvaDeclared: Set<string> | undefined;
  /** Values declared by a union-typed prop specifically. */
  unionDeclared: Set<string> | undefined;
  advertised: string[];
}

const backed: BackedGroup[] = [];
const unbacked: string[] = [];

for (const entry of registry.components) {
  const component = scanned.get(entry.file);
  if (!component) continue;

  for (const variant of entry.variants) {
    const prop = propName(variant.name);
    const fromCva = component.cva.get(prop);
    const fromUnion = component.unions.get(prop);

    if (!fromCva && !fromUnion) {
      unbacked.push(`${entry.name}.${variant.name}`);
      continue;
    }

    backed.push({
      entry: entry.name,
      group: variant.name,
      declared: new Set([...(fromCva ?? []), ...(fromUnion ?? [])]),
      cvaDeclared: fromCva,
      unionDeclared: fromUnion,
      advertised: variant.values,
    });
  }
}

/** Groups whose declared values are a two-state pair carry no value inventory. */
function isTwoState(values: Set<string>): boolean {
  return [...values].every((value) => value === 'true' || value === 'false');
}

// ---------------------------------------------------------------------------
// Suites
// ---------------------------------------------------------------------------

describe('registry — the scan itself sees the source', () => {
  it('finds every file an entry points at', () => {
    const missing = registry.components
      .filter((entry) => !existsSync(join(srcDir, entry.file)))
      .map((entry) => `${entry.name} -> ${entry.file}`);

    expect(
      missing,
      'These entries name a file that does not exist, so nothing below can check them.'
    ).toEqual([]);
  });

  it('parses a non-empty structure out of every component file', () => {
    const empty = [...scanned.values()]
      .filter((component) => component.structureLength < 200)
      .map((component) => component.file);

    expect(
      empty,
      'The scanner produced (almost) nothing for these files, so every assertion about ' +
        'them passes by finding nothing. Fix the scanner before trusting this suite.'
    ).toEqual([]);
  });

  it('reads exactly the expected inventory of sources and groups', () => {
    const found = {
      componentFiles: componentFiles.length,
      filesWithCvaGroups: [...scanned.values()].filter((c) => c.cva.size > 0).length,
      cvaGroups: [...scanned.values()].reduce((total, c) => total + c.cva.size, 0),
      registryGroups: registry.components.reduce((total, e) => total + e.variants.length, 0),
    };

    expect(
      found,
      'The scan drifted from EXPECTED_SCAN.\n' +
        '- FEWER groups usually means the parser stopped reading a form it used to read, and ' +
        'the comparisons below are now passing vacuously over whatever it lost. Fix the ' +
        'parser.\n' +
        '- MORE (or a different file count) means the library or the registry grew. That is ' +
        'fine — update these numbers in the same commit so the change is visible in review.'
    ).toEqual(EXPECTED_SCAN);
  });

  it('finds the category literals declared by the registry schema', () => {
    expect(
      schemaCategories.size,
      'Could not read the category union out of registry/schema.ts, so the shape assertion ' +
        'below would accept any category at all.'
    ).toBeGreaterThan(5);
  });

  it('normalises exactly the known informal group names', () => {
    const informal = registry.components
      .flatMap((entry) => entry.variants.map((variant) => variant.name))
      .filter((name) => propName(name) !== name)
      .sort();

    expect(
      informal,
      'A registry group name that is not a bare prop name has appeared or changed shape. ' +
        'The normaliser strips a trailing parenthetical and keeps the last word; anything ' +
        'else it would mangle into a prop nothing declares. Add the spelling to ' +
        'INFORMAL_GROUP_NAMES deliberately, or write the group name as the prop.'
    ).toEqual([...INFORMAL_GROUP_NAMES].sort());
  });
});

describe('registry — every entry matches the schema it is served under', () => {
  it.each(registry.components.map((entry) => [entry.name, entry] as const))(
    '%s declares every required field',
    (_name, entry) => {
      const problems: string[] = [];

      if (typeof entry.name !== 'string' || entry.name.length === 0) problems.push('name');
      if (!schemaCategories.has(entry.category)) {
        problems.push(`category is not one of the literals registry/schema.ts declares`);
      }
      if (typeof entry.description !== 'string' || entry.description.length === 0) {
        problems.push('description');
      }
      if (!Array.isArray(entry.keywords) || entry.keywords.length === 0) problems.push('keywords');
      if (typeof entry.file !== 'string' || !entry.file.startsWith('components/')) {
        problems.push('file');
      }
      if (!Array.isArray(entry.variants)) problems.push('variants');
      if (typeof entry.hasRadixPrimitive !== 'boolean') problems.push('hasRadixPrimitive');
      if (!Array.isArray(entry.examples) || entry.examples.length === 0) problems.push('examples');
      for (const variant of entry.variants ?? []) {
        if (typeof variant.name !== 'string' || !Array.isArray(variant.values)) {
          problems.push('a variant group is not { name, values }');
        }
      }
      for (const example of entry.examples ?? []) {
        if (typeof example.title !== 'string' || typeof example.code !== 'string') {
          problems.push('an example is not { title, code }');
        }
      }

      expect(
        problems,
        'The mcp-server reads every field of every entry and its own types require all of ' +
          'them. A malformed entry is a runtime failure in a tool an agent is mid-task with.'
      ).toEqual([]);
    }
  );
});

describe('registry — every variant group names a prop the source has', () => {
  it('exempts exactly the groups inherited from a third-party primitive', () => {
    expect(
      unbacked.sort(),
      'A registry variant group names a prop that NOTHING in the component file declares — ' +
        'no `cva` variants group of that name, no union-typed prop of that name. This is the ' +
        'NIMUI-49 defect itself: an agent reading the entry writes the prop, the prop does ' +
        'not exist, and the wrong code is already written before the type error appears.\n' +
        'Delete the group (the fix is to make the registry honest, NOT to implement the ' +
        'missing feature — that is a separate, deliberate decision), or, if the prop really ' +
        'does reach consumers from an upstream primitive, add it to INHERITED_GROUPS naming ' +
        'the package it comes from. Note what that costs: an inherited group has its NAME ' +
        'checked and its VALUES checked by nobody.'
    ).toEqual([...INHERITED_GROUPS].sort());
  });

  it('has backed groups left to compare', () => {
    expect(backed.length).toBeGreaterThan(60);
  });

  it.each(backed.map((group) => [`${group.entry}.${group.group}`, group] as const))(
    '%s advertises only values the source declares',
    (_label, group) => {
      const unreal = group.advertised
        .filter((value) => !group.declared.has(value))
        .map((value) => `${group.entry}.${group.group}: ${value}`);

      expect(
        unreal,
        'The registry advertises a value the source does not declare. Every one found when ' +
          'this suite was written was either a value that had been renamed in the component ' +
          'and left stale in the registry, or a value invented for a prop that never took ' +
          'one. Compare against the `cva` keys / the union members in the component file and ' +
          'write down what is there.'
      ).toEqual([]);
    }
  );

  it.each(backed.map((group) => [`${group.entry}.${group.group}`, group] as const))(
    '%s advertises every value the source declares',
    (_label, group) => {
      const advertised = new Set(group.advertised);
      const hidden: string[] = [];

      // Two-state groups carry no inventory to publish: the registry describes
      // enumerable choices, and whether it should describe a boolean prop at all
      // is a schema question this suite does not answer.
      if (group.cvaDeclared && !isTwoState(group.cvaDeclared)) {
        for (const value of group.cvaDeclared) {
          if (!advertised.has(value)) hidden.push(`${group.entry}.${group.group}: ${value}`);
        }
      }
      if (group.unionDeclared) {
        for (const value of group.unionDeclared) {
          if (!advertised.has(value)) hidden.push(`${group.entry}.${group.group}: ${value}`);
        }
      }

      expect(
        hidden.sort(),
        'The source declares a value the registry hides. Half the drift this suite was ' +
          'written for was a value renamed in the component: the entry kept the old ' +
          'spelling and never gained the new one, so an agent was told a value that does ' +
          'not work and not told the one that does. Only a two-way comparison sees that, ' +
          'which is why this assertion exists alongside its opposite.'
      ).toEqual([]);
    }
  );
});

describe('registry — examples compose real components with real values', () => {
  /** Capitalised JSX tags in `code`, skipping type arguments like `useState<T>()`. */
  function jsxTags(code: string): { name: string; at: number }[] {
    return [...code.matchAll(/(?:^|[^\w$.])<([A-Z][A-Za-z0-9_]*)/g)].map((match) => ({
      name: match[1] as string,
      at: match.index ?? 0,
    }));
  }

  it('names only components the kit exports', () => {
    const foreign = new Set<string>();
    for (const entry of registry.components) {
      for (const example of entry.examples) {
        for (const tag of jsxTags(example.code)) {
          if (!kitExports.has(tag.name)) foreign.add(`${tag.name}`);
        }
      }
    }

    expect(
      [...foreign].sort(),
      'An example composes a capitalised tag no component file exports. Entries were found ' +
        'building whole families of subcomponents that never existed anywhere but in the ' +
        'registry — the most expensive kind of false entry, because an agent following it ' +
        'writes an import that cannot resolve and a structure the real component cannot ' +
        'accept.\n' +
        'Rewrite the example against the exported API. A placeholder standing in for the ' +
        "consumer's own content must not be spelled like a kit component; use a plain " +
        'element. FOREIGN_EXAMPLE_TAGS is for a tag that openly belongs to another ' +
        'framework, and it is asserted as an exact set so an exemption cannot outlive its ' +
        'example.'
    ).toEqual([...FOREIGN_EXAMPLE_TAGS].sort());
  });

  it.each(registry.components.map((entry) => [entry.name, entry] as const))(
    '%s examples pass advertised values to the props they name',
    (_name, entry) => {
      const groups = new Map(
        backed
          .filter((group) => group.entry === entry.name)
          .map((group) => [propName(group.group), group])
      );
      if (groups.size === 0) return;

      const wrong: string[] = [];

      for (const example of entry.examples) {
        const tags = jsxTags(example.code);

        for (const attribute of example.code.matchAll(/([A-Za-z_][\w:-]*)="([^"]*)"/g)) {
          const at = attribute.index ?? 0;
          // The owning tag is the last one opened before the attribute: in JSX a
          // tag's attributes always precede any child tag.
          const owner = [...tags].reverse().find((tag) => tag.at < at);
          if (!owner || !owner.name.startsWith(entry.name)) continue;

          const group = groups.get(attribute[1] as string);
          if (!group) continue;
          if (!group.declared.has(attribute[2] as string)) {
            wrong.push(
              `${entry.name} example "${example.title}" passes ${attribute[1]} a value the ` +
                `source does not declare`
            );
          }
        }
      }

      expect(
        wrong,
        'An example passes a variant prop a value the component does not declare. Examples ' +
          'are the part of an entry an agent copies verbatim, so a stale one produces the ' +
          'exact wrong code the entry was meant to prevent.'
      ).toEqual([]);
    }
  );
});
