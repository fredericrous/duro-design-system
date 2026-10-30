# Reviews: Duro 5.37.2, token subpaths typed from dist

## Full reviews (reference)

- **backend round 1**, approve-with-changes (62k, 103 s). Findings:
  1. high: a fresh worktree's first `.ts` commit still fails `typecheck` on `cli` → the person chose "Plugin + tokens";
  2. medium: rebuild-in-place race between `lint` and `lint-js` → accepted risk, row 8;
  3. medium: CI cannot catch a lost `customConditions` → a `ui` typecheck before the build;
  4. low: record the install cost;
  5. low: add `layers` to row 7.
- **backend round 2**, approve-with-changes (26k, 27 s): 1, 2, 4 and 5 resolved; 3 was broken by the fix for 1.
  - high: install now builds tokens, so the CI step must `rm -rf packages/tokens/dist` first (applied);
  - low: record CI install time; Native `Build tokens` redundant but kept (applied);
  - low: install fails when either build fails, workaround `--ignore-scripts` (applied);
  - cosmetic: row order (not patched).
- **backend re-run on the final body**, approve (24k, 18 s). Carried into implementation: on the PR, prove the `ui` typecheck step fails when `customConditions` is removed, and compare the install step time before and after.
