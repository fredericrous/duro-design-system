# Non-modal panes: full reviews (reference)

Round 1, on body bba1498b17f5:

- **backend:** approve-with-changes (53k, 66 s). 8 findings, all applied. High: Escape on `document` closes sibling layers (fixed: keydown on the panel, scroll lock gated on `modal`); side detents need px and a separate type (fixed); the Pages switch has no rollback (fixed). Medium: a tag is not a published package (fixed: `npm view` gate); no bundle budget (fixed: CI prints gzipped size and fails above it); layer ambiguity (fixed); unobservable checks (fixed); a second meta relationship (fixed).
- **typescript:** approve-with-changes (63k, 50 s). 6 findings, all applied. High: native non-modal cannot use RN `Modal` (fixed: `PortalHost`); widening `SnapPoint` breaks consumers (fixed: separate `SideSnapPoint`, union on `anchor`). Medium: width precedence (fixed), the worklet side maths (fixed), unobservable tests (fixed), esbuild pins (fixed).

Round 2 (deltas, then a blocker check on the final body):

- **backend** on 008d15cf1855: approve-with-changes (54k, 96 s). Blocking: `Portal` drops Drawer contexts natively (fixed: re-provided). High: entries draw only in the top host (fixed: `base` host). Applied both.
- **typescript** on 008d15cf1855: approve-with-changes (48k, 43 s). Blocking: the same context loss (fixed); high: the base host (fixed).
- **backend** on 45a712f4cd87: approve-with-changes (47k, 29 s). High: the base host needs a `setEntry` target, not just a comment (fixed, with a registry unit test); medium: the native check in Verification (fixed).
- **backend** blocker check on 74a5b0535904: approve, no findings to change the body.
- **typescript** blocker check on 74a5b0535904: approve, one low carried: type `host` as an internal `'base' | 'top'` (default `'top'`, not exported), add `baseHost` to the snapshot, and have the top host skip base entries.

Carried into implementation (4): the top host must skip base entries (no double draw when the root is the only host); the `host` type as above; the `Drawer` cast when `anchor` narrows `snapPoints` (`useDrawerRoot.ts`); the esbuild version is in the lockfile, not the plan text.
