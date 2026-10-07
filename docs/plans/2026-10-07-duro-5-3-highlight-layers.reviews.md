# Duro 5.3 highlight and layers — full reviews

## Full reviews (reference)

**backend, round 1: approve-with-changes (53k, 59 s).**

- High: toasts don't ride the portal mount, so they render under Dialogs. Fixed: `toast` layer.
- High: the DragDrop premise was wrong (the ghost isn't portalled). Fixed: every fix test must be red on v5.2.0.
- Medium: the inventory was off (15 values in 12 files). Fixed.
- Medium: native behaviour of string layers. Fixed.
- Medium: the screenshot tool was unnamed. Fixed.
- Low: unfixable local z-index warnings. Fixed: counted, and the person decides before the major.

**backend, round 2: approve-with-changes (51k, 53 s).** 5 of 6 resolved.

- High: a native Dialog test is impossible, since there is no native Dialog. Fixed: a numeric `LAYERS` unit test.
- Low: "two fixes" wording. Fixed.
- Low: Popover-in-Drawer. Fixed.
- Low: the no-ThemeProvider case. Fixed.

**backend, final bind: approve (30k, 18 s).** All resolved. Two lows are left for implementation: Popover-in-Drawer as a screenshot exception, and the "§5.3 swaps" wording.

**backend, sizes delta: approve-with-changes (60k, 61 s).**

- High: RAIL is used as a JS number. Fixed: `SIZES_PX` and `calc()`.
- Medium: cross-axis lint rows. Fixed.
- Low: a gate count for new size suggestions. Fixed.

**backend, sizes delta final: approve (32k, 19 s).** All resolved. Lows left for implementation, all wording or bookkeeping: four gaps, not three; a sizes commit; whether `SIZES_PX` is new (it isn't: keys.ts has had it since 5.0).

**backend, groups delta: approve-with-changes (71k, 90 s).**

- Blocking: `:first-child` can't work for nested triggers. Fixed: DOM-order registration.
- High: contexts leak into portals. Fixed.
- High: Select key handling. Fixed.
- Medium: roving registration. Fixed.
- Low: pressed border. Fixed.
- Low: Popover.Trigger label/ref. Fixed.

**backend, groups round 2: approve-with-changes (67k, 83 s).**

- Medium: pressed and focus shared a layer. Fixed: inset border.
- Medium: portal key bubbling. Fixed: native listener.
- Low: SSR. Fixed.
- Low: vertical toolbar with a Select. Fixed.

**backend, groups final: approve-with-changes (35k, 28 s).** All resolved.

- Medium: the `defaultPrevented` guard is ineffective with a native listener.
- Low: SSR row, commit order, release-notes item.

These are recorded as binding implementation notes in the review panel, not as a third round.
