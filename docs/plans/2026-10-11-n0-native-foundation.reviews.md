# N0 — Duro's native foundation — full reviews

## Full reviews (reference)

**game-ux, round 1: approve-with-changes (37k, 22 s).**

- High: drag motion must use the native driver. Fixed: Decision 4.
- High: the sheet needs a grabber, velocity snap and a haptic. Fixed: grabber and velocity in Decision 5; haptic rejected because it would add a dependency.
- Medium: Combobox keyboard covers a 50 % sheet. Fixed: it opens at `'large'` and avoids the keyboard.
- Medium: lint-enforced `aria-label` on icon-only Tooltip triggers. Rejected: not statically decidable; the rule stays documented.
- Medium: Toast swipe and stacking above the keyboard and sheet. Fixed: Slice B item 4.
- Low: reorder the slices. Rejected: the order follows Happier's gates.

**po, round 1: approve-with-changes (62k, 43 s).**

- High: no preview before a tag. Fixed: a guided Storybook preview precedes each tag.
- High: no post-release measure. Fixed: § After each release.
- Medium: the token inventory is unsized. Fixed: phase C0, with the person supplying the gap values.
- Low: the Tooltip amendment is not recorded. Fixed: Decision log.
- Low: records have no home. Fixed: they go in the slice's PR body.

**ux-research, round 1: approve-with-changes (43k, 32 s).**

- High: a non-drag dismiss path (WCAG 2.5.7). Fixed: close button, and a grabber that cycles detents.
- High: Tooltip content must be non-essential. Fixed: Decision 5. The hallway test was not added, because the person decided.
- Medium: Toast close button and screen-reader pause (WCAG 2.2.1). Fixed: Slice B item 4.
- Medium: native focus restore. Fixed: Decision 2 and Dialog.
- Medium: an A/B test of sheet vs anchored for short lists. Rejected: the person chose sheets.
- Low: a modal Popover on native. Rejected: it follows the Modal mechanism.
- Low: Toast offset vs sheet. Fixed with game-ux 5.

**unix, round 1: approve-with-changes (62k, 40 s).**

- High: `grep -c` on a one-line source map. Fixed: a node count of distinct package roots.
- High: the path filter misses manifests and lock. Fixed.
- Medium: the lint passes on an empty list. Fixed: exit 2 on a tool failure, exit 1 on violations.
- Medium: script wiring. Fixed with backend 4.
- Medium: CI timeout and `CI=1`. Fixed with backend 5.

**tui, round 1: approve-with-changes (60k, 44 s).**

- Medium: root `typecheck:native` wiring. Fixed with backend 4.
- Medium: lint output format. Fixed: one `path:line:col form — fix` line per violation.
- Medium: the Vite error has no fix. Fixed: the error names the fix.
- Medium: the registry lacks a native flag. Fixed: Slice A item 12.

**lang:typescript, round 1: approve-with-changes (71k, 82 s).**

- High: `paths` replaces the parent's mapping. Fixed: tokens repeated, and tokens built first in CI.
- High: the example install and the hoisted fallback. Superseded by backend 1 (standalone project).
- Medium: tests outside the vitest include. Fixed with backend 2.
- Medium: two react-native type trees. Fixed: `pnpm why` shows one version.
- Low: side-effect and namespace `react-dom` imports. Fixed: covered by the lint.

**ui-design, round 1: approve-with-changes (65k, 59 s).**

- High: no mockup step (ADR-0016). Fixed: phases B0 and C0; `adrs` lists ADR-0016 and ADR-0027.
- High: Icon has no colour prop. Fixed: an explicit `color` `ColorKey` on native.
- High: the Tooltip hint is a ReactNode on a wrapper. Fixed: string-only, on the trigger's own host.
- Medium: no grabber token. Fixed: `sheetGrabberW` and `sheetGrabberH`.
- Medium: the 85vh cap on web. Fixed.
- Medium: the keyboard in Dialog. Fixed: `KeyboardAvoidingView`, and the Footer stays visible.
- Medium: sheet empty states. Fixed.

**architect, round 1: approve-with-changes (73k, 77 s).**

- High: Checkbox fails the new lint. Fixed: the Checkbox split in slice A.
- High: the example has no workspace home and could be published. Superseded by backend 1 (standalone project, never published).
- Medium: a second JSX scanner. Fixed: ESLint `no-raw-html-element` with `svgExempt: false`.
- Medium: path filter. Duplicate of unix 2.
- Low: the ADR-0001 reading is not recorded. Fixed: Decision log.

**react, round 1: approve-with-changes (66k, 78 s).**

- High: RSD maps no hint. Fixed: the trigger owns the hint (refined in backend round 2).
- Medium: `useOverlayOpenState` keeps two bugs. Fixed: no double close, and a controlled close animates.
- Medium: native focus restore. Fixed.
- Medium: a toast remount resets its countdown. Fixed: the store holds the remaining time.
- Medium: SplitPane ARIA. Fixed.
- Medium: VirtualList set size. Fixed.
- Medium: override CSS injection. Fixed: `CSS.supports`.

**backend, round 1: approve-with-changes (76k, 95 s).**

- High: the example install. Fixed: a standalone project.
- Medium: the exports test never ran. Fixed.
- Medium: the Vite guard missed Storybook. Fixed.
- Medium: typecheck wiring and cost. Fixed.
- Medium: CI numbers. Fixed.
- Medium: iOS Modal→Modal handoff. Fixed: `onSelect` after `onDismiss`.
- Low: toast host move. Fixed.
- Low: release verification and rollback. Fixed.

**backend, round 2: approve-with-changes (78k, 64 s), then approve (26k, 10 s).**

- High: RSD drops `accessibilityHint` on `html.*`. Fixed: an RN `Pressable` host in each trigger's `.native` file.
- High: the root install cost of the react-native devDependency. Fixed: recorded before and after.
- Blocking: `--ignore-workspace`, plus a root install in the native job. Fixed.
- Carried into implementation (low): state the Android order for Menu `onSelect` (after the exit transition ends).
- Carried into implementation (medium): the Happier range bump in § After each release is run by this plan's session on a throwaway happier branch.
- Re-check: approve. Optional: note `--ignore-workspace` in the example's README.

**backend, delta on the person's review: approve-with-changes (94k, 103 s), all applied.**

- High: Android Modal needs its own `GestureHandlerRootView`. Fixed: `OverlayModal`, plus an Android checkpoint row.
- High: the Simulator has no VoiceOver. Fixed: a physical iPhone for VoiceOver, a Play image for TalkBack.
- Medium: frame targets were not measurable. Fixed: `dumpsys gfxinfo` and Instruments, and a ≥ 10 % benchmark margin.
- Medium: two animation systems on one surface. Fixed: gesture-driven surfaces are wholly Reanimated.
- Medium: "optional" peers are required on native, and worklets was missing. Fixed.
- Medium: `--duro-*` aliases only re-declare on `[data-theme]`. Fixed: the override attribute sits on that element.
- Low: `Button.tsx:54`, not :65. Fixed. Low: `highContrastColors` exists. Fixed.

**backend, final body: approve-with-changes (30k, 29 s).**

- Carried into implementation (medium): one nested-override rule on both platforms. A nested provider on the same theme merges its overrides over the outer ones; `useResolvedColors` follows the web behaviour, and C's native checkpoint checks it.
- Carried into implementation (low): the iOS threshold is Instruments' hitch time ratio < 5 ms/s (Android stays at ≤ 5 % janky frames).
