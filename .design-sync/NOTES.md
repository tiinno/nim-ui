# Design Sync — operational notes

Read this before re-syncing. These are corrections/discoveries that supersede the
original runbook assumptions.

## Re-sync is WRITES-ONLY — never run a reconciliation delete

The live Claude Design project accumulates content that `convert.mjs` does **not**
produce and that must be preserved on every re-sync:

- `templates/` — designs authored in Claude Design (e.g. `backoffice-dashboard`,
  `landing-page`, `slide-deck`), each with `*.dc.html` + `ds-base.js` + `support.js`
  + `.thumbnail`. **These are the user's work.**
- `fonts/*.woff2` — the brand-font registry (Fraunces / Hanken Grotesk /
  JetBrains Mono), populated via the manual "Upload fonts" button. Not the same
  as `media/*.woff2` (those are card-render fonts the converter copies).
- `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` — app-generated.

So: `finalize_plan` with **`deletes: []`** and only overwrite the converter's own
files — 122 as of 2026-08-04 (98 cards + `_shared/nim-ui.css` + `styles.css` +
22 `media/*.woff2`). A "delete everything not in my build" reconciliation would
wipe the user's designs and uploaded fonts. The converter is deterministic, so
there are normally zero orphans in its own namespace anyway.

Scope `writes` to the converter's own directories — `commerce/*.html`,
`data-display/*.html`, … `primitives/*.html`, plus `_shared/*.css`,
`media/*.woff2`, `styles.css` (14 patterns) — instead of a blanket `**/*.html`.
Same 122 files either way, but `templates/` then sits **outside the write grant**,
so the plan itself, not just care in assembling the file list, is what protects
the user's authored designs. Note that `templates/*/*.dc.html` will show up as an
"orphan" in any naive `.html`-keyed diff; it isn't one.

## Verify the shared CSS *content* before uploading — the converter can't

`assembleSharedCss()` reads the `<link rel=stylesheet>` hrefs out of one docs page
and concatenates the chunks. It throws if a chunk is *missing*, but it has no idea
what should be *in* one. So a docs-side change that narrows the compiled stylesheet
(and this repo now has several guards that deliberately do exactly that —
`@source not`, `compiled-utility-inventory.test.ts`) produces a shared CSS that is
structurally fine and quietly missing rules the cards need. Nothing fails; the
cards just render wrong in a project the user has authored templates in.

So before every upload, copy the previous `build/_shared/nim-ui.css` aside, rebuild,
and diff the two **by class inventory**, not by line (the file is minified — a line
diff is noise). Extract `/\.((?:\\.|[a-zA-Z0-9_-])+)/g`, unescape the backslashes,
and set-diff. Then confirm by name:

- the `:where(:root){--font-fraunces:…;--font-hanken:…;--font-jetbrains:…}` hoist
  block is present with **all three** families — if it's empty or short a family,
  every card silently drops to system fonts;
- whatever styling work landed since the last sync is actually visible in the CSS.

On the 2026-08-04 run this was the whole value of the check: it showed the NIMUI-57
ring→outline migration arriving (`focus-visible:ring-offset-2`,
`ring-primary-300`, `ring-error-400/500`, `focus-within:ring-*`,
`[&:focus-visible>div]:ring-*` **out**; `focus-visible:outline-2` +
`outline-primary-500` / `dark:…outline-primary-400`, `focus-within:outline-*`,
`has-[[data-card-link]:focus-visible]:outline-*` **in**), alongside the
`aria-disabled:*` and `motion-reduce:animate-none` sets. 58 classes lost, 69 gained,
2011 → 2022. Losses that are *expected*: `bg-gray-*`, `bg-yellow-*`, `bg-blue-50`,
`hover:shadow-lg/md`, `animate-fade-in/out` — the docs-stylesheet cleanups. A loss
outside that shape is a red flag, not a rounding error.

## Fonts: the referenced set grows; check `missing`, and don't assume 16

`copyFonts()` copies only the woff2 the assembled CSS actually references, and it
**does not throw** when one is absent — it collects `missing[]` and prints it. A
non-empty `missing` means you are about to upload CSS pointing at fonts you didn't
ship: stop. Also, the count is not stable — 2026-07-28 referenced 16, 2026-08-04
referenced 22 (Next content-hashes these names, so new subsets appear as new files).
Because re-sync is writes-only, a *dropped* reference would leave a stale woff2 on
the remote forever; the 2026-08-04 run checked and all 16 prior names were still
referenced, so there are no orphans to date.

## register_assets is NO LONGER required (behavior changed after 2026-07-06)

The app now auto-indexes cards from each card's first-line
`<!-- @dsCard group="..." -->` comment into `_ds_manifest.json`. Verified
2026-07-10: the manifest enumerated all 83 cards with correct groups, with no
`register_assets` call. (The original runbook/2026-07-06 note said registration
was mandatory or the pane showed "empty" — that is now stale.) Skip it.

## Shared CSS path: `_shared/` (yours) vs `shared/` (app-managed)

Cards link `../_shared/nim-ui.css` and `styles.css` imports `./_shared/nim-ui.css`
(underscore) — that's what the converter uploads. The remote ALSO carries
`shared/nim-ui.css` (no underscore). Confirmed 2026-07-10 by fetching it: it is the
**app's processed copy** of `_shared/nim-ui.css` — same CSS but annotated with
`/* @kind ... */` markers (the app's design-adherence analysis, paired with the
`_adherence.oxlintrc.json` file). It stays in sync with your `_shared/` upload and
already carried the font-var hoist fix after this re-sync. So it is app-managed —
**do not overwrite or delete it**; just keep uploading `_shared/nim-ui.css` and the
app maintains `shared/`. Both resolution paths therefore carry your latest CSS.
