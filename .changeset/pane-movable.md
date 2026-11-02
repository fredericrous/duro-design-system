---
'@duro-app/ui': minor
---

`Pane.Root movable` lets a side pane be moved. A drag on its header moves it and a double-click on the header puts it back; it never leaves the window entirely (a fifth of its width stays in view on either side, its top edge stays below the window top, a tenth of its height stays in view at the bottom); `Pane.Move` is a header control: its menu sends the pane to either edge of the window or back to its place (a single-pointer way to move it), and with focus on it the arrow keys nudge it, Shift for a larger step and Home to put it back. Its names are translatable (`labels`, the new `PaneMoveLabels` type). A drag on the header never starts the swipe that dismisses a pane. The place resets when the pane closes. A bottom pane ignores `movable`, and React Native accepts it and does nothing: the move is web only.

Also, Escape from an open disclosure (an Advanced button with `aria-expanded`) closes a non-modal pane again. Only a popup trigger (`aria-haspopup`) holds Escape for its own popup.
