---
status: active
branch: feat/size-border-tokens
repos: [decisions, duro-design-system]
adrs: [ADR-0027]
---

# Every measure is a token: sizes and border widths in Duro, decided for the fleet

## Review panel

👉 **Decide:** none. Approve if a 5.0.0 major (tokens, migration, lint at error everywhere) after the ADR-0027 PR is the right shape. Consumers then migrate when they take 5.0.
📍 decisions → duro-design-system · planned, nothing written · next: the ADR-0027 PR in `decisions`. Panel: backend (computed as a delta because this file was reused; see the note).
**Changed by review:** lint only `no-raw-design-values` on `packages/ui/src/**` with an `exemptFiles` option; a per-property candidate set with no silent collisions; shorthands parsed; measures passed as props typed as token keys; ui-email in scope; one exemption list.
**Verdicts:** backend: round 1, 3 binds and 3 email deltas approve-with-changes, every item in the body; final bind **approve**.
📄 Full reviews: [2026-10-06-every-measure-is-a-token.reviews.md](2026-10-06-every-measure-is-a-token.reviews.md)
📄 **Notes:**

- **Panel note:** `plan-panel` computed `panel=delta` (backend only), because this plan file had held the earlier icon plan. The full computed panel for these areas would add lang:typescript, tui, unix, react, ui-design, ux-research and game-ux. The person can ask for them before approving.

Repositories, in this order:

1. `decisions`: the rule, one PR.
2. `duro-design-system`: tokens, migration, lint and mockup check; one PR, released as **5.0.0**.

Home of the plan: `duro-design-system`; `decisions` gets a pointer file.

## Context

The person asked where the 44px touch target in Duro 4.5.0 comes from, because
"all measures come from tokens". It comes from nowhere. **Duro has no size
tokens**: its groups are colours, spacing, radii, typography, motion, shadows,
layout spacing and breakpoints. So every component that needs a fixed size
writes a literal.

Inventory of `packages/ui`, taken 2026-10-06.

- **Sizes, about 60 literals across 25 components:**
  - touch target 44 (Toggle; the VirtualTable row estimate);
  - control heights 28/39 (Toggle, `rowHeight.ts`) and 40 (TagGroup);
  - indicator boxes 18 (Checkbox, Radio, SideNav icon), the radio dot 8, the
    check mark 5×9;
  - Switch 36×20 with a 16 thumb;
  - close buttons 32 (Dialog, Drawer, DetailPanel) and 28 (ActionBar);
  - spinners 16/24/40;
  - inline glyphs 10/12/16;
  - popup min and max sizes 120/160/200/280;
  - Dialog widths 400/520/680, Drawer and DetailPanel widths 360/480/640,
    Toast 440;
  - page widths 600/800/1200;
  - Grid minimum columns 240/280, Table minimum column 120;
  - scrollbar 8, ColorInput 44×34, nav marker 3×18.
- **Border and outline widths, about 60 more:** 1, 2 and 3 for borders,
  2 for focus rings, offsets of 1, 2 and −2.
- **Icon sizes** exist only as a plain TS map, `ICON_SIZES` in
  `packages/tokens/src/keys.ts:80-87`. They are not a token group and have no
  CSS variables.

Nothing catches these literals:

- `duro/no-raw-design-values`
  (`packages/eslint-plugin/src/rules/no-raw-design-values.ts`) checks px on
  spacing and radius properties only, never on width, height or border width.
- Duro's own `eslint.config.js` (lines 43-54) does not apply the rule to
  component `styles.css.ts` at all.
- No fleet rule covers sizes. `handoff.tokens-only` exempts geometry on
  purpose ("a width, a height, a position is a sketch"), and ADR-0016 records
  `ui.mockup-handoff` as "pixel values do not bind".

**What the person decided (2026-10-06):**

- **Full scale.** A `sizes` token group, every size literal migrated, and lint
  enforcement.
- **A recorded fleet decision**, so that reviewers and lint enforce it
  everywhere.
- **Code and artboards.** The rule replaces ADR-0016's geometry choice, so
  component dimensions in artboards use size tokens too. Layout _positions_
  stay free.
- **A borders group** as well: hairline, strong, accent and focus ring.
- **Error everywhere at once**, in Duro and in consumers, from the release
  that adds the rule. A config that turns a consumer's green CI red is a
  breaking change, so the release is **5.0.0**, not 4.6.0, and no consumer
  gets it through a `^4` range.

**Named exemptions, which the rule states:**

- `0`;
- relative units (`%`, `vh`, `vw`, `fr`, `auto`, `min-content`…);
- a `calc()` made only of tokens, relative units and unitless multipliers
  (`calc(-1 * focusOffset)`);
- the 1×1 visually-hidden technique. All six copies (Radio, Checkbox,
  Spinner, Switch, TagGroup, DragDrop) move into one module,
  `packages/ui/src/styles/visually-hidden.css.ts`. The rule's `exemptFiles`
  option names that single file in Duro's lint config; there is no disable
  comment (the fleet's "suppressions need an outside cause" rule);
- SVG `viewBox` path coordinates, which draw a glyph and do not size a box;
- the **intrinsic canvas size of a `Diagram`** (its `width`/`height` props).
  A diagram is authored in explicit coordinates (`@duro-app/diagrams`), and
  its canvas is the coordinate space, not a component dimension;
- media queries on the breakpoint scale (a query cannot read a variable);
- layout **positions** in artboards (top, left, inset, transform);
- inline email styles, which interpolate raw token values because mail
  clients cannot read CSS variables (`@duro-app/ui-email` and a consumer's
  email templates alike).

**One list.** This list is written once, in `docs/principles/measures.md`,
under `design-system.every-measure-is-a-token`. `handoff.every-measure-a-token`
refers to it and does not restate it.

**Constraint: no visual change.** Each token's value equals the literal it
replaces, so every story renders identically. A computed-size diff proves it
(see Verification).

## Phase 1: decisions (one PR)

### 1a. ADR-0027: every measure is a token

New record `docs/adr/0027-every-measure-is-a-token.md`, with
`replaces: ADR-0016`. It carries ADR-0016's context, its drift measurements
and its reasons forward unchanged; only the geometry choice changes.

The record decides two keys:

- `ui.mockup-handoff@duro-stack`, with the choice: _Token-annotated
  artboards; component names and every design value, sizes and border widths
  included, bind through tokens; layout positions do not_.
- `ui.measures@duro-stack`, a new key declared in `.adr.yaml` next to
  `ui.mockup-handoff`, with the choice: _Every measure in design-system and
  consumer styles is a published Duro token: spacing, radius, size and border
  width; the exemptions are named_.

**Why:** in 4.5.0 a touch-target literal passed 9 plan reviewers and 4
implementation reviews, because no rule named sizes. A rule that lint and
review can cite stops that.

**Consequences:**

- `@duro-app/tokens` gains the `sizes` and `borders` groups.
- `duro/no-raw-design-values` covers size and border-width properties, at
  `error` both in Duro and in the consumer preset. That is a breaking release.
- `duro mockup check` flags raw sizes in artboards.
- Each consumer migrates in the PR that takes the new Duro major.

### 1b. Rules

**`docs/principles/ui-handoff.md`** changes to `adopts: ADR-0027`, so the
`handoff.*` rules stay active once ADR-0016 is replaced.

- `handoff.tokens-only` changes meaning, so it gets a new id:
  **`handoff.every-measure-a-token`** [constraint]. Sizes and border widths
  join the token list. For its exemptions it refers to the single list in
  `design-system.every-measure-is-a-token`; it does not restate them.
- `handoff.what-binds` [heuristic] keeps its id; only its wording changes.
  Positions are the sketch now, not geometry.
- Every reference to the old id or to ADR-0016's geometry choice inside the
  rules files is updated, including `ui-handoff.md:80`.
- Records are never edited: ADR-0023:80 keeps citing ADR-0016. A replaced
  record is still a record, so the citation is not dead to `aval check`.

**New file `docs/principles/measures.md`** (`adopts: ADR-0027`,
`applies: [ui]`), listed in `.adr.yaml` `rules:`:

- **`design-system.every-measure-is-a-token`** [constraint]:
  - In `@duro-app/ui` and in every Duro consumer's styles, a measure is a
    published token: spacing, radius, size or border width.
  - A missing token is a gap that goes upstream
    (`design-system.gaps-go-upstream`); it is never a local literal.
  - The rule body carries the exemption list itself, copied from the list
    in Context. It never refers to a section of this plan. It names:
    - `0`;
    - relative units (`%`, `vh`, `vw`, `fr`, `auto`, `min-content`…);
    - a `calc()` made only of tokens, relative units and unitless
      multipliers;
    - the 1×1 visually-hidden technique, in the single module
      `packages/ui/src/styles/visually-hidden.css.ts`;
    - SVG `viewBox` path coordinates;
    - the intrinsic canvas size of a `Diagram`;
    - media queries on the breakpoint scale;
    - layout positions in artboards;
    - inline email styles, which interpolate raw token values because mail
      clients cannot read CSS variables.
  - `duro/no-raw-design-values` is the mechanical form.
- **`design-system.a-missing-token-is-added-not-approximated`** [heuristic]:
  when no token fits, add one with the value the design needs. Never borrow
  the nearest spacing token as a size. The inventory found `spacing.md` and
  `spacing.xl` used as widths in Tree and Table.

All wording follows the agent-text rules (ADR-0026).

### 1c. Generate and check

- Run `aval heads --write` and `aval pack --write`.
- Pre-commit runs `aval check`. CI runs `aval check`, `heads --check`,
  `pack --check` and `hook install --check`.
- Commit as `feat(adr): every measure is a token`.

## Phase 2: duro-design-system (one PR, release 5.0.0)

### 2a. Token groups

Each group follows the spacing pattern in every file the Explore inventory
lists:

- `sizes.css.ts` / `borders.css.ts`, using `css.defineVars`;
- the barrel export and the package `exports`;
- `keys.ts` (`SIZES_PX`, `BORDERS_PX`) and `check-token-drift.mjs`;
- `generate-vars-css.mjs` and `mockup-css.mjs` (`GROUP_NAMES`);
- the CLI `tokens.mjs` and `docs.mjs`;
- `registry.json` and its tests;
- the eslint `TOKEN_DEEP_PATHS`.

`sizes`, with values equal to the current literals:

| token                                           | px                     | replaces                                                                   |
| ----------------------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| `touchTarget`                                   | 44                     | Toggle coarse minimum, VirtualTable row estimate                           |
| `controlSm` / `controlMd` / `controlLg`         | 28 / 39 / 40           | Toggle wrapped heights and `ROW_HEIGHT`; TagGroup minimum height           |
| `indicator` / `indicatorDot`                    | 18 / 8                 | Checkbox, Radio and SideNav icon box; the radio dot                        |
| `checkMarkW` / `checkMarkH`                     | 5 / 9                  | the Checkbox tick                                                          |
| `switchTrackW` / `switchTrackH` / `switchThumb` | 36 / 20 / 16           | Switch (thumb inset and travel become a `calc()` of these)                 |
| `iconButton` / `iconButtonSm`                   | 32 / 28                | close buttons: Dialog, Drawer, DetailPanel / ActionBar                     |
| `spinnerSm` / `spinnerMd` / `spinnerLg`         | 16 / 24 / 40           | Spinner                                                                    |
| `glyphXs` / `glyphSm` / `glyphMd`               | 10 / 12 / 16           | inline SVG glyphs: close, chevron, check, remove                           |
| `iconSm` … `iconXxl`                            | 16 / 18 / 24 / 36 / 48 | `ICON_SIZES`, which is then derived from the group's raw keys (one source) |
| `navMarkerW` / `navMarkerH`                     | 3 / 18                 | SideNav active marker                                                      |
| `scrollbar`                                     | 8                      | ScrollArea                                                                 |
| `swatchW` / `swatchH`                           | 44 / 34                | ColorInput                                                                 |
| `labelMinW` / `popupMinW`                       | 120 / 160              | Field side label, Select, Table minimum column / Menu                      |
| `listMaxH` / `listMaxHSm`                       | 280 / 200              | Select / Combobox                                                          |
| `dialogSm` / `dialogMd` / `dialogLg`            | 400 / 520 / 680        | Dialog                                                                     |
| `panelSm` / `panelMd` / `panelLg`               | 360 / 480 / 640        | Drawer, DetailPanel                                                        |
| `toastMaxW`                                     | 440                    | Toast                                                                      |
| `gridColSm` / `gridColMd`                       | 240 / 280              | Grid minimum columns                                                       |
| `pageSm` / `pageMd` / `pageLg`                  | 600 / 800 / 1200       | PageShell                                                                  |

`borders`: `hairline` 1, `strong` 2, `accent` 3, `focusRing` 2,
`focusOffset` 2, `focusOffsetSm` 1 (ColorInput). An inset ring of −2 is
`calc(-1 * focusOffset)`. Every border value in the inventory has a token;
any that the migration finds missing is added, never approximated.

- The CSS variables are `--duro-size-*` and `--duro-border-*`.
- Names may be refined during implementation; **values may not change**.

### 2b. Migrate every literal

- Each inventory row becomes its token, with a `calc()` where the value is
  derived: the Switch thumb travel, and ActionBar's
  `calc(100vw - ${spacing.xxl})`.
- Spacing tokens no longer stand in for sizes (the Tree caret and the Table
  edge fade).
- Measures used from JavaScript read the raw keys (`SIZES_PX`): VirtualTable
  `estimateRowHeight`, Table `minColumnWidth`, and Icon's SVG `width` and
  `height`.
- `Toggle/rowHeight.ts` is deleted, and ToggleGroup's `maxRows` calc reads
  the tokens.
- **`@duro-app/ui-email`** is in scope. Mail clients cannot read CSS
  variables, so its inline styles interpolate **raw token values**. The
  measure still comes from the token. The emitted email is unchanged
  byte for byte (Verification 9).
  - **Inventory, measured on `origin/main`:**
    `git grep -nE "[0-9]+px" packages/ui-email/src`
    matches **20 lines**, which is 19 runtime values
    and 1 comment.
    - `theme.ts` holds **17** of the values.
    - `components.tsx:46` has `1px solid`; `:49` has `maxWidth: '520px'`.
    - Grep reaching 0 proves the literals are gone. It does not prove the
      email output is valid; Verification 9 and 10 do.
  - **Exact conversions in `theme.ts:12` (binding):**
    - spacing from `SPACING_PX`;
    - radii from `RADII_PX`;
    - font sizes from `FONT_SIZE_REM` × the existing fixed factor **16**,
      serialized as `${rem * 16}px`:

      | theme key          | source                                | px  |
      | ------------------ | ------------------------------------- | --- |
      | `font.sizeXs`      | `FONT_SIZE_REM.fontSizeXs` (0.75)     | 12  |
      | `font.sizeSm`      | `FONT_SIZE_REM.fontSizeSm` (0.875)    | 14  |
      | `font.sizeMd`      | `FONT_SIZE_REM.fontSizeMd` (1)        | 16  |
      | `font.sizeLg`      | `FONT_SIZE_REM.fontSizeLg` (1.125)    | 18  |
      | `font.sizeXl`      | `FONT_SIZE_REM.fontSizeXl` (1.25)     | 20  |
      | `font.sizeHeading` | `FONT_SIZE_REM.fontSizeHeading` (1.5) | 24  |

      `space.*` comes from `SPACING_PX` (xs…xxxl, 4…64) and `radius.sm/md/lg`
      from `RADII_PX` (8/12/16);

    - the card `maxWidth` in **`components.tsx:49`** (not `theme.ts`) from
      `EMAIL_PX.emailCardW` (520);
    - the border from `BORDERS_PX.hairline` (1).

  - **What must not change:**
    - The exported theme keys and their **string values** are preserved
      exactly.
    - No CSS variable and no `rem` appears in emitted email styles.
    - The comment at `:32` is reworded so it holds no literal.
  - **A production-safe import.** `@duro-app/tokens/keys` exports TypeScript
    source (`packages/tokens/package.json:38`), and the email build
    (`packages/ui-email/vite.config.ts:20`) externalizes only `/raw`. So:
    - the numeric maps ui-email needs (`SPACING_PX`, `RADII_PX`,
      `FONT_SIZE_REM`, `BORDERS_PX`) are re-exported through the existing
      compiled **`/raw`** entry;
    - `/raw`'s `types` (`package.json:35`, today `./src/raw.ts`) points at
      the built **`./dist/raw.d.ts`** (vite-plugin-dts already emits it), so a
      consumer's `tsc` never type-checks token source under its own settings;
    - a new **`EMAIL_PX`** map, `{emailCardW: 520, trackingPixel: 1}`, is
      exported **only** from `/raw`. It has no CSS variable and is not a lint
      candidate, so an unrelated `width: 1` or `width: 520` is never
      autofixed to an email value;
    - ui-email imports them from `/raw` only, never from `/keys`.

- **The consumer tracking pixel.** duro-app's InviteEmail pixel
  (`duro-app/app/lib/emails/invite-email.tsx:71`) has `width="1"`,
  `height="1"` and `1px` maximum dimensions. It is outside the grep above and
  is not the visually-hidden technique.
  - At duro-app's 5.0 migration it uses `EMAIL_PX.trackingPixel`.
  - Its attributes, styles, URL and conditional rendering are preserved
    exactly.
  - That migration is duro-app's own PR (Non-goals); the value ships here.
  - **duro-app's 5.0 PR must rerun Verification 9**, all pixel and link
    combinations included, against its pre-migration SHA. duro-app turns the
    duro preset off for `app/lib/emails/**`, so no lint sees that file, and
    this rerun is the only check that the pixel is unchanged.
- **Stories, docs and recipes too, with no exemption (the person's
  decision).**
  - Stories hold 28 size literals in 13 `*.stories.tsx` files, and the
    shipped `docs/ai/recipes` hold more (login-form `maxWidth: 400`).
  - Both are already linted, so they migrate in this same PR.
  - A demo frame uses a size token or a `calc()` of tokens. Where none fits,
    a token is added.

### 2c. Lint

`no-raw-design-values` gains two property lists:

- `SIZE_PROPERTIES`: width, height, the min/max variants, flexBasis,
  blockSize and inlineSize.
- shorthands: the width inside `border`, `border*` (top, right, bottom,
  left, block, inline) and `outline` strings is parsed and checked like the
  longhand, so `border: '1px solid red'` is flagged;
- `BORDER_WIDTH_PROPERTIES`: borderWidth, border\*Width, outlineWidth and
  outlineOffset.

For those properties the rule:

- flags numeric literals and `'Npx'` strings, **negatives included**
  (today's rule skips them, `no-raw-design-values.ts:75`);
- allows the named exemptions.

**Suggestions are picked from a candidate set per property.** Several
tokens share a px value: 2 (`strong`, `focusRing`, `focusOffset`), 16, 18,
40, 44, 120 and 280. The current lookup tables are `Record<number,string>`
(`util/tokens.ts:52,64`) and would silently keep the last token. Instead,
each property has its own candidates:

| property        | candidates                     |
| --------------- | ------------------------------ |
| `border*Width`  | `hairline`, `strong`, `accent` |
| `outlineWidth`  | `focusRing`                    |
| `outlineOffset` | `focusOffset`, `focusOffsetSm` |
| size properties | `sizes.*`                      |

- When several candidates for the property share the value (only possible
  for sizes, for example 16), the message lists them and offers no autofix.
- When there is none, it says "add a token"
  (`design-system.a-missing-token-is-added-not-approximated`).
- The token-drift test fails if a lookup table drops a token because two
  share a value.

Enforcement:

- `util/tokens.ts` adds `sizes` and `borders` to `TOKEN_DEEP_PATHS`; the
  token-drift test requires it.
- Duro's `eslint.config.js` enables **only**
  `duro/no-raw-design-values: error` for `packages/ui/src/**/*.{ts,tsx}`
  (components and the new `styles/` directory alike).
- The rule gains a new option, **`exemptFiles: string[]`** (globs). Duro's
  config sets it to exactly `packages/ui/src/styles/visually-hidden.css.ts`;
  consumers' presets leave it empty.
- A test checks that
  `pnpm lint` flags a `width: 44` seeded inside a component, so the glob
  cannot silently match nothing.
- Duro's config does not enable the whole `recommended` config, whose other
  rules (`no-raw-html-element`,
  `no-deprecated-table-parts`, `prefer-ds-form-components`) are kept off
  component internals on purpose.
- The rule now also checks spacing, radius and colour in component sources,
  which it has never linted. **The finding count on `origin/main` is measured
  and recorded before the migration**, broken down by message id, and every
  finding is fixed in this PR.
- Severity is `error` in Duro and in the consumer `react` preset.

### 2c′. Measures passed as props

The style lint cannot see a measure passed as a prop string, so "every
measure" needs the props typed:

- Grid's `minColumnWidth` (whose canonical example is `"280px"`) accepts only
  size-token keys (`"gridColSm" | "gridColMd" | …`). This is a breaking type
  change, made in 5.0.0.
- Any other component prop typed as a free CSS length is typed the same way.
  - Found with:
    `git grep -nE "(Width|Height|Size|width|height|size)\??: (string|number|CSSProperties\[)" packages/ui/src/components`.
  - Props whose union is already a token-key enum are excluded.
  - The count found is recorded in the plan.
  - Each prop gets a type-error fixture.
- PageShell `maxWidth` already takes `sm|md|lg` and only maps them to the
  `page*` tokens.
- Diagram `width`/`height` are the named intrinsic-canvas exemption and are not retyped; they are not covered by the
  `viewBox` exemption.
- **A gap named in ADR-0027:** a consumer's plain `.css` stylesheets are not
  linted. Their only coverage is the rule plus review, until a stylelint
  preset exists. That preset is recorded as a follow-up, not done here.

### 2d. Mockups

- `duro mockup check` (`packages/cli/src/commands/mockup.ts`) flags raw px on
  size and border-width properties, including the width inside a `border`,
  `border-*` or `outline` shorthand (the existing fixture writes
  `border: 1px solid #333`, `test/mockup.test.ts:69`). Positions stay free.
- The seed CSS (`mockup-css.mjs`) carries `--duro-size-*` and
  `--duro-border-*`.
- `skill-template.ts:42,111` say that sizes bind and positions do not.

### 2e. Docs, registry and pack

- The CLAUDE.md token reference gets "Sizes" and "Borders" tables
  (`docs.mjs`).
- The guidance that `docs.mjs` generates stops teaching literals: Critical
  Rules §3's `borderRadius: 12` becomes `radii.md`, and the plain-CSS example's
  `border: 1px solid …` becomes `var(--duro-border-hairline)`.
- The Grid examples (`minColumnWidth="280px"`) become token keys.
- `registry.json` is regenerated, and `registry.test.ts` gets drift
  assertions.
- Meta is updated where a size is visible to users: Toggle's 44, Switch and
  Spinner.
- The vendored decisions pack is refreshed in this same PR
  (`aval add github:fredericrous/decisions`), per
  `guidance.generated-block-rides-the-change`.

### 2f. Release 5.0.0

- **Before tagging, measure the impact on consumers.** Run the 5.0.0 rule
  (the branch's plugin) on website-builder, duro-app and
  application-landscape. Record each repository's finding count in the plan
  and in the release notes. That is the migration each one owes at its bump.
- **Verification 9 and 10 must pass before the tag.** Exact HTML equality
  for the real templates and a successful render from packed artifacts are
  release blockers; Storybook parity alone does not establish email safety.
- Merge when green, then run `tag-release` for v5.0.0. The tag needs the
  audit gate, which passes today.
- The release notes say what breaks: raw sizes and border widths in
  `css.create` are now lint errors, and the two new groups are the migration
  path.
- They also say: **a consumer with email templates reruns the Verification 9
  harness against its pre-bump SHA; duro-app must** (its tracking pixel, via
  `EMAIL_PX.trackingPixel`, is checked by nothing else). The requirement is
  limited to duro-app, the only consumer with email templates today.
- The harness lives in the git repository only (ui-email publishes `dist`),
  so the notes give its command line:
  `pnpm --filter @duro-app/ui-email exec tsx scripts/render-consumer-emails.tsx --consumer <duro-app checkout> --variants <manifest.json> --base <duro-design-system SHA> --candidate <SHA>`.
  The duro-app manifest
  (the 6 variants, template entry points and locale directory) is committed
  beside the script; a future consumer supplies its own manifest.
- Verify the tarball: the `sizes.css` and `borders.css` exports, the
  `vars.css` entries, and the rule in `@duro-app/eslint-plugin`.

**Rollback.** npm is immutable, so a defect in 5.0.0 ships as 5.0.1.
Consumers on `^4` are untouched until they bump.

### Non-goals

- **Migrating consumers.** Each consumer's raw sizes are fixed in the PR that
  takes Duro 5.0 (website-builder, duro-app, application-landscape…). With
  error everywhere, a consumer cannot bump without that migration.
- Changing any rendered size.
- Layout positions.

## Verification

1. **decisions:**
   - `aval check`, `aval heads --check`, `aval pack --check` and
     `aval hook install --check` all exit 0.
   - `aval rule design-system.every-measure-is-a-token` and
     `aval rule handoff.every-measure-a-token` print the new rules.
   - `aval resolve ui.mockup-handoff --scope duro-stack` answers ADR-0027.
2. **duro, no visual change.** A script opens every Storybook story on
   `origin/main` and on the branch. It records each element's computed
   `width`, `height`, `border-*-width`, `outline-width` and `outline-offset`,
   then diffs the two runs.
   - It runs three times: default, with `:focus-visible` forced on each
     focusable element, and with `pointer: coarse`, which covers the 44px
     targets.
   - The coarse run uses CDP `Emulation.setEmulatedMedia`
     (`features: [{name: 'pointer', value: 'coarse'}]`) plus touch emulation.
     It asserts that `matchMedia('(pointer: coarse)').matches` is true before
     measuring.
   - Expected: an empty diff in all three runs.
   - The script and its output are kept as evidence.
3. **duro, lint:**
   - `pnpm lint` exits 0 on the branch.
   - A fixture test of `no-raw-design-values` flags `width: 44`,
     `minHeight: '28px'` and `borderWidth: 2`.
   - The same test allows `0`, `'100%'`, `'85vh'`, a token, a calc of tokens,
     and the `srOnly` exemption.
   - The **branch's plugin**, run on `origin/main`'s sources (`packages/ui`,
     stories, recipes), reports the exact count, measured and recorded before
     the migration and broken down by message id. After the migration it
     reports 0.
   - Collision fixtures:
     - `borderWidth: 2` suggests `borders.strong`;
     - `outlineWidth: 2` suggests `borders.focusRing`;
     - `outlineOffset: 2` suggests `borders.focusOffset`;
     - `width: 16` lists its candidates and offers no autofix.
   - A fixture allows `calc(-1 * focusOffset)`.
   - `maxWidth: 520` suggests `sizes.dialogMd` only, and `width: 1` never
     suggests anything from `EMAIL_PX`.
   - The fixture `border: '1px solid red'` is flagged.
   - **The exemption is live.** A 1px `width` passes inside
     `packages/ui/src/styles/visually-hidden.css.ts`. The same code in
     `packages/ui/src/styles/x.css.ts` and in a component fails. `pnpm lint`
     reports 0 for `packages/ui/src/styles/`.
   - `git grep -nE "[0-9]+px" packages/ui-email/src` reports 0 after the
     migration (it was 20 lines on main). This proves only that the literals
     are gone.
   - `aval rule design-system.every-measure-is-a-token` prints all nine
     exemptions and does not contain the word "Context".
   - The glob check flags a `width: 44` seeded inside a component.
   - `minColumnWidth="280px"` is a type error.
4. **duro, tokens:**
   - `check-token-drift`, `registry.test.ts` and `token-drift.test.ts` pass.
   - `dist/vars.css` contains `--duro-size-touch-target: 44px` and
     `--duro-border-hairline: 1px`.
5. **duro, mockup check:**
   - An artboard with `width: 44px` on a control fails.
   - One with `border: 1px solid` fails.
   - One with `border: var(--duro-border-hairline) solid` passes.
   - One with `top: 120px` passes.
6. **duro, suite:** typecheck, the unit tests and the full Storybook run pass.
7. **Consumer impact**, recorded before the tag: the 5.0.0 rule's finding
   counts for website-builder, duro-app and application-landscape.
8. **duro, release:** `@duro-app/tokens@5.0.0` exports `./tokens/sizes.css`
   and `./tokens/borders.css`, and the published eslint-plugin flags
   `width: 44`.
9. **Email output is byte-identical (blocks the release).** The real
   templates live in duro-app: `InviteEmail` (`app/lib/emails/invite-email.tsx`)
   and `CertRenewalEmail` (`app/lib/emails/cert-renewal-email.tsx`). Its
   tests check only selected content, so this check compares the whole
   HTML.
   - **Harness:**
     1. Check out duro-app at the recorded SHA.
     2. `npm install` the tarballs `@duro-app/tokens` and `@duro-app/ui-email`,
        packed from each duro-design-system SHA (baseline, then candidate).
        `git diff package-lock.json` must touch only those two entries.
     3. Render with the committed script
        `packages/ui-email/scripts/render-consumer-emails.tsx`, run with
        `tsx` (duro-app's templates are `.tsx`), through
        `@react-email/render` with fixed options and the real i18next locale
        files.
     4. Compare the full HTML strings.
   - Render those same consumer sources twice: once against the baseline
     packages and once against the candidate packages.
   - Cover every variant:
     - InviteEmail: all 4 combinations of tracking pixel present/absent ×
       tracking link present/absent;
     - CertRenewalEmail: reveal link present/absent;
     - a ui-email primitive fixture covering the remaining primitive
       variants and style overrides.
   - **Frozen:** the inputs, the translations, the React and React Email
     versions.
   - **Recorded:** the baseline commit SHAs of duro-design-system and
     duro-app.
   - **Fails on any HTML difference**, including Outlook conditional markup
     and dark-mode CSS.
10. **Packed artifacts render (blocks the release).** A smoke test:
    - `pnpm pack`s `@duro-app/tokens` and `@duro-app/ui-email`;
    - installs them in a scratch directory;
    - renders the **Verification 9 primitive fixture** in plain Node,
      **without workspace aliases and without a TypeScript loader**, and
      asserts its HTML equals the source-level render;
    - type-checks an import of the tarballs' types under `tsc` with
      `skipLibCheck: false`;
    - asserts that the packed `@duro-app/tokens/package.json` has
      `exports['./raw'].types` = `./dist/raw.d.ts` and that the tarball
      contains `dist/raw.d.ts`.
      This catches packaging failures (a `/keys` import, a missing `/raw`
      export) that source-level rendering misses.
11. **Preview approval:** a guided preview on Storybook (Duro is a UI repo),
    before the Duro push.

## Decision log

- **2026-10-06, the person:** component sources, linted for the first time,
  held 51 non-size findings. They get exact tokens, so nothing moves:
  - `microSpacing` px1/px2/px3/px5/px6, in its own group, so `SpacingToken`
    (and every `gap=` prop) keeps its eight steps;
  - `radii.px6`;
  - `colors.scrim`, `inverseFill(Hover)`, `inverseBorder(Hover)` and
    `fixedLight`, the same in every theme;
  - `duration.minimal/quick/brisk`, and `easing.linear`.
- **2026-10-06, the person:** story and doc frames map to the nearest
  existing size token (300→gridColMd, 320→panelSm, 560→pageSm, 700/720→
  dialogLg, 900→pageMd, 1120→pageLg, 50→iconXxl). No demo-only token is
  published. Verification 2 therefore expects differences inside those
  stories only.
- **Tokens the inventory missed**, added with exact values: `sizes.divider`
  (1, the ActionBar separator), `sizes.tabIndicator` (2), and
  `sizes.edgeFade` (32, the Table edge fade, which had borrowed
  `spacing.xl`).
- **A raw `#ffffff` now suggests `colors.fixedLight`**, not `colors.bg`
  (`bg` is near-black in the dark theme). This goes in the release notes.
- **The email harness** is `node packages/ui-email/scripts/render-consumer-emails.mjs`
  (plain Node; adding `tsx` to Duro would change its lockfile). Its render
  entry is `.tsx` and runs under the consumer's own `tsx`. It packs both
  tarballs at the versions the consumer already pins, so the dependency
  tree keeps its shape. The first run caught a nested-copy lockfile change
  with a dummy version.
- **The Verification 10 type check** uses `bundler` resolution and counts
  only errors in `@duro-app/*` or in the check file. Third-party
  declarations with missing `@types` peers are not this release's to fix.
  Found while doing it: ui-email's `.d.ts` uses extensionless relative
  imports, which `nodenext` consumers reject. This predates the branch and
  is a follow-up.
- **2026-10-06, the person, on implementation-review finding 1:** the
  artboard root's 1120×840 canvas is not exempted. The seed writes
  `--duro-mockup-canvas-width/height` into its token block (canvas constants,
  not design tokens), and the root reads them through `var()`. The check has
  no geometry exemption, and ADR-0027's list stays as written. An artboard
  with an inline `width: 1120px` on its root is now flagged until rewritten.
- **2c′ count:** the plan's grep found 8 public length props, all retyped:
  Grid `minColumnWidth`, InputGroup.Addon `minWidth`, ScrollArea.Viewport and
  VirtualTable `maxHeight`, Table.Root and FromTanstack `minColumnWidth`, and
  Table.HeaderCell `width`/`compactWidth`. The other grep hits are internal
  state, style-function parameters, or `estimateRowHeight` (a px input to
  the virtualizer, not a CSS length).
- **Table header cell `width`/`compactWidth`** are typed `GridTrack` (Length,
  `Nfr`, `minmax()`, `fit-content()`). The arguments inside a track
  function are not type-checked. This is a named gap, like plain `.css`.
- **The lint-js gate refuses any warning in a staged file.** Unused imports
  in touched stories were removed, and the Spacing doc story's `flexGrow: 1`
  was removed: react-strict-dom forces flex-grow to 0 on web, so the
  declaration was already dead.

## Verification results (observed before the push)

Input → expected → actual. Evidence is under
`~/.claude/amont-agent/attestations/` (`email-v9-*`, `v2-size-diff-*`).

1. **decisions:** decisions#43, merged as `eb64959`.
   - The four `aval` checks → exit 0 → exit 0.
   - `aval resolve ui.mockup-handoff` and `aval resolve ui.measures` → ADR-0027 → ADR-0027.
2. **No visual change:** 328 stories × (default, focus, coarse), baseline
   `origin/main` against the branch build.
   - **Expected:** differences only inside the story frames the person
     mapped.
   - **First run:** found a real regression. The inset focus rings of Tabs,
     Tree and Table had flipped from −2 to +2 (`99448519` fixes it).
   - **Rerun:** default run, 0 stories outside the mapped frames. The
     remaining focus and coarse rows are play-function timing: element sets
     differ between runs, and the baseline differs from its own earlier run.
     Probing them after the play settles gives identical width and content.
     The Storybook a11y vision-filter SVG is excluded as noise.
3. **Lint:**
   - `pnpm lint` → 0 errors → 0 errors (19 warnings, all from before this
     branch).
   - **Branch plugin on main's sources** → recorded → 274 findings in 72
     files: rawMeasure 167, ambiguousMeasure 35, missingMeasureToken 30,
     offScaleSpacing 23, rawColor 6, rawDuration 5, rawRadius 2, and 1 each
     of rawFontSize, rawFontWeight, rawEasing, rawColorToken, offScaleRadius
     and rawSpacing.
   - **After the migration** → 0 → 0.
   - **Seeded checks:** `width: 44` in a component → error → error. The
     same 1px in `styles/x.css.ts` → error → error. In the exempt module →
     none → none.
   - **Fixtures:** every one listed in plan V3 → passes → passes. Exception:
     `width: 1` now suggests `sizes.divider`, never `EMAIL_PX`.
   - **ui-email grep** → 0 → 0.
   - **Type fixtures:** in `shared/length.typecheck.tsx`. Falsified: allowing
     px fails 9 checks.
4. **Tokens:**
   - The drift check, `registry.test.ts` and `token-drift.test.ts` → pass →
     pass.
   - `vars.css` has the `--duro-size-*`, `--duro-border-*` and
     `--duro-micro-spacing-*` variables → yes → yes.
5. **Mockup check:** `width: 44px` and `border: 1px solid` fail.
   `var(--duro-border-hairline)`, `top: 120px` and the 1120×840 root pass.
   As expected.
6. **Suite:**
   - Typecheck → pass → pass.
   - Unit tests → 317/317 → 317/317. Under a load average above 40, the
     `hook-pin` CLI tests time out intermittently; they pass on rerun.
   - Storybook → 328/328 → 328/328.
7. **Consumer impact:** the branch rule against the 4.5 rule, over every
   `.ts`/`.tsx` file in `origin/main`:
   - **website-builder** (`294bd2b`): +96 new findings (54 raw size/border,
     32 with no token yet, 10 ambiguous). Separately, 70 off-scale spacings
     and 7 radii relabel to `microSpacing` and `radii.px6`.
   - **duro-app** (`1e82093`): +31 (21 raw, 4 with no token yet, 6
     ambiguous).
   - **application-landscape** (`816cf4e8`): 0.
8. **Release:** after the tag (`tag-release`).
9. **Email (blocks the release):**
   - **Setup:** duro-app `1e82093`, baseline `c1ad41b0`, candidate
     `99448519`.
   - **Expected:** 8 renders byte-identical. **Actual:** 8 identical.
   - **Frozen versions:** React 19.2.4, @react-email/render 2.0.8,
     components 1.0.12, i18next 25.10.10, react-i18next 16.6.6, tsx 4.23.15.
   - **Falsified:** a 1px change to `space.md` makes 7 of 8 renders
     DIFFERENT, and the harness FAILs.
10. **Packed artifacts (blocks the release):** the five checks → ok → ok.
    Falsified: an injected type error is caught.
11. **Preview:** pending the person's approval before the push.

<!-- panel: repos=duro-design-system,decisions reviewers=backend body-sha=f5006c2288ec -->
