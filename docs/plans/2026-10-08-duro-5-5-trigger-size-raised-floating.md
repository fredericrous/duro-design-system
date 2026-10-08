---
status: active
branch: feat/duro-5-5-trigger-size-raised
repos: [duro-design-system, duro-lexical-multi, website-builder]
adrs: []
---

# Duro 5.5: trigger size, raised floating surfaces

## Review panel

👉 **Decide:** none — approve if `size` on the three triggers and a modal-aware `floatingRaised`/`popoverRaised` pair (plus `useInModal` and `Popover.Popup raised`) close #76/#77, with lexical-multi 0.4.1 and website-builder following.
📍 duro-design-system (+ lexical-multi and website-builder consumer steps) · plan reviewed, nothing built · next: worktree, plan commit, ControlSize. Panel: backend.
**Changed by review:** a page-level anchor can't beat a Dialog by z-index, so lexical-multi portals into the mount while in a modal; `raised` is inherited by nested Popovers; the small ghost Menu uses `iconButtonSm`; coarse-pointer heights match; a non-vacuous Dialog-over-Popover check.
**Binding for implementation:** `raised` lives in `PopoverLayerContextValue` and `Popover.Popup` re-provides it (`raised ?? parent.raised`) around its children, since the Root can't see a Popup prop; lexical-multi's in-modal floaters use viewport coordinates (the mount is fixed, inset 0), reposition on the Dialog body's scroll, set `pointerEvents: 'auto'`, and fall back to the anchor while `usePortalMount()` is null; add a check: in a scrolled Dialog, typing into the link editor keeps focus and its top edge stays within 1px of the selection's bottom.
**Verdicts:** backend round 1 approve-with-changes; round 2 approve-with-changes, its two notes recorded above, so no round 3.
📄 Full reviews: [2026-10-08-duro-5-5-trigger-size-raised-floating.reviews.md](2026-10-08-duro-5-5-trigger-size-raised-floating.reviews.md)

## Context

The 5.x fleet migration (2026-10-07/08) left two issues open, filed while duro-lexical-multi moved its editor toolbar to Duro's `Toolbar` + `ButtonGroup attached`. duro-lexical-multi 0.4.0 carries a `holds-until` comment for each.

- **#76, trigger size.** `Toggle` and `Button` take `size="small"`; `Select.Trigger`, `Menu.Trigger` and `Popover.Trigger` don't. In lexical-multi's toolbar, the three Select pills and the text-colour and highlighter Popover triggers are wider and taller than the small toggles beside them.
- **#77, one floating surface over another.** lexical-multi's link editor must sit above its selection format bar, which is on `layers.floating` (50). The only layers above `floating` are `popover` (1040, "a Popover inside a Dialog or Drawer") and `popup` (1050). lexical-multi borrows `popover`. Its floaters portal into `floatingAnchorElem`, which a host can share at page level (`useFloatingAnchor`, e.g. website-builder). That anchor sits outside the ThemeProvider portal mount, and layer values only order elements inside one stacking context. So outside a modal the floaters compete at page level against the mount (1100), and inside a modal a page-level anchor can never draw above the Dialog, whatever its z-index. The 5.4 review established that the fix must be modal-aware: a raised layer at 60 would sit under a Dialog when the editor itself is inside one.

The person asked to fix both. 5.5 is a minor release: it adds one prop on three components, two tokens, one exported hook and one Popover prop. No existing value, default or API changes. **Rollback trigger:** a new lint or type error in any consumer, or a stacking regression (a Popover, Select or Dialog drawn under something it used to cover). Either leads to a 5.5.1, since npm versions are immutable.

## 1. Trigger size (#76)

- **Shared type.** A new `ControlSize = 'default' | 'small'` in `packages/ui/src/shared/`; `ToggleSize` and `ButtonSize` become aliases of it, so no export changes.
- **Props.** `Select.Trigger`, `Menu.Trigger` and `Popover.Trigger` gain `size?: ControlSize` (default `'default'`).
- **Styles.** Each trigger's `styles.css.ts` adds `triggerSmall`, written as longhands (the trigger blocks set `paddingTop`/`paddingLeft`… longhands, and StyleX lets a longhand win over a later shorthand): `paddingTop`/`paddingBottom: spacing.xs`, `paddingLeft`/`paddingRight: spacing.sm`, `fontSize: typography.fontSizeXs`, `gap: spacing.xs`. These are Toggle `sizeSmall`'s values. It is applied after `trigger` and before the attached-group style.
- **Menu ghost.** For `Menu.Trigger variant="ghost"`, `size="small"` applies a separate `triggerGhostSmall`: `fontSize: fontSizeXs` and `minWidth`/`minHeight: sizes.iconButtonSm` (28px) instead of `iconButton` (32px), keeping the ghost's `xs` padding.
- **Coarse pointer.** `triggerSmall` and `triggerGhostSmall` take the same `@media (pointer: coarse)` `minHeight: sizes.touchTarget` that Toggle already has, so heights stay equal on touch.
- **Stories.** A plain `Inline` row (no attached group, which would stretch heights) of a small `Toggle`, small `Select.Trigger`, small `Menu.Trigger` and small `Popover.Trigger`; and the existing attached-group stories gain a small variant.

## 2. Raised floating surfaces (#77)

Two tokens, as a pair so the choice follows the modal context the same way `floating`/`popover` already do:

| token            | value | role                                                                                                                   |
| ---------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| `floatingRaised` | 60    | a floating surface that must sit over another floating one, outside a modal: a link editor over a selection format bar |
| `popoverRaised`  | 1041  | the same, inside a Dialog or Drawer: above `popover` (1040), below `popupBackdrop` (1049)                              |

Both fall between existing steps, so the scale order doesn't change. In `LAYER_KEYS`, `floatingRaised` goes after `floating` and `popoverRaised` after `popover`; `layers.test.ts` adds `floatingRaised < overlay` and `popoverRaised < popupBackdrop`. Wiring, each edited by hand: `packages/tokens/src/tokens/layers.css.ts`, `keys.ts` (`LAYER_KEYS`, `LAYERS`), `raw.ts` (`LAYERS`), and the lint table `LAYERS_BY_VALUE` in `packages/eslint-plugin/src/util/tokens.ts` (checked by `token-drift.test.ts`). The CLAUDE.md layer table, `vars.css` and `packages/cli/registry.json` are regenerated, never hand-edited.

**Choosing the layer:**

- **`useInModal()`** is exported from `@duro-app/ui`. It already exists (`packages/ui/src/shared/ModalContext.ts`), and Popover uses it to pick `floating` or `popover`. A consumer whose floating surface is not a Duro Popover (lexical-multi's link editor) uses it to pick `floatingRaised` or `popoverRaised`.
- **`Popover.Popup raised?: boolean`.** When set, the Popover picks `popoverRaised` inside a modal and `floatingRaised` outside one, instead of `popover`/`floating`. This covers the case where both surfaces are Duro Popovers. `raised` is carried through the existing `PopoverLayerContext`, so a Popover nested inside a raised one inherits it and isn't drawn under its parent.
- **Docs.** The `layers.css.ts` comments, the Popover JSDoc and CLAUDE.md say which to use: a raised surface is for one floating thing that must cover a sibling floating thing, never for covering a modal.

## 3. Consumers

1. **duro-lexical-multi 0.4.1**, after 5.5.0 is on npm (worktree, plan-governed like the 5.2–5.4 consumer steps):
   - peer and devDeps `@duro-app/*` → `^5.5.0`;
   - the three Select triggers and the two colour `Popover.Trigger`s take `size="small"`; remove `holds-until` #76;
   - inside a modal (`useInModal()`), the format bar and link editor portal into `usePortalMount()` instead of the page-level `floatingAnchorElem`, so they share the Dialog's stacking context; outside a modal they keep the anchor;
   - the link editor picks `useInModal() ? layers.popoverRaised : layers.floatingRaised`, and the format bar `useInModal() ? layers.popover : layers.floating`; remove `holds-until` #77;
   - a browser check: editor inside an open Dialog with a page-level `useFloatingAnchor`; `elementFromPoint` lands in the format bar, and in the link editor where they overlap; the same with no Dialog;
   - CHANGELOG 0.4.1; preview → push → merge → `v0.4.1` tag (the audit waivers already in place cover the tag).
2. **website-builder**, a follow-up PR: `@fredericrous/lexical-multi` → `^0.4.1` and `@duro-app/*` → `^5.5.0`; preview → push → merge. Its next deploy picks it up.
3. Close #76 and #77 with links to the 5.5 PR and lexical-multi 0.4.1.

## 4. Release

Worktree on branch `feat/duro-5-5-trigger-size-raised` with `worktree-task`. The plan is the first commit, then small commits: shared ControlSize, trigger size, layers, Popover raised + useInModal export, docs. Then Verification, the implementation review **in the parent session**, and preview approval in the parent session. Push, merge with `merge-when-green`, release `v5.5.0` with `tag-release`, then check the packument.

## Verification

Each check is listed as what goes in and what must come out.

### duro-design-system

- **CI commands:** `pnpm lint`, `typecheck`, `test`, `build` (drift check) and `build-storybook` all exit 0.
- **Visual:** the email harness (v5.4.0 → branch) is 8/8 byte-identical. Playwright Storybook screenshots against v5.4.0 match with `maxDiffPixels: 0`, except the new stories.

| Input                                                                                                         | Expected                                                                                     |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| plain `Inline`: small Toggle, small Select/Menu/Popover triggers, fine pointer (browser)                      | equal `offsetHeight` in px; triggers' padding `xs`/`sm` and font `fontSizeXs`                |
| the same row, coarse pointer (emulated)                                                                       | every control at `touchTarget` height                                                        |
| `Menu.Trigger variant="ghost" size="small"`                                                                   | width and height `iconButtonSm` (28px); font `fontSizeXs`                                    |
| default-size triggers                                                                                         | computed styles unchanged from v5.4.0                                                        |
| two Popovers, the second `raised`, no modal (browser)                                                         | `elementFromPoint` at the overlap is inside the raised one; its z-index is 60                |
| the same inside an open Dialog                                                                                | the raised one is on top, z-index 1041; both are above the Dialog panel                      |
| a raised Popover (no modal) held open with a controlled `open`, then a Dialog opened with a controlled `open` | the Popover is still mounted; `elementFromPoint` at the Dialog's centre is inside the Dialog |
| a Popover nested inside a raised one, no modal and inside a Dialog                                            | the nested one is on top in both cases                                                       |
| a Select opened from inside a raised Popover in a Dialog                                                      | the listbox (1050) is on top                                                                 |
| `useInModal()` from `@duro-app/ui`                                                                            | `true` inside Dialog and Drawer, `false` outside; type-checks from the package root          |
| lint `zIndex: 60` / `1041`                                                                                    | `rawZIndex`, suggestions `layers.floatingRaised` / `layers.popoverRaised`                    |
| `LAYERS` unit test                                                                                            | strictly increasing; every value a number                                                    |
| regenerated CLAUDE.md                                                                                         | rows `floatingRaised \| 60` and `popoverRaised \| 1041`; `pnpm build` leaves no diff         |

### All nine consumers, before tagging

Install the packed 5.5 tarballs, then run lint, typecheck and `duro doctor`; record error and warning counts against 5.4. 0 new errors and 0 new type errors anywhere. lexical-multi with its §3.1 swaps applied: 0 errors, 0 warnings, and its toolbar controls at equal height in an 800px Storybook (vertical-overlap check).

## Addendum (person's decision, 2026-10-08)

**Decision:** every small control (`Toggle`, `Button`, `Select.Trigger`, `Menu.Trigger`, `Popover.Trigger`) gets `minHeight: sizes.controlSm` (28px), plus the coarse-pointer `touchTarget` minimum it already has. A small ghost `Menu.Trigger` stays `iconButtonSm` (28px). §3.1 also passes `size="small"` to lexical-multi's two ghost Menus.

**Scope (from the implementation review):** `LinkButton` follows `Button`, so a small LinkButton is also at least 28px. Neither has a coarse-pointer `touchTarget` minimum at any size in 5.x, and 5.5 does not add one: under a coarse pointer, small Toggles and triggers are 44px and a small Button or LinkButton stays 28px. Story `SmallTriggersRowCoarsePointer` checks both.

**Why:** equal height whatever a small control holds. With §1 as written, lexical-multi's toolbar at 800px measured 25px (small Selects, 12px text), 28px (Toggles and colour triggers, 18px icons) and 32px (ghost Menus, not swapped): the padding matched, the content did not.

**Overrides:** "No existing value, default or API changes" (Context) for small controls: a text-only small `Toggle` or `Button` goes from 25px to 28px. Stories showing one are named screenshot exceptions in the verification record, and the release notes say "small controls are at least 28px tall".

<!-- panel: repos=duro-design-system reviewers=backend body-sha=8d7066569789 -->

## Verification record (observed before push, tree f3c8be73 rebased on 0b001bef)

- CI commands: lint 0 errors (the 16 warnings main has), typecheck, test:unit 394/394, Storybook 412/412, build with no drift, build-storybook: all exit 0.
- Email harness main → branch: 8/8 byte-identical.
- Screenshots main vs branch, 401 shared stories: 386 identical. The 5 named exceptions (Toggle/Small, ToggleGroup/Small, ToggleGroup/All Variants, LinkButton/Small, LinkButton/All Variants) are small text controls growing to 28px. 7 Drawer/Scroll stories differ by the port in their static-build error text. 3 flaky stories match on a rerun or differ main vs main.
- Small row, fine pointer: all controls 28px; trigger padding 4px/8px, font 12px; ghost Menu 28×28. Coarse pointer: Toggles, triggers and ghost Menu 44px, small Button 28px (`SmallTriggersRowCoarsePointer`).
- Default-size triggers: 26 triggers, 0 computed properties differ from 5.4.
- Stacking: raised over the bar 60 > 50; in a Dialog 1041 > 1040, both over the panel; a later Dialog covers a held-open raised Popover; a nested Popover inherits `raised` (fails without the inheritance); a Select from a raised Popover in a Dialog is at 1050. `useInModal` is true in Dialog and Drawer and false outside.
- Lint `zIndex: 60`/`1041` suggests the new tokens. `LAYERS` stays strictly increasing. The regenerated CLAUDE.md has both rows.
- Nine consumers on the 5.5.0 tarballs (tree 77d8cc82): 0 new lint, type or doctor errors. lexical-multi with the §3.1 swaps: 12 toolbar controls at 28px, 800px. Re-run on the final tarballs before the tag.

## Decision log

- Released as **v5.6.0**, not 5.5.0: another session tagged v5.5.0 at 0b001bef (#82, docs navigation parts) while this branch was in review. Code comments name 5.6. The plan keeps its 5.5 file name. Where §3–§4 and the rollback trigger say 5.5.0 / `^5.5.0` / 5.5.1, read 5.6.0 / `^5.6.0` / 5.6.1. The verification rows that name 5.5 tarballs record what was tested and stay as they are.

## Implementation review

- Round 1 (tree 6066ad98): approve-with-changes. Fixed: recorded actuals, coarse-pointer story, small LinkButton at 28px; Button's missing touch size recorded as scope in the addendum.
- Round 2 (tree b196a592), Delta (tree 85f71e67): approve, then approve-with-changes, low only. Fixed: ghost Menu in the touch story. deliberate: LinkButton's 28px is held by its screenshot exceptions, not a play test; the consumer row is re-run before the tag.
- Next phase: §3 consumers (lexical-multi 0.4.1, website-builder) after v5.6.0.
