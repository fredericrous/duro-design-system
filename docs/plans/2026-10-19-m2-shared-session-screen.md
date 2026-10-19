---
canonical: happier:docs/plans/2026-10-19-m2-shared-session-screen.md
phases: [D]
status: done
---

Part of [M2: the shared session screen](https://git.daddyshome.fr/fredericrous/happier/src/branch/feat/m2-session/docs/plans/2026-10-19-m2-shared-session-screen.md). This repository carries Phase D: VirtualList prepend + `onStartReached` and a native version, CodeBlock `language` + diff line roles and a native version, Prose and Toolbar native, Textarea `autoGrow`/`maxRows` and forwarding `Listbox.getAnchorProps()`, SplitPane `collapsed`; released as 5.21.0.

## Verification (Phase D, tree e3b74c4c; e946c8dd changes only story button variants: SplitPane stories 7/7)

| Check                                                                     | Expected                                      | Actual                                                                                                                                            |
| ------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                               | exit 0                                        | exit 0                                                                                                                                            |
| `pnpm typecheck` / `typecheck:native`                                     | exit 0                                        | exit 0 / exit 0                                                                                                                                   |
| `vitest run --project=unit`                                               | all pass                                      | 603/603                                                                                                                                           |
| `vitest run --project=storybook` (dark theme, the default global)         | all pass                                      | 544/544                                                                                                                                           |
| `node scripts/check-native-graph.mjs`                                     | exit 0                                        | exit 0                                                                                                                                            |
| `pnpm native:export` (after `native:install`)                             | iOS and Android bundle                        | exit 0, both bundled                                                                                                                              |
| RED first: VirtualList short-list stories, Textarea autoGrow unit         | fail before the fix                           | 2 + 1 failed before, pass after                                                                                                                   |
| Chrome, dev Storybook light and dark: CodeBlock Diff, SplitPane Collapsed | tints and strip readable, as in Focus.dc.html | bands distinct in both (faint in light, text contrast unaffected); strip hairline and icon button match the artboard; strip button restores 240px |

`npm pack --dry-run` of the four `.native` files and `npm view @duro-app/ui@5.21.0` belong to the release (tag-release), not to this record.

## Decision log

- 2026-10-19: hunk `@@` lines use the info tokens, not success/error: a hunk header is neither an addition nor a removal.
- 2026-10-19: SplitPane gains `collapsedContent` (what the strip shows), beside `collapsed`; the strip draws a hairline in place of the handle, as the artboard does.
- 2026-10-19: a VirtualList too short to scroll calls `onStartReached` once per distinct first key and length, so a transcript with deferred history pages in.
- 2026-10-19: the prepend re-pin runs 6 frames, with a `holds-until:` naming the ResizeObserver replacement.

## Implementation review

approve (round 1 on e946c8dd, 16k, 11 s), after five cycles; the last covered the person's preview change (one primary button per view: SplitPane story controls are secondary).
Fixed: diff tints and autoGrow cap asserted against independent bases; `maxRows` only with `autoGrow`; short-list ask (no loop, re-asks after a prepend); stale autoGrow height cleared; hunk tint probed; regenerated docs; strip fidelity.
Deliberate: hunk info tokens (Decision log); the unit autoGrow test is a wiring test, the story holds the cap.
