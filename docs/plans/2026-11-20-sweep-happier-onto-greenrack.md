---
canonical: happier:docs/plans/2026-11-20-sweep-happier-onto-greenrack.md
phases: [4]
status: done
branch: feat/combobox-open
plan-id: p-01M7W16MSFNDS1PG5BWB1N93RS
---

# Sweep happier onto greenrack, then f01 (Combobox open event)

This repository's slice is Phase 4 of the canonical plan, greenrack 7.2.0:
`Combobox.Root onOpenChange`, a web list that opens with every option while
the field shows its chosen label, and an accessible name for `Combobox.Input`
(`aria-label`, or `Field.Label` through the field's `controlId`).

## Code review

- greenrack: backend, lang:typescript, react, ui-design, architect (a published API change; unix and tui left out: no CLI change)

## Verification (this slice)

| Check                                                           | Expected                                                                                   | Observed                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run typecheck`, `lint`, `pnpm test`, `pnpm test:unit`     | exit 0                                                                                     | typecheck 0; lint 0 errors (13 warnings, none in Combobox); Storybook 658/658; unit 890/890 (candidate afb7510d); after the review fixes, the Combobox stories 15/15 and the native test 2/2                                                                                                            |
| new tests RED on the old source                                 | the new stories fail                                                                       | 6 stories fail on the old Combobox source (opens with every option, pointer click then type, once per transition, controlled input, both names); the native test fails to load (it needs the patch's native import change)                                                                              |
| `native:install && native:export`                               | exit 0                                                                                     | exit 0                                                                                                                                                                                                                                                                                                  |
| Storybook in Chrome (`browser-check`), 1120×840, light and dark | the chosen option highlighted and in view, every option on open, the label names the input | 120-option story: "Language 110" highlighted, inside the 200px listbox, Escape keeps it; NamedByFieldLabel: name "Pick a fruit"; WithDefaultValue: 8 options on open, "a" replaces the label and leaves 4; listbox and highlight colours resolve per theme; 0 console errors (`attestations/1b1021c2/`) |

## Implementation review

- implementation-review: approve-with-changes, then approve at the Delta; StrictMode no-warning assertion, invalid-Field story and the tautology fixed; real-time wait deliberate (a browser run, fake timers freeze userEvent); the PR names the native import change (99k/40 s, 73k/76 s).
- backend: approve-with-changes, then approve; unmount and sort-ceiling documented; real-time wait deliberate (98k/76 s, 30k/26 s).
- lang:typescript: approve-with-changes twice; `any` handlers and test braces fixed; deliberate: valueRef staleness (a flag argument or a render-time ref write is the only fix, unreachable today, commented), inputValue ref (no re-subscription saved), shared props type, and the story helper's bare block, structural types and hand-made console spy (test-only, behaviour-neutral) (91k/73 s, 30k/33 s).
- react: approve-with-changes, then approve; dependency comment and `any` handlers fixed (83k/52 s, 26k/24 s). architect: approve (96k/59 s).
- ui-design (interface-review): approve-with-changes twice; native Field naming documented; deliberate: the describedby string mirrors Select.Trigger, its helper and the pre-existing keyboard and disabled gaps filed to the inbox; the invalid story's styling not verified (90k/88 s, 26k/20 s).
