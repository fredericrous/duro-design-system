---
'@greenharness/greenrack-ui': minor
---

`Dialog.Root` takes `onExitComplete`, called once per finished exit after focus is back on what held it before the open: the place to unmount. An inside close calls `onOpenChange(false)` first; a controlled `open` turning false calls only `onExitComplete`. Not called for an exit a reopen cancels. `ConfirmDialog` forwards it.
