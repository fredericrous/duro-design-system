---
'@greenharness/greenrack-ui': minor
---

Field: an Input or Textarea inside Field.Root now reports the browser's native validation message (required, type, pattern) to the Field on the DOM `invalid` event, and Field.Error shows it, clearing or updating it on the next change. Explicit Field.Error children and react-hook-form errors keep precedence.
