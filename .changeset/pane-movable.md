---
'@duro-app/ui': minor
---

`Pane.Root movable` lets a side pane be moved. A drag on its header moves it, clamped to the window, and a double-click on the header puts it back; `Pane.Move` is a header control that moves it with the arrow keys (Home puts it back), the non-drag way to move it. The place resets when the pane closes. A bottom pane ignores `movable`, and React Native accepts it and does nothing: the move is web only.

Also, Escape from an open disclosure (an Advanced button with `aria-expanded`) closes a non-modal pane again. Only a popup trigger (`aria-haspopup`) holds Escape for its own popup.
