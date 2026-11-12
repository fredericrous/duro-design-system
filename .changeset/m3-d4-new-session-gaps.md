---
'@duro-app/ui': minor
---

Gaps Happier's shared /new meets (web and native): `Button` takes `shape="round"` (an icon-only circle sized by `iconButton` / `iconButtonSm`; give it an `aria-label`) and `variant="ghost"` (borderless until hover, for chip rows). `Popover.Trigger` takes `disabled` and `variant="ghost"`. `Dialog.Portal` takes `aria-label` (the name when no Dialog.Title is rendered) and `backdrop="blur"` (`effects.overlayBlur` on the backdrop element; web only). The innermost open Popover takes Escape before an enclosing Dialog or modal Drawer. `Textarea` takes `onSelectionChange(start, end)` on both platforms. `VisuallyHidden` is exported from the native entry. `Menu.Item` already took `disabled`.
