---
'@duro-app/ui': minor
---

VirtualList (web and native) gains `onAtEndChange`, called once each time the reader comes within 44px (touchTarget) of the end or leaves it, and `scrollToEndKey`, which scrolls to the end and resumes `anchor="end"` following each time it changes to a new non-null value, even when the reader had scrolled up.
