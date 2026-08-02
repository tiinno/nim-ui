# Nim UI

React UI kit for **operational software** — dashboards and backoffice first, commerce as a supporting surface. 91 components across 8 categories.

## Layout

pnpm workspace + turbo. Four packages:

| Package | What |
|---|---|
| `packages/ui` (`@nim-ui/components`) | The library. 91 components. |
| `packages/docs` (`@nim-ui/docs`) | Next.js 16 + Fumadocs, static export (`output: 'export'`). |
| `packages/tailwind-config` | Shared Tailwind v4 config + design tokens. |
| `packages/mcp-server` | MCP server that reads `packages/ui/src/registry/index.json`. |

React 19 · TypeScript 5.9 · Tailwind v4 · vitest · Node ≥22 · pnpm 9.15.4

## Verification gate

Run all four from the repo root before claiming anything works.

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm build
```

CI runs those four **and a fifth step**, `pnpm test:e2e` — a Playwright suite that drives the built static export in a real Chromium (NIMUI-68). It is deliberately outside `pnpm test`: folding it in would make a browser download a precondition for the unit suite on every machine. Run it yourself for anything touching `sr-only` text, `aria-hidden`, a live region, or focus after an interaction — it is the only place those are measured, because jsdom computes no cascade, reports every box as zero, and cannot show that a node survived a React reconciliation. Needs `pnpm --filter @nim-ui/docs exec playwright install chromium` once, and a `pnpm build` first (turbo enforces the dependency).

The suite lives in `packages/docs/e2e/` and that location is load-bearing twice over: `packages/docs/vitest.config.ts` narrows its include to `tests/` + `.test.ts`, which is what keeps vitest from claiming a `.spec.ts`; and `@source not '../e2e'` in `app/global.css` keeps Tailwind from compiling the spec's class-name literals into the shipped bundle. Measured — deleting that one line leaks a probe class and grows the docs bundle by exactly its rule. Both facts are asserted by `packages/docs/tests/compiled-utility-inventory.test.ts`.

**Never run a bare `npx vitest run` from the root** — there is no root vitest config, so tests execute in the node environment without jsdom or the setup file and 92 of 94 files fail with `document is not defined`. Only the per-package configs work, which is what `pnpm test` (turbo `test:run`) uses.

Single test file: `pnpm --filter @nim-ui/components exec vitest run src/components/<name>.test.tsx`

Note `pnpm --filter @nim-ui/components test` (no `:run`) is **watch mode** and never exits.

## Design contract — Ink + Muted Steel

The single most important convention. "Premium Operations Minimal": calm hierarchy, restrained colour, dense enough to scan.

- **Ink carries primary action**: `bg-neutral-950 text-white` / `dark:bg-neutral-100 dark:text-neutral-950`. The near-black primary button is **deliberate, not a bug** — do not "fix" it to a brand colour.
- **Steel (`primary-*`, a low-chroma blue-grey) is reserved** for focus rings, selection, and links. Never a decorative fill.
- Focus indicator: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:focus-visible:outline-primary-400`. **It is an `outline`, not a `ring`** — NIMUI-57 moved every focus indicator off the ring — 63 class-string lines across 37 files, which is 52 indicator elements — because a ring's offset band is an opaque `box-shadow` that masks the ring's inner 2px, so it has to be *painted a colour*, and a library cannot know which surface a consumer put the control on. Measured: a hardcoded `ring-offset-neutral-950` is right on the page and wrong on a `neutral-900` card, while an outline's offset gap is genuinely transparent and shows whatever is behind — correct on both without being told. `ring-offset-transparent` is **not** the shortcut it looks like: with no opaque band there is no mask, and the ring renders as a solid 4px collar touching the control. Do not reintroduce `focus-visible:outline-none` on a focusable element — it sets `outline-style: none` and erases the indicator. `avatar-group`'s `ring-2 ring-white dark:ring-neutral-950` is a *decorative* ring and is deliberately still a ring. **The pair is mandatory, not a style choice** — WCAG 2.2 SC 1.4.11 wants 3:1 and *no single step of the steel scale clears it in both themes*: `primary-400` measures 2.84 / 2.72 / 2.61 on white / `neutral-50` / `neutral-100`, `primary-500` measures 2.86 on `neutral-800`. Same treatment for the focus *border* on `input`/`textarea`/`select` (`focus-visible:border-primary-500 dark:focus-visible:border-primary-400`) and for the `focus-within:` and `[&:focus-visible>div]:` forms. Write `dark:` **outermost** — `focus-visible:dark:` compiles the same but every `toHaveClass` assertion would miss it. Guarded by `src/focus-ring-contrast.test.ts`. Do **not** answer a contrast complaint by retuning `--color-primary-400`; it also paints chart fills, spinners, progress bars, slider ranges and the radio dot.
  - **Consumer override consequence**: an override must be in the `outline-*` namespace — a `focus-visible:ring-*` class does not replace the indicator, it paints a *second* one alongside. And tailwind-merge keys on the modifier set, so `focus-visible:outline-red-500` alone only replaces the *light* half and they get red in light, steel in dark. A full override is both halves: `focus-visible:outline-red-500 dark:focus-visible:outline-red-500`. `popover.tsx`'s highlight border (`border-primary-500 dark:border-primary-400`) is the precedent. `guides/customization.mdx` documents this.
  - **Every focus indicator the kit ships is now that pair** (NIMUI-55 emptied `KNOWN_UNPAIRED` in `packages/ui/src/focus-ring-contrast.test.ts`; the list stays, empty, so the next arrival still trips it). There is no variant-specific, status-specific or component-specific focus colour left: one indicator, kit-wide, 4.09:1–5.16:1 on the light surfaces and 5.19:1–6.96:1 on the dark ones. Scope that green run honestly all the same — `LIGHT_SURFACES`/`DARK_SURFACES` in that file are a hand-maintained judgement about where these components sit, not a fact derived from the stylesheet, so a component dropped on a mid-scale or consumer background is still unmeasured. **The offset band is no longer a defect** — NIMUI-57 closed it by moving to `outline`, so the four explicit offset colours (`sidebar-nav`, `tree-view`, `tabs` ×2) went away with it and no site needs one again. The counts, for the record — **count indicator *elements*, meaning `outline-2` sites, not colour declarations**: **52 elements, 38 with `outline-offset-2`, 14 flush.** (37 of the 38 are the ones that used to be `ring-offset-2`; the 38th is Card's relational form, which has drawn an outline since NIMUI-50.) The migration swapped the mechanism and nothing else, so the 14 flush sites stay flush — **and NIMUI-58 measured that this costs nothing.** All 14 are transparent at rest, so a flush indicator's inner neighbour is the same surface as its outer one; their only fills are `neutral-100`/`neutral-200`/`neutral-800` on hover, which are already in the guard's surface lists at 4.73 / 4.09 / 5.19. There is no uncovered contrast case, so that ticket is cosmetic only.
  - **The indicator is uniform on purpose, and that is a decision with a history.** `secondary`/`outline`/`ghost` shipped `focus-visible:ring-primary-300` until NIMUI-54 (1.79:1 on white, 1.42:1 on hovered `neutral-200`), on the reasoning that a quieter button deserves a quieter ring. `destructive` tinted to the danger hue, and `input`/`textarea` tinted to their validation state, on the reasoning that the tint was *semantic*. NIMUI-55 ruled against the semantic tint too: measured, it cost contrast (`ring-error-400` 2.77:1 on `neutral-100`; `ring-error-500` 2.99:1 on `neutral-800`), and it bought nothing — danger is already carried by the destructive fill, validity by the field's border and text colour, and neither reaches assistive technology through a ring colour at all. **Visual weight and semantics belong to the resting control** (fill, border, text), which still differs variant by variant. The focus indicator is transient, appears on exactly one control at a time, and is the only thing telling a keyboard user where they are. A new variant-specific focus colour needs a ticket that overturns this, not a precedent.
- Radius: components/cards `rounded-md`; large overlays `rounded-lg`; pills `rounded-full`
- Surface: `border-neutral-200 bg-white` / `dark:border-neutral-800 dark:bg-neutral-950`. Controls use `border-neutral-300`.
- Elevation: `shadow-soft` (cards) / `shadow-panel` (overlays) — `@theme` tokens, never inline `shadow-[...]`
- Status tones are **soft tonal**: `bg-{tone}-50 text-{tone}-700 border-{tone}-200` / `dark:bg-{tone}-950/40 dark:text-{tone}-300 dark:border-{tone}-900/60`
- Numerics use `tabular-nums`; large values add `tracking-tight`
- **Every colour utility needs its `dark:` counterpart.** Light-only styling is a defect.

Type system is named but **not shipped**: tokens declare Hanken Grotesk / JetBrains Mono / Fraunces with full platform fallbacks, and the kit ships zero font bytes. Apps load the families themselves.

## Adding a component

1. `packages/ui/src/components/<name>.tsx` — `cva` + `forwardRef` + `displayName`, JSDoc with 2–3 `@example`s. Model on `meter.tsx` (simple) or `scroll-area.tsx` (compound).
2. `packages/ui/src/components/<name>.test.tsx` — model on `meter.test.tsx`.
3. Export from `packages/ui/src/components/index.ts` under the right category comment.
4. Add a registry entry to `packages/ui/src/registry/index.json` (append; the mcp-server reads this and every field is required).
5. `packages/docs/content/docs/components/<category>/<name>.mdx` — model on `meter.mdx`; add the slug to that folder's `meta.json`.
6. Bump counts in `llms.txt` (header, category heading, component line, footer), `README.md`, and `packages/docs/app/(home)/page.tsx`. `src/documented-inventory.test.ts` fails the build if you miss one — including if you bump a heading number but never list the component under it.

**Tests assert literal class strings on purpose.** Any restyle needs a lockstep test update — that is the convention, not an accident.

## Gotchas that have actually cost time

- **MDX + RSC**: never pass a function prop to a live `<ComponentPreview>` child — MDX pages are Server Components and the Nim components are client, so `valueFormatter={(v) => …}` fails the static export with *"Functions cannot be passed directly to Client Components"*. **vitest does not catch this; only `pnpm --filter docs build` does.** Put that example in `<LivePlayground code={`…`} />` instead (the code is a client-evaluated string). Function props inside ```` ```tsx ```` fences or `<PreviewCode>` are always safe.
- **MDX nested `<p>`**: JSX children on their own line inside a `<p>`-rendering component get markdown-wrapped in a second `<p>` → hydration errors. Keep text children on the opening tag's line.
- **Docs dev server caches `@nim-ui/components` dist exports.** After adding exports, rebuild `ui` *and* restart the docs dev server.
- **React 19**: `useRef<T>()` with no argument is a type error — pass an initial value.
- **jsdom**: Radix ScrollArea thumbs never mount (zero sizes); `navigator.clipboard` is getter-only, and `userEvent.setup()` installs its own clipboard stub that clobbers mocks.
- **Docs demos render in a ~640px column** — never use viewport breakpoints for a demo's internal layout.
- `.design-sync/convert.mjs` extracts previews by class, so it is **coupled to `packages/docs/components/preview.tsx`'s root element**. A docs restyle silently broke it once (83 cards → 10). It now throws when the majority of pages yield nothing — keep that guard.
- **Tailwind v4 scans prose, not just class strings.** `packages/ui/src/styles.css` states its scan explicitly (`source(none)` + `@source "../src"` + `@source not` for `**/*.test.ts`, `**/*.test.tsx` and `test/`), so **comments and JSDoc in shipped sources — and `registry/index.json` — are still read**, and anything that looks like a utility is compiled into the published stylesheet. A bare "invert" in a comment once added a live `.invert` rule (+239 bytes); prose describing transition syntax once added four dead `transition-[…]` rules (+958). `src/compiled-utility-inventory.test.ts` fails the build on any rule no class string asks for, so **write bare CSS property names in comments, never utility syntax**. Test files are out of the scan (NIMUI-52 removed 32 rules that only test literals minted) — but their literals still count as *users* for that guard, so a class only tests mention is neither compiled nor reported. The corollary for guards still holds: a test asserting a class is *absent* must not name it as a literal — assemble such names at runtime (`aria-disabled-hover.test.ts`, `styles.test.ts`) or break them with a marker (`compiled-utility-inventory.test.ts`).

## Git

`main` is protected and requires **linear history** — rebase or squash, never a merge commit.

**Do not build deep stacked PR chains here.** GitHub's rebase-merge always mints new commit SHAs, so merging the bottom of a stack orphans every branch above it (identical trees, but the merge-base falls back and everything reports add/add conflicts). A 7-deep stack cost a full recovery session. Prefer one PR per shippable slice straight to `main`. Also: `--delete-branch` **closes** any PR still based on that branch — it does not retarget it.

Commit messages: `<type>(<scope>): <description>`, body in bullets. **No `Co-Authored-By` or AI-attribution trailer, ever.**

## PM

This repo runs in PM mode — see the global `pm` skill. Repo-specific facts:

- **Tracker**: Plane, project identifier `NIMUI`. Project/workspace/state UUIDs are deliberately **not** committed (public repo) — they live in the session's auto-memory alongside the design-sync pin convention. Re-derive with `mcp__plane__list_projects` / `list_states` if unavailable.
- **Verify commands**: the gate above — the four, plus `pnpm test:e2e` for anything touching `sr-only`, `aria-hidden`, a live region, or focus. Run them yourself after every build — a subagent's "it passes" is a claim, not proof.
- **UI-facing changes need real rendering**, not just a green build. For a *repeatable* check, add to the suite in `packages/docs/e2e/` and run `pnpm test:e2e`; it serves the export itself through `e2e/serve-out.mjs` — one PID, handle released on teardown, so it does not leave the `EBUSY` behind that a stray `npx serve` does. For a *one-off* look, drive the same server by hand (`node packages/docs/e2e/serve-out.mjs 4319`) with Playwright MCP; the embedded browser pane does not work against the static export. Whatever you start by hand, **kill it afterwards** — anything holding `packages/docs/out` fails the next `pnpm build` with `EBUSY`.
- **Extra gate**: any change touching component styling must state which class strings changed and confirm the corresponding test assertions were updated.
- **No `.github/workflows` before 2026-07-26** — anything older than that was never covered by CI, so treat "it was working" claims about that period with suspicion.
