---
'@duro-app/ui': minor
'@duro-app/tokens': minor
---

Three additions for drill-down pickers. `SteppedList` (Root, Step, Item) is a stack of steps, each with a title, its own rows and an optional input row: an Item pushes the step named by `to`, the back control (text from `backLabel`) pops, focus moves to the new step's first row and back to the row that opened it, and the rows are capped at `maxHeight` (a size-token key). `List.Section` groups rows under a title (and an optional trailing `accessory`) inside one Root, as a labelled group; `List.Item` takes a `ref`. `Badge` takes `dot`, a small dot before the text in the variant's colour, sized by the new `sizes.badgeDot` token.
