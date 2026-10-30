---
status: active
branch: fix/dts-explicit-extensions
repos: [duro-design-system]
adrs: []
---

# Duro 5.37.1: published types resolve under nodenext

## Review panel

👉 **Decide:** none — approve if fixing the emitted `.d.ts` (sources untouched) plus a packed nodenext gate before publish is the right fix.
📍 duro-design-system · nothing built yet · next: Phase 1, the rewrite module and its unit test. Panel: backend (opus-5-5); delta panel per plan-panel; codex skipped (delta).
**Changed by review:** specifiers found with `ts.preProcessFile`, reference paths never rewritten; a real-build row proves a throw fails `vite build`; consumer is ESM with every peer pinned, and the check never builds.
**Verdicts:** round 1 approve-with-changes (5 accepted); round 2 approve-with-changes (1 blocker, fixed); re-run approve; final-body review approve. 2 carried into implementation.
📄 Full reviews: [2026-10-30-published-types-nodenext.reviews.md](2026-10-30-published-types-nodenext.reviews.md)

## Context

The open follow-up from the 10-06 plan ("every measure is a token") says `ui-email`'s `.d.ts` uses extensionless relative imports, which `nodenext` consumers reject. Measured on the published 5.37.0 tarballs on 2026-10-30, the follow-up is mis-scoped and worse than written:

- **Which packages.** Extensionless relative specifiers in the shipped `.d.ts`: `@duro-app/ui` 348, `@duro-app/diagrams` 15, `@duro-app/tokens` 16. `ui-email`, `cli`, `eslint-plugin` and `eslint-config` are clean.
- **What a consumer sees.** A fresh consumer of 5.37.0 with `module`/`moduleResolution: nodenext`:
  - with `skipLibCheck: false`: 86 TS2834/TS2835 errors, all in `@duro-app/ui/dist/index.d.ts`;
  - with `skipLibCheck: true` (the common setting): no error, and every type behind those imports silently becomes `any`. `const t: ThemeTokens = {radii: {md: 6}}` is accepted, while under `bundler` the same line is an error.
- **Runtime is fine.** The published JS is bundled: no relative import is left in `dist/*.js`.
- **Why the sources stay as they are.** The repo's sources import without extensions from its first commit (`moduleResolution: bundler`); no decision records why. Adding `.js` to source imports would break the platform split: `./ThemeProvider` resolves to `ThemeProvider.native.tsx` on Metro and `ThemeProvider.tsx` on the web, and `./ThemeProvider.js` defeats it. So the fix is in the emitted declarations only.
- **Why nothing caught it.** `packages/ui-email/scripts/smoke-packed.mjs` type-checks a nodenext consumer, but only of `tokens/raw` and `ui-email`, and it is not run in CI.

Every relative specifier in the published declarations resolves on disk to either `<spec>.d.ts` (341 in ui, all 15 in diagrams, all 16 in tokens, `./grow.css` → `grow.css.d.ts` included) or `<spec>/index.d.ts` (7 in ui). None is unresolved. So the rewrite is mechanical.

## Decisions

- **Rewrite the emitted `.d.ts`, never the sources.** After `vite-plugin-dts` writes the declarations, each relative specifier gets its explicit form:
  - `<spec>` where `<spec>.d.ts` exists → `<spec>.js`;
  - `<spec>` where `<spec>/index.d.ts` exists → `<spec>/index.js`;
  - already ending in `.js`, `.mjs`, `.cjs` or `.json` → unchanged;
  - anything else → the build fails, naming the file and the specifier.

  TypeScript maps `./x.js` in a declaration to `./x.d.ts`, so no `.js` file needs to exist beside it, and `bundler` consumers resolve the same specifier.

- **One module, used by every package that emits declarations.** `scripts/dts-extensions.mjs` exports `addDtsExtensions(distDir)`, with a `scripts/dts-extensions.d.mts` beside it (the existing `scripts/check-native-graph.mjs` / `.d.mts` pattern). `ui`, `diagrams`, `tokens` and `ui-email` call it from `vite-plugin-dts`'s `afterBuild` hook (v4.5.4 has it), so every `vite build` emits fixed declarations. `ui-email` is clean today; wiring it keeps it so.
  - It finds module specifiers with `ts.preProcessFile` (`importedFiles` only: imports, re-exports, `import('…')`; comments skipped) and rewrites at the returned offsets; `/// <reference path>` names a file, not a module, and is never rewritten. The fixture keeps a commented-out relative import and a reference path, both untouched.
  - It is idempotent.
  - It writes a file only when the file changed.
- **A packed-consumer check in CI.** `scripts/check-packed-types.mjs` packs `tokens`, `ui`, `diagrams` and `ui-email`, installs the tarballs into a scratch `"type": "module"` consumer, with every non-optional peer of the four packed manifests (including `react-hook-form`) plus `@types/react` and `typescript`, all pinned to the workspace-resolved versions, and type-checks one consumer file four ways: `bundler` and `nodenext`, each with `skipLibCheck` false and true.
  - With `skipLibCheck: false`, an error in `@duro-app/*` or in the consumer file fails. A third-party declaration error does not; that filter is copied from `ui-email`'s smoke, with a comment naming its source.
  - With `skipLibCheck: true`, the consumer file carries `// @ts-expect-error` sentinels that only hold when the types are real, so a silent `any` fails:
    - `ThemeTokens` with `radii.md: 6`;
    - `<Button variant="nope">`;
    - a diagrams `Node` with a string `x`;
    - an unknown key on `ThemeTokens`.
  - It runs in `ci.yml` Validate after "Build libraries", and in `release.yml` after `pnpm build`, before `pnpm -r publish`, so a release cannot ship declarations a nodenext consumer cannot read. The script never builds: it packs the existing `dist/` and fails if one is missing.
- **Release 5.37.1**: a patch changeset for `ui`, `tokens`, `diagrams` and `ui-email` ("published declarations use explicit `.js` specifiers; nodenext consumers now get the real types").

## Phases

### Phase 1: the rewrite

- Add `scripts/dts-extensions.mjs` and `scripts/dts-extensions.d.mts`.
- Unit test `scripts/test/dts-extensions.test.ts`, in the existing `scripts/test` directory under the unit project. It builds a fixture tree in a temp dir and covers:
  - a file target, a directory `index` target, and a `.css` declaration (`./grow.css` → `./grow.css.js`);
  - `import('…')` and `export * from`;
  - an already-`.js` specifier left unchanged, and a second run changing nothing;
  - an unresolved specifier throwing with its file and specifier;
  - bare package specifiers untouched.
- Wire `afterBuild` into `packages/ui/vite.config.ts`, `packages/diagrams/vite.config.ts`, `packages/tokens/vite.config.ts` and `packages/ui-email/vite.config.ts`.

### Phase 2: the check

- Add `scripts/check-packed-types.mjs` with its consumer file under `scripts/fixtures/packed-consumer.tsx`.
- Add the step to `.github/workflows/ci.yml` (Validate, after Build libraries) and to `.github/workflows/release.yml` (after `pnpm build`, before publish).
- Add a changeset; `CLAUDE.md`/AGENTS regions are regenerated only if a generator covers them.

### Phase 3: release

- One PR, merged on green, then tag v5.37.1 (the tag-release skill).
- Close the 10-06 follow-up line by a one-line note in this plan's outcome.

## Non-goals

- Source imports keep their current form; the Metro/Vite platform split depends on it.
- The cli's in-repo typecheck under `nodenext` keeps reading built declarations (ci.yml builds first since #155).
- No change to the runtime JS, which is bundled.
- `ui-email`'s own smoke (`smoke-packed.mjs`) stays as it is.

## Verification

| #   | Check                                                                                                                                                                                    | Expected                                                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `vitest --project=unit scripts/test/dts-extensions.test.ts`                                                                                                                              | every case passes, including the unresolved-specifier throw                                                                                                               |
| 2   | `pnpm build`, then count relative specifiers without `.js` in `packages/{ui,diagrams,tokens,ui-email}/dist/**/*.d.ts`                                                                    | 0; the ui count of rewritten specifiers is 348                                                                                                                            |
| 3   | `node scripts/check-packed-types.mjs`                                                                                                                                                    | 4 configurations pass                                                                                                                                                     |
| 4   | Same check with the `afterBuild` hook removed from `ui`                                                                                                                                  | the nodenext + `skipLibCheck: true` run fails on an unused `@ts-expect-error` (the check bites on a silent `any`), and nodenext + `skipLibCheck: false` fails with TS2834 |
| 4b  | Add `packages/diagrams/src/__probe.d.ts` containing `export * from './nope'` (vite-plugin-dts copies it to `dist/`), run `pnpm --filter @duro-app/diagrams build`, then delete the probe | non-zero exit; output names `__probe.d.ts` and `./nope`                                                                                                                   |
| 5   | CI on the PR: Validate (including the new step, its wall-clock time recorded), Storybook Tests, Native bundle                                                                            | green; step time noted in the PR                                                                                                                                          |
| 6   | After v5.37.1 is published: the scratch consumer from 10-30 (`/tmp/duro-consumer`) on 5.37.1, nodenext with `skipLibCheck: true`                                                         | `{radii: {md: 6}}` is now a type error, as under bundler                                                                                                                  |

<!-- panel: repos=duro-design-system reviewers=backend body-sha=5b949680c20b -->
