# Screen-reader runbook

How to run an assistive-technology pass against the built docs site, and what the
last one found.

Nothing here runs in CI, and nothing here is a substitute for it. `a11y.spec.ts`
in this directory checks that the markup is in a state where a reader *could*
announce correctly — computed style, live-region node identity across a React
reconciliation, focus retention, accessibility-tree exposure. **None of that is
an announcement.** Live-region behaviour differs between NVDA, JAWS and
VoiceOver, is not observable from the accessibility tree, and only a real reader
can answer it. That is NIMUI-47.

---

## Recorded passes

| Reader | Browser | OS | Date | Result |
| --- | --- | --- | --- | --- |
| NVDA 2026.1.1 | Firefox | Windows 11 25H2 | 2026-08-03 | **All five scenarios passed.** No gap found between the docs and what was heard. |
| JAWS | Chrome | — | — | Not run |
| VoiceOver | Safari | — | — | Not run — needs macOS |

A checklist with no last-run date is decoration. If you run a pass, add the row.

### What the NVDA run observed, verbatim

Each quoted string is what NVDA emitted, taken from its own input/output log.

**Initial load.** Reading backwards from the SkeletonGroup toggle on a freshly
loaded page, the first line is `'Loading operator'`. The three placeholders
between the toggle and the region said nothing — `aria-hidden` pruned them.

**Transition (SC 4.1.3).** Activating the toggle so `loading` flips back on:

```
'Loading operator '
'Finish loading'
```

The region spoke *first*; the second utterance is the focused control renaming
itself. So the announcement fired on the text change and focus never moved.

**`loadedLabel` unset.** Only `'Load again'` — the focused control renaming
itself. The text-to-empty swap produced no stray utterance.

**`loadedLabel` set.** `'Operator loaded '`, then `'Load again'`.

**Dot.** Bare dots read one per line: `'Active'`, `'Warning'`, `'Failed'`. Dots
with a label read once each (`'Syncing inventory'`, `'Retrying webhook'`) — the
gate against double-announcement holds on a real render. The 6px marker was
never spoken.

**Button loading.** `'Loading...', 'button', 'unavailable', 'busy'` — nothing
from the inner `role="status"` wrapper, and the control was reached by Tab.

---

## Setting up NVDA without installing it

NVDA can make a portable copy that touches no service, no registry entry and no
startup item. Delete the folder and it is gone.

```bash
# from https://www.nvaccess.org/download/ — verify the signature says NV Access Limited
nvda_<version>.exe --create-portable-silent --portable-path="<somewhere>/nvda-portable"
```

That flag is silent and prints nothing on success. Check that the folder exists
rather than trusting the exit code.

### The log is the evidence, and getting it needs a config file

NVDA speaks; it does not hand you text. Its input/output log does, and every
observation above came from there rather than from someone's memory of what they
heard.

**`-l` and `-f` are accepted and then silently ignored.** They appear in the
process command line and change nothing: the log still lands in the default
temporary location at the default level. The log level has to come from a config
file, with `-c` naming the directory that holds it:

```ini
; <portable>/userConfig/nvda.ini
[general]
loggingLevel = IO
showWelcomeDialogAtStartup = False
```

```bash
<portable>/nvda.exe -c "<portable>/userConfig"
```

Confirm it took by checking the log for lines beginning `IO` before running
anything — at the default level there are none, and a pass read from an
`INFO`-level log measures nothing.

`--help` writes to no console: NVDA is a windowed application, so piping it
gives an empty result and exit code 0. That is not evidence a flag exists.

## Serving the site

```bash
pnpm --filter @nim-ui/docs build
node packages/docs/e2e/serve-out.mjs 4319
```

One process, one handle, released when it exits — unlike a stray `npx serve`,
which holds `packages/docs/out` and fails the next build with `EBUSY`.

---

## How to drive it — read this before improvising

Two attempts were lost to the same trap before the method was right.

**A screen reader narrates whichever window has focus.** Written steps live in a
terminal or an editor, so a person following them spends the session listening
to the *steps* rather than to the page, and switching to the browser means
losing sight of what to do next. Both hand-driven attempts produced logs full of
NVDA reciting the test plan.

**That failure looks exactly like success from the log.** The phrases under test
appeared in the plan being read aloud, so searching the log found every one of
them. A run that measured nothing passed a naive check. Before believing any
hit, confirm it came from the document and not from the console.

What worked: focus the browser window programmatically and send one key at a
time, reading the log after each keystroke before choosing the next. Walk tab
stops until the target is *heard*, never by a fixed count — a page that gains a
heading silently redirects a counted walk onto a different control.

**Never send an activation key to a control whose name has not been read back.**
A blind hunt for a button activated a browser's "Refresh profile" prompt during
the first attempt and reset a real profile. Launch the browser with an explicit
profile path and an explicit URL rather than typing either.

Deliberately not committed: the keystroke driver itself. It defeats
focus-stealing prevention and sends keys into whatever window matches a title,
which is the mechanism that caused the incident above. It is twenty lines to
rewrite when needed, and the part worth keeping is the discipline on this page.

## The scenarios

Five, and they are NIMUI-47's, not this file's — check there for the current
list before running.

1. **Initial load.** A region already populated at mount is not reliably
   announced; the claim is that its text stays reachable in browse mode instead.
2. **Transition.** `loading` flips while focus is elsewhere. The region must
   speak *without* moving focus.
3. **`loadedLabel` set versus unset.** Set announces completion; unset stays
   quiet, and the text-to-empty swap must not produce a stray utterance.
4. **Dot `srLabel`.** Spoken for a bare dot; a dot with a label must not be
   announced twice.
5. **Button loading.** Confirm ARIA's prune of a button's descendants actually
   happens rather than trusting the spec.

A negative result is a valid and useful outcome. The point is to replace a
spec-reading with an observation.
