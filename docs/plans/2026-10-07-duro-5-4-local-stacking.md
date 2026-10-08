---
status: done
landed: 'v5.4.0 (2d30f214). Consumer: website-builder #200 (50b2b96, git.daddyshome.fr/fredericrous/website-builder), migrated to Duro 5.4 on 2026-10-08.'
branch: feat/duro-5-4-local-stacking
repos: [duro-design-system, website-builder]
adrs: [ADR-0027]
---

# Duro 5.4: local stacking, a modal-raised layer, surface blur

## Review panel

👉 **Decide:** none — approve if a lint exemption for local stacking (2–9), `layers.modalRaised` and `effects.surfaceBlur` are the right way to finish website-builder, the 9th repo. #76 and #77 move to a later 5.5.
📍 duro-design-system (+ website-builder's step 3) · plan reviewed, nothing built · next: worktree, plan commit, lint. Panel: architect, backend, po.
**Changed by review:** scope cut to website-builder's needs (#76/#77 need a modal-aware design); the tear ghost portals via `usePortalMount` at `popup`; the published nav gap gets a release note, a unit test and a live-page check; rollback trigger named; `localMax` capped at 49.
**Binding for implementation (overrides the body):** CLAUDE.md layer and effect tables are generated, so ignore §2's 'hand-edit' line, regenerate them from docs.mjs in §2 and §3, and add a row check; the ghost renders nothing while `usePortalMount()` is null (as Dialog does); cite website-builder's snapshot-render file for the live-site claim; update the rule's `Options` type and its "has no token" doc comment; website-builder's step 3 is governed by this plan, like the 5.2/5.3 consumer steps; the per-repo list of values no longer reported goes in the 5.4 PR body; each consumer's ^5.4.0 bump PR records its lint counts against that list, and website-builder re-checks its three browser rows on deploy.
**Verdicts:** round 1: po, architect and backend each approve-with-changes. Round 2: backend approve-with-changes, architect approve-with-changes (§2 vs the binding note on CLAUDE.md, folded above), po approve. Their remaining lows are folded into the binding notes, so no round 3.
📄 Full reviews: [2026-10-07-duro-5-4-local-stacking.reviews.md](2026-10-07-duro-5-4-local-stacking.reviews.md)

## Context

Duro 5.3 shipped on 2026-10-07, and website-builder is the last of the nine consumers still to migrate. Its branch builds, typechecks and passes tests on 5.3, but 11 files can't be committed: `duro/no-raw-layer-values` warns about them, and website-builder's commit gate refuses any warning. The values are:

- **Component-local stacking:** `3`–`6` inside one widget (MobileItemChrome, PageNode, SectionWidget, renderWidget, and their native copies). The 5.3 plan (§4) left "exempt small values or add a `local` step" to the person.
- **`1002`:** the mobile keyboard sheet (`FormatToolbar`), which must sit above the "+ Add" bottom bar at `layers.modal` (1001).
- **`1200`:** the tab-tear drag ghost (`PanelDockGroup`). It renders in place at body level, not in a portal.
- **`blur(6px)`:** a frosted pill over images (`ImageWidget`). `effects.overlayBlur` is 2px, which is a different role.

The person decided:

- these values go into a Duro 5.4 release;
- small component-local values are exempted rather than tokenised;
- `1002`, `1200` and `blur(6px)` are mapped by role, or get a token where no role fits;
- website-builder's NavWidget gap becomes 24px, in both the editor and the published sites.

**Scope.** 5.4 contains only what website-builder needs, so it isn't held up. The two issues filed during the migration stay open for a later 5.5 plan:

- **#76:** trigger size;
- **#77:** floating over floating. It needs a modal-aware design: a raised layer at 60 would sit under a Dialog, so it needs a pair of layers and a way for a component to know it is inside a modal.

duro-lexical-multi keeps its `holds-until` markers pointing at those two issues.

5.4 is a minor release: it adds tokens, and the lint rule reports less. **Rollback trigger:** a new lint error in any consumer, or a stacking regression after a bump (the sheet or the ghost hidden). Either would lead to a 5.4.1, since npm versions are immutable.

## 1. Lint: component-local stacking is not reported

**ADR-0027.** A z-index is not one of the measures `design-system.every-measure-is-a-token` lists (spacing, radius, size, border width). So skipping local stacking values is a lint scoping choice, not a new ADR-0027 exemption. The README says so.

In `packages/eslint-plugin/src/rules/no-raw-layer-values.ts`:

- **New option `localMax`:** schema `{type: 'integer', minimum: 0, maximum: 49}` (49 is below `layers.floating`), default 9.
- **The skip:** after the existing `value <= 0` skip, add `if (value <= localMax && !LAYERS_BY_VALUE[value]) return`. A value of 1 still matches `layers.raised` and keeps its suggestion, so only 2–9 are skipped.
- **`offScaleZIndex` message:** its closing clause "a stacking value local to one component has no token yet" is replaced with "values up to `localMax` that order children inside one component are not reported".
- **Tests:**
  - `zIndex: 2`, `5` and `9` → valid;
  - `zIndex: 10` → `offScaleZIndex`;
  - `zIndex: 1` → `rawZIndex` → `layers.raised`;
  - `{localMax: 0}` with `zIndex: 5` → reported;
  - the schema rejects `localMax: 50`.

## 2. `layers.modalRaised`

| token         | value | role                                                                                 |
| ------------- | ----- | ------------------------------------------------------------------------------------ |
| `modalRaised` | 1002  | chrome that sits on a modal-level surface: a sheet's own toolbar over its bottom bar |

It falls between `modal` (1001) and `popover` (1040), so the scale order doesn't change. Each of these is edited by hand:

- `packages/tokens/src/tokens/layers.css.ts`;
- `keys.ts` (`LAYER_KEYS`, `LAYERS`) and `raw.ts` (`LAYERS`);
- the hand-written lint table `LAYERS_BY_VALUE` in `packages/eslint-plugin/src/util/tokens.ts`, which `token-drift.test.ts` checks against `LAYERS`;
- the CLAUDE.md layer table.

The drift check, the registry and vars.css (`--duro-layer-modal-raised`) follow through their generators.

**`1200` gets no token.** The tab-tear ghost is a drag preview, the same role as Duro's DragDrop ghost, which portals into the ThemeProvider mount at `layers.popup`. The consumer does the same (§5).

## 3. `effects.surfaceBlur`

`effects.css.ts` gains `surfaceBlur: 'blur(6px)'`. Its role is a frosted surface over imagery (pills and chips on photos); `overlayBlur` stays for modal backdrops. The doc comment carries the same "apply it only on the element itself" warning. Each of these is edited by hand:

- `keys.ts` (`EFFECT_KEYS`, `EFFECTS`);
- `raw.ts`, which gains an `EFFECTS` export it doesn't have today, plus its entry in the drift check's raw.ts list;
- the lint `EFFECTS_BY_VALUE` table, so `blur(6px)` gets a suggestion;
- the effects prose in `packages/cli/scripts/lib/docs.mjs`, which today names only `overlayBlur`.

## 4. Housekeeping

The 5.3 plan's frontmatter moves to `status: done`, with a line recording which consumers landed:

- ticket-vision #19;
- social-planner #56;
- lexical-multi 0.4.0 (#21, #22);
- website-builder, whose PR is filled in when it merges.

## 5. Release, then website-builder

1. Create a worktree on branch `feat/duro-5-4-local-stacking` with `worktree-task`. The plan is the first commit, followed by small commits: lint, layers, effects, docs and housekeeping.
2. Run Verification, then the implementation review **in the parent session**, then preview approval in the parent session. Push, merge with `merge-when-green`, and release `v5.4.0` with `tag-release`, then check the packument.
3. website-builder (its held `chore/duro-5.1` branch) moves to `^5.4.0`:
   - **Keyboard sheet:** `1002` → `layers.modalRaised`.
   - **Tear ghost:** portal it into the ThemeProvider mount with the exported `usePortalMount()`, at `layers.popup`, like Duro's DragDrop ghost.
   - **Image pill:** `blur(6px)` → `effects.surfaceBlur`.
   - **Local stacking:** the `3`–`6` values stay; they are no longer reported.
   - **Nav gap:** NavWidget → `spacing.lg` (24px) in the editor. The published-site CSS in `apps/builder-webapp/src/theme/renderPage.tsx` gets the literal `24px` (it's a CSS string), with a unit test that keeps it equal to `SPACING_PX.lg`.
     - Pages render at publish time, in the browser, and the server serves the committed HTML (website-builder's `apps/workerd-runtime/src/materialize.ts`). Existing sites keep `20px` until they are republished; website-builder's PR decides between adding a re-render and saying so in the release note.
     - The PR body and the website-builder release notes get a line for site owners: "Navigation items are 4px further apart."
   - **Done when:** lint reaches 0 errors and 0 warnings, then the usual preview → push flow.

## Verification

Each check is listed as what goes in and what must come out.

### duro-design-system

- **CI commands:** `pnpm lint`, `typecheck`, `test`, `build` (with the drift check) and `build-storybook` all exit 0.
- **Visual:** the email harness (v5.3.0 → branch) is 8/8 byte-identical. Storybook screenshots against v5.3.0 match with `maxDiffPixels: 0`, since there's no UI change.

| Input                                 | Expected                                                                                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint `zIndex: 2` / `5` / `9`          | no report                                                                                                                                                                                    |
| lint `zIndex: 10`                     | `offScaleZIndex`, with the new message clause                                                                                                                                                |
| lint `zIndex: 1`                      | `rawZIndex`, suggestion `layers.raised`                                                                                                                                                      |
| lint `zIndex: 1002`                   | `rawZIndex`, suggestion `layers.modalRaised`                                                                                                                                                 |
| lint `{localMax: 0}` with `zIndex: 5` | reported                                                                                                                                                                                     |
| lint options `{localMax: 50}`         | schema error                                                                                                                                                                                 |
| lint `backdropFilter: 'blur(6px)'`    | `rawEffect`, suggestion `effects.surfaceBlur`                                                                                                                                                |
| `LAYERS` unit test                    | strictly increasing in key order; every value a number                                                                                                                                       |
| `token-drift.test.ts`                 | `LAYERS_BY_VALUE` and `EFFECTS_BY_VALUE` mirror keys.ts                                                                                                                                      |
| `generate-vars-css`                   | `--duro-layer-modal-raised` present, aliasing the StyleX var; literal `1002` in mockup.css. `--duro-effect-surface-blur` present, aliasing the StyleX var; literal `blur(6px)` in mockup.css |

### All nine consumers, before tagging

Install the packed 5.4 tarballs, then run lint and `duro doctor`, and record error and warning counts against 5.3.

- **Every repo:** 0 new errors. Warnings can only go down; list the values that stopped being reported in each repo.
- **website-builder, with the §5 step 3 swaps applied:** 0 errors and 0 warnings.

### website-builder, in the browser (production build)

| Input                                                          | Expected                                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Mobile editor, keyboard sheet open while the "+ Add" bar shows | `elementFromPoint` at the sheet's centre is inside the sheet                                   |
| Tab-tear drag with a Dialog open                               | the ghost is the topmost element under the pointer                                             |
| Tab-tear drag without a Dialog                                 | the ghost shows and follows the pointer, as on main                                            |
| Published page, `.wb-nav ul`                                   | computed `gap` is 24px and matches the editor's NavWidget; before/after screenshot of one page |
| renderPage unit test                                           | the nav gap literal equals `SPACING_PX.lg`                                                     |

## Deviations

- **The live-site nav gap claim (§5 step 3) was false**, corrected above: website-builder renders pages at publish time (`apps/workerd-runtime/src/materialize.ts`), so no snapshot re-render reaches existing sites.

<!-- panel: repos=duro-design-system reviewers=architect,backend,po body-sha=0630c6063f3b -->
