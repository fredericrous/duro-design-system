---
status: active
branch: fix/token-subpath-types
repos: [duro-design-system]
adrs: []
---

# Duro 5.37.2: token subpaths typed from dist, plugin built on install

## Review panel

👉 **Decide:** none. The person chose types → built `d.ts` and "Plugin + tokens" on install. Approve if a slower `pnpm install` is acceptable; the cost is measured, and anything above ~30 s comes back to the person.
📍 duro-design-system · nothing built yet · next: Phase 1, the token exports. Panel: backend (opus-5-5), delta panel per plan-panel; codex skipped (delta).
**Changed by review:** `prepare` also builds tokens, because `cli`'s typecheck needs it on a fresh worktree; CI deletes tokens `dist` before typechecking `ui`, so the check can fail; the install-time cost and the install-fails-on-build-error risk are recorded.
**Verdicts:** round 1 approve-with-changes (5 accepted); round 2 approve-with-changes (1 high, 2 low applied, 1 cosmetic not patched); re-run approve; the person's change (parallel builds): delta approve-with-changes (2 accepted), final body approve.
📄 Full reviews: [2026-10-30-token-subpath-types.reviews.md](2026-10-30-token-subpath-types.reviews.md)

## Context

Two items left open after 5.37.1 (duro#156, plan `docs/plans/2026-10-30-published-types-nodenext.md`); the person chose the recommended fix for each.

- **Four token subpaths are still untyped for nodenext consumers.**
  - Every `@duro-app/tokens` subpath export of the StyleX token files (`./tokens/*.css`, `./themes/*.css`) and `./keys` is a plain string pointing at raw source, e.g. `"./tokens/layers.css": "./src/tokens/layers.css.ts"`. StyleX's build and Metro need that source.
  - Four of those sources import siblings without an extension: `tokens/layers.css.ts` → `../keys`, `tokens/type-presets.css.ts` → `./typography.css`, and `themes/light.css.ts` / `themes/high-contrast.css.ts` → `../tokens/colors.css` and `../tokens/shadows.css`. A nodenext consumer importing them gets `any`, so 5.37.1 excludes them from attw by name.
  - Yet the package already ships a built declaration for every one of them: `dist/tokens/*.css.d.ts`, `dist/themes/*.css.d.ts` and `dist/keys.d.ts`, with explicit `.js` specifiers since 5.37.1.
  - The `.`, `./raw` and `./theme` exports already use a conditional shape whose `types` points at `dist`.
- **A fresh worktree's first commit fails the `lint-js` gate.**
  - amont's built-in `lint-js` runs `eslint` directly, and `eslint.config.js` imports `@duro-app/eslint-plugin`, whose exports point at `dist/`.
  - The repo's declared `lint` gate (`pnpm run lint`) builds that plugin first, but runs in parallel. On a fresh worktree `lint-js` fails with `ERR_MODULE_NOT_FOUND` (hit on 2026-10-30).
  - The root `prepare` script is `amont init`.

## Decisions

- **Every token subpath gets the `./theme` shape** (the person: "types → built d.ts"), for the 14 `./tokens/*.css` and `./themes/*.css` entries and `./keys`:

  ```json
  "./tokens/layers.css": {
    "react-native": "./src/tokens/layers.css.ts",
    "source": "./src/tokens/layers.css.ts",
    "types": "./dist/tokens/layers.css.d.ts",
    "default": "./src/tokens/layers.css.ts"
  }
  ```

  - **Order matters.** `react-native` and `source` come before `types`, so Metro and in-repo TypeScript with `customConditions: ["source"]` keep reading source.
  - **Bundlers and StyleX are unchanged.** Vite, webpack and the StyleX babel plugin match `default`, which is still source.
  - **TypeScript consumers change.** Under any resolution, they match `types` and read the built declarations.

- **`ui`'s web tsconfig gets `customConditions: ["source"]`.** Its 205 files that import token subpaths keep typechecking against source, with no prior build. `ui-email` and `eslint-plugin` already set it. `ui`'s native tsconfig already resolves `react-native`. `cli` (nodenext, one import of a token subpath) cannot read source and keeps reading built declarations, as it has since 5.37 (CI builds before typecheck since #155). Measured in Verification row 4, not assumed.
- **attw exclusions shrink to stylesheets only.** In `packages/tokens/package.json`'s `check:types`, the four source entries are removed from `--exclude-entrypoints`. `./vars.css` and `./mockup.css` stay: they are real CSS, with no types to check. `internal-resolution-error` stays never ignored.
- **The plugin and tokens are built on install** (the person: "Build on install", then "Plugin + tokens" after review). Building only the plugin leaves `cli`, which reads `@duro-app/tokens/theme` from `dist` under nodenext, failing the pre-commit `typecheck` gate on a fresh worktree. The root `prepare` becomes `amont init && pnpm --no-sort --filter @duro-app/eslint-plugin --filter @duro-app/tokens run build`. The two builds run in parallel (the person: "build the plugin and tokens in parallel"). `eslint-plugin`'s source never imports `@duro-app/tokens`: the workspace dev dependency serves its tests, and its tsconfig resolves `source`. So only pnpm's topological sort serialized them, and `--no-sort` lifts it. If the plugin ever starts reading tokens' built output, this flag must go. Verification row 9 checks that today; a future import from `src` would compile silently, so the flag's comment-free home in `prepare` is named in the plugin's README dependency note. Every `pnpm install` then leaves both `dist` folders built: a fresh worktree, CI, and the rehearsal snapshot (`set snapshotPrepare pnpm install --offline …` in `amont.conf`). Both lint gates keep running, so `lint-js` still holds changed files to zero warnings. Accepted risk: `lint` rebuilds `eslint-plugin/dist` in place (`tsc`, no clean) while `lint-js` reads it, so on a commit that changes a rule, `lint-js` lints with the rules built at install time. Checked in Verification row 8. Accepted risk: `pnpm install` (and the rehearsal snapshot) now fails whenever the tokens or eslint-plugin build fails; `pnpm install --ignore-scripts` is the workaround.
- **Release 5.37.2** with a patch changeset for `@duro-app/tokens` and `@duro-app/ui`. `ui`'s tsconfig change is not published, but the changeset text names the token types.

## Phases

### Phase 1: token exports

- `packages/tokens/package.json`: rewrite the 15 exports into the shape above. Each `types` path must exist in a built `dist` (Verification row 1).
- `packages/tokens/package.json`: drop the four source entries from `check:types`.
- `packages/ui/tsconfig.json`: add `customConditions: ["source"]`.
- `.github/workflows/ci.yml`: before `Build libraries`, add `rm -rf packages/tokens/dist && pnpm --filter @duro-app/ui run typecheck`, so CI proves row 3. The `rm` is required: `pnpm install` now runs `prepare`, which builds `packages/tokens/dist` before this step (ci.yml:86), and `pnpm build` also runs before `pnpm typecheck`, so without it `dist` always exists there.

### Phase 2: build on install

- Root `package.json`: change `prepare` to the command above.
- Record the time it adds to `pnpm install` (`time pnpm --no-sort --filter @duro-app/eslint-plugin --filter @duro-app/tokens run build` against the sorted run, back to back, 3 runs each, median and load average recorded) in the PR, plus the change in the CI `pnpm install` step time (5 jobs install). If it is above about 30 s, it goes back to the person before the push. The Native bundle job's `Build tokens` step becomes redundant; it is kept.

### Phase 3: release

- One PR, merged on green, then tag v5.37.2 (the tag-release skill).

## Non-goals

- No source import changes; the Metro/Vite platform split depends on them.
- No change to the CSS exports (`./vars.css`, `./mockup.css`, `ui`'s and `diagrams`' `.css` entries); they stay excluded from attw.
- No `skip lint-js` in `amont.conf`; the person chose to keep both lint gates.

## Verification

| #   | Check                                                                                                                                                                                                                                             | Expected                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `pnpm build`, then every `types` path in `packages/tokens/package.json` exists on disk                                                                                                                                                            | all 15 (plus `.`, `./raw`, `./theme`) exist                                                                                                       |
| 2   | `pnpm check:types-packed` with the four exclusions removed                                                                                                                                                                                        | exit 0; `@duro-app/tokens/tokens/layers.css`, `/tokens/type-presets.css`, `/themes/light.css`, `/themes/high-contrast.css` green under node16 ESM |
| 3   | `packages/ui`: delete `packages/tokens/dist`, run `pnpm --filter @duro-app/ui run typecheck`, then rebuild                                                                                                                                        | exit 0 (web reads `source`, native reads `react-native`)                                                                                          |
| 4   | Same with `packages/tokens/dist` deleted, for `cli`                                                                                                                                                                                               | recorded as measured: expected to fail as it has since 5.37, which CI covers by building first                                                    |
| 5   | Fresh worktree from the branch: `pnpm install --frozen-lockfile`, then `ls packages/eslint-plugin/dist/index.js packages/tokens/dist/theme.d.ts`, then a commit touching one `packages/ui/src/*.ts` file                                          | both files exist; `typecheck`, `lint` and `lint-js` all pass on the first commit                                                                  |
| 6   | Storybook build and the Native bundle job (CI on the PR)                                                                                                                                                                                          | green: Vite and Metro still resolve source                                                                                                        |
| 8   | Fresh worktree: commit a change to `packages/eslint-plugin/src` plus one `ui` `.ts` file, 3 times                                                                                                                                                 | no `ERR_MODULE_NOT_FOUND` or syntax error from `lint-js`                                                                                          |
| 9   | Search `packages/eslint-plugin/src` for `from '@duro-app/tokens` and `import('@duro-app/tokens`                                                                                                                                                   | 0 matches: the plugin build reads nothing tokens builds, so `--no-sort` is safe                                                                   |
| 7   | After 5.37.2: a scratch nodenext consumer with `skipLibCheck: true` imports `colors` from `@duro-app/tokens/tokens/colors.css`, `layers` from `/tokens/layers.css` and `light` from `/themes/light.css`, with a `@ts-expect-error` on a wrong use | the expected errors hold: real types, not `any`                                                                                                   |

## Verification record

Observed before the push, on the branch.

| #    | Input                                                                                                                                                         | Expected                      | Actual                                                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `pnpm build`, every `types` path in `packages/tokens/package.json` on disk                                                                                    | all exist                     | 18 `types` entries, none missing                                                                                                                |
| 2    | `pnpm --filter @duro-app/tokens run check:types`, only `./vars.css`, `./mockup.css` excluded                                                                  | exit 0, the four green        | exit 0; `tokens/layers.css`, `tokens/type-presets.css`, `themes/light.css`, `themes/high-contrast.css` all `node16 (from ESM): 🟢 (ESM)`        |
| 3    | `rm -rf packages/tokens/dist`, `pnpm --filter @duro-app/ui run typecheck`                                                                                     | exit 0                        | exit 0 (web via `source`, native via `react-native`)                                                                                            |
| 4    | same, `pnpm --filter @duro-app/cli run typecheck`                                                                                                             | fails, as since 5.37          | exit 2, `Cannot find module '@duro-app/tokens/theme'`; covered by `prepare` building tokens and by CI building first                            |
| 5    | fresh throwaway worktree from 5d4d1ffc: `pnpm install --frozen-lockfile`, both `dist` files, a commit touching `packages/ui/src/components/Button/Button.tsx` | both exist, every gate passes | install exit 0; `eslint-plugin/dist/index.js` and `tokens/dist/theme.d.ts` present; commit exit 0, 29 checks passed                             |
| 5b   | current tree (after `--no-sort`): delete both `dist` folders, `pnpm install --frozen-lockfile`                                                                | both rebuilt, builds overlap  | exit 0; both files present; log: `eslint-plugin build$` starts, `tokens build$` starts, `eslint-plugin build: Done` before `tokens build: Done` |
| 8    | same worktree, 3 commits each changing `packages/eslint-plugin/src/rules/*.ts` and `Button.tsx`                                                               | no lint-js error              | 3 commits exit 0, no `ERR_MODULE_NOT_FOUND` or syntax error (worktree then removed)                                                             |
| 9    | `grep` for `from '@duro-app/tokens` / `import('@duro-app/tokens` in `packages/eslint-plugin/src`                                                              | 0                             | 0                                                                                                                                               |
| cost | `pnpm --filter … run build` (sorted) vs `pnpm --no-sort …` (parallel), back to back, 3 runs                                                                   | median under ~30 s            | sorted 15 / 21 / 21 s, parallel 10 / 22 / 7 s, at load 9.5 / 13.6 / 25.2: median 21 s sorted, 10 s parallel                                     |

Rows 6 (Storybook and Native bundle) and 7 (published 5.37.2) are observed on the PR and after the release.

## Implementation review

- **Round 1 (tree 1e707a1d):** approve (74k, 44 s), no findings. Its hand checks:
  - Row 5 ran before `--no-sort`, so row 5b re-ran the install on the current tree.
  - The CI install-step time and row 6 go in the PR.
- **Next:** Phase 3. Merge on green, tag v5.37.2, then row 7 on the published packages.

<!-- panel: repos=duro-design-system reviewers=backend body-sha=55741c376fef -->
