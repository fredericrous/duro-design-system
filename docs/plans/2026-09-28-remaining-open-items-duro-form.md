---
status: active
branch: fix/form-subpath # home repo; others per Phases
repos: [duro-design-system, duro-lexical-multi, website-builder, duro-app]
adrs: [ADR-0022, ADR-0023] # + a local duro-design-system ADR (Phase 2)
---

# Remaining open items: Duro form peers, link editor, hook deps, test race

Plan home: **duro-design-system** (it owns the packaging decision). The other
repos carry a pointer file of the same name listing their phases.

## Goal

Close the items left open by the lexical-multi 0.3.0 work: an app using
`@duro-app/ui` without a form stops needing Form's peers; confirming a new link
in the editor applies the URL instead of deleting the linked text; lexical-multi
lints clean; website-builder's DesignSystemTab test race is gone.

## Non-goals

- Migrating consumers other than the two that must move: of 9 consumers only
  duro-app imports `Form` from the root (`app/components/CertGate/CertGate.tsx:5`,
  `app/routes/setup.tsx:16`); it gets a PR (Phase 10). The rest stay on 3.x
  until they next bump (none imports `Form`/`FormProps`/`LabelPosition`/
  `NecessityIndicator` from the root — parsed, incl. multi-line and `import type`).
- Changing how `Field`/`Input` bind to a form (they keep `react-hook-form`).
- The lexical 0.41 (lexical-multi) / 0.45 (`packages/editor`) skew in
  website-builder: recorded as a follow-up unless Phase 5 shows it causes the bug.

## Behaviour

1. **Duro 4.0.0.** `Form`, `FormProps` import from `@duro-app/ui/form`,
   mirroring `@duro-app/ui/table`. Nothing reachable from the root entry
   imports `@hookform/resolvers` or `effect` (only `Form.tsx:12` does;
   `effect` is type-only there), so they are genuinely optional peers.
   `react-hook-form` becomes a required peer (Field uses it, native too; every
   consumer package already has it). `LabelPosition`/`NecessityIndicator` stay
   root exports (Field needs them; `FormContext.ts` imports only react).
2. **Link editor (lexical-multi 0.3.1).** Select text → Link → type a URL →
   Enter (or ✓) links the selected text to that URL — in a MultiEditorProvider
   with several editors and a shared floating anchor (website-builder's shape).
   Today it deletes the text ("Visit Duro now" → "Visit now"). Editing an
   existing link keeps working.
3. **lexical-multi lint.** 0 warnings (was 3 `react-hooks/exhaustive-deps`).
4. **website-builder.** DesignSystemTab's `install()` helper no longer clicks
   Install while it is still disabled; the app runs lexical-multi 0.3.1 and
   Duro 4.0.0 and the link flow in (2) works in the canvas.

## Phases

duro-design-system — PR 1 (branch `fix/form-subpath`)

- [x] Phase 1 — `packages/ui/src/form.ts` exports `Form`, `FormProps`; remove
      only `index.ts:37` (the `Form` export), keep the `LabelPosition`/
      `NecessityIndicator` type exports; `vite.config.ts` `lib.entry.form`;
      `package.json` exports `./form` (source/import/types) like `./table`;
      `peerDependenciesMeta`: `react-hook-form` no longer optional.
- [x] Phase 2 — `extractSurface(project, 'packages/ui/src/form.ts',
'@duro-app/ui/form', surface)` next to the table line in
      `packages/cli/scripts/build-registry.mjs` (recipes map by `importPath`,
      `scripts/lib/recipes.mjs:54`); regenerate with `--write-docs`; hand-edit
      `CLAUDE.md` (stack line, Form Composition Pattern imports, a subpath note
      beside the Data Table one) and `.cursorrules:47`; ADR "a component whose
      peer is optional lives behind a subpath" in `docs/adr/`, declared as this
      repo's first local key in `.adr.yaml` (`aval check` green); BREAKING note
      for 4.0.0 naming the one-line migration.
- [ ] Phase 3 — verify (below) → preview (Storybook, ADR-0023) → push → PR →
      merge-when-green.
- [ ] Phase 4 — tag **v4.0.0** (approved) from a clean worktree at the merge;
      verify the published tarball.

duro-lexical-multi — PR 2 (branch `fix/link-editor-submit`)

- [x] Phase 5 — red first: a story with **two** editors under one
      MultiEditorProvider and a shared floating anchor, driving select → Link →
      type → Enter and ✓; asserts the text survives and `href` is the typed URL,
      plus a link-edit regression. While red, instrument to NAME the mechanism
      (`registerUpdateListener` with dirty nodes/tags; CRITICAL-priority listeners
      on KEY_ENTER / INSERT_PARAGRAPH / DELETE_CHARACTER / REMOVE_TEXT logging the
      active editor) and record it in the Decision log. Then the robust submission
      whatever the cause: `preventDefault` + `stopPropagation` on Enter/Escape/✓;
      submit inside `editor.update`; if `$getSelection()` is not a range,
      `$setSelection(lastSelection.clone())`; `$findMatchingParent(node,
n => $isLinkNode(n) && !$isAutoLinkNode(n))` → `setURL`, else
      `$toggleLink(url)`; only the editor whose `isLink` is true renders/focuses
      its input (`isLinkEditMode` is shared across editors, `MultiEditorContext.tsx:48`).
- [x] Phase 6 — hook deps: hoist `defaultConfig` to module scope
      (`MultiEditorContext.tsx`; `PlaygroundNodes`/`DuroEditorTheme` are module
      constants); drop `activeEditor` from `$updateToolbar`'s deps in
      `useFormatText.ts`/`useFormatElement.ts` (it closes over nothing that
      changes; the registering effects depend on `[editor, $updateToolbar]`) and
      the then-dead `activeEditor` state.
- [ ] Phase 7 — `@duro-app/*` devDeps → 4.0.0, peer `@duro-app/ui`
      `^3.7.0 || ^4.0.0`, `0.3.1`; verify → preview (Storybook) → push → PR →
      merge → tag **v0.3.1** (approved).

website-builder — PR 3 (branch `fix/lexical-0-3-1`)

- [ ] Phase 8 — `DesignSystemTab.test.tsx` `install()`: after each pick wait
      for the chosen file name, then `waitFor` Install to be enabled before
      clicking; in the second owner round also wait for `w.server.getActive()` to
      differ from the value captured before `install()`.
- [ ] Phase 9 — `@fredericrous/lexical-multi ^0.3.1`; `@duro-app/ui ^4.0.0`
      in the 4 packages, `@duro-app/tokens ^4.0.0` in builder-webapp only; lock via
      `--lockfile-only` + strip Forgejo tarball URLs (`.npmrc`); CLAUDE.md pin;
      verify → preview (webapp) → push → PR → merge.

duro-app — PR 4 (branch `build/duro-ui-4`)

- [ ] Phase 10 — `@duro-app/ui` (+ tokens/cli if declared) → `^4.0.0`; the two
      files import `Form` from `@duro-app/ui/form`; verify the two routes
      (`/setup`, the CertGate flow) → preview → push → PR → merge.

## Decision log

- 2026-09-28 — Form moves to `@duro-app/ui/form` (major 4.0.0) rather than
  declaring its peers required: `Field` needs only `react-hook-form`, while
  `@hookform/resolvers`/`effect` serve `Form` alone (builder-native has no
  `effect`), and `./table` set the pattern. (Person's choice.)
- 2026-09-28 — Releases included: Duro 4.0.0, lexical-multi 0.3.1, then
  website-builder and duro-app adopt. (Person's choice, work.release-on-request.)
- 2026-09-28 — Staff review folded in: the consumer claim was wrong (duro-app,
  2 files → Phase 10); the link fix's mechanism is unproven (setURL ≡ what
  `$toggleLink` already does) → Phase 5 names it first; the test race is a
  disabled-button click in `install()`, not an early unmount.
- 2026-09-28 — The subpath rule is recorded as duro-design-system's first
  local ADR (`docs/adr/0001-optional-peer-behind-subpath.md`, key
  `packaging.optional-peer-entry`). There is no changelog in this repo, so the
  BREAKING note goes in the commit, the PR and the v4.0.0 release body.
- 2026-09-28 — Link bug mechanism, named by instrumenting the live editor
  (update listener + a listener on every registered command, real keys via
  Playwright): Enter in the URL field → `TOGGLE_LINK_COMMAND` applies the URL →
  Lexical restores the DOM selection onto the link text and fires
  `FOCUS_COMMAND` → the same, unconsumed Enter arrives in the editor as
  `BEFORE_INPUT` → `INSERT_PARAGRAPH` over that selection, replacing "Duro" and
  its link. ✓ never failed (a click has no text default). Not the lexical
  version skew. Fix: the field consumes Enter/Escape; the submit restores
  `lastSelection` when the host dropped it. The `setURL`/`$findMatchingParent`
  rewrite was dropped — `$toggleLink` was never the fault.
- 2026-09-28 — Found while verifying: with two editors, one whose caret sits in
  a link, the shared `isLinkEditMode` opened TWO URL fields that fought for
  focus. `Editor` now opens its field only when it is the provider's current
  editor. Covered by its own story.
- 2026-09-28 — user-event never performs a key's default action, so the Enter
  story asserts the contract that failed (the keydown is `defaultPrevented`);
  the end-to-end check with real keys is the Playwright run below.
- 2026-09-28 — Tagging v4.0.0 was refused by the pre-push audit gate (67
  advisories, all transitive, all dev/build tooling). A blanket in-range
  `pnpm update` pulled majors through open ranges (`@tanstack/react-table
  > =8`→ 9,`@eslint/js`→ 10) and broke typecheck/build; the fix is`pnpm audit --fix`overrides in`pnpm-workspace.yaml` with every target
bounded to its patched major (`^x.y.z`, not `>=`). Published manifests are
  > untouched.

## Verification

- P1–3: walk every chunk and `.d.ts` reachable from `dist/index.js` → no
  `@hookform/resolvers` / `effect` import; a scratch consumer builds against
  the root with those two packages DELETED from node_modules, and imports
  `Form` from `@duro-app/ui/form` when they are present (as the table split
  was proven); `duro login-form --source-only` prints
  `from '@duro-app/ui/form'`; `build-registry --check --check-docs`.
  - Observed (2026-09-28): `dist/index.js` chunk graph externals =
    react, react-dom, react-hook-form, react/jsx-runtime; `dist/form.js` adds
    `@hookform/resolvers/effect-ts`. `index.d.ts` graph (63 files) imports
    neither package.
  - Observed: scratch consumer from the packed tarballs, npm
    `--legacy-peer-deps`, `node_modules/@hookform` and `effect` absent →
    `import {Button} from '@duro-app/ui'` builds (exit 0); `import {Form}
from '@duro-app/ui/form'` fails with `effectTsResolver is not exported
by __vite-optional-peer-dep:@hookform/resolvers/effect-ts` (the peer
    requirement now sits where it belongs); after installing the two peers
    the Form build succeeds (exit 0).
  - Observed: `duro login-form --source-only` prints `import {Form} from
'@duro-app/ui/form'`; `duro Form` heads with the same import;
    `build-registry --check --check-docs` → up to date; `aval check` → 22
    records, no findings.
- P4: `npm pack @duro-app/ui@4.0.0` → `exports["./form"]`, root chunk graph
  as in P1–3.
- P5: new story red on main (text deleted, mechanism logged), green after;
  link-edit story green; Storybook preview: select → Link → type → Enter.
  - Observed (lexical-multi@ae9fd4f): `NewLinkConfirmedWithEnter` red on the
    unfixed plugin (`defaultPrevented` false), green after;
    `NewLinkInSecondEditorWhileFirstSitsInALink` red on the unfixed `Editor`
    (two URL fields), green after; Toolbar + EditorAppearance stories 11/11.
  - Observed, real keys (Playwright): main build — select "Duro" → Insert link
    → type → Enter → `"Visit  now"`, 2 paragraphs, no link; ✓ → linked.
    Fixed build, second editor while the first holds a link — Enter and ✓
    both → `"Visit Duro now"`, 1 paragraph, `Duro→https://duro.example`.
- P6: `eslint --max-warnings 0` on the three files; toolbar stories green.
  - Observed: `pnpm lint --max-warnings 0` exit 0 (was 3 warnings); the
    three files alone exit 0; toolbar stories green.
- P8: make the mocked picker dispatch `change` in a `setTimeout` → the test is
  red on main, green after; webapp suite 3× green.
- P9: webapp localhost (production build): canvas text → Link → type URL →
  Enter → the text links to it (reproduced as broken on main).
- P10: duro-app `/setup` form renders and submits; CertGate form renders.

## Outcome
