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
1. `pnpm install --frozen-lockfile`   # cheerio is a root devDep
2. `pnpm build`   # turbo; refreshes packages/docs/out (docs build needs ui built first)
3. `node .design-sync/convert.mjs`   # rebuild .design-sync/build

`convert.mjs` never cleans `build/`, so a renamed or deleted docs page leaves its
old card behind. Diff the build's file list against the previous run (or against
the remote `list_files`) before uploading — don't assume the output is a
fresh tree.

## Upload (authorized session only)
`DesignSync` needs Claude Design authorization (interactive login), so it cannot
run in a non-interactive session. In an authorized session:
1. `list_projects` → pick the target design-system project, or `create_project`.
   Pin its id/name into **`config.local.json`** (gitignored), NOT `config.json`.
   The committed `config.json` ships with `project: null` so this public repo
   never carries a personal Claude Design project id, and anyone who clones it
   creates their own project. On re-sync, read the pin from `config.local.json`.
2. `finalize_plan` with `localDir` = `.design-sync/build`, **`deletes: []`** — the
   re-sync is writes-only; see NOTES.md for the templates/fonts that a
   reconciliation delete would destroy. Scope `writes` to the converter's own
   directories (`commerce/*.html` … `primitives/*.html`, `_shared/*.css`,
   `media/*.woff2`, `styles.css`) rather than a blanket `**/*.html`: that keeps
   `templates/` outside the write grant, so even a bad file list can't clobber
   designs authored in Claude Design.
3. `write_files` (localPath uploads, ≤256 per call — 122 files fits in one).
   Exclude `_fonts-upload/` — those are for the manual "Upload fonts" button only.
4. **No `register_assets`, and no `_ds_needs_recompile` sentinel.** The app
   auto-indexes cards from each card's first-line `<!-- @dsCard group="..." -->`
   comment. (This step used to say registration was *required*; that was true on
   2026-07-06 and has been false since — verified by the 2026-07-10, 2026-07-28
   and 2026-08-04 syncs, the last two of which wrote no sentinel at all.)

## Close-out
- `build/` and `config.local.json` are gitignored. Commit only config.json
  (with `project: null`), convert.mjs, this file.
- Colors is generated from tokens.css on purpose; the docs colors page is a
  separate concern.
