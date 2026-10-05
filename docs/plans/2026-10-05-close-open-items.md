---
canonical: website-builder:docs/plans/2026-10-05-close-open-items.md
phases: [D]
status: active
---

Part of "Close the open items after design-system widgets" (canonical plan in
website-builder). This repository carries **phase D**:

- `ActionBar` gains `insetInlineEnd`, so it centres in the window minus a
  docked end panel (a DetailPanel) instead of sliding under it;
- the session hook and skill pin the CLI at the release's own major
  (`^4.4.0`), and their caches carry the pin, so a consumer on
  `@duro-app/ui` 4 stops getting 3.x docs, skill and doctor.

Released as the 4.4.0 minor.
