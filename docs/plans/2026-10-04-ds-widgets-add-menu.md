---
canonical: website-builder:docs/plans/2026-10-04-ds-widgets-add-menu.md
phases: [U]
status: done
---

Part of [Design-system widgets in the Add menu](https://git.daddyshome.fr/fredericrous/website-builder/src/branch/feat/ds-widgets-palette/docs/plans/2026-10-04-ds-widgets-add-menu.md).
This repository carries **phase U**: a `Popover` component (a non-modal
anchored overlay, with a virtual anchor for zoomed canvases). The website
builder's in-place widget editing needs it, and the design-system rules
send a gap upstream instead of working around it in a consumer.

## Verification (phase U)

| Check                                                   | Expected                                                                                                                                       | Observed                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm run typecheck`                                    | exit 0                                                                                                                                         | exit 0                                                           |
| `vitest --project=unit`                                 | all pass                                                                                                                                       | 264 passed (incl. `popover.test.ts`, `popover-position.test.ts`) |
| `vitest --project=storybook` Popover, headless Chromium | focus in/out, Close, outside press with `ignore`, nested Select owns the first Esc, a disclosure does not, virtual anchor follows a moved spot | 6/6 passed                                                       |
| `build-registry.mjs --check --check-docs`               | exit 0                                                                                                                                         | exit 0                                                           |
| `duro Popover` / `duro list components`                 | USE / DON'T USE naming Menu, Tooltip, Dialog, DetailPanel, Drawer; row ≤ 80 columns                                                            | as expected (CLI test)                                           |
| lint                                                    | 0 errors, no warnings in changed files                                                                                                         | as expected                                                      |

## Implementation review

- **approve-with-changes**, then a delta pass with both code findings resolved: the Esc guard narrowed to popup owners (with `holds-until:`), and the registry test asserting `parts.Root.props`.
- deliberate: Trigger mode also portals into ThemeProvider's layer (`position: fixed` from the trigger rect), not CSS-anchored like `Menu.Popup` as the plan text says. The relais review required the portal layer for theme tokens and stacking above dialogs; the reviewed plan text stays.
- After the preview approval, the person asked for the AI metadata. The Popover example was fixed (Input `onChange` receives an event), a Field composition entry added, Dialog and Drawer now point back to Popover, and `.cursorrules` lists it. Delta review: **approve**.
- Tokens: about 71k (round 1), 27k (delta) and 29k (metadata delta); about 63 s, 17 s and 16 s.
- Candidate from relais `run-65d0ae85cd7e9-7166` (needs_review). Its three findings were fixed, plus `pointerEvents: 'auto'` that the portal layer needs.
