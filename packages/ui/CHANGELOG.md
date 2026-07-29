# Changelog

All notable changes to `@nim-ui/components` are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project intends to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Nothing has been published yet — the package sits at `0.0.0` and is consumed
from the workspace — so everything so far lives under Unreleased.

## [Unreleased]

### Added

- New entry point `@nim-ui/components/reduced-motion.css`, holding the global
  reduced-motion damper (the `*` / `!important` reset that clamps every
  animation and transition under `prefers-reduced-motion: reduce`).

- Per-component reduced-motion cover for every transition in the kit that can
  move something — the accordion and tree-view chevrons, the switch thumb, the
  meter / progress / bar-chart fills, the product-card zoom, the card lift and
  the toast swipe. Each switches the `transition-property` longhand off in its
  own class string, so it stands on its own rather than relying on the blanket
  damper below. Guarded by `packages/ui/src/motion-reduce.test.ts`.

### Changed

- That damper moved out of `tokens.css`, where it rode along with the design
  tokens. Sites that import `tokens.css` directly rather than the bundle (as
  this repo's docs site does) need the new import if they want it.

- **The blanket damper is no longer part of the default bundle.**
  `src/styles.css` no longer imports it, so `@nim-ui/components/styles` — and
  therefore anything that ships it — no longer installs an application-wide
  motion reset. That reset is an **application-level** decision: the selector is
  `*`, the declarations are `!important` and the rule is unlayered, so it
  reached every element in the consumer's application, including code the kit
  does not own, with no way to opt out. The file is still published and
  unchanged; to get exactly the previous behaviour back, add one line to your
  own stylesheet:

  ```css
  @import '@nim-ui/components/reduced-motion.css';
  ```

  **The kit still honours `prefers-reduced-motion` on its own, with no consumer
  code.** Overlays, menus, toasts and the rest each ship a
  `motion-reduce:animate-none` counterpart in the component itself, and every
  movement-bearing transition ships the counterpart described above. Both are
  guarded by `packages/ui/src/motion-reduce.test.ts` and are unaffected by this
  change.

  **What does change: loading indicators now animate at full speed under
  `prefers-reduced-motion: reduce`.** `Spinner`, `Skeleton`, `Dot`, `StatusPill`
  and `Button`'s loading state carry a bare `animate-spin` / `animate-pulse`,
  and this reset was the only thing reaching them. That is intended, not a
  regression: for a loading indicator the motion *is* the information, and WCAG
  2.2 SC 2.2.2 exempts an activity indicator on that basis. It is also better
  than the previous behaviour, where the reset did not slow those loops but
  stopped them dead — after one 0.01ms iteration the indicator sat motionless,
  which reads as a hung interface rather than as work in flight. Add the import
  above if you would rather have them stopped.

  Colour and opacity transitions (~55 sites) also stop being clamped. A
  crossfade moves nothing, so this is the intent rather than a side effect.

  **Not a semver event.** The package is at `0.0.0`, has zero git tags and no
  publish workflow, so nothing has ever been released with the old behaviour.
  If this lands before the first publish there is no version to bump and no
  migration to run; it is simply what `0.1.0` will ship. If a release somehow
  precedes it, treat it as breaking — the restore line above is the migration.
