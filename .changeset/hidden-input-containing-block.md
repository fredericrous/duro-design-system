---
'@greenharness/greenrack-ui': patch
---

`Switch`, `Checkbox` and `RadioGroup.Item` are the containing block of their visually hidden native input (`position: relative` on the label). Before, the input was placed against the nearest positioned ancestor of the page: inside an `AppShell` with `scroll="main"` it escaped the `main` scroller and lengthened the document, so a page of switches scrolled twice.
