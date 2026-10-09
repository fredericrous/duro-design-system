---
status: active
branch: feat/lint-raw-shorthand-inline
repos:
  [
    duro-design-system,
    duro-lexical-multi,
    duro-app,
    website-builder,
    application-landscape,
    kb-vision,
  ]
adrs: []
---

# Raw values in shorthands and inline styles; editor chrome keeps its theme

## Review panel

👉 **Decide:** none — approve if a 5.7.0 rule that catches shorthands and inline styles (with per-repo ratchets), Duro-built ui/Button, chrome back on the editor theme and de-flaked E2E close the four items.
📍 duro-design-system + 5 consumers · plan reviewed, nothing built · next: rule and tests, then the fleet gate on the tarballs. Panel: backend, platform.
**Changed by review:** baselined files the fixes touch are migrated in the same PR (zero-warning pre-commit); a bounded 35-minute wait for the 0.2.25 rollout before the live check; a named no-suggestion mechanism; shrink-only guard tests.
**Binding for implementation:** state each repo's real pre-commit warning policy (cite its hook) instead of "if"; the tip-overlap E2E test goes in `ds-widgets.harness.spec.ts`, so CI runs it; the step-6 list is derived as changed files ∩ both baselines, and that output is recorded.; when landing the plan, move the serialization paragraph below Phase 6 (the platform delta's low).
**Verdicts:** platform approve-with-changes → approve (delta); backend approve-with-changes (one blocking) → approve (round 2).

## Context

Four open items from the Duro 5.6 / lexical-multi 0.4.x work:

1. **duro-design-system#92.** `duro/no-raw-design-values` skips multi-value strings (`padding: '4px 8px'`): `checkStringValue` matches one whole `^\d+px$` value (`packages/eslint-plugin/src/rules/no-raw-design-values.ts:531`), on purpose per the doc comment (:217) and a `valid` test (`test/no-raw-design-values.test.ts:18`). The rule also only walks `css.create(...)` (:729-746), so inline `style={{…}}` objects are never checked. The person asked for both: shorthands, and inline styles, "now".
2. **duro-lexical-multi#26.** Its public `ui/Button` (`src/ui/Button.tsx`, exported at `src/index.ts:81`, used by no consumer) has `padding: '6px 14px'` / `'4px 10px'`. 14px and 10px are off the spacing scale, and the fleet rule forbids snapping. The person chose to rebuild it on Duro's `Button`.
3. **website-builder: serif selection-bar buttons.** The buttons are Duro `Button`s with Duro's CSS. The serif comes from `EditorScreen.tsx:924`, which spreads the site's brand `duroVars` (`apps/builder-webapp/src/theme/duroTheme.ts:34-58`) onto the whole work area, editor chrome included. One of them is `--fontFamily: Inter` (`duroTheme.ts:55`), with no fallback stack, and Inter is never loaded, in the editor or on published sites. That goes against ADR-0010 (`site-design-system.contract`): "the editor's own UI stays on the fleet's library". Lint could not see it: this is runtime variable scoping, not a raw value.
4. **website-builder: two "flaky" E2E tests** (`test/e2e/ds-widgets.harness.spec.ts:95`, `:387`). The first-run tip pill (`ResizePrecisionTip`) sits about 1px over the point each test presses, so the press lands on the pill. It is a real UX defect too: the pill swallows a user's click on the block they just selected.

**Fleet impact of the lint change**, measured by running the rule's handler:

- Shorthands inside `css.create`: 6 new errors. Those are duro-app's dead `ButtonLink` and lexical-multi's `ui/Button`.
- Inline styles: about 530 new errors (website-builder 323, application-landscape 105, kb-vision 99, duro-app 3; the rest 0). They are mostly raw colours, font sizes and measures on the raw HTML elements website-builder already baselines.

The person chose "rule on + ratchet": ship the check on by default, fix duro-app, and freeze the other three repos' current files in a shrink-only baseline.

## Non-goals

- Migrating the ~527 existing inline-style values in website-builder, application-landscape and kb-vision. Each repo gets one tracking issue.
- Loading brand web fonts (editor and published site). That needs a font host, CSP and privacy choices. It gets its own website-builder issue; this plan only adds a generic fallback stack so nothing renders in serif.
- React Native `StyleSheet.create`. Its values are numeric dp, and token suggestions would be wrong there.
- Inline-style coverage for `packages/ui-email`, which needs inline styles and is not in that lint scope.

## Behaviour

### duro-design-system: `no-raw-design-values` (release 5.7.0)

- **No-suggestion mechanism.** `walkStyleObject` and `checkValue` pass down a `suggest: boolean`. When it is false, every check (`checkPxValue`, `checkFontSize`, `checkFontWeight`, `checkColorValue`, … which attach `suggestReplacement` today, :437/475/491/505) emits `suggest: []`.
- **Shorthand strings.** For spacing and radius properties, a string is split on whitespace and every nonzero px word is checked as a single value would be, reusing `checkPxValue` with `suggest: false`. `0`, `auto`, `%`, `rem` and `var(...)` words are skipped. Suggestions: none for a shorthand; the message names the token per word. This follows the `checkMeasureString` precedent (:409-416, border shorthands report with `suggestions: []`). The `valid` case `gap: '8px 16px'` moves to `invalid`.
- **Inline styles.** A new `JSXAttribute` visitor: when the attribute is `style={{…}}` with an object literal, it runs `walkStyleObject(expr, null)`.
  - It applies to every JSX element.
  - `style={styles.x}`, arrays and spreads are ignored.
  - Custom-property keys (`'--wb-vw'`) are ignored.
  - Inline hits carry no suggestion, because plain-React consumers have no `.css.ts` token imports. The message still names the token.
- **Options.** `inlineStyle?: boolean`, default `true`, in the options type and schema (:50-56, :232-243). README entry (README.md:121).
- **Tests.** A JSX-enabled `RuleTester` with an `inline(body)` helper. Valid and invalid cases as listed in the Verification table.
- **Rollback.** A consumer sets `inlineStyle: false` or reverts its bump. A bad 5.7.0 is superseded by 5.7.1, since npm versions are immutable.
- **Version.** 5.7.0 is a minor on purpose: consumers' lockfiles pin the plugin, so nothing turns red until a repo bumps. Every repo with hits is bumped and baselined in this plan. The four with zero hits bump whenever they like.

### duro-lexical-multi 0.5.0 (#26)

- `ui/Button` renders Duro `Button`:
  - `small` maps to `size="small"`;
  - `title` maps to `aria-label`;
  - `variant="secondary"` stands in for the old bordered look;
  - `children`, `onClick` and `disabled` are kept;
  - `style` and `data-test-id` are dropped (breaking, hence 0.5.0; no consumer passes them).
- `Editor.stories.tsx:84` becomes `paddingBlock: spacing.xs`, `paddingInline: spacing.sm` (no visual change).
- `@duro-app/*` `^5.7.0`. CHANGELOG 0.5.0 says what was dropped.
- Contact sheet of every visible story, then a preview.

### duro-app

- Delete `app/components/ButtonLink/` (definition and test). It is used nowhere, and the app already uses Duro `LinkButton`.
- `@duro-app/*` `^5.7.0`; its 3 inline hits are fixed with tokens or its CSS variables. No UI change and no release needed.

### website-builder

1. **Chrome keeps the editor theme.** `EditorScreen.tsx:924` stops spreading `duroVars`. The div keeps `data-wb-scope` and `--wb-vw`. The brand vars move into the `ThemeVarsProvider` value (:936), which `PageNode` already spreads onto every page body (`PageNode.tsx:181`, `:419`) and `MoveDragGhost.tsx:203` onto its ghost.
   - `AddDragGhost` and `PreviewCanvas` get the same spread.
   - The TearGhost copy (`PanelDockGroup.tsx:300-315`) is reduced to `--wb-vw`.
   - Comments in `fluidType.ts` and `ThemeVarsContext.tsx` updated.
   - Fluid type still resolves, since `--wb-vw` is inherited from the scope.
2. **Font fallback stack.** A `fontStack(name)` helper in packages/theme-engine returns `"Inter", system-ui, sans-serif`, or a serif stack for Lora / Playfair Display / Georgia. It passes through values that already hold a comma or a generic family. It is applied where tokens are emitted (`resolve.ts:77-78`, `duroTheme.ts:55`), never in `generate` (versioned). The publish snapshot changes accordingly. An issue is filed for actually loading brand fonts.
3. **Tip pill never swallows a click.** `ResizePrecisionTip`, `SelectFirstTip` and `CrossTabDragCoach` get `pointerEvents: 'none'` on the pill, with `pointerEvents: 'auto'` on its "Got it" button.
4. **E2E.**
   - `openEditor` seeds the three tips' seen-keys with `addInitScript`.
   - :95 waits on the "Button" selection toolbar instead of `waitForTimeout(600)`.
   - Both tests `hover()` the target before raw `page.mouse` presses, so an overlay fails loudly.
5. **Dependencies and lint.**
   - `@duro-app/*` `^5.7.0` and lexical-multi `^0.5.0`, in a commit after the behaviour fixes.
   - `eslint.duro-baseline.js` gains a shrink-only `RAW_VALUES_BASELINE` (today's files with inline hits). It sets `no-raw-design-values` to `warn` there, the same mechanism as `RAW_HTML_BASELINE`.
   - A test fails when a file listed there has 0 hits, so the list only shrinks.
6. **Baselined files the fixes touch are migrated in the same PR.** The pre-commit hook lints staged files at zero warnings (`eslint.config.js:8-9`), so touching a file listed in `RAW_HTML_BASELINE` (or, after the bump, in `RAW_VALUES_BASELINE`) means migrating it: raw elements become `html.*`, raw values become tokens, and its baseline line is deleted.
   - Known from the inventory: `AddDragGhost.tsx` and `CrossTabDragCoach.tsx`.
   - To check at the start of implementation: `MoveDragGhost.tsx`, `PanelDockGroup.tsx`, `PreviewCanvas.tsx`, `ResizePrecisionTip.tsx` and `SelectFirstTip.tsx`.
   - The exact list and its counts go into the record.
   - CLAUDE.md's stale "warns on raw px" line is corrected.
   - One issue tracks the migration.
7. **Release and deploy builder-webapp 0.2.25** (live is 0.2.24). The PR's CI install must pass with the 0.5.0 lockfile before tagging.
   - One homelab commit bumps both `chart.spec.version` and `values.image.tag` in `kubernetes/cloud/apps/website-builder/helm-release-webapp.yaml`.
   - Wait up to 35 minutes for HelmRelease `builder-webapp` to be `Ready` at the new revision, with the Deployment's image at the new tag and one pod left. The image is ~830 MB, pulled at 0.65–2.21 MB/s.
   - Only then check the live editor. If the wait runs out, stop and report.
   - **Rollback:** revert the homelab commit back to 0.2.24, which may mean another long pull. Sites published in the window keep the fallback stack, which is harmless; nothing in `generate` or stored site data changes.

### application-landscape and kb-vision

`@duro-app/*` `^5.7.0`. Neither repo has a baseline today, so each gets one:

- a new `eslint.duro-baseline.{js,mjs}` exporting `RAW_VALUES_BASELINE`;
- an override block in `eslint.config.{mjs,js}` setting `no-raw-design-values` to `warn` for those files;
- the same shrink-only test.

One migration issue each. No code changes. If a repo lints commits at zero warnings, editing one of its ~70 (application-landscape) or 14 (kb-vision) baselined files forces migrating that file; the person was told.

## Phases

1. duro-design-system: plan, rule and tests, README, the fleet gate (every consumer on the 5.7.0 tarballs: new errors only where listed above), merge, tag v5.7.0, verify npm.

The consumer PRs (Phases 2–5) run one at a time. Nothing else is pushed while the builder-webapp release builds: over-queued Forgejo runners kill jobs that are already running. 2. duro-lexical-multi 0.5.0: implement, contact sheet, preview, merge, tag, verify the registry. 3. duro-app: delete ButtonLink, bump, merge. 4. website-builder: fixes 1–5, contact of the changed chrome, preview, merge; release and deploy the webapp; check live. 5. application-landscape and kb-vision: bump and baseline, merge. 6. Issues: the three migration issues, website-builder brand-font loading. Close #92 and #26 with links.

## Verification

| Input                                                                                                     | Expected                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| eslint-plugin tests                                                                                       | pass; new cases: `padding: '4px 8px'` → 2 reports with no suggestion; `margin: '0 auto'` valid; `<div style={{padding: 16}} />` → `rawSpacing` with no suggestion; `<Comp style={{fontSize: 14}} />` → `rawFontSize`; `style={styles.x}`, `style={{...base}}`, `style={{['--wb-x']: 1}}` valid; `inlineStyle: false` → inline objects not checked |
| duro-design-system `pnpm lint/typecheck/test/build`                                                       | exit 0; packages/ui has 0 inline or shorthand hits                                                                                                                                                                                                                                                                                                |
| Fleet gate on the 5.7.0 tarballs, before tagging                                                          | new errors only in website-builder, application-landscape, kb-vision, duro-app and lexical-multi, with counts matching the inventory                                                                                                                                                                                                              |
| lexical-multi gates, contact sheet, `UiComponents` story                                                  | pass; ui/Button looks like a Duro secondary Button at both sizes                                                                                                                                                                                                                                                                                  |
| duro-app lint, typecheck, test, build                                                                     | pass, no ButtonLink left                                                                                                                                                                                                                                                                                                                          |
| website-builder: select a block in the editor (browser)                                                   | Delete, Duplicate, Section and the width chips render in the system sans font; computed `font-family` on them is Duro's stack, not `Inter`                                                                                                                                                                                                        |
| website-builder: a page body on the canvas                                                                | still uses the brand (`--wb-font-body`, brand colours)                                                                                                                                                                                                                                                                                            |
| website-builder: press the selected block where the tip pill overlaps it                                  | the block gets the press (quick edit opens on the second press)                                                                                                                                                                                                                                                                                   |
| new E2E test: keep the tip, press the overlapped point                                                    | the block, not the pill, receives the press; 20 local runs, 20 pass                                                                                                                                                                                                                                                                               |
| `RAW_VALUES_BASELINE` guard test in each repo                                                             | fails if a listed file has 0 hits                                                                                                                                                                                                                                                                                                                 |
| eslint-plugin: `<div style={{color: '#fff'}} />`, `<div style={{fontWeight: 600}} />`                     | reported with `suggestions: []`                                                                                                                                                                                                                                                                                                                   |
| website-builder E2E (the six CI specs), 3 runs locally                                                    | all pass, 3 of 3                                                                                                                                                                                                                                                                                                                                  |
| website-builder publish snapshot                                                                          | only the font-family values change, to the stack                                                                                                                                                                                                                                                                                                  |
| website-builder lint with 5.7.0                                                                           | 0 errors; baselined files warn                                                                                                                                                                                                                                                                                                                    |
| live editor after deploy (browser), once the HelmRelease is Ready at 0.2.25 with one pod on the new image | the same chrome font check passes; the page body's `font-family` starts with `"Inter"`                                                                                                                                                                                                                                                            |
| application-landscape, kb-vision lint with 5.7.0                                                          | 0 errors                                                                                                                                                                                                                                                                                                                                          |

## Decision log

- The inline check ships on by default with per-repo ratchets (the person's choice, 2026-10-09). The ~530 count corrected an earlier estimate of 49.
- Minor version 5.7.0, not major: lockfiles pin the plugin, and every affected repo is bumped and baselined here.
- No suggestions for shorthand or inline hits: a whole-node token swap is wrong for shorthands, and plain-React consumers can't import `.css.ts` tokens.
- Brand font loading is deferred to its own issue; this plan only removes the serif fallback.
- 2026-10-09, Phase 1 build:
  - A negative px word in a shorthand (`'-4px 8px'`) is skipped, as negatives on spacing are; only `8px` is reported.
  - A shorthand's message names each word.
  - Inline walks skip computed and `--` keys, while css.create still scans computed keys for colours.
  - All three are pinned by tests.
- 2026-10-09: **released as v5.9.0, not 5.7.0.** Another session had already published v5.7.0, v5.8.0 and v5.8.1 (2026-10-08). Every "5.7.0" / `^5.7.0` in this plan reads 5.9.0 / `^5.9.0`. The branch is based on v5.8.1 (9f5746b2).

## Phase 1 record (observed before push)

- eslint-plugin unit tests: 208 pass (10 files). `pnpm lint` passes with 0 `no-raw-design-values` hits in packages/ui. typecheck passes, and build leaves no diff. The full Storybook run's 2 DrawerScroll failures are the open #81 (touch emulation leak); the branch has no packages/ui diff.
- **Fleet gate** on the candidate tarballs (packed from a507c789), each repo at origin/main, against both 5.6.0 and the published 5.8.1. Lint at 5.8.1 equals 5.6.0 everywhere, so the whole delta comes from the rule.

  | Repo                  | New `no-raw-design-values` errors                |
  | --------------------- | ------------------------------------------------ |
  | website-builder       | 352 (25 files, all inline)                       |
  | application-landscape | 122 (35 files)                                   |
  | kb-vision             | 91 (12 files)                                    |
  | duro-app              | 7 (6 shorthand in the dead ButtonLink, 1 inline) |
  | duro-lexical-multi    | 6 (shorthand)                                    |
  | the other four        | 0                                                |
  - No other rule changed, and there are 0 new type errors.
  - The counts differ from the probe's (323/105/99/3/3) because the gate counts one report per value of a two-value shorthand, and because the probe ran without each repo's ignores.
  - The per-file lists become the baselines.

- Implementation review: round 1 approve-with-changes (tests for negatives and inline conditions, a comment); delta approve.

## Full reviews (reference)

**platform, round 1: approve-with-changes (41k, 53 s).**

- High: an unbounded deploy wait. Fixed with a 35-minute bound and a check of the new image.
- Medium: target 0.2.25.
- Medium: rollback.
- Medium: serialize PRs because of runner capacity.
- Low: the 0.5.0 lockfile install on the PR.

**backend, round 1: approve-with-changes (66k, 101 s).**

- Blocking: the zero-warning pre-commit on baselined files.
- Medium: the no-suggestion mechanism.
- Medium: baselines for application-landscape and kb-vision.
- Medium: an E2E test for the click-swallow.
- Low: shrink-only test.
- Low: 5.7.0 rollback.

**backend, round 2: approve (34k, 60 s).**

- All resolved.
- Three lows, recorded as binding notes: the hook policy, the spec file, the derived list.

<!-- panel: repos=duro-design-system,duro-lexical-multi,duro-app,website-builder,application-landscape,kb-vision reviewers=backend,platform body-sha=436e1e728d74 -->
