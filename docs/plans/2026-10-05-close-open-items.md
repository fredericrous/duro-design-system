---
canonical: website-builder:docs/plans/2026-10-05-close-open-items.md
phases: [D]
status: done
---

Part of "Close the open items after design-system widgets" (canonical plan in
website-builder). This repository carries **phase D**:

- `ActionBar` gains `insetInlineEnd`, so it centres in the window minus a
  docked end panel (a DetailPanel) instead of sliding under it;
- the session hook and skill pin the CLI at the release's own major
  (`^4.4.0`), and their caches carry the pin, so a consumer on
  `@duro-app/ui` 4 stops getting 3.x docs, skill and doctor.

Released as the 4.4.0 minor.

## Verification (phase D)

| Check                                     | Expected                                                                                                                                                                                                                                                                                                                                                                 | Observed                                                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run typecheck`                      | 0 errors                                                                                                                                                                                                                                                                                                                                                                 | 0                                                                                                                                                   |
| `vitest --project=unit`                   | all pass                                                                                                                                                                                                                                                                                                                                                                 | 279 passed                                                                                                                                          |
| `hook-pin.test.ts` (sh and dash)          | floors share a major; check-pin-major passes 4.4.0 / v4.9.1, fails 5.0.0 and a `^3` hook floor, exits 1/0; 3.x cache → current catalog, pin never printed; failed refresh → cache unchanged, no .tmp, printed whole, stderr names the install command; no pin-only file on a failed or empty fetch; a one-line catalog without newline kept; current cache not refetched | 16 passed                                                                                                                                           |
| `vitest --project=storybook`              | all pass                                                                                                                                                                                                                                                                                                                                                                 | 309 passed (53 files), ActionBar 10/10                                                                                                              |
| ActionBar at 1072 px, headless Chromium   | no inset: centred on the window; panel 360: centre 356, right ≤ 688; 9-button bar: right ≤ 688, row scrolls                                                                                                                                                                                                                                                              | 536 centre; 238–474 (centre 356); wide bar 24–688, scrolls; bar 46 px tall either way; focus rings of the first and last button whole while tabbing |
| Wide-bar story can fail                   | fails without the scroll fix                                                                                                                                                                                                                                                                                                                                             | fails (× Docked Panel Wide Bar) with it removed                                                                                                     |
| `build-registry.mjs --check --check-docs` | exit 0                                                                                                                                                                                                                                                                                                                                                                   | exit 0                                                                                                                                              |
| lint (touched files)                      | 0 warnings                                                                                                                                                                                                                                                                                                                                                               | 0 (two pre-existing unused vars in ActionBar.stories.tsx removed)                                                                                   |

Consumer checks (`hook install --check`, `skill install --check`, a 4.4 catalog in a real session) run in website-builder's phase W.

## Implementation review (phase D)

- Round 1 (59k tokens, 44 s): approve-with-changes. Fixed: the wide-bar story could not fail (real buttons now; the row scrolls instead of spilling), and an empty `npx` output left a pin-only cache. The release.yml `'v*'` quotes came from the formatter the pre-commit gate enforces.
- Delta (30k, 19 s): approve-with-changes. Fixed: a no-newline catalog is kept; the scroll applies only beside a panel, with room for focus rings.
- Final delta (49k, 25 s): **approve**.
