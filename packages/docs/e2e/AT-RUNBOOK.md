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
| VoiceOver | Safari 26.5 | macOS 26.5.2 (25F84) | 2026-08-03 | **All five scenarios passed.** Two reader differences from NVDA, neither of which falsifies a docs claim — see below. |
| JAWS | Chrome | — | — | Not run — licence declined (NIMUI-72) |

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

### What the VoiceOver run observed, verbatim

Each quoted string is what VoiceOver emitted, read from `content of last phrase`
over AppleScript rather than from the Caption Panel or from memory.

**Initial load.** Reading backwards from the SkeletonGroup toggle with
`move left`, the first item is the region: cursor `'Loading operator'`, spoken
`'Loading operator'`. The next item back is the demo's own caption, so the three
placeholders in between contributed nothing — same as NVDA.

**Transition (SC 4.1.3).** Activating the toggle so `loading` flips back on:

```
'Loading operator'
```

Focus, read from the accessibility tree rather than inferred from speech, went
`Load again / AXButton` → `Finish loading / AXButton`. So the region spoke and
focus never moved — the claim holds. **VoiceOver stops there:** where NVDA
followed with `'Finish loading'`, VoiceOver does not re-announce a focused
control whose accessible name has changed underneath it.

**`loadedLabel` unset.** No page utterance at all. The only thing spoken was
VoiceOver's own control hint, `'You are currently on a button. To click this
button, press Control-Option-Space.'`, and focus moved `Finish loading` →
`Load again` in the accessibility tree without being spoken. The text-to-empty
swap produced no stray utterance — **and note this is where a virtual screen
reader modelled an announcement with empty text. Real VoiceOver does not.**

That hint is what makes this the strongest of the negative results, so do not
suppress it. The marker technique proves silence by the marker still being last;
here it was *not* last — VoiceOver spoke over it. So the channel is demonstrably
live during the measured window and the region still said nothing, which answers
the obvious "was anything listening?" objection with evidence instead of an
argument.

**`loadedLabel` set.** `'Operator loaded'`, then the same control hint.

**Dot.** Bare `srLabel` dots read at group level as a single run-together item,
`'ActiveWarningFailed'` — the status is reachable as text, but with no separator
between the three, where NVDA read them one per line. Dots with a visible label
read `'Syncing inventory Retrying webhook'` and `'Active Pending Processing
Success'` — **space-separated**, each exactly once, so the gate against
double-announcement holds here too. The 6px marker was never spoken.

The separator difference is *not* DOM whitespace, which was checked in the built
export rather than assumed: both groups are byte-for-byte adjacent,
`…>Active</span></span><span class="inline-flex…`, with nothing between the
wrappers. The two differ only in the label span's class — `sr-only` (clipped to a
1x1 box) against `truncate` (a real inline box) — so the run-together reading
tracks rendered layout, not markup structure. That is as far as the measurement
goes: **whether interacting into the bare group splits it one-utterance-per-label
was attempted and not obtained.** It was obtained for the visible-label group
(`'Active'`, `'Pending'`, `'Processing'`, `'Success'` as separate utterances),
which is a different group and does not settle the question for this one.

**Button loading.** `'Loading... website button busy dimmed button'` — nothing
from the inner `role="status"` wrapper, and the control was reached by Tab.

### The two divergences, classified

Neither is a wrong claim in the docs; both are reader differences.

1. **A renamed focused control is not re-announced.** NVDA speaks the control's
   new name after the region; VoiceOver does not. Nothing documented depends on
   it — the announcement the docs promise is the region's, and that fired.
2. **Adjacent `sr-only` labels run together.** Three bare dots read as one item
   with no separator. The documented claim is that a bare dot's status reaches
   assistive tech as text rather than colour alone, and it does — nothing above
   promises one utterance per dot at group granularity. Classified as a reader
   difference because the markup is identical to the visible-label group that
   *did* get separators; the mechanism is named but the interact-in split for
   this group is unmeasured.

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

## Setting up VoiceOver

Written from what was actually run on macOS 26.5.2, not from a plan.

### Two permissions, and neither can be scripted

1. **VoiceOver Utility → General → "Allow VoiceOver to be controlled with
   AppleScript".** The app is at
   `/System/Applications/Utilities/VoiceOver Utility.app` — *not* in
   `CoreServices` next to `VoiceOver.app`.
2. **System Settings → Privacy & Security → Accessibility → the terminal.**
   Without it `key code` fails with `osascript is not allowed to send
   keystrokes. (1002)` and no key ever reaches Safari.

**Writing the preference directly does not work, and this was measured, not
assumed:**

```bash
defaults write com.apple.VoiceOver4/default SCREnableAppleScript -bool true
```

That writes, reads back as `1`, and creates `default.plist` — and VoiceOver
still answers `-1728 Can't get content of last phrase` after a restart and a
`killall cfprefsd`. The checkbox is the only thing that took. Budget for a human
to click it.

### Starting and stopping

```bash
/System/Library/CoreServices/VoiceOver.app/Contents/MacOS/VoiceOverStarter
osascript -e 'tell application "VoiceOver" to quit'
```

On the machine's **first ever** VoiceOver launch a separate `VoiceOver
Quickstart` process appears and holds the session in a tutorial; it has to be
dismissed before anything is measurable. `killall VoiceOver` reported success
while VoiceOver kept running — the `quit` above is the one that works, and it
works without AppleScript control being enabled.

### The log VoiceOver does not have

VoiceOver writes no log, and the Caption Panel is on-screen text. The text
channel is `content of last phrase` over AppleScript.

**Poll it from one long-lived `osascript` process, never one per sample.** A
sample that spawns a process costs 40–80ms, which is coarser than the gap
between two VoiceOver utterances: the first of a pair is silently lost and the
result reads as "only one thing was announced". Running the loop inside a single
`osascript` makes each sample one Apple event — measured here at **0.175–0.23ms**
— and both utterances of a pair are recovered in order, even when emitted from
the same `tell` block on consecutive samples.

Two more things that produced wrong readings before they were fixed:

- **Size the window to outlast the action.** The loop is bounded by an iteration
  count because AppleScript's `current date` has one-second resolution. A window
  that closes early reports nothing, which is indistinguishable from silence.
- **Speak a unique marker before each measurement.** Then silence is a positive
  observation — the marker is still the last phrase — rather than an inference
  from a string that did not change.

**Do not use `guidepup`'s `spokenPhraseLog()` for this.** Its
`#pollForSpokenPhrases` re-pushes the *previous* phrase once polling passes half
its retry count with nothing new spoken, so an action that said nothing comes
back carrying the last thing that did. Two of the five scenarios are decided by
silence; a harness that manufactures an utterance cannot answer them. Its
`start`/`stop` and key handling are fine.

### Driving the page

- **`Control-Option-Right` sent through System Events does not move the
  VoiceOver cursor** — VoiceOver swallows the combination. Use its own command:
  `tell application "VoiceOver" to tell vo cursor to move right`. `move left`,
  `move into item` and `move out of item` work the same way, and interacting in
  is what splits a group into one utterance per child.
- **A Tab walk can land in a live code editor, and the next Tab is typed into
  the page.** That happened here on the Button page: the walk reached a
  `LivePlayground` textarea and the following keystroke came back as `selection
  replaced <`. The page under test had been edited by the test. Stop the walk
  when a stop announces itself as a text area, and reload before measuring.
- **Jump by anchor** (`…/button/#loading`) rather than tabbing from the top. It
  cut a 90-stop walk to 2 and keeps the walk clear of the editors entirely.
- Read focus from the accessibility tree, not from what was spoken:
  `name of (value of attribute "AXFocusedUIElement")`. SC 4.1.3 is about where
  focus *is*, and on VoiceOver the control does not announce its own rename, so
  speech alone cannot tell you.

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
