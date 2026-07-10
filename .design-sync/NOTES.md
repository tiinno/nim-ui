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
101 files (83 cards + `_shared/nim-ui.css` + `styles.css` + 16 `media/*.woff2`).
A "delete everything not in my build" reconciliation would wipe the user's designs
and uploaded fonts. The converter is deterministic, so there are normally zero
orphans in its own namespace anyway.

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
