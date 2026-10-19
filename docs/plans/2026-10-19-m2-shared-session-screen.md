---
canonical: happier:docs/plans/2026-10-19-m2-shared-session-screen.md
phases: [D]
status: done
---

Part of [M2: the shared session screen](https://git.daddyshome.fr/fredericrous/happier/src/branch/feat/m2-session/docs/plans/2026-10-19-m2-shared-session-screen.md). This repository carries Phase D: VirtualList prepend + `onStartReached` and a native version, CodeBlock `language` + diff line roles and a native version, Prose and Toolbar native, Textarea `autoGrow`/`maxRows` and forwarding `Listbox.getAnchorProps()`, SplitPane `collapsed`; released as 5.21.0.

## Verification (Phase D, full suite on tree e3b74c4c; later commits e946c8dd and b71d7172 change only story buttons and the story viewport helper, checked below)

| Check                                                                          | Expected                                      | Actual                                                                                                                                            |
| ------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                                    | exit 0                                        | exit 0                                                                                                                                            |
| `pnpm typecheck` / `typecheck:native`                                          | exit 0                                        | exit 0 / exit 0                                                                                                                                   |
| `vitest run --project=unit`                                                    | all pass                                      | 603/603                                                                                                                                           |
| `vitest run --project=storybook` (dark theme, the default global)              | all pass                                      | 544/544                                                                                                                                           |
| `node scripts/check-native-graph.mjs`                                          | exit 0                                        | exit 0                                                                                                                                            |
| `pnpm native:export` (after `native:install`)                                  | iOS and Android bundle                        | exit 0, both bundled                                                                                                                              |
| RED first: VirtualList short-list stories, Textarea autoGrow unit              | fail before the fix                           | 2 + 1 failed before, pass after                                                                                                                   |
| Chrome, dev Storybook light and dark: CodeBlock Diff, SplitPane Collapsed      | tints and strip readable, as in Focus.dc.html | bands distinct in both (faint in light, text contrast unaffected); strip hairline and icon button match the artboard; strip button restores 240px |
| Runner, SplitPane + Drawer stories after the viewport-helper change (b71d7172) | all pass                                      | 33/33                                                                                                                                             |
| Dev Storybook, the five SplitPane stories that set the viewport                | render, no Vite error                         | all five render, no error display, no overlay                                                                                                     |
| A11y re-scan of Collapse Keeps Child State after its play                      | 0 violations                                  | 0                                                                                                                                                 |

`npm pack --dry-run` of the four `.native` files and `npm view @duro-app/ui@5.21.0` belong to the release (tag-release), not to this record.

## Decision log

- 2026-10-19: hunk `@@` lines use the info tokens, not success/error: a hunk header is neither an addition nor a removal.
- 2026-10-19: SplitPane gains `collapsedContent` (what the strip shows), beside `collapsed`; the strip draws a hairline in place of the handle, as the artboard does.
- 2026-10-19: a VirtualList too short to scroll calls `onStartReached` once per distinct first key and length, so a transcript with deferred history pages in.
- 2026-10-19: the prepend re-pin runs 6 frames, with a `holds-until:` naming the ResizeObserver replacement.

## Implementation review

approve (Delta on b71d7172, 55k, 8 s), after six cycles; the last two covered the person's preview changes: one primary button per view (SplitPane story controls are secondary), and viewport stories that render in dev Storybook (`setViewport` tolerates only the runner refusal).
Fixed: diff tints and autoGrow cap asserted against independent bases; `maxRows` only with `autoGrow`; short-list ask (no loop, re-asks after a prepend); stale autoGrow height cleared; hunk tint probed; regenerated docs; strip fidelity.
Deliberate: hunk info tokens (Decision log); the unit autoGrow test is a wiring test, the story holds the cap.
