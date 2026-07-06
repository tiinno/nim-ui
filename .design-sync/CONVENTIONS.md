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

## Regenerate
1. `pnpm --filter docs build`   # refresh packages/docs/out
2. `node .design-sync/convert.mjs`   # rebuild .design-sync/build

## Upload (authorized session only)
`DesignSync` needs Claude Design authorization (interactive login), so it cannot
run in a non-interactive session. In an authorized session:
1. `list_projects` → pick the target design-system project, or `create_project`.
   Pin its id/name into `config.json` `project`.
2. `finalize_plan` with `localDir` = `.design-sync/build`, writes = `**/*.html`,
   `**/_shared/*.css`.
3. `write_files` (localPath uploads, ≤256 per call — split across calls).
   Cards are indexed from their `@dsCard` first line; no manual register needed.

## Close-out
- `build/` is gitignored (regenerable). Commit only config.json, convert.mjs,
  this file.
- Colors is generated from tokens.css on purpose; the docs colors page is a
  separate concern.
