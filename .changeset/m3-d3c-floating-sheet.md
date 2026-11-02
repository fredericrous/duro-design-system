---
'@duro-app/ui': minor
'@duro-app/tokens': minor
---

Drawer.Portal (web and native): `backdrop="ramp"` draws a scrim that ramps from clear to the scrim colour over the new `sizes.scrimRampH` token (128px) at the bottom edge, still dismissing on a press; an `above` slot lays content just over the panel's top edge, end-aligned, inside the dialog and moving with the panel; and `placement="floating"` now works on a modal drawer too. Defaults are unchanged.
