---
status: active
branch: fix/dts-explicit-extensions
repos: [duro-design-system]
adrs: []
---

# Duro 5.37.1: published types resolve under nodenext

## Review panel

👉 **Decide:** none — the person chose attw for the packed check; approve if the source/CSS subpath exclusions are acceptable as a non-goal.
📍 duro-design-system · nothing built yet · next: Phase 1, the rewrite module and its unit test. Panel: backend (opus-5-5); delta panel per plan-panel; codex skipped (delta).
**Changed by review:** specifiers found with `ts.preProcessFile`, reference paths never rewritten; a real-build row proves a throw fails `vite build`; the packed check is attw (the person's choice) and never builds.
**Verdicts:** round 1 approve-with-changes (5 accepted); round 2 approve-with-changes (1 blocker, fixed); re-run approve; final-body review approve; delta on the person's attw change approve-with-changes (4 accepted). 1 carried into implementation.
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
- **A packed-types check in CI: arethetypeswrong** (the person, 2026-10-30, after comparing with established practice: "attw (Recommended)"). `@arethetypeswrong/cli` is added as a root dev dependency at an exact version, and a root script `check:types-packed` runs `test -f packages/<name>/dist/index.d.ts && attw --pack packages/<name> --profile esm-only` for `tokens`, `ui`, `diagrams` and `ui-email`, the four chained with `&&` so any one failing fails the step.
  - `esm-only` because the packages ship ESM only; their `exports` maps are not meant for node10 or CommonJS callers.
  - attw reports this defect as "Internal resolution error" under node16 ESM, for every entry point (`.`, `/form`, `/table`, the tokens subpaths), with no consumer install.
  - Subpaths that export raw source or CSS rather than built declarations (in `tokens`: `./keys` and the `./tokens/*.css`, `./themes/*.css`, `./vars.css`, `./mockup.css` entries; in `ui`: `./component-meta` and its `.css` entries; the exact list is the one row 0 measures) are excluded by name with `--exclude-entrypoints`. Nodenext consumers of those deep imports are a non-goal of this release. `internal-resolution-error` is never passed to `--ignore-rules`.
  - Any other attw problem found today is fixed in this PR, or ignored with `--ignore-rules` naming the rule, a reason in a comment, and a line in the PR. Nothing is ignored silently.
  - It runs in `ci.yml` Validate after "Build libraries", and in `release.yml` after `pnpm build`, before `pnpm -r publish`, so a release cannot ship declarations a nodenext consumer cannot read. It never builds: `attw --pack` packs the existing `dist/`, and the script fails if a `dist/` is missing.
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

- Add `@arethetypeswrong/cli` (exact version) and the root `check:types-packed` script.
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

| #   | Check                                                                                                                                                                                    | Expected                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Before any change: `attw --pack --profile esm-only` on the published 5.37.0 tarballs of the four packages                                                                                | the entries that report "Internal resolution error" under node16 ESM, and the raw-source/CSS entries, are recorded; row 4 expects the former, the exclusions list the latter |
| 1   | `vitest --project=unit scripts/test/dts-extensions.test.ts`                                                                                                                              | every case passes, including the unresolved-specifier throw                                                                                                                  |
| 2   | `pnpm build`, then count relative specifiers without `.js` in `packages/{ui,diagrams,tokens,ui-email}/dist/**/*.d.ts`                                                                    | 0; the ui count of rewritten specifiers is 348                                                                                                                               |
| 3   | `pnpm check:types-packed`                                                                                                                                                                | attw reports no problem for the four packages under the esm-only profile (or only the rules ignored by name, each with its reason)                                           |
| 4   | Same check with the `afterBuild` hook removed from `ui`                                                                                                                                  | attw reports "Internal resolution error" for `@duro-app/ui` under node16 ESM: the check bites on the defect                                                                  |
| 4b  | Add `packages/diagrams/src/__probe.d.ts` containing `export * from './nope'` (vite-plugin-dts copies it to `dist/`), run `pnpm --filter @duro-app/diagrams build`, then delete the probe | non-zero exit; output names `__probe.d.ts` and `./nope`                                                                                                                      |
| 5   | CI on the PR: Validate (including the new step, its wall-clock time recorded), Storybook Tests, Native bundle                                                                            | green; step time noted in the PR                                                                                                                                             |
| 6   | After v5.37.1 is published: the scratch consumer from 10-30 (`/tmp/duro-consumer`) on 5.37.1, nodenext with `skipLibCheck: true`                                                         | `{radii: {md: 6}}` is now a type error, as under bundler                                                                                                                     |

## Verification record

Observed before the push, on the branch's tree (raw output kept outside the repository, `~/.claude/amont-agent/attestations/dts-row0/`).

| #   | Input                                                                                                              | Expected                                              | Actual                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | `attw --from-npm @duro-app/<name>@5.37.0 --profile esm-only` (attw 0.18.5)                                         | defect entries and raw-source/CSS entries recorded    | Internal resolution error under node16 ESM: tokens `.` and `/theme` (16 in `dist`), ui `.` (102), diagrams `.` (6); ui-email clean. Also failing: 6 errors in 4 tokens `src` entries (`themes/light.css` and `themes/high-contrast.css` have 2 each: `./tokens/layers.css`, `./tokens/type-presets.css`, `./themes/light.css`, `./themes/high-contrast.css`), and CSS entries resolving to nothing (tokens `./vars.css`, `./mockup.css`; ui `./dist/index.css`, `./reset.css`, `./strict.css`; diagrams `./dist/index.css`, `./styles.css`). These became the exclusions; the other ten tokens source entries pass and stay checked |
| 1   | `vitest --project=unit scripts/test/dts-extensions.test.ts`                                                        | every case passes                                     | 3 tests pass (file, dir index, `.css`, `import()`, `export *`, `.js` kept, bare untouched, comment and reference path untouched; second run writes nothing; unresolved throws naming file and specifier). Full unit project 43 files / 810 tests                                                                                                                                                                                                                                                                                                                                                                                    |
| 2   | `pnpm build`, count relative specifiers in `dist/**/*.d.ts`                                                        | 0 without an extension; ui 348                        | ui 348 explicit / 0; tokens 18 / 0; diagrams 15 / 0; ui-email 2 / 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 3   | `pnpm check:types-packed`                                                                                          | no problem for the four packages                      | exit 0 in 22 s; ui `.`, `/form`, `/table`, tokens `.`, `/theme` green under node16 ESM                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4   | ui `afterBuild` removed, rebuild, `pnpm --filter @duro-app/ui run check:types`                                     | attw reports Internal resolution error, non-zero exit | exit 1, `node16 (from ESM): 🥴 Internal resolution error`; restored config: exit 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 4b  | type-only probe `export type * from './nope'` in `packages/diagrams/src/__probe.ts`, diagrams build, probe deleted | non-zero exit naming the file and `./nope`            | exit 1, `[vite:dts] …/dist/__probe.d.ts: cannot resolve relative specifier "./nope"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## Decision log

- 2026-10-30: the person chose attw over the custom consumer script after comparing with established practice (post-build rewrite as in nxgt-http#135 and vue-stripe; attw as the standard checker).
- 2026-10-30: each package's attw exclusions live in its own `check:types` script, next to the `exports` they describe; the root `check:types-packed` runs the four with `pnpm --filter`, which fails when any one fails. The plan had one chained root command; the guard (`test -f dist/index.d.ts`) and the failure behaviour are the same.
- 2026-10-30: row 4b's first probe, a hand-written `src/__probe.d.ts`, was not copied to `dist` (build exit 0, the visible failure the review anticipated); a type-only re-export in a `.ts` source reached the declarations and proved the throw fails the build.
- 2026-10-30: Phase 2's relais candidate stored `pnpm-lock.yaml` as binary; the rest was applied and pnpm regenerated the lockfile (217 lines added, none removed). Recorded as salvaged.
- 2026-10-30: in a fresh worktree the pre-commit `lint-js` gate fails until `@duro-app/eslint-plugin` is built (the `lint` gate builds it in parallel). Not fixed here; a separate follow-up.
- 2026-10-30: the push's audit gate reported a new moderate advisory, GHSA-8g5g-mxqh-grgj on `vite` 6.4.4 (reached via `diagrams`), that would block the v5.37.1 tag this plan's Phase 3 needs, so it rides in this PR (7d343380). The four `vite` specifiers moved from `^6.0.0` to `^6.4.5`, and a plain `pnpm install` re-resolved the lockfile: 56/56 lines, and `vite` is the only resolved version that changed. A first `pnpm up -r` attempt also changed metro, flow-parser and rollup, so it was reverted. Afterwards `pnpm audit` shows only the waived low deepmerge; `pnpm build` and `pnpm check:types-packed` exit 0.
- 2026-10-30: after the vite fix, the audit gate still blocked the tag: the private Expo example (`examples/native`, its own lockfile, never published) had gained GHSA-qr28-fpjm-wq7f (high, `decode-uri-component` ≤ 0.5.0, via `expo-router > query-string`). It rides in this PR (64f187e7) for the same reason. The existing override from #114 moved its floor from `<0.5.0: ^0.5.0` to `<0.5.1: ^0.5.1`; no override was added, and `query-string` 7 already ran on the ESM 0.5.x line. The lockfile changed 5/5 lines, 0.5.0 → 0.5.1 only. The example's remaining advisories (GHSA-5p2g-fcmc-qvqq, GHSA-w3rx-r6r6-pgpr, GHSA-86w9-cpqp-85rv high; GHSA-gcqx-w48m-w2h4 low) are all in `.amont-audit-waivers` until 2026-12-31. The Native bundle CI job is the bundle proof.

## Implementation review

- **Round 1:** approve-with-changes (67k, 47 s). The test's module-level `let dist` was fixed: a `withDist` helper now passes it to each test explicitly. The row 0 count was corrected. The attw ownership argument (dependency tree, no install scripts, maintainer and cadence, what happens if it is abandoned) went into the PR body, because `package.json` cannot carry it.
- **Delta (tree cb1f4197):** approve (72k, 17 s), no new findings.
- **Delta (tree c3b219c5, the vite 6.4.5 bump):** approve-with-changes (76k, 15 s). One low finding: record the bump in the decision log (done). Hand check: `vite` is the only resolved version that changes in the lockfile.
- **Delta (tree 2f01383b, the native `decode-uri-component` 0.5.1 override):** approve-with-changes (79k, 15 s). One low finding: record the change in the decision log (done).
- **Next:** Phase 3. Merge on green, tag v5.37.1, then row 6 against the published packages.

<!-- panel: repos=duro-design-system reviewers=backend body-sha=5b949680c20b -->
