# Duro 5.5 trigger size, raised floating — full reviews

## Full reviews (reference)

**backend, round 1: approve-with-changes (58k, 91 s).**

- High: a page-level anchor in a modal can't win by z-index. Fixed: portal into the mount while in a modal.
- Medium: a nested Popover inside a raised one. Fixed: inherited.
- Medium: the Dialog-over-Popover row passed vacuously. Fixed: controlled `open`.
- Medium: the small ghost Menu kept 32px. Fixed: `iconButtonSm`.
- Low: coarse pointer. Fixed.
- Low: key order and registry. Fixed.

**backend, round 2: approve-with-changes (49k, 45 s).** All 6 resolved. Two new mediums (where `raised` flows; positioning in the mount) are recorded as binding notes.
