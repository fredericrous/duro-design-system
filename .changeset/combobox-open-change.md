---
'@greenharness/greenrack-ui': minor
---

`Combobox.Root` takes `onOpenChange`, called once each time the list (web) or sheet (native) opens or closes; there is no controlled `open`, as on `Select`. `Combobox.Input` takes `aria-label` and, inside a `Field.Root`, is named by `Field.Label` (and carries the field's description and invalid state). Behaviour change: a web field showing its chosen label now opens with every option instead of only the matching one, and selects its text on focus; consumer-side filters driven by `onInputChange` keep filtering, as that callback does not fire on open or focus.
