/**
 * Nim Ink — the docs' syntax palette.
 *
 * Two chromatic families over a neutral ramp: steel (H≈250) carries named API
 * surface — components, types, attribute names, function names — and gold
 * (H≈80) carries literal values — strings, numbers, booleans, units. Everything
 * else is neutral, and the ramp's temperature flips per theme (cool-neutral on
 * paper, warm-neutral on ink) so the two families stay legible without either
 * one turning into decoration. Nine tokens, no more: the kit's code samples are
 * read for structure, not for colour, so hue is spent on the distinction that
 * matters (is this a name or a value?) rather than on grammar trivia.
 *
 * Nothing lands below 4.5:1 on either code surface in either theme; the system
 * minimum is punctuation inside a <Tab>, whose bg-fd-secondary is the
 * worst-case background.
 *
 * Both themes are generated from one `settings` structure with only the hex
 * swapped, so a scope can never resolve to different rules in light and dark
 * (that is exactly how the previous github-light/github-dark pairing produced
 * stray colour pairs, and how it left comments identical in both themes).
 */

/** Minimal structural shape of a TextMate theme — `shiki` is not a direct
 *  dependency of this package, so its types are not importable here. */
interface ThemeSetting {
  scope: string[];
  settings: { foreground: string; fontStyle?: 'bold' | 'italic' };
}

export interface NimInkTheme {
  name: string;
  type: 'light' | 'dark';
  colors: Record<string, string>;
  settings: ThemeSetting[];
}

/** The nine tokens. One value per token per theme; no value is reused. */
export interface InkPalette {
  /** JSX tags, components, types, classes. Set in semibold. */
  entity: string;
  /** Default foreground: JSX children, variables, unclassified text. */
  plain: string;
  /** JSX attribute names, object keys, CSS property names. */
  property: string;
  /** `import`, `const`, `return`, `type`, storage modifiers. */
  keyword: string;
  /** String bodies and their quote marks. */
  string: string;
  /** Comments. Set in italic. */
  comment: string;
  /** Function names and calls. */
  function: string;
  /** Numbers, booleans, `null`, escapes, units. */
  constant: string;
  /** Brackets, delimiters, separators, operators. */
  punctuation: string;
}

export const nimInkLight: InkPalette = {
  entity: '#161C24',
  plain: '#2F3743',
  property: '#334A62',
  keyword: '#4A5462',
  string: '#6E5223',
  comment: '#665C48',
  function: '#476482',
  constant: '#7D5F28',
  punctuation: '#636D7B',
};

export const nimInkDark: InkPalette = {
  entity: '#EDEAE3',
  plain: '#D2CEC4',
  property: '#9FB4CC',
  keyword: '#9DA2A8',
  string: '#B09B72',
  comment: '#9C947F',
  function: '#7E95AF',
  constant: '#A08A62',
  punctuation: '#848992',
};

/**
 * Build a theme from one palette.
 *
 * Rule order matters twice over. TextMate resolves by scope specificity first
 * (more segments wins: `keyword.operator` beats `keyword`, which is why
 * operators land on punctuation), then by source order for ties — so:
 *  - `property` sits after the `variable` rule, so object keys and attribute
 *    names win over the generic variable colour;
 *  - `string` sits last, so `punctuation.definition.string` (the quote marks)
 *    resolves to the string colour rather than to punctuation.
 * `editor.foreground` is the *content* colour, with punctuation pushed down
 * from it — that is what separates JSX children text from JSX scaffolding.
 */
function build(name: string, type: 'light' | 'dark', ink: InkPalette): NimInkTheme {
  return {
    name,
    type,
    colors: {
      'editor.foreground': ink.plain,
      // The code surface is owned by the docs (bg-fd-card), not by the theme.
      'editor.background': '#00000000',
    },
    settings: [
      {
        scope: ['comment', 'comment.block', 'comment.line', 'punctuation.definition.comment'],
        settings: { foreground: ink.comment, fontStyle: 'italic' },
      },
      {
        scope: [
          // No bare `source` here: it would match `source.embedded` (the
          // ```@example``` body inside a JSDoc block), and being the innermost
          // scope in the stack it would beat the enclosing comment rule,
          // dropping one line of a comment back to body colour.
          // `editor.foreground` already supplies plain for unscoped tokens.
          'variable',
          'variable.other',
          'variable.other.readwrite',
          'variable.parameter',
          'meta.jsx.children',
          'text.html',
        ],
        settings: { foreground: ink.plain },
      },
      {
        scope: [
          'entity.other.attribute-name',
          'meta.object-literal.key',
          'support.type.property-name',
          'meta.property-name',
        ],
        settings: { foreground: ink.property },
      },
      {
        scope: [
          'entity.name.tag',
          'entity.name.type',
          'entity.name.class',
          'entity.name.namespace',
          'entity.other.inherited-class',
          'support.class',
          'support.class.component',
          // Deliberately NOT bare `support.type`: it also matches
          // `support.type.property-name` (JSON keys, CSS property names), which
          // takes its colour from the property rule above but would inherit
          // this rule's weight, rendering every JSON key semibold.
          'support.type.primitive',
          'support.type.builtin',
          'support.type.object',
        ],
        settings: { foreground: ink.entity, fontStyle: 'bold' },
      },
      {
        scope: [
          'keyword',
          'keyword.control',
          'storage',
          'storage.type',
          'storage.modifier',
          'variable.language',
        ],
        settings: { foreground: ink.keyword },
      },
      {
        scope: [
          'entity.name.function',
          'meta.function-call',
          'support.function',
          'variable.function',
        ],
        settings: { foreground: ink.function },
      },
      {
        scope: [
          'constant',
          'constant.numeric',
          'constant.language',
          'constant.character.escape',
          'support.constant',
          'keyword.other.unit',
        ],
        settings: { foreground: ink.constant },
      },
      {
        scope: [
          'punctuation',
          'punctuation.separator',
          'punctuation.terminator',
          'punctuation.definition.tag',
          'punctuation.definition.block',
          'punctuation.definition.parameters',
          'meta.brace',
          'keyword.operator',
        ],
        settings: { foreground: ink.punctuation },
      },
      {
        scope: [
          'string',
          'string.quoted',
          'string.template',
          'punctuation.definition.string',
          'punctuation.definition.string.begin',
          'punctuation.definition.string.end',
        ],
        settings: { foreground: ink.string },
      },
      {
        // Parent-scoped, and last, so it beats every rule above for anything
        // nested inside a comment. Without it a JSDoc block fragments: the type
        // expression in `@type {import('x').Config}` matches
        // `entity.name.type.instance.jsdoc` and renders semibold in the entity
        // colour, in the middle of an italic comment. A comment is one token.
        scope: [
          // Parent-scoped catch-alls (a selector with a parent outranks the
          // same target scope without one) …
          'comment entity.name.type',
          'comment storage.type',
          'comment punctuation.definition',
          'comment keyword',
          'comment variable',
          'comment string',
          // … plus the JSDoc scopes by name, which sit deeper than the
          // catch-alls can reach.
          'entity.name.type.instance.jsdoc',
          'entity.name.type.jsdoc',
          'storage.type.class.jsdoc',
          'punctuation.definition.block.tag.jsdoc',
          'variable.other.jsdoc',
          'constant.other.jsdoc',
        ],
        settings: { foreground: ink.comment, fontStyle: 'italic' },
      },
    ],
  };
}

export const nimInkLightTheme = build('nim-ink-light', 'light', nimInkLight);
export const nimInkDarkTheme = build('nim-ink-dark', 'dark', nimInkDark);
