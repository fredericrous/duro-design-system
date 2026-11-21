---
'@greenharness/greenrack-ui': patch
---

`Combobox` on the web handles options that arrive after the list opens (loaded on demand from `onOpenChange`): `Combobox.Empty` shows while the list holds no option, not only when typed text matches nothing, and an option label that arrives later replaces the text the field showed for its value (for example the stand-in label from `initialLabels`), unless the text was edited since. Before, the late label left the stale text in the field and it filtered out every option.
