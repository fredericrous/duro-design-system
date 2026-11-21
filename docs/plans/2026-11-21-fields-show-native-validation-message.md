---
status: active
plan-id: p-01M7XDDV3TXZGPD4HST8NQNC1Q
branch: feat/field-native-validation
repos: [greenrack, social-planner, decisions]
adrs: []
---

# greenrack fields show their own native validation message

## Review panel

👉 **Decide:** the body grew ×1.6 from review (984 → 1570 words), all reviewer edge cases; approve if keeping them beats a trimmed plan.
📍 greenrack, social-planner, decisions · 4 phases · 2 releases · next: Phase 1. Panel: backend, lang:typescript, react, ui-design, tui, unix, architect, po (opus-5-5), codex.
**Changed by review:** native message clears on programmatic value changes and after commit, never in render; dialog Field turns invalid on a server error; refs keep React 19 cleanup.
**Verdicts:** round 2: 2 approve (backend final, tui), 6 approve-with-changes; codex approve-with-changes; 4 carried into implementation; words 984 → 1570 (×1.60); remove 0 (1 rejected), merge 0.
📄 Full reviews: [2026-11-21-fields-show-native-validation-message.reviews.md](2026-11-21-fields-show-native-validation-message.reviews.md).

## Picture

```
 today                             after this plan
 -----                             ---------------
 submit: browser checks <input>    submit: browser checks <input>
   | invalid                         | invalid (event)
   v                                 v
 browser bubble only               bubble kept (it moves focus)
 (gone on next click; nothing      + Input/Textarea hand the
  in the page, no aria-invalid)      validationMessage to Field.Root
                                     v
                                   Field invalid: red border,
                                   aria-invalid, describedby → error,
                                   message under the field
                                   (Field.Error, else Field.Root's own)
                                     | typed until valid
                                     v
                                   message and error state clear
```

Today a failed native check leaves only the browser's bubble; after this
plan the Field shows the browser's own message as its error, and clears
it once the value is valid.

## Context

Follow-up f31 (`decisions:docs/programmes/follow-ups/f31-greenrack-native-validation-message.md`).
social-planner's Add link dialog has an `Input type="url" required`; a bad
URL shows only the browser's bubble, which vanishes on the next click and
leaves nothing in the page. greenrack 7.2.0's `Input` and `Field` ignore the
`invalid` event. That dialog's Input also has no label (placeholder only).

## Goal

Inside a `Field.Root`, an `Input` or `Textarea` that fails the browser's
constraint validation puts its `validationMessage` in the Field as its error:
the Field turns invalid (error border, `aria-invalid`, `aria-describedby`
names the error id), and the message shows in `Field.Error`, or, when the
Field has no `Field.Error`, in an error line `Field.Root` renders itself.
social-planner's dialog wraps its Input in a labelled Field and shows it.

## Non-goals

- A standalone `Input` (no Field) keeps today's behaviour, the bubble only.
  Rendering a sibling message from Input would join the parent's flex row
  (social-planner `feeds.tsx` puts two Inputs and a Button in an `Inline`).
  The meta says: wrap in Field.Root to get the message.
- Suppressing the browser bubble (`preventDefault` on `invalid`). Cancelling
  every invalid event also cancels the browser's focus move to the first
  invalid control, which greenrack would then have to rebuild. Kept.
- Native (React Native): no constraint validation; the hook is a no-op there.
- The dangling `descriptionId` in describedby (an existing inbox line from
  another session): not touched here.
- Select, Combobox, Checkbox, RadioGroup: not wired in this plan.

## Code review

- greenrack: react, lang:typescript, ui-design (backend left out: no server code; unix, tui left out: no command, flag or output changes, the CLI only gains regenerated prop text)
- social-planner: react, lang:typescript, ui-design (backend left out: the dialog's action is untouched)
- decisions: none — markdown only (Phase 4 edits two ticket files; every profile left out)

## Behaviour

- `FieldContext` gains `nativeMessage: string` and `setNativeMessage: Dispatch<SetStateAction<string>>`
  (the `useState` setter; listeners use the updater form `prev => prev === '' ? '' : …`, so they
  register once per element with no stale closure; the `.native.ts` stub types its arguments
  `unknown`, as `useFileDrop.native.ts` does),
  and `registerError(): () => void` so a mounted `Field.Error` is known: a
  counter held in `Root` state, so the root re-renders when one mounts or
  unmounts.
  Both `StaticRoot` and `ControlledRoot` hold `nativeMessage` in state;
  `invalid = invalidProp || rhfError || nativeMessage !== ''`.
- New hook `useNativeValidation(ref, setMessage)` in
  `packages/ui/src/components/Field/useNativeValidation.ts` (+ a no-op
  `.native.ts`, the pattern of `Textarea/useFileDrop`). On web it adds
  listeners on the element with `addEventListener` (not a JSX `onInvalid`,
  which react-strict-dom's prop filter may drop):
  - `invalid` → `setMessage(el.validationMessage)`;
  - `input` and `change` → when a message is showing, set it to
    `el.validity.valid ? '' : el.validationMessage` (it follows the typing
    once shown, never appears while typing before a submit);
  - the owning form's `reset` → `''`;
  - a value change no `input` event preceded (a controlled `setState`,
    RHF `reset()`, a dialog clearing its field) → `''`: the `invalid`,
    `input` and `change` handlers record `el.value`, and a second effect
    with no dependency array compares it with `el.value` after each commit
    (never during render), clearing through the updater.

  The hook runs only when a Field context is present.

- `Input` and `Textarea` keep an inner ref merged with the caller/RHF ref
  (Textarea's existing `setRef`; Input gets the same, a `useCallback` with stable deps so RHF's `field.ref` is not detached each render) and call the hook, which subscribes once in `useEffect` on the ref object; `setNativeMessage` is the `useState` setter. Both mergers keep React 19
  callback-ref cleanup: a callback's returned cleanup runs on detach (else
  it gets `null`); Textarea's existing merger is fixed too, and a story
  counts setup and cleanup across a value update and an unmount.
- `Field.Error` content: its children when they render something, else the
  RHF `errorMessage`, else `nativeMessage`; it keeps today's render rule (shown while the Field is invalid or has
  content), so the `errorId` in `aria-describedby` always names an element. It registers in a `useLayoutEffect` with cleanup, called before its
  early `return null`, so a `Field.Error` that renders nothing still counts
  and no commit shows both it and the auto line.
- `Field.Root`, when `nativeMessage` is set and no `Field.Error` is
  registered, renders the same error span (`id=errorId`, `role="alert"`,
  `styles.error`) after its children, inside the content column for
  `labelPosition="side"`. One error line at most per Field.

## Phases

- [ ] Phase 1 — greenrack: context, hook, Input, Textarea, Field.Error and
      the auto line; stories with play tests; meta text (Field.meta.ts and Input.meta.ts: the exact sentences, appended after each description's first sentence so the `greenrack list` summary and the CLAUDE.md quick-reference row are unchanged; any new whenToUse/whenNotToUse bullet 76 characters or fewer, since bullets are not wrapped, format.ts:67-70); changeset;
      registry regenerated:
      `packages/ui/src/components/Field/{FieldContext.ts,Field.tsx,useNativeValidation.ts,useNativeValidation.native.ts,Field.meta.ts,Field.stories.tsx}`,
      `packages/ui/src/components/Input/{Input.tsx,Input.meta.ts}`,
      `packages/ui/src/components/Textarea/Textarea.tsx`,
      `.changeset/field-native-validation.md`, `packages/cli/registry.json`
      and CLAUDE.md generated regions (`packages/cli/scripts/build-registry.mjs`;
      regenerate with `pnpm greenrack:registry && pnpm greenrack:docs`, since a bare
      run writes only registry.json)
- [ ] Phase 2 — release greenrack 7.3.0 (a minor: new behaviour, no API
      removed) via the `tag-release` skill, which consumes the changeset;
      check the npm tarball (the release consumes
      `.changeset/field-native-validation.md`)
- [ ] Phase 3 — social-planner: `@greenharness/greenrack-ui` to `^7.3.0`;
      AddLinkDialog's Input in `Field.Root`: `Field.Label` "Link", the Input,
      the helper text as `Field.Description`, then `Field.Error` whose
      children are the server `result.error`, with
      `Field.Root invalid={Boolean(result?.error)}` so it sets aria-invalid and
      describedby too (one error line per Field; the
      success Text stays outside); PR, merge, release (tag) and observe the deployed dialog:
      `package.json`, `pnpm-lock.yaml`, `app/components/AddLinkDialog.tsx`
- [ ] Phase 4 — close f31 in decisions: ticket `status = "done"`, its
      "Answer looks like" amended to the Field-scoped answer, map
      entry: `docs/programmes/follow-ups/f31-greenrack-native-validation-message.md`,
      `docs/programmes/follow-ups/map.md`

## Verification

- Phase 1: `vitest --project=storybook` on Field and Input stories.
  New stories: `NativeValidationMessage` (Field +
  `Input type="url" required` + `Field.Error` in an `html.form` with a submit button: type
  "nope", click submit → `role="alert"` with the input's own
  `validationMessage`, input `aria-invalid="true"`, its `aria-describedby`
  contains the alert's id; type a valid URL → alert gone, no aria-invalid),
  `NativeValidationWithoutFieldError` (same Field without `Field.Error` →
  exactly one alert), `NativeValidationTextarea` (required Textarea, empty
  submit → alert), `NativeValidationInForm` (`Field.Root name` in `Form`,
  required: the RHF message wins, one alert), `NativeValidationErrorMounts`
  (a conditional `Field.Error` mounts and unmounts: one alert throughout).
  `NativeValidationDefaultValue` (`defaultValue="nope"`, submit without
  typing: the alert stays). In `NativeValidationMessage`, typing before any submit shows no alert, a
  `type="reset"` button clears it, and a parent `setState('')` clears it. Each fails with the hook call removed. Every existing
  Field, Input, Textarea and Form story stays green. `pnpm typecheck`,
  `pnpm lint`, `build-registry.mjs --check` and `--check-docs` exit 0. `NO_COLOR=1 greenrack Field` and `greenrack Input` (local CLI build) show the new text, add no bullet line over 80 columns and no other line over 88 (the CLI's
  wrap width), and the Field line of `greenrack list` is unchanged.
  browser-check on local Storybook (1280 and 390): the message renders
  under the field in error colour, light and dark.
- Phase 2: `npm view @greenharness/greenrack-ui@7.3.0 version` → 7.3.0; the
  tarball's dist contains `addEventListener("invalid"` (not just the string `invalid`, which `aria-invalid` already matches).
- Phase 3: `npm view @greenharness/greenrack-ui@7.3.0 version` first. A
  new AddLinkDialog test finds `getByRole("textbox", {name: "Link"})` and
  one `getByRole("alert")` after an invalid submit. Tests and typecheck
  green. browser-check on the local app at 1280 and 390, light and dark:
  open Add link, type "nope", press Add link → the field's own message
  under it, one alert; press Done, reopen → no alert, no aria-invalid; then on the deployed app after
  the release, the same.
- Phase 3 sweep: every social-planner `Field.Root` holding a required,
  url, email or number Input shows one alert at most on an invalid submit;
  any Field with two alerts or a layout break pins back to 7.2.x until a
  7.3.1. Other consumers get an inbox line to run the same sweep at bump.
- Phase 4: `relais programme check docs/programmes/follow-ups` exits 0.

## Decision log

- 2026-11-20 — Field-scoped, not standalone Input: a sibling message from
  Input would break the rows it sits in (Non-goals).
- 2026-11-20 — keep the browser bubble: cancelling `invalid` drops the
  browser's focus move.
- 2026-11-20 — Textarea joins Input: same constraint validation, one hook.
- 2026-11-20 — `Field.Error` keeps today's render rule (architect), not
  the round-1 "null when empty": it would leave `errorId` dangling.
- 2026-11-20 — the registration counter stays: consumers mount
  `{error && <Field.Error>}` conditionally, and without it that Field
  would show two alerts.
- 2026-11-20 — no mockup directions: the dialog only gains a label and
  its error line, the Phase 1 story is the reference.
- 2026-11-20 — the bubble and the `role="alert"` line announce the same message twice; accepted, since suppressing the bubble drops the focus move.
- 2026-11-20 — the board showed `feat/breakpoints-doctor-overlay` touching
  Field and Input; it dates from 2026-09-28 (pre-rename, Form subpath
  since shipped), not live work.

<!-- panel: repos=greenrack,social-planner,decisions adds=contract reviewers=backend,lang:typescript,react,ui-design,tui,unix,architect,po,codex body-sha=0abbe950e204 -->
