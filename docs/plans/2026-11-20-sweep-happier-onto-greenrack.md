---
canonical: happier:docs/plans/2026-11-20-sweep-happier-onto-greenrack.md
phases: [4]
status: active
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
