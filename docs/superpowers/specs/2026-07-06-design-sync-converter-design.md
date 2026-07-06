# Design Sync Converter — Design

**Date:** 2026-07-06
**Status:** Approved (design), pending implementation
**Scope:** Local prep tooling to package the Nim UI component library as a Claude
Design *design system*, ready to upload via the `DesignSync` tool.

## Problem

We want the Nim UI library available in Claude Design as a proper design system —
foundations first, then components — so designers/agents can reference and reuse it.
The `DesignSync` tool uploads one HTML "card" per unit, grouped by a first-line
`<!-- @dsCard group="…" -->` marker, and reads file contents directly from disk.

Two hard constraints shape this design:

1. **Auth is blocked in this session.** `DesignSync` needs Claude Design
   authorization, which requires an interactive login this non-interactive session
   cannot run. So project selection/creation and the actual upload happen **later**,
   in an authorized session. Everything in this spec is the local prep that does
   **not** need auth.
2. **Don't hand-render components.** The docs site already server-renders every
   component with real classes. We extract from that build for pixel parity and zero
   new rendering logic.

## What we're building

A new top-level `.design-sync/` directory:

```
.design-sync/
  config.json        # pinned project + path config (package.json-shaped)
  convert.mjs        # the converter (run with `node`, no build step)
  CONVENTIONS.md     # conventions header / how-to / close-out notes
  build/             # GENERATED, gitignored (matches .gitignore `build`)
    _shared/nim-ui.css
    foundations/<slug>.html
    <category>/<slug>.html
    patterns/<slug>.html
```

One new devDependency at the repo root: `cheerio` (parse built docs HTML).

## Card inventory (~83 cards + 1 shared CSS)

| Group | Count | Source | Mechanism |
|-------|-------|--------|-----------|
| Overview | 1 | `CONTEXT.md` + `tokens.css` | authored/generated |
| Foundations · Colors | 1 | `packages/ui/src/tokens.css` | generated from tokens (see note) |
| Foundations · Type/Spacing/Dark-mode | 3 | `packages/docs/out/design-system/{typography,spacing,dark-mode}` | extract ComponentPreview blocks |
| Components | 75 | `packages/docs/out/components/<category>/<slug>` | extract ComponentPreview blocks |
| Patterns | 3 | `packages/docs/out/patterns/<slug>` | extract ComponentPreview blocks |

Component `group` values come from the registry category, mapped to display names via
`config.json.groups`: Primitives (7), Layout (14), Data Display (14), Commerce (4),
Landing (6), Forms (16), Feedback (9), Navigation (5).

### Note: Colors card is generated from tokens, NOT extracted from docs

`packages/docs/content/docs/design-system/colors.mdx` uses `<ColorSwatch>` with
**hardcoded hex from the old bright-blue palette** (e.g. Primary 500 `#0ea5e9`). The
real source of truth `tokens.css` is muted steel gray-blue
(`--color-primary-500: oklch(0.534 0.030 248.2)`), and CONTEXT.md / the design
contract explicitly say "Ink + Muted Steel" and "Avoid: Bright blue primary".
Extracting that page would sync a palette contradicting the actual design system, so
the Colors card is **generated directly from `tokens.css`** (OKLCH scales + semantic
light/dark vars, emitted as inline-styled swatches — no Tailwind bundle needed).

The stale `colors.mdx` itself is a separate docs bug, tracked as a follow-up (not part
of this work).

## Data flow

1. **Prereq (existing):** `pnpm --filter docs build` → `packages/docs/out/**` static
   export. Already true today for all 75 components + foundations + patterns.
2. `node .design-sync/convert.mjs`:
   - reads `config.json` for paths + group map, and the registry for the component list
   - fails fast with a clear message if `packages/docs/out` is missing/stale
   - **shared CSS:** concatenate the two Tailwind chunks from
     `packages/docs/out/_next/static/chunks/*.css` once → `build/_shared/nim-ui.css`
     (instead of duplicating ~180 KB into every card)
   - **extracted cards:** for each component/foundation/pattern page, load with cheerio,
     pull every `ComponentPreview` block (`div.not-prose.my-8`), drop the collapsible
     "View Code" `<details>`, strip all docs chrome (nav/sidebar/props table/prose),
     stack the demo blocks into one card body
   - **generated cards:** Colors (from tokens.css) and Overview (from CONTEXT.md +
     token summary) authored directly by the script
   - each card written as a standalone HTML doc whose **first line** is
     `<!-- @dsCard group="<Display Name>" -->`, followed by
     `<link rel="stylesheet" href="../_shared/nim-ui.css">` and the stacked body.
     Every card lives at a uniform depth `build/<dir>/<slug>.html`, so a single
     relative `../_shared/…` href resolves for all of them (safer than a
     root-absolute path whose resolution on Claude Design's side is unknown)
   - a page yielding zero blocks is **skipped with a warning**, not a hard crash
   - prints a summary: N cards written per group, M skipped
3. Output sits in `build/`, ready for a later authorized session to
   `finalize_plan` (localDir = `.design-sync/build`) → `write_files`.

## config.json shape

```json
{
  "name": "@nim-ui/design-sync",
  "version": "0.0.0",
  "project": { "id": null, "name": null },
  "source": {
    "registry": "packages/ui/src/registry/index.json",
    "docsExport": "packages/docs/out",
    "tokens": "packages/ui/src/tokens.css",
    "context": "CONTEXT.md"
  },
  "output": { "dir": ".design-sync/build", "sharedCss": "_shared/nim-ui.css" },
  "groups": {
    "primitives": "Primitives", "layout": "Layout", "data-display": "Data Display",
    "commerce": "Commerce", "landing": "Landing", "forms": "Forms",
    "feedback": "Feedback", "navigation": "Navigation"
  }
}
```

`project.id` / `project.name` stay `null` until the authorized session selects/creates
the Claude Design project and pins them here. That pin + upload is out of scope for this
local-prep spec.

## Error handling

- Missing/stale `packages/docs/out` → fail fast, message tells user to run the docs build.
- Component page with zero preview blocks → warn + skip (one bad page never blocks the rest).
- Missing shared CSS chunks → fail fast (cards would be unstyled otherwise).

## Testing

No vitest suite — this is internal one-off tooling, not a published package. Verify by:

1. Run `node .design-sync/convert.mjs`; confirm ~83 files + `_shared/nim-ui.css`.
2. Confirm each card's first line is exactly `<!-- @dsCard group="…" -->` with the
   right group.
3. Spot-check a few rendered cards in the browser preview (a component, the generated
   Colors card, a pattern) — styling intact, no docs chrome, Colors shows muted steel
   not bright blue.

## Out of scope (later / separate)

- Claude Design auth, project selection/creation, `finalize_plan`, upload — needs an
  authorized session.
- Fixing the stale `colors.mdx` bright-blue swatches — separate docs bug (follow-up task).
- Figma Code Connect mapping, dark-mode duplicate cards, per-variant cards.
