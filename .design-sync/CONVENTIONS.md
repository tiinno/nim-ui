# Design Sync — conventions & runbook

Local prep that packages the docs export into Claude Design cards. Upload is a
separate, auth-gated step (see below).

## Card conventions
- One card per unit at `build/<dir>/<slug>.html`; first line is
  `<!-- @dsCard group="<Display Name>" -->` (drives the Design System pane).
- Groups: Overview, Foundations, Primitives, Layout, Data Display, Commerce,
  Landing, Forms, Feedback, Navigation, Patterns.
- Extracted cards link `../_shared/nim-ui.css`; Colors and Overview are
  self-contained (inline styles) and generated from source, not extracted.
- Brand fonts (Fraunces / Hanken Grotesk / JetBrains Mono) are copied to
  `build/media/*.woff2`; the shared CSS's `@font-face` rules reference them via
  relative `../media/…` URLs (resolve from `_shared/nim-ui.css` → project-root
  `media/`). Skip this and Claude Design warns "Missing brand fonts".

## Regenerate
1. `pnpm --filter docs build`   # refresh packages/docs/out
2. `node .design-sync/convert.mjs`   # rebuild .design-sync/build

## Upload (authorized session only)
`DesignSync` needs Claude Design authorization (interactive login), so it cannot
run in a non-interactive session. In an authorized session:
1. `list_projects` → pick the target design-system project, or `create_project`.
   Pin its id/name into **`config.local.json`** (gitignored), NOT `config.json`.
   The committed `config.json` ships with `project: null` so this public repo
   never carries a personal Claude Design project id, and anyone who clones it
   creates their own project. On re-sync, read the pin from `config.local.json`.
2. `finalize_plan` with `localDir` = `.design-sync/build`, writes = `**/*.html`,
   `_shared/*.css`, `media/*.woff2`, `_ds_needs_recompile` (deletes = same globs
   minus the sentinel, for reconciliation).
3. `write_files` (localPath uploads, ≤256 per call — split across calls).
4. `register_assets` all cards (name/path/group/viewport). **Required** for this
   hand-authored layout — the app's `@dsCard` auto-index does NOT fire for loose
   cards (no `_ds_bundle.js`/manifest), so without registration the project shows
   "This design system is empty". Then re-write `_ds_needs_recompile` so the app
   refreshes. `group` comes from each card's `@dsCard group="..."` first line.

## Close-out
- `build/` and `config.local.json` are gitignored. Commit only config.json
  (with `project: null`), convert.mjs, this file.
- Colors is generated from tokens.css on purpose; the docs colors page is a
  separate concern.
