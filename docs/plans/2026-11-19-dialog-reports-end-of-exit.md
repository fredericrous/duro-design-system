---
status: done
branch: feat/dialog-exit-complete
repos: [duro-design-system, duro-lexical-multi]
adrs: []
plan-id: p-01M7TNNB93FQW8190X05817KKS
---

# Dialog reports the end of its exit

## Review panel

👉 **Decide:** none — approve if a new `onExitComplete` prop (fired after focus returns) beats re-sending `onOpenChange(false)`.
📍 duro-design-system, duro-lexical-multi · 4 phases · 2 releases · next: Phase 1. Panel: backend, lang:typescript, react, ui-design, tui, unix, architect, po (all opus-5-5); codex: not installed.
**Changed by review:** notice fires outside the `isConnected` guard; stories prove the unmount and the count, not just focus; registry/docs regeneration named.
**Verdicts:** round 2: 5 approve, 3 approve-with-changes; 9 carried into implementation (order of the two callbacks, native wording, app follow-ups, story file, ticket `repos`); words 855 → 1015 (×1.19); remove 0, merge 0.
📄 Full reviews: [2026-11-19-dialog-reports-end-of-exit.reviews.md](2026-11-19-dialog-reports-end-of-exit.reviews.md).

## Picture

```
 today                               after this plan
 -----                               ---------------
 owner: open=false                   owner: open=false
   |                                   |
   v                                   v
 Dialog exit plays (silent)          Dialog exit plays
   |                                   |
   v                                   v
 focus back to opener                focus back to opener
   (owner never told; an               |
    early unmount skips it)            v
                                     onExitComplete --> owner unmounts
```

A controlled close used to end without a word to the owner; after this
plan the Dialog calls `onExitComplete` once focus is back, and the owner
unmounts there.

## Context

Programme greenrack-rename, ticket t14 (`decisions:docs/programmes/greenrack-rename/t14-dialog-exit-notice.md`).
greenrack's `Dialog` plays its exit when a controlled `open` turns false from
outside, and hands focus back only when the exit ends, but tells the owner
nothing. An owner that unmounts at `open={false}` loses the focus hand-back.
greenrack-lexical 1.x works around it with a hidden `Dialog.Close` inside
`Dialog.Title` (a `div` in the heading, `TODO(greenrack)`).

## Goal

`Dialog.Root` gains `onExitComplete`, called once per finished exit, after
focus is back. An owner unmounts there. greenrack-lexical's `ui/Modal` drops
its hidden trigger and uses it.

## Non-goals

- Calling `onOpenChange(false)` after an outside close. Rejected: an owner
  whose `onOpenChange` toggles state would reopen the dialog. An owner that
  set `open={false}` itself would hear its own close back. And
  `onOpenChange` reports a request, not a completion.
- Drawer and DetailPanel share `useOverlayOpenState` but stay as they are.
  A Drawer `onExitComplete` is filed as a follow-up (inbox).
- Making an unmount on `onOpenChange(false)` keep focus. That case is
  documented on the prop, not fixed.

## Code review

- duro-design-system: react, lang:typescript (backend left out: no server code; unix, tui left out: `greenrack Dialog` gains one prop row, no new command, flag, stream or exit code; ui-design left out: nothing renders differently)
- duro-lexical-multi: react, lang:typescript (backend left out: no server code; ui-design left out: the hidden trigger was invisible, nothing renders differently)

## Behaviour

- `Dialog.Root onExitComplete?: () => void`, on web and on native.
- It is called once per exit, whatever started it: Escape, the backdrop,
  `Dialog.Close`, or a controlled `open` turning false. It runs after the
  exit animation ends and after focus has gone back to what held it before
  the open (on native, after the screen reader's focus moves to the trigger).
- It is not called for an exit that a reopen cancels mid-animation, nor
  for a Dialog that was never shown, nor when the Dialog unmounts mid-exit
  (the exit timer is cleared).
- An owner that renders `{mounted && <Dialog.Root …>}` and unmounts in
  `onExitComplete` keeps the focus hand-back.
- How it fires: from Dialog's focus-return effect (web: the
  `!present && wasOpenRef.current` branch, after the focus attempt and
  outside its `target?.isConnected` check, so an opener that left the DOM
  still gets the notice; native: the `wasPresent && !present` branch, after
  `focusForAccessibility`). The callback is read through a ref written in
  an effect declared above the focus effect, so the focus effect reads the
  latest callback and an inline arrow does not re-run it. It does not fire from the hook's exit timer: the owner's state
  update would batch with `setPresent(false)`, the Dialog would unmount in
  that commit, and the focus effect would never run.
- `ConfirmDialog` forwards `onExitComplete` to its `Dialog.Root`.
- greenrack-lexical `Modal`: `<Dialog.Root open={open && !dismissed}
onOpenChange={(next) => setDismissed(!next)} onExitComplete={report}>`,
  where `report` calls `onClose` once. The hidden `Dialog.Close`, its span
  ref and the TODO go. When the Modal closes before its Dialog ever showed
  (a `shownRef`, set when the Modal renders with `open && !dismissed`, is
  still false), no exit plays, so an effect calls `report` directly.

## Phases

- [x] Phase 1 — DS: `onExitComplete` on web and native Dialog, forwarded by
      ConfirmDialog, documented, two stories (an outside close and an Escape
      close, each unmounting on the notice and asserting focus on the opener),
      plus one that reopens mid-exit, waits `DURATION_MS.fast * 2`, counts zero
      notices, then closes and counts one:
      `packages/ui/src/components/Dialog/Dialog.tsx`,
      `packages/ui/src/components/Dialog/Dialog.native.tsx`,
      `packages/ui/src/components/Dialog/Dialog.meta.ts`,
      `packages/ui/src/components/Dialog/Dialog.stories.tsx`,
      `packages/ui/src/components/ConfirmDialog/ConfirmDialog.tsx`,
      `.changeset/dialog-exit-complete.md`, and `packages/cli/registry.json`
      plus the CLAUDE.md prop blocks, regenerated with
      `packages/cli/scripts/build-registry.mjs`
- [x] Phase 2 — DS release 7.1.0 via the `tag-release` skill (a new prop,
      so a minor; the release workflow sets the version from the tag); check
      the npm package lists the prop in its `.d.ts`
- [x] Phase 3 — greenrack-lexical: peer and dev `@greenharness/greenrack-ui`
      to `^7.1.0`, the Modal rewrite, the `Widgets` story green, release 1.3.0
      (minor, because the peer floor rises): `package.json`, `pnpm-lock.yaml`,
      `src/ui/Modal.tsx`, `src/UiComponents.stories.tsx` (only if its play
      needs a change)
- [x] Phase 4 — close t14 in decisions (ticket `status = "done"`, map
      Handoff): `docs/programmes/greenrack-rename/t14-dialog-exit-notice.md`,
      `docs/programmes/greenrack-rename/map.md`

## Decision log

- 2026-11-19 — `onExitComplete`, not `onOpenChange(false)` after an outside
  close, for the reasons under Non-goals.
- 2026-11-19 — fire from the focus-return effect, not the timer, so that
  unmounting in the callback cannot skip the focus hand-back.
- 2026-11-19 — deliberate: the reopen story keeps a real
  `setTimeout` wait (tests.no-real-waits). It proves that a cancelled exit
  timer never fires, the same pattern as `DoubleCloseReportsOnce`, and fake
  timers do not combine with userEvent in the storybook browser project.
- 2026-11-19 — Phase 1 implemented by relais run `run-660a6e6c7b4db-d8de`
  (accepted). The reopen story's wait was raised by hand to
  `DURATION_MS.slow * 2`, since the story uses the slow exit.
- 2026-11-19 — lexical ships as 1.3.0, not 1.2.0. Another session released
  1.2.0 (greenrack-lexical#42) about an hour before this branch.
- 2026-11-19 — lexical's Modal close is one-way. The react code review found
  that the first rewrite (relais run `run-660a7a782c04a-3ed5`) let a kept
  Modal reopen after an outside close, with no second `onClose`. One effect
  now latches `dismissed`. `ModalOutsideCloseStaysClosed` and
  `ModalClosedBeforeShown` fail against the earlier Modal. The fix was by hand.

## Implementation review

- implementation-review: approve-with-changes. The real wait in the reopen story is kept as deliberate (see the Decision log). The pack refresh already sits in its own `chore(adr)` commit. The bare "pass" is replaced by commands and their output. 75k, 41 s.
- react: approve. Kept deliberate: a raw `html.button` opener, because the story needs its DOM ref to compare `document.activeElement`. 68k, 26 s.
- lang:typescript: approve. Its note on the real wait is covered by the same decision. 72k, 28 s.

- greenrack-lexical (#43): implementation-review, react and lang:typescript each said approve-with-changes in round 1, then approve on the delta. The one-way close came from the react seat. The plan record, which this repository holds, is this close-out.

## Verification

- Phase 1: Storybook test run (vitest browser) of `Dialog.stories.tsx` →
  the new `UnmountOnExitComplete*` stories find the opener by role and
  name and show the owner unmounted ("Mounted: no"), "Exits reported: 1"
  and "Focus on opener at notice: yes" (read inside the callback); they
  fail with the call removed. The reopen-mid-exit story shows "Exits
  reported: 0" after the reopen, then 1 after a full close. Every existing
  Dialog and ConfirmDialog story stays green. Typecheck, lint, and
  `build-registry.mjs --check` and `--check-docs` exit 0. Native has no
  test harness (no `*.native.test.*`): its branch is checked by typecheck
  and review only.
  - Observed: `vitest --project=storybook` on `Dialog.stories.tsx` → 22 of 22
    pass. With the web `onExitCompleteRef.current?.()` call removed, the three
    new stories fail (3 failed, 19 passed), so they test the notice.
    `build-registry.mjs --check` → "registry: up to date";
    `--check-docs` → "CLAUDE.md: generated regions up to date". `pnpm typecheck` → exit 0; `pnpm lint` → exit 0, 0 errors (13
    warnings, all in files this branch does not touch). ConfirmDialog has
    no stories, so its forward is covered by typecheck only.
- Phase 2: `npm view @greenharness/greenrack-ui@7.1.0 version` → 7.1.0, and
  the tarball's Dialog `.d.ts` has `onExitComplete`, and
  `npx @greenharness/greenrack-cli@7.1.0 Dialog` lists it with the
  unmount-on-`onOpenChange(false)` caveat.
  - Observed: tag `v7.1.0` at e4f3bb13 (greenrack#198), release run 44615875569
    → success, which published all seven packages at 7.1.0 with provenance.
    The registry tarball has `onExitComplete` in
    `dist/components/Dialog/Dialog.d.ts`. `npx -y @greenharness/greenrack-cli@7.1.0 Dialog`
    prints it with the order and the caveat. `npm pack` returned ETARGET for
    about a minute after `npm view` already showed 7.1.0: the registry
    propagates in pieces.
- Phase 3: lexical's Storybook test of `Widgets` → green, including the
  useModal in-content close returning focus to `hookOpener`; a grep of
  `src/` → no `outsideClose` and no `TODO(greenrack)` left in Modal; a
  story mounting a Modal with `open={false}` → `onClose` called once.
  `browser-check` on the local Storybook: open a modal from the Widgets
  story, close it from its content (the outside path) and with Escape →
  focus returns to the opener both times, no console error.
  - Observed: greenrack-lexical#43 merged at 82a7afd, and tag `v1.3.0` is
    published to the Forgejo registry (latest 1.3.0, peer `^7.1.0`). The
    tarball's dist calls `onExitComplete`. `vitest --project=storybook
src/UiComponents.stories.tsx` → 3 of 3 pass. Without
    `onExitComplete={report}`, Widgets fails. Against the earlier Modal, the
    two one-way stories fail. A grep of `src/` for `outsideClose` and
    `TODO(greenrack)` finds nothing. In the browser (chrome-devtools,
    isolated profile): the hook modal's "Done" leaves focus on "Open hook
    modal", and Escape leaves it on "Open modal". The never-shown and
    outside-close stories read "closes:1" with no dialog, also after "Set
    open again". No console errors. The preview's before/after pair (Widgets)
    is byte-identical.
- Phase 4: `relais programme check` on the greenrack-rename programme
  exits 0.
  - Observed: on the decisions#281 branch, exit 0 on greenrack-rename and on
    follow-ups. t14 is closed with its Resolution and both repos. t15 records
    its second step. f70 (Drawer) and f71 (the apps take lexical 1.3.0) are
    filed.

## Outcome

Shipped: greenrack 7.1.0 with `Dialog.Root onExitComplete` on web and
native, forwarded by ConfirmDialog, and greenrack-lexical 1.3.0, whose Modal
uses it and whose close is one-way. Not shipped: Drawer's notice (f70), and
the apps' upgrade with its in-app check and a 1.3.1 rollback if it fails
(f71). The surprises:

- relais's accepted Phase 1 candidate failed the repository's own pre-commit
  lint (a raw `<button>`), which its profile did not run.
- The first lexical rewrite was plausible but reopened a kept Modal. Only the
  review caught it.
- npm propagation made a commit gate fail for about a minute after the
  publish.

<!-- panel: repos=duro-design-system,duro-lexical-multi adds=contract reviewers=backend,lang:typescript,react,ui-design,tui,unix,architect,po body-sha=61af6f685956 -->
