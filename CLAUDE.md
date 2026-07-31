# Nim UI

React UI kit for **operational software** — dashboards and backoffice first, commerce as a supporting surface. 91 components across 8 categories.

## Layout

pnpm workspace + turbo. Four packages:

| Package | What |
|---|---|
| `packages/ui` (`@nim-ui/components`) | The library. 91 components, 2078 tests. |
| `packages/docs` (`@nim-ui/docs`) | Next.js 16 + Fumadocs, static export (`output: 'export'`). |
| `packages/tailwind-config` | Shared Tailwind v4 config + design tokens. |
| `packages/mcp-server` | MCP server that reads `packages/ui/src/registry/index.json`. |

React 19 · TypeScript 5.9 · Tailwind v4 · vitest · Node ≥22 · pnpm 9.15.4

## Verification gate

Run all four from the repo root before claiming anything works. This is what CI runs.

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm build
```

**Never run a bare `npx vitest run` from the root** — there is no root vitest config, so tests execute in the node environment without jsdom or the setup file and 92 of 94 files fail with `document is not defined`. Only the per-package configs work, which is what `pnpm test` (turbo `test:run`) uses.

Single test file: `pnpm --filter @nim-ui/components exec vitest run src/components/<name>.test.tsx`

Note `pnpm --filter @nim-ui/components test` (no `:run`) is **watch mode** and never exits.

## Design contract — Ink + Muted Steel

The single most important convention. "Premium Operations Minimal": calm hierarchy, restrained colour, dense enough to scan.

- **Ink carries primary action**: `bg-neutral-950 text-white` / `dark:bg-neutral-100 dark:text-neutral-950`. The near-black primary button is **deliberate, not a bug** — do not "fix" it to a brand colour.
- **Steel (`primary-*`, a low-chroma blue-grey) is reserved** for focus rings, selection, and links. Never a decorative fill.
- Focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400`. **The pair is mandatory, not a style choice** — WCAG 2.2 SC 1.4.11 wants 3:1 and *no single step of the steel scale clears it in both themes*: `primary-400` measures 2.84 / 2.72 / 2.61 on white / `neutral-50` / `neutral-100`, `primary-500` measures 2.86 on `neutral-800`. Same treatment for the focus *border* on `input`/`textarea`/`select` (`focus-visible:border-primary-500 dark:focus-visible:border-primary-400`) and for the `focus-within:` and `[&:focus-visible>div]:` forms. Write `dark:` **outermost** — `focus-visible:dark:` compiles the same but every `toHaveClass` assertion would miss it. Guarded by `src/focus-ring-contrast.test.ts`. Do **not** answer a contrast complaint by retuning `--color-primary-400`; it also paints chart fills, spinners, progress bars, slider ranges and the radio dot.
  - **Consumer override consequence**: tailwind-merge keys on the modifier set, so a consumer's `focus-visible:ring-red-500` only replaces the *light* half and they get red in light, steel in dark. A full override is both halves: `focus-visible:ring-red-500 dark:focus-visible:ring-red-500`. `popover.tsx`'s highlight border (`border-primary-500 dark:border-primary-400`) is the precedent.
  - **Every focus indicator the kit ships is now that pair** (NIMUI-55 emptied `KNOWN_UNPAIRED` in `packages/ui/src/focus-ring-contrast.test.ts`; the list stays, empty, so the next arrival still trips it). There is no variant-specific, status-specific or component-specific focus colour left: one indicator, kit-wide, 4.09:1–5.16:1 on the light surfaces and 5.19:1–6.96:1 on the dark ones. Scope that green run honestly all the same — `LIGHT_SURFACES`/`DARK_SURFACES` in that file are a hand-maintained judgement about where these components sit, not a fact derived from the stylesheet, so a component dropped on a mid-scale or consumer background is still unmeasured; and the ring's *offset band* is a separate open defect (NIMUI-57) — it defaults to opaque white and is wrong in dark mode on **34 of the 37 `ring-offset-2` sites**, spread over 27 of the 29 component files, which SC 1.4.11 does not turn on but a designer will notice. Count the *sites*, not the files — only `sidebar-nav` and `tree-view` are fully covered; `tabs` pairs its content element and leaves `TabsTrigger` bare, and `navbar` alone has five sites. Note `--tw-ring-offset-color` is declared `inherits: false`, so a global `.dark` override cannot reach any of them and every site needs its own declaration.
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
6. Bump counts in `llms.txt` (header, category heading, component line, footer), `README.md`, and `packages/docs/app/(home)/page.tsx`.

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
- **Verify commands**: the four-command gate above. Run them yourself after every build — a subagent's "it passes" is a claim, not proof.
- **UI-facing changes need real rendering**, not just a green build. Playwright MCP works against the static export; the embedded browser pane does not. Serve with `npx serve packages/docs/out -l 5173` — and **kill the server afterwards**, or it holds a handle on `packages/docs/out` and the next `pnpm build` fails with `EBUSY`.
- **Extra gate**: any change touching component styling must state which class strings changed and confirm the corresponding test assertions were updated.
- **No `.github/workflows` before 2026-07-26** — anything older than that was never covered by CI, so treat "it was working" claims about that period with suspicion.
