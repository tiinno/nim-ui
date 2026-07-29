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

### Changed

- That damper moved out of `tokens.css`, where it rode along with the design
  tokens. **No behaviour change:** `styles.css` still imports it, so the
  compiled `@nim-ui/components/styles` bundle applies exactly the same rule in
  the same place in the cascade. Sites that import `tokens.css` directly rather
  than the bundle (as this repo's docs site does) now need the new import — one
  line, shown below.

### Deprecated

- Shipping that damper as part of the default bundle. It is an
  **application-level** decision: the selector is `*`, the declarations are
  `!important` and the rule is unlayered, so importing the kit's stylesheet
  currently clamps motion across the consumer's entire application, including
  code the kit does not own, with no way to opt out. A later change will drop
  the import from `styles.css` and make it opt-in. To keep today's behaviour
  after that lands, add one line to your stylesheet:

  ```css
  @import '@nim-ui/components/reduced-motion.css';
  ```

  **Entrance and exit animations do not depend on that import.** Overlays,
  menus, toasts and the rest each ship a `motion-reduce:animate-none`
  counterpart in the component itself, guarded by
  `packages/ui/src/motion-reduce.test.ts`, and stay still under reduced motion
  either way.

  **Loading indicators are the deliberate exception.** `Spinner`, `Skeleton`,
  `Dot`, `StatusPill` and `Button`'s loading state carry a bare `animate-spin` /
  `animate-pulse`, so this reset is the only thing damping them. Once it becomes
  opt-in, a build that leaves it out will show those indicators spinning and
  pulsing at full speed under `prefers-reduced-motion: reduce`. That is
  intended: for a loading indicator the motion *is* the information, and WCAG
  2.2 SC 2.2.2 exempts an activity indicator on that basis. It is also better
  than today's behaviour, where the reset does not slow those loops but stops
  them dead: after one 0.01ms iteration the indicator sits motionless, which
  reads as a hung interface rather than as work in flight. Re-add the import
  above if you would rather keep them stopped.
