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
- Focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400`
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
