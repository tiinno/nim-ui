import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import ts from 'typescript';

/**
 * A documented `<PropsTable>` enum must say what the component's `cva` says.
 *
 * ## The defect this exists for (NIMUI-81)
 *
 * Four props-table drifts were found in three days, each by a human happening to
 * read one page:
 *
 * - `button.mdx` documented five variant values and a default the component does
 *   not have; the cva declares six and a different default.
 * - `button.mdx`'s prose said three sizes where the cva defines four.
 * - `progress.mdx` documented a colour variant under a name the cva does not
 *   declare. That one fails **silently**: an unmatched cva key is not an error,
 *   so the bar renders with no variant classes at all — no exception, no
 *   warning, nothing in the console. A consumer copying the documented value
 *   gets a component that quietly does nothing.
 *
 * A one-time audit finds today's drift and does nothing about tomorrow's,
 * because the table and the component are edited by different changes at
 * different times. This is the same shape as `registry-truth.test.ts` (the
 * registry advertising props the source does not have) and
 * `documented-inventory.test.ts` (prose counts against the registry), and it is
 * answered the same way: mechanically, in the suite, with the exceptions written
 * down.
 *
 * ## How a table is tied to a cva
 *
 * The chain is entirely derived, never assumed:
 *
 * 1. A page is `<category>/<slug>.mdx`. Its tables are attributed to a
 *    component by the SUBheading each one sits under (`### Card`), and to the
 *    page's own component when there is no subheading. Every page documenting
 *    more than one component uses that convention; the three whose headings name
 *    two components at once (or a hook) are pinned below rather than guessed at.
 * 2. The component is whichever source file declares `<Component>Props` —
 *    `<slug>.tsx` first, then any other component file, because two pages
 *    document a component that lives in a differently named file. Ambiguity is
 *    reported, not guessed.
 * 3. That declaration's `VariantProps<typeof …>` heritage names the cva
 *    definitions whose groups the component actually accepts as props. **This
 *    step is the whole reason the check works**: `Progress`'s `variant` prop is
 *    declared by `progressIndicatorVariants`, not by `progressVariants`, so
 *    matching a component to the cva that shares its name would have missed the
 *    exact bug this guard was written for.
 * 4. A documented prop is compared only when its name is one of the resolved
 *    group names. Most documented props are ordinary React props with no cva
 *    counterpart, and a guard that had an opinion about those would be noise.
 *
 * ## What is asserted
 *
 * - Every value a table documents for a cva-backed prop is a key of that cva
 *   group. This is the silent-failure defect.
 * - Every key of that cva group is documented. The other direction matters just
 *   as much and is harder to notice by reading: `badge.mdx` listed four of seven
 *   variant values while its own playground used two of the missing three.
 * - A documented `default` matches `defaultVariants`, when both sides state one.
 * - A boolean cva group (keys `true`/`false`) is documented as a boolean. A
 *   one-sided boolean group — only the `true` key, so that passing false applies
 *   nothing — is normal cva and is not a missing value.
 *
 * ## What is NOT asserted, and why
 *
 * - **Prose.** The button size drift lived in a sentence ("Three size options
 *   are available") two sections above a table that already said four. Counting
 *   number-words in prose is exactly the noisy check that gets a guard disabled,
 *   so the prose form of this defect remains uncovered. `badge.mdx` had the
 *   same pair, and its prose was corrected by hand in the commit that added
 *   this file.
 * - **Preview blocks.** A `<ComponentPreview>` demonstrating four of seven
 *   variants is not a false statement, and `registry-truth.test.ts` already
 *   asserts the registry's examples pass values the source declares.
 * - **Descriptions and non-cva props.** Free prose and ordinary React props.
 * - **Whether a prop exists at all.** A table row naming a prop no component
 *   declares is invisible here unless the name collides with a cva group.
 * - **A default the component applies by destructuring.** A cva group with no
 *   `defaultVariants` entry can still have a default, set in the component's
 *   parameter list. Matching a destructured parameter to the cva call that
 *   consumes it is not something to mechanise loosely, so those defaults are
 *   listed in DEFAULTS_NOT_COMPARED rather than half-checked.
 *
 * ## Coverage, stated
 *
 * 90 component pages, 84 of which carry a table; 150 tables; 95 variant groups
 * a consumer can pass to an exported component, of which **87 are compared
 * against a documented row and 8 are documented nowhere at all** (pinned, with
 * the reason). 30 tables belong to components that declare no props type, and
 * a separate assertion proves those components reference no cva — so "nothing
 * to check there" is a fact rather than an assumption.
 *
 * That statement was false when this file first landed, in the way it was
 * written to prevent. The cva lookup was per-file, so `PasswordInput`'s two
 * groups — reached through `VariantProps<typeof inputVariants>` imported from
 * `./input` — resolved to nothing and left the inventory without a word. The
 * count read 93 because two groups had quietly stopped existing, and the
 * suite's own green was the only evidence of it. Resolution now falls back to
 * a package-wide map, and an unresolvable name is pushed into `complications`
 * so it surfaces in UNRESOLVED_HERITAGE instead of disappearing.
 *
 * The pinned inventories below are the whole of what is NOT compared, each
 * asserted as an EXACT set so an exemption cannot outlive the thing it exempts.
 * The counts in `EXPECTED_SCAN` are exact for the same reason: a reader that
 * goes blind makes fewer comparisons, and fewer comparisons is a green run.
 *
 * ## Why no value is written as a literal here
 *
 * Same reason `registry-truth.test.ts` gives. Test files are outside the
 * Tailwind scan, so nothing in this file compiles a rule — but a string literal
 * in a test still counts as a USER for `compiled-utility-inventory.test.ts`, so
 * naming a variant value that happens to also be a utility would vouch for a
 * rule nothing asks for and mask a genuine leak. Every value this suite talks
 * about is derived at runtime from the two sides it compares; the pins hold page
 * names, component names and group names only.
 */

const srcDir = resolve(__dirname);
const componentsDir = join(srcDir, 'components');
const docsComponentsDir = resolve(srcDir, '../../docs/content/docs/components');

// ---------------------------------------------------------------------------
// Pinned inventories
// ---------------------------------------------------------------------------

/**
 * Pages named after the section they build rather than after the component they
 * document, whose tables sit under no subheading naming it either.
 *
 * One entry: the page slug is the section, the component is an initialism, and
 * no capitalisation rule turns one into the other. The alias is asserted to be
 * both correct and NEEDED below, so it cannot outlive a page rename.
 */
const PAGE_COMPONENT_ALIASES: Record<string, string> = {
  'landing/cta-section.mdx': 'CTA',
};

/**
 * Pages that cannot be tied to a component source at all.
 *
 * Empty, and kept so the next one trips it rather than joining a growing list
 * of pages nobody is checking.
 */
const UNMAPPED_PAGES: string[] = [];

/**
 * Tables filed under a subheading that does not name exactly one component.
 *
 * A heading that names two components, or a group of them, cannot be resolved to
 * one props declaration, and guessing would be worse than saying so: the table
 * would be compared against a component it does not describe. Split the table,
 * or rename the heading to the component it documents, and this entry goes away.
 */
const TABLES_UNDER_AN_UNNAMED_OWNER = [
  // "AlertDialogAction / AlertDialogCancel" — one table for two components.
  'feedback/alert-dialog.mdx',
  // "AdminShellSidebar and AdminShellHeader" — likewise.
  'layout/admin-shell.mdx',
  // "usePagination" — a hook's options object, not a component's props. Nothing
  // here will ever apply to it.
  'navigation/pagination.mdx',
];

/**
 * Component props whose cva reference this reader will not resolve.
 *
 * Empty. `Omit<VariantProps<typeof …>, …>` — the one wrapper the kit uses — is
 * resolved by subtracting the omitted keys, which is what makes `Banner`'s
 * `align` checkable while correctly leaving its `tone` to the local union type
 * that actually declares it. The list stays so that a `Pick`, a conditional or
 * a mapped type has to be dealt with deliberately instead of quietly removing a
 * component from the comparison.
 */
const UNRESOLVED_HERITAGE: string[] = [];

/**
 * Variant groups a consumer can pass that no documented table states.
 *
 * Every one of these is a prop the component accepts and the documentation does
 * not mention — a gap, not a false statement, which is why they are pinned
 * rather than failed: closing one means writing documentation, and this change
 * corrects claims rather than authoring pages. Left for a follow-up ticket.
 *
 * One cause, eight times over — see the comment on the list.
 */
const UNCOVERED_VARIANT_GROUPS = [
  // Every one of these is the same cause: the page documents the family's main
  // component and some of its parts, and has no table for THIS part at all. The
  // fix is a new `### <Component>` section with a table, which is documentation
  // to be written rather than a claim to be corrected — a follow-up ticket.
  'DropdownMenuSubContent.variant (dropdown-menu.tsx)',
  'FormLayoutActions.sticky (form-layout.tsx)',
  'FormLayoutSection.divided (form-layout.tsx)',
  'RecordInspectorBody.density (record-inspector.tsx)',
  'RecordInspectorFooter.sticky (record-inspector.tsx)',
  'RecordInspectorHeader.density (record-inspector.tsx)',
  'RecordInspectorSection.density (record-inspector.tsx)',
  'ViewSwitcherCount.selected (view-switcher.tsx)',
];

/**
 * Documented defaults that cannot be compared, because only one side states one.
 *
 * A cva group with no `defaultVariants` entry can still have a default: the
 * component destructures one in its signature, which is where every entry marked
 * "documented only" below sets it. Reading those out would mean matching
 * parameter destructuring to the cva call that consumes it, and a check that
 * appeared to cover them while silently resolving nothing is worse than an
 * honest hole. The one marked "declared only" is the opposite case — a cva
 * default the table does not mention — and is a documentation gap of the same
 * family as UNCOVERED_VARIANT_GROUPS.
 */
const DEFAULTS_NOT_COMPARED = [
  // Documented, with no `defaultVariants` entry to check it against: each of
  // these defaults is applied by the component's own parameter destructuring.
  'Dot.pulse (data-display/dot.mdx) <- documented only',
  'FeatureGrid.columns (landing/feature.mdx) <- documented only',
  'FormLayoutGrid.columns (forms/form-layout.mdx) <- documented only',
  'Grid.cols (layout/grid.mdx) <- documented only',
  'RecordInspectorMetadata.columns (data-display/record-inspector.mdx) <- documented only',
  'Text.truncate (primitives/text.mdx) <- documented only',
  // Documented in prose rather than as a value, because it genuinely varies with
  // the element the component renders.
  'Text.variant (primitives/text.mdx) <- documented only',
  'Text.weight (primitives/text.mdx) <- documented only',
  // Declared by the cva and not stated by the table: a documentation gap, in the
  // one row that overrides a default it never mentions.
  'MetricCardDelta.tone (data-display/metric-card.mdx) <- declared only',
];

/**
 * Two different cva definitions reachable from one props declaration that
 * declare the same group name with different keys or different defaults.
 *
 * Empty, and kept so the next one trips it: such a group cannot be compared
 * against a single documented enum, and the guard must say so rather than pick
 * one of the two.
 */
const AMBIGUOUS_GROUPS: string[] = [];

/**
 * Documented types this suite cannot read as an enumeration, for a prop that IS
 * a cva group.
 *
 * Empty, and kept so the next one trips it. A cva-backed prop documented as
 * something other than a union of literals (or a boolean, for a boolean group)
 * is either mis-typed in the table or a shape this reader needs to learn.
 */
const NOT_ENUMERABLE: string[] = [];

/**
 * Exact counts, so a reader-side regression cannot pass by finding nothing.
 *
 * Every number here is produced by a hand-written reader over sources it does
 * not compile. A FALL is the signal that matters — fewer comparisons is a
 * quieter run, not a better one. A RISE is fine and means the library or the
 * docs grew; update the numbers in the same commit so the change is visible in
 * review.
 */
const EXPECTED_SCAN = {
  /** Component sources scanned (excluding their tests). */
  componentFiles: 91,
  /** `cva()` calls across them. */
  cvaCalls: 95,
  /** Documentation pages under `content/docs/components`. */
  pages: 90,
  /** `<PropsTable>` blocks found on them. */
  tables: 150,
  /** Variant groups an exported component accepts as props. */
  consumerFacingGroups: 95,
  /**
   * Tables whose component declares no props type anywhere — subcomponents that
   * take a plain element's attributes. Nothing to compare, and the assertion
   * below proves none of them hides a cva; the count is here so that a jump in
   * it has to be looked at.
   */
  tablesWithoutAPropsDeclaration: 30,
  /** Table rows compared against a cva group. */
  comparisons: 87,
  /** Of those, compared value-for-value (the rest are boolean groups). */
  enumComparisons: 78,
  /** Of those, whose default was compared against `defaultVariants`. */
  defaultComparisons: 73,
};

// ---------------------------------------------------------------------------
// Component sources
// ---------------------------------------------------------------------------

interface CvaDefinition {
  /** group name -> declared keys, in source order */
  groups: Map<string, string[]>;
  /** group name -> `defaultVariants` value */
  defaults: Map<string, string>;
}

interface VariantReference {
  /** The cva definition's identifier. */
  ref: string;
  /** Group names an `Omit<…>` wrapper removes from what the component accepts. */
  omit: string[];
}

interface PropsDeclaration {
  name: string;
  exported: boolean;
  /** cva definitions reached through `VariantProps<typeof …>` */
  variantRefs: VariantReference[];
  /** other `…Props` declarations in the same file that this one extends */
  localRefs: string[];
  /** heritage that mentions VariantProps in a shape this reader does not resolve */
  complications: string[];
}

interface ScannedComponent {
  file: string;
  cva: Map<string, CvaDefinition>;
  props: Map<string, PropsDeclaration>;
  cvaCalls: number;
  /** Every cva definition the file references through `VariantProps`, anywhere. */
  referencedAnywhere: Set<string>;
}

/** The two keys a boolean cva group is written with, derived rather than typed. */
const BOOLEAN_KEYS: readonly string[] = [true, false].map(String);

function parseSource(path: string, kind: ts.ScriptKind, text?: string): ts.SourceFile {
  return ts.createSourceFile(
    path,
    text ?? readFileSync(path, 'utf-8'),
    ts.ScriptTarget.Latest,
    true,
    kind
  );
}

/** An object-literal key, whatever syntax it is written in. */
function propertyKey(name: ts.PropertyName, sf: ts.SourceFile): string | null {
  if (ts.isComputedPropertyName(name)) return null;
  return name.getText(sf).replace(/^['"`]|['"`]$/g, '');
}

/** A value written as a string literal, `true` or `false`. */
function literalValue(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return BOOLEAN_KEYS[0] ?? null;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return BOOLEAN_KEYS[1] ?? null;
  return null;
}

function collectCva(sf: ts.SourceFile): { defs: Map<string, CvaDefinition>; calls: number } {
  const defs = new Map<string, CvaDefinition>();
  let calls = 0;

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'cva') {
      calls++;
      const config = node.arguments[1];
      const definition: CvaDefinition = { groups: new Map(), defaults: new Map() };

      if (config !== undefined && ts.isObjectLiteralExpression(config)) {
        for (const option of config.properties) {
          if (!ts.isPropertyAssignment(option)) continue;
          const optionName = propertyKey(option.name, sf);

          if (optionName === 'variants' && ts.isObjectLiteralExpression(option.initializer)) {
            for (const group of option.initializer.properties) {
              if (!ts.isPropertyAssignment(group)) continue;
              if (!ts.isObjectLiteralExpression(group.initializer)) continue;
              const groupName = propertyKey(group.name, sf);
              if (groupName === null) continue;
              const values: string[] = [];
              for (const value of group.initializer.properties) {
                if (!ts.isPropertyAssignment(value)) continue;
                const key = propertyKey(value.name, sf);
                if (key !== null) values.push(key);
              }
              definition.groups.set(groupName, values);
            }
          }

          if (optionName === 'defaultVariants' && ts.isObjectLiteralExpression(option.initializer)) {
            for (const entry of option.initializer.properties) {
              if (!ts.isPropertyAssignment(entry)) continue;
              const groupName = propertyKey(entry.name, sf);
              const value = literalValue(entry.initializer);
              if (groupName !== null && value !== null) definition.defaults.set(groupName, value);
            }
          }
        }
      }

      const owner = node.parent;
      if (ts.isVariableDeclaration(owner) && ts.isIdentifier(owner.name)) {
        defs.set(owner.name.text, definition);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return { defs, calls };
}

/** Does this node mention `VariantProps` anywhere inside it? */
function mentionsVariantProps(node: ts.Node): boolean {
  if (ts.isIdentifier(node) && node.text === 'VariantProps') return true;
  let found = false;
  ts.forEachChild(node, (child) => {
    if (!found && mentionsVariantProps(child)) found = true;
  });
  return found;
}

function collectProps(sf: ts.SourceFile): Map<string, PropsDeclaration> {
  const declarations = new Map<string, PropsDeclaration>();

  /** The members of a `'a' | 'b'` type argument. */
  const keyList = (node: ts.TypeNode | undefined): string[] => {
    if (node === undefined) return [];
    const parts = ts.isUnionTypeNode(node) ? node.types : [node];
    const keys: string[] = [];
    for (const part of parts) {
      if (ts.isLiteralTypeNode(part) && ts.isStringLiteral(part.literal)) keys.push(part.literal.text);
    }
    return keys;
  };

  /** One heritage element / intersection member. */
  const readSupertype = (node: ts.Node, into: PropsDeclaration, omit: string[] = []): void => {
    let head: ts.Node | undefined;
    let args: ts.NodeArray<ts.TypeNode> | undefined;

    if (ts.isExpressionWithTypeArguments(node)) {
      head = node.expression;
      args = node.typeArguments;
    } else if (ts.isTypeReferenceNode(node)) {
      head = node.typeName;
      args = node.typeArguments;
    } else {
      // A type literal, a mapped type, a conditional — nothing to resolve unless
      // it hides a cva reference, in which case say so.
      if (mentionsVariantProps(node)) into.complications.push(node.getText(sf));
      return;
    }

    const name = head.getText(sf);
    const first = args?.[0];

    if (name === 'VariantProps') {
      if (first !== undefined && ts.isTypeQueryNode(first)) {
        into.variantRefs.push({ ref: first.exprName.getText(sf), omit });
      } else {
        into.complications.push(node.getText(sf));
      }
      return;
    }

    // `Omit<VariantProps<typeof …>, 'tone'>` SUBTRACTS a group: the component
    // takes that prop from somewhere else (a local union it declares itself) or
    // computes it. Reading the wrapper and not the subtraction would report a
    // group the component does not accept, so the omitted keys are carried
    // through and dropped during resolution.
    if (name === 'Omit' && first !== undefined) {
      readSupertype(first, into, [...omit, ...keyList(args?.[1])]);
      return;
    }

    if (/Props$/.test(name) && !name.includes('.')) {
      into.localRefs.push(name);
      return;
    }

    // React attribute bags, Radix props, anything else: only interesting if a
    // cva reference is hiding inside one.
    if (mentionsVariantProps(node)) into.complications.push(node.getText(sf));
  };

  const isExported = (node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration): boolean =>
    (node.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

  const visit = (node: ts.Node): void => {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      /Props$/.test(node.name.text)
    ) {
      const declaration: PropsDeclaration = {
        name: node.name.text,
        exported: isExported(node),
        variantRefs: [],
        localRefs: [],
        complications: [],
      };

      if (ts.isInterfaceDeclaration(node)) {
        for (const clause of node.heritageClauses ?? []) {
          for (const type of clause.types) readSupertype(type, declaration);
        }
      } else {
        const members = ts.isIntersectionTypeNode(node.type) ? node.type.types : [node.type];
        for (const member of members) readSupertype(member, declaration);
      }

      declarations.set(declaration.name, declaration);
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);
  return declarations;
}

/**
 * Every cva definition named in a `VariantProps<typeof …>` anywhere in the file,
 * whether or not a props declaration is what names it.
 *
 * The check this feeds is what turns "a component with no `…Props` declaration
 * has no variant props" from an assumption into something asserted.
 */
function collectVariantReferences(sf: ts.SourceFile): Set<string> {
  const refs = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (
      (ts.isTypeReferenceNode(node) && node.typeName.getText(sf) === 'VariantProps') ||
      (ts.isExpressionWithTypeArguments(node) && node.expression.getText(sf) === 'VariantProps')
    ) {
      const first = node.typeArguments?.[0];
      if (first !== undefined && ts.isTypeQueryNode(first)) refs.add(first.exprName.getText(sf));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return refs;
}

const componentFiles = readdirSync(componentsDir)
  .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
  .sort();

const scanned = new Map<string, ScannedComponent>(
  componentFiles.map((file) => {
    const sf = parseSource(join(componentsDir, file), ts.ScriptKind.TSX);
    const { defs, calls } = collectCva(sf);
    return [
      file,
      {
        file,
        cva: defs,
        props: collectProps(sf),
        cvaCalls: calls,
        referencedAnywhere: collectVariantReferences(sf),
      },
    ];
  })
);

/**
 * Every cva definition in the package, by identifier, so a `VariantProps<typeof
 * x>` whose `x` was imported from a sibling file still resolves.
 *
 * A same-file-only lookup drops those on the floor **silently**: the ref
 * resolves to nothing, no complication is recorded, and the groups simply never
 * enter the coverage inventory — so the suite reports full coverage of a set it
 * quietly shrank. `password-input.tsx` is the live case (it declares no cva of
 * its own and extends `VariantProps<typeof inputVariants>` imported from
 * `./input`), and it is precisely the failure this file exists to prevent,
 * turned on the reader itself.
 *
 * Keyed to an array, not a definition, so a name defined in two files is
 * reported as unresolvable rather than guessed at. No collision exists today.
 */
const cvaByName = new Map<string, CvaDefinition[]>();
for (const component of scanned.values()) {
  for (const [name, definition] of component.cva) {
    const existing = cvaByName.get(name);
    if (existing === undefined) cvaByName.set(name, [definition]);
    else existing.push(definition);
  }
}

/**
 * cva definitions a file exposes through `VariantProps` without any `…Props`
 * declaration naming them — i.e. variant props reaching consumers by a route
 * this suite cannot follow from a table.
 */
const strayVariantReferences: string[] = [];
for (const [file, component] of scanned) {
  const declared = new Set(
    [...component.props.values()].flatMap((d) => d.variantRefs.map((r) => r.ref))
  );
  for (const ref of component.referencedAnywhere) {
    if (!declared.has(ref)) strayVariantReferences.push(`${ref} (${file})`);
  }
}

/** `<Component>Props` -> the files declaring it, for the cross-file lookup. */
const filesByPropsName = new Map<string, string[]>();
for (const [file, component] of scanned) {
  for (const declaration of component.props.values()) {
    const list = filesByPropsName.get(declaration.name) ?? [];
    list.push(file);
    filesByPropsName.set(declaration.name, list);
  }
}

// ---------------------------------------------------------------------------
// Resolving a props declaration to the cva groups it accepts
// ---------------------------------------------------------------------------

interface ResolvedGroup {
  values: string[];
  default: string | undefined;
  /** cva definitions declaring this group name */
  sources: string[];
  ambiguous: boolean;
}

function resolveGroups(
  component: ScannedComponent,
  propsName: string
): { groups: Map<string, ResolvedGroup>; complications: string[] } {
  const groups = new Map<string, ResolvedGroup>();
  const complications: string[] = [];
  const declaration = component.props.get(propsName);
  if (declaration === undefined) return { groups, complications };

  const refs = [...declaration.variantRefs];
  complications.push(...declaration.complications);

  // One level of local extension: a subcomponent's props that build on the
  // family's own props type. Deeper than that is reported rather than followed.
  for (const local of declaration.localRefs) {
    const parent = component.props.get(local);
    if (parent === undefined) continue;
    refs.push(...parent.variantRefs);
    complications.push(...parent.complications);
    for (const grandparent of parent.localRefs) {
      const further = component.props.get(grandparent);
      if (further !== undefined && further.variantRefs.length > 0) {
        complications.push(`${propsName} -> ${local} -> ${grandparent}`);
      }
    }
  }

  for (const { ref, omit } of refs) {
    // Same file wins; a sibling file's definition is the fallback. Unresolvable
    // — unknown name, or a name two files define — is *reported*, never skipped
    // quietly, so it lands in UNRESOLVED_HERITAGE and has to be pinned on
    // purpose instead of vanishing from the coverage count.
    let definition = component.cva.get(ref);
    if (definition === undefined) {
      const candidates = cvaByName.get(ref) ?? [];
      if (candidates.length === 1) definition = candidates[0];
    }
    if (definition === undefined) {
      complications.push(`${propsName} -> ${ref}`);
      continue;
    }
    for (const [name, values] of definition.groups) {
      if (omit.includes(name)) continue;
      const existing = groups.get(name);
      if (existing === undefined) {
        groups.set(name, {
          values,
          default: definition.defaults.get(name),
          sources: [ref],
          ambiguous: false,
        });
        continue;
      }
      const same =
        existing.values.length === values.length && existing.values.every((v) => values.includes(v));
      existing.sources.push(ref);
      if (!same || existing.default !== definition.defaults.get(name)) existing.ambiguous = true;
    }
  }

  return { groups, complications };
}

// ---------------------------------------------------------------------------
// Documentation sources
// ---------------------------------------------------------------------------

interface DocumentedProp {
  name: string;
  /** The `type` field, verbatim. */
  type: string | null;
  /** The `default` field, verbatim, still carrying its own quotes. */
  default: string | null;
  line: number;
}

interface DocumentedTable {
  /** `<category>/<slug>.mdx` */
  page: string;
  slug: string;
  /** The component this table is filed under, or null when the heading names none. */
  owner: string | null;
  line: number;
  props: DocumentedProp[];
}

/** The heading these tables live under, which is never a component name. */
const SECTION_HEADING = 'Props';

const PREFIX = 'const _ = ';

/** Balanced `{ … }` from `from`, ignoring braces inside strings. */
function balancedBraces(text: string, from: number): { start: number; end: number } | null {
  const open = text.indexOf('{', from);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '\\') {
          j++;
          continue;
        }
        if (text[j] === c) {
          i = j;
          break;
        }
      }
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return { start: open, end: i };
    }
  }
  return null;
}

function pascalCase(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length > 0 ? (part[0] ?? '').toUpperCase() + part.slice(1) : part))
    .join('');
}

function extractTables(page: string, slug: string, source: string): DocumentedTable[] {
  const newlines: number[] = [];
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') newlines.push(i);
  const lineAt = (offset: number): number => {
    let line = 1;
    for (const at of newlines) {
      if (at >= offset) break;
      line++;
    }
    return line;
  };

  /**
   * The component a table is filed under.
   *
   * `null` when a subheading is present but does not name exactly one component
   * — a heading covering two subcomponents at once, say. Falling back to the
   * page's own component there would compare a table against something it does
   * not describe, which is worse than reporting it unchecked.
   *
   * Two informal spellings are normalised rather than rejected, because both are
   * used across several pages and both name exactly one component: a trailing
   * parenthetical qualifier ("(Root)") and a trailing repetition of the section
   * word. Anything else is left alone, so a heading naming two components, or a
   * hook, resolves to nothing.
   */
  const pageOwner = PAGE_COMPONENT_ALIASES[page] ?? pascalCase(slug);

  const ownerAt = (offset: number): string | null => {
    const headings = [...source.slice(0, offset).matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)];
    const last = headings[headings.length - 1];
    if (last === undefined) return pageOwner;
    if ((last[1] ?? '').length < 3) return pageOwner;

    const text = (last[2] ?? '')
      .replace(/\s*\([^)]*\)\s*$/, '')
      .replace(new RegExp(`\\s+${SECTION_HEADING}$`, 'i'), '')
      .trim();
    if (text === SECTION_HEADING) return pageOwner;
    return /^[A-Z][A-Za-z0-9]*$/.test(text) ? text : null;
  };

  const tables: DocumentedTable[] = [];

  for (const match of source.matchAll(/<PropsTable\b/g)) {
    const at = match.index ?? 0;
    const propsAt = source.indexOf('props=', at);
    if (propsAt === -1) continue;
    const braces = balancedBraces(source, propsAt);
    if (braces === null) continue;

    const arrayText = source.slice(braces.start + 1, braces.end);
    const parsed = parseSource('props-table.ts', ts.ScriptKind.TS, PREFIX + arrayText);
    const statement = parsed.statements[0];
    if (statement === undefined || !ts.isVariableStatement(statement)) continue;
    const initializer = statement.declarationList.declarations[0]?.initializer;
    if (initializer === undefined || !ts.isArrayLiteralExpression(initializer)) continue;

    /** Offset in the MDX of a node inside the extracted array. */
    const mdxOffset = (node: ts.Node): number =>
      braces.start + 1 + node.getStart(parsed) - PREFIX.length;

    const props: DocumentedProp[] = [];
    for (const element of initializer.elements) {
      if (!ts.isObjectLiteralExpression(element)) continue;
      const fields = new Map<string, ts.Expression>();
      for (const field of element.properties) {
        if (!ts.isPropertyAssignment(field)) continue;
        const key = propertyKey(field.name, parsed);
        if (key !== null) fields.set(key, field.initializer);
      }
      const nameNode = fields.get('name');
      const name = nameNode === undefined ? null : literalValue(nameNode);
      if (name === null) continue;
      const typeNode = fields.get('type');
      const defaultNode = fields.get('default');
      props.push({
        name,
        type: typeNode === undefined ? null : literalValue(typeNode),
        default: defaultNode === undefined ? null : literalValue(defaultNode),
        line: lineAt(mdxOffset(typeNode ?? nameNode ?? element)),
      });
    }

    tables.push({ page, slug, owner: ownerAt(at), line: lineAt(at), props });
  }

  return tables;
}

const pages: { page: string; slug: string }[] = [];
const tables: DocumentedTable[] = [];
for (const category of readdirSync(docsComponentsDir, { withFileTypes: true })) {
  if (!category.isDirectory()) continue;
  for (const file of readdirSync(join(docsComponentsDir, category.name)).sort()) {
    if (!file.endsWith('.mdx')) continue;
    const page = `${category.name}/${file}`;
    const slug = file.replace(/\.mdx$/, '');
    pages.push({ page, slug });
    tables.push(
      ...extractTables(page, slug, readFileSync(join(docsComponentsDir, category.name, file), 'utf-8'))
    );
  }
}

// ---------------------------------------------------------------------------
// Reading a documented type as an enumeration
// ---------------------------------------------------------------------------

type DocumentedType =
  | { kind: 'boolean' }
  | { kind: 'members'; members: string[] }
  | { kind: 'other' };

/**
 * `'a' | 'b'` and `1 | 2 | 3` yield their members — a group keyed by a column
 * count is documented as numbers and keyed as strings, and comparing them by
 * spelling is what the consumer's editor does too. Anything else is `other`.
 */
function readDocumentedType(type: string | null): DocumentedType {
  if (type === null) return { kind: 'other' };
  const parsed = parseSource('type.ts', ts.ScriptKind.TS, `type T = ${type};`);
  const statement = parsed.statements[0];
  if (statement === undefined || !ts.isTypeAliasDeclaration(statement)) return { kind: 'other' };
  const node = statement.type;
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return { kind: 'boolean' };

  const parts = ts.isUnionTypeNode(node) ? node.types : [node];
  const members: string[] = [];
  for (const part of parts) {
    if (!ts.isLiteralTypeNode(part)) return { kind: 'other' };
    const literal = part.literal;
    if (ts.isStringLiteral(literal) || ts.isNumericLiteral(literal)) members.push(literal.text);
    else {
      const value = literalValue(literal as ts.Expression);
      if (value === null) return { kind: 'other' };
      members.push(value);
    }
  }
  return members.length > 0 ? { kind: 'members', members } : { kind: 'other' };
}

/** A documented `default`, with whichever quotes it was written in removed. */
function unquote(value: string): string {
  return /^(['"])(.*)\1$/.exec(value)?.[2] ?? value;
}

// ---------------------------------------------------------------------------
// The comparison
// ---------------------------------------------------------------------------

interface Analysis {
  documentedProps: number;
  unmappedPages: string[];
  tablesUnderAnUnnamedOwner: string[];
  /** owner has no `…Props` declaration anywhere — and no cva named after it */
  tablesWithoutAPropsDeclaration: string[];
  /** owner has no `…Props` declaration but the file DOES declare a cva for it */
  tablesHidingACva: string[];
  ambiguousOwners: string[];
  ambiguousGroups: string[];
  notEnumerable: string[];
  comparisons: string[];
  enumComparisons: number;
  defaultComparisons: number;
  defaultsNotCompared: string[];
  valueFailures: string[];
  defaultFailures: string[];
  comparedGroups: Set<string>;
}

function analyse(): Analysis {
  const result: Analysis = {
    documentedProps: 0,
    unmappedPages: [],
    tablesUnderAnUnnamedOwner: [],
    tablesWithoutAPropsDeclaration: [],
    tablesHidingACva: [],
    ambiguousOwners: [],
    ambiguousGroups: [],
    notEnumerable: [],
    comparisons: [],
    enumComparisons: 0,
    defaultComparisons: 0,
    defaultsNotCompared: [],
    valueFailures: [],
    defaultFailures: [],
    comparedGroups: new Set(),
  };

  for (const table of tables) {
    result.documentedProps += table.props.length;

    if (table.owner === null) {
      if (!result.tablesUnderAnUnnamedOwner.includes(table.page)) {
        result.tablesUnderAnUnnamedOwner.push(table.page);
      }
      continue;
    }

    const propsName = `${table.owner}Props`;
    const candidates = filesByPropsName.get(propsName) ?? [];
    const preferred = `${table.slug}.tsx`;
    const file = candidates.includes(preferred) ? preferred : candidates[0];

    if (file === undefined) {
      // Nothing anywhere declares this owner's props. Either the page documents
      // a component whose source cannot be found at all, or the owner is a
      // subcomponent that takes a plain element's props — the second is normal
      // and only matters if the file secretly declares a cva for it.
      const own = scanned.get(preferred);
      const cvaName = `${table.owner[0]?.toLowerCase()}${table.owner.slice(1)}Variants`;
      if (own === undefined) {
        const at = `${table.page}#${table.owner}`;
        if (!result.unmappedPages.includes(at)) result.unmappedPages.push(at);
      } else if (own.cva.has(cvaName)) {
        result.tablesHidingACva.push(`${table.page}#${table.owner}`);
      } else {
        result.tablesWithoutAPropsDeclaration.push(`${table.page}#${table.owner}`);
      }
      continue;
    }

    if (candidates.length > 1) {
      result.ambiguousOwners.push(`${table.page}#${table.owner} <- ${candidates.join(', ')}`);
      continue;
    }

    const component = scanned.get(file);
    if (component === undefined) continue;

    const { groups } = resolveGroups(component, propsName);
    const documented = new Map(table.props.map((p) => [p.name, p]));

    for (const [group, resolved] of groups) {
      const doc = documented.get(group);
      if (doc === undefined) continue; // Not documented at all: coverage, below.

      const at = `${table.page}:${doc.line} ${table.owner}.${group}`;

      if (resolved.ambiguous) {
        result.ambiguousGroups.push(`${table.owner}.${group} <- ${resolved.sources.join(', ')}`);
        continue;
      }

      const documentedType = readDocumentedType(doc.type);
      const isBooleanGroup = resolved.values.every((value) => BOOLEAN_KEYS.includes(value));

      if (isBooleanGroup) {
        // A boolean group is often one-sided — only the `true` key, because
        // passing false has to apply nothing. So there is no value inventory to
        // compare; what is checkable is that the table types it as a boolean.
        const documentsABoolean =
          documentedType.kind === 'boolean' ||
          (documentedType.kind === 'members' &&
            documentedType.members.every((member) => BOOLEAN_KEYS.includes(member)));
        if (!documentsABoolean) {
          result.valueFailures.push(
            `${at} is documented as an enumeration, but the cva declares it as a boolean variant ` +
              `(keys ${resolved.values.join(', ')})`
          );
          continue;
        }
        result.comparisons.push(`${table.owner}.${group}`);
        result.comparedGroups.add(`${table.owner}.${group}`);
      } else if (documentedType.kind === 'members') {
        const documentedValues = documentedType.members;
        const where = `(cva ${resolved.sources.join(', ')} declares: ${resolved.values.join(' | ')})`;
        for (const value of documentedValues) {
          if (!resolved.values.includes(value)) {
            result.valueFailures.push(`${at} documents "${value}", which the cva does not declare ${where}`);
          }
        }
        for (const value of resolved.values) {
          if (!documentedValues.includes(value)) {
            result.valueFailures.push(`${at} omits "${value}", which the cva declares ${where}`);
          }
        }
        result.comparisons.push(`${table.owner}.${group}`);
        result.comparedGroups.add(`${table.owner}.${group}`);
        result.enumComparisons++;
      } else {
        result.notEnumerable.push(`${at} type=${doc.type ?? '(none)'}`);
        continue;
      }

      const documentedDefault = doc.default === null ? null : unquote(doc.default);
      if (documentedDefault !== null && resolved.default !== undefined) {
        result.defaultComparisons++;
        if (documentedDefault !== resolved.default) {
          result.defaultFailures.push(
            `${at} documents the default as ${documentedDefault}, the cva declares ${resolved.default}`
          );
        }
      } else if (documentedDefault !== null || resolved.default !== undefined) {
        // Exactly one side states a default. Neither stating one is not a hole:
        // there is nothing to compare and nothing being claimed.
        result.defaultsNotCompared.push(
          `${table.owner}.${group} (${table.page}) <- ${documentedDefault !== null ? 'documented only' : 'declared only'}`
        );
      }
    }
  }

  return result;
}

const analysis = analyse();

/** Every variant group an exported component accepts as a prop. */
const consumerFacingGroups: string[] = [];
const unresolvedHeritage: string[] = [];
for (const [file, component] of scanned) {
  for (const declaration of component.props.values()) {
    if (!declaration.exported) continue;
    const { groups, complications } = resolveGroups(component, declaration.name);
    const owner = declaration.name.replace(/Props$/, '');
    if (complications.length > 0) unresolvedHeritage.push(`${owner} (${file})`);
    for (const group of groups.keys()) consumerFacingGroups.push(`${owner}.${group} (${file})`);
  }
}

const uncoveredGroups = consumerFacingGroups
  .filter((entry) => !analysis.comparedGroups.has(entry.slice(0, entry.indexOf(' '))))
  .sort();

// ---------------------------------------------------------------------------

describe('props tables — the reader sees both sides', () => {
  it('reads the expected inventory of sources, pages and comparisons', () => {
    const found = {
      componentFiles: componentFiles.length,
      cvaCalls: [...scanned.values()].reduce((total, c) => total + c.cvaCalls, 0),
      pages: pages.length,
      tables: tables.length,
      consumerFacingGroups: consumerFacingGroups.length,
      tablesWithoutAPropsDeclaration: analysis.tablesWithoutAPropsDeclaration.length,
      comparisons: analysis.comparisons.length,
      enumComparisons: analysis.enumComparisons,
      defaultComparisons: analysis.defaultComparisons,
    };

    expect(
      found,
      'The reader drifted from EXPECTED_SCAN.\n' +
        '- FEWER comparisons is the dangerous direction: every check below is a comparison that ' +
        'was made, so a reader that stops seeing a shape it used to see reports success by ' +
        'finding nothing. Fix the reader.\n' +
        '- MORE (or a different file/page count) means the library or the docs grew. Update these ' +
        'numbers in the same commit, so the change is visible in review.'
    ).toEqual(EXPECTED_SCAN);
  });

  it('reads rows out of every table it finds', () => {
    const empty = tables.filter((t) => t.props.length === 0).map((t) => `${t.page}:${t.line}`);

    expect(
      empty,
      'A `<PropsTable>` yielded no rows. The rows are read by parsing the `props={[…]}` ' +
        'expression, so an empty result means a table shape this reader cannot parse — and a ' +
        'table with no rows agrees with everything.'
    ).toEqual([]);
  });

  it('reads a plausible number of rows in total', () => {
    // A FLOOR rather than an exact count, and deliberately so: every other
    // number in EXPECTED_SCAN moves only when a component or a page is added,
    // while this one moves when anyone adds one row to any of 83 tables. Pinned
    // exactly, its first failure would almost always be an unrelated docs edit
    // reading as a broken guard — the fastest way to get a guard deleted. What
    // it is here to catch is a COLLAPSE: a reader that silently drops rows
    // inside tables it still parses, which the empty-table check above cannot
    // see. 632 rows at the time of writing.
    expect(
      analysis.documentedProps,
      'Far fewer documented rows than these pages carry. The row reader has lost a shape it used ' +
        'to read, and every row it dropped is a claim nobody is comparing any more.'
    ).toBeGreaterThan(600);
  });

  it('attributes every table to a component whose props it can resolve', () => {
    expect(
      analysis.unmappedPages.sort(),
      'A documentation page cannot be tied to a component source. Nothing on the page names ' +
        'the component it documents: the file is not `<slug>.tsx` and no table sits under a ' +
        'subheading naming a component whose props declaration exists. Every enum on such a page ' +
        'is unchecked. Name the component in a subheading, or add the page to UNMAPPED_PAGES ' +
        'accepting that it stays unchecked.'
    ).toEqual([...UNMAPPED_PAGES].sort());
  });

  it('keeps every page alias correct and still needed', () => {
    const wrong: string[] = [];
    const knownPages = new Set(pages.map((p) => p.page));

    for (const [page, component] of Object.entries(PAGE_COMPONENT_ALIASES)) {
      const entry = pages.find((p) => p.page === page);
      if (!knownPages.has(page) || entry === undefined) {
        wrong.push(`${page} is not a page — the alias outlived it`);
        continue;
      }
      if (!filesByPropsName.has(`${component}Props`)) {
        wrong.push(`${page} -> ${component}: no component declares ${component}Props`);
      }
      if (filesByPropsName.has(`${pascalCase(entry.slug)}Props`)) {
        wrong.push(`${page} -> ${component}: the file name already resolves, so the alias is dead`);
      }
    }

    expect(
      wrong,
      'A page alias no longer says something true. An alias is this suite being told a fact the ' +
        'page does not state, so it has to be checked in both directions: that it resolves, and ' +
        'that it is still needed.'
    ).toEqual([]);
  });

  it('files every table under a heading that names exactly one component', () => {
    expect(
      analysis.tablesUnderAnUnnamedOwner.sort(),
      'A table sits under a subheading that does not name exactly one component, so this suite ' +
        'cannot tell which props declaration it describes — and guessing the page\'s own ' +
        'component would compare the table against something it does not document. Split the ' +
        'table, or rename the heading.'
    ).toEqual([...TABLES_UNDER_AN_UNNAMED_OWNER].sort());
  });

  it('leaves no table whose owner has a cva but no props declaration', () => {
    expect(
      analysis.tablesHidingACva.sort(),
      'A table documents a component with no `…Props` declaration, in a file that declares a ' +
        '`cva` named after that very component. That combination is the blind spot this rule ' +
        'exists to deny: the component has variants, and nothing here can reach them. Give the ' +
        'component an exported props declaration (which is the kit\'s convention anyway), and it ' +
        'becomes checkable.'
    ).toEqual([]);
  });

  it('reaches every cva a component exposes through a props declaration', () => {
    expect(
      strayVariantReferences.sort(),
      'A component file types something with `VariantProps<typeof …>` without an `…Props` ' +
        'declaration naming that cva. This assertion is what stops the coverage statement below ' +
        `from resting on an assumption: ${analysis.tablesWithoutAPropsDeclaration.length} documented ` +
        'tables belong to components with no props declaration at all, and they are treated as ' +
        'having no variant props to check. That is only true while this list is empty.'
    ).toEqual([]);
  });

  it('resolves every table owner to exactly one component file', () => {
    expect(
      analysis.ambiguousOwners.sort(),
      'Two component files declare the same `…Props` name, so a table naming that component ' +
        'could be compared against either. Rename one, or the comparison is a coin flip.'
    ).toEqual([]);
  });

  it('exempts exactly the props declarations whose cva reference it will not resolve', () => {
    expect(
      unresolvedHeritage.sort(),
      'A props declaration reaches a cva through a shape this reader does not resolve — an ' +
        '`Omit`/`Pick` wrapper, say, which SUBTRACTS keys. Resolving it wrongly would report ' +
        'groups the component does not accept, so the declaration is skipped entirely. Add it ' +
        'here deliberately, and note that every group it owns is then unchecked.'
    ).toEqual([...UNRESOLVED_HERITAGE].sort());
  });

  it('exempts exactly the groups two cva definitions disagree about', () => {
    expect(
      analysis.ambiguousGroups.sort(),
      'One props declaration reaches two cva definitions that declare the same group name with ' +
        'different keys or different defaults. There is no single answer to compare the ' +
        'documented enum against, so the group is skipped and named here.'
    ).toEqual([...AMBIGUOUS_GROUPS].sort());
  });

  it('exempts exactly the cva-backed props documented as something other than an enum', () => {
    expect(
      analysis.notEnumerable.sort(),
      'A prop that IS a cva group is documented with a type this suite cannot read as an ' +
        'enumeration. Either the table types it wrongly, or it is a shape this reader should ' +
        'learn — do not pin it without deciding which.'
    ).toEqual([...NOT_ENUMERABLE].sort());
  });
});

describe('props tables — every documented enum matches its cva', () => {
  it('documents exactly the values the cva declares', () => {
    expect(
      analysis.valueFailures.sort(),
      'A props table and the component disagree about a variant prop.\n' +
        'A value the table names and the cva does not is the expensive direction: cva does not ' +
        'validate its argument, so a consumer copying that value gets a component with NO ' +
        'variant classes at all — no exception, no warning, nothing in the console. This has ' +
        'shipped twice.\n' +
        'A value the cva declares and the table omits is the quiet one: the feature exists and ' +
        'nobody can find it. Read the `cva` definition named at the end of each line and write ' +
        'down what is there, in its order.'
    ).toEqual([]);
  });

  it('documents the default the cva declares', () => {
    expect(
      analysis.defaultFailures.sort(),
      'A props table states a default the `defaultVariants` block does not. The button page ' +
        'documented one variant as the default while the cva chose another — a consumer ' +
        'reasoning about what they get for free was simply misinformed.'
    ).toEqual([]);
  });

  it('compares a default wherever both sides state one', () => {
    expect(
      [...new Set(analysis.defaultsNotCompared)].sort(),
      'A cva-backed prop whose default is stated on only one side. A cva group with no ' +
        '`defaultVariants` entry can still have a default — the component destructures one in ' +
        'its signature — and this suite deliberately does not read those, so the documented ' +
        'value is unchecked. The reverse (a cva default the table never mentions) is a ' +
        'documentation gap. Pin new ones deliberately; each is a claim nobody is checking.'
    ).toEqual([...DEFAULTS_NOT_COMPARED].sort());
  });
});

describe('props tables — what is left uncovered', () => {
  it('covers every variant group an exported component accepts, except those pinned', () => {
    expect(
      uncoveredGroups,
      'A variant prop a consumer can pass that no documented table states. Not a false ' +
        'statement — a missing one: the prop exists, works, and appears nowhere in the ' +
        'documentation, so the only way to find it is to read the source. Add a row to the ' +
        "component's props table, or pin it here with the reason it stays undocumented.\n" +
        'This assertion is what stops the suite reporting green over a shrinking share of the ' +
        'library: comparisons happen only where a table and a cva group meet, and this is the ' +
        'list of places they do not.'
    ).toEqual([...UNCOVERED_VARIANT_GROUPS].sort());
  });

  it('states its own coverage', () => {
    const covered = consumerFacingGroups.length - uncoveredGroups.length;
    expect(
      { covered, total: consumerFacingGroups.length },
      'Coverage moved. This suite compares ' +
        `${covered} of ${consumerFacingGroups.length} consumer-facing variant groups, across ` +
        `${analysis.comparisons.length} table rows on ${pages.length} pages. The number is ` +
        'asserted so that a change to it is a decision someone made, not something that happened.'
    ).toEqual({
      covered: EXPECTED_SCAN.consumerFacingGroups - UNCOVERED_VARIANT_GROUPS.length,
      total: EXPECTED_SCAN.consumerFacingGroups,
    });
  });
});
