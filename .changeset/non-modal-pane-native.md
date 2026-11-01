---
'@duro-app/ui': minor
---

`Drawer` and `Pane` on React Native. `Drawer.Root modal={false}` draws the panel in the base portal host instead of a Modal: no backdrop, the app behind stays touchable, a Dialog opened later covers it without remounting it, and Android back closes it. A left or right drawer takes `snapPoints` of `compact` and `expanded` (the panelSm and panelLg widths, held to the window) with a vertical grabber on its inner edge, and `Drawer.Portal` takes `placement="floating"` (inset by a spacing token, rounded and bordered all round). `Pane` is exported from the native barrel. The native half of Duro#104, written without a React Native renderer to run it in: it typechecks and passes the native graph check, but the gesture and portal behaviour has not been seen on a device.
