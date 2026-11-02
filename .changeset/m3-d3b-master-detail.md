---
'@duro-app/ui': minor
'@duro-app/tokens': minor
---

MasterDetail (web and native): a rail of selectable rows whose focused row drives a detail pane, mirroring Happier's agent-input chip picker. Parts: Root (`focusedValue`, `defaultFocusedValue`, `onFocusedValueChange`, `railWidth`, `maxHeight`), Rail, Section (title and count), Item (`value`, `selected` check, `disabled`, a trailing `action` beside its button, `onActivate` on a press but not on the arrows) and Detail. The rail reuses Tabs' roving focus, run vertically, and the detail is a tabpanel labelled by the focused item. The rail and the detail scroll on their own inside `maxHeight` and stack below the `sm` breakpoint.

Popover.Popup takes `width` (a size-token key the popup takes, never wider than the screen less a margin), `maxWidth` and `maxHeight` (size-token keys) and `padding="flush"`, on web and native.

Tokens: sizes `railW` (190px), `pickerMaxW` (720px) and `pickerMaxH` (420px).
