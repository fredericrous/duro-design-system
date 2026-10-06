---
status: active
branch: feat/icon-choices
canonical: fredericrous/website-builder docs/plans/2026-10-06-icon-choice-list.md
phases: [1a, 1b, 1c, 1d]
---

# Icon choice list: the design-system slice

Pointer. The plan, its reviews and its binding implementation notes live in
website-builder (`docs/plans/2026-10-06-icon-choice-list.md`, branch
`feat/icon-picker`). This repository carries Phase 1:

- **1a**: Popover counts a nested Select/Combobox layer as inside (context
  registration); Select, Menu and Combobox `preventDefault` the Escape they
  consume.
- **1b**: ToggleGroup `wrap`, `maxRows`, roving focus; 44px coarse-pointer
  Toggles.
- **1c**: Drawer swipe-to-dismiss yields to an inner ScrollArea.
- **1d**: release 4.5.0.

Found while fixing website-builder's quick-edit card (a Select inside a
Popover lost its value); recorded here per
`design-system.gap-found-is-gap-reported`.
