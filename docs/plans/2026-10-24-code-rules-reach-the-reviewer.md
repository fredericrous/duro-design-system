---
canonical: decisions:docs/plans/2026-10-24-code-rules-reach-the-reviewer.md
phases: [6]
status: done
branch: feat/eslint-config-adr-lint
---

# Code rules reach the reviewer (pointer)

Canonical plan: [decisions/docs/plans/2026-10-24-code-rules-reach-the-reviewer.md](https://github.com/fredericrous/decisions/blob/main/docs/plans/2026-10-24-code-rules-reach-the-reviewer.md) (ADR-0044).

This repository carries Phase 6: `@duro-app/eslint-config` gains opt-in `adrLint` and `adrLintTyped` exports, built on `@aval-adr/eslint-config` (adr-lint 0.6.0). They are never part of `base`, `react` or `effect`, for the reason of the react-hooks v7 note in index.js: a new error rule is a per-repository migration, not a default gate.

Flat config keeps only the last options for a rule. So `adrLint` passes the import bans of the presets named in its `stack` to the preset, merged with the consumer's layers (and copied into each `files` scope), and one `no-restricted-imports` holds them all. Spreading `react` and then `adrLint({stack: ['react']})` keeps the UI bans; `restrictedImports` without `stack` throws. This also fixes the react+effect case today, where effect's entry drops the UI bans. The dependency runs one way, duro → adr-lint.

## Verification

Input → expected → actual:

- A focused lint through ESLint's API from the package, on `src/App.tsx` importing `@mui/material`:
  - `[...react, ...adrLint({stack: ['react']})]` → refused, with a message naming `@duro-app/ui` → refused, and it names `@duro-app/ui`.
  - `[...react, ...adrLint({stack: ['react'], restrictedImports: [{files: ['src/**'], patterns: [{group: ['**/infra/**']}]}]})]`, which also imports `../infra/db` → both refused, the mui one naming `@duro-app/ui` → both refused, as expected.
- The eslint-config tests → pass → 26/26. They cover:
  - the react bans kept when `adrLint` comes last;
  - react and effect together;
  - consumer layers merged into one rule;
  - the bans kept in a `files`-scoped layer;
  - a ban reported once when two entries share a scope;
  - `restrictedImports` without `stack` throws, and `stack: []` does not;
  - `@ts-ignore` and a bare empty catch fire, and a justified catch passes;
  - `base` unchanged;
  - an unknown stack name throws.
- Mutation: the once-per-scope guard removed → the shared-scope test fails → it fails.
- `pnpm run typecheck` → exit 0 → 0. `pnpm exec vitest run --project=unit` → pass → 609/609 in 40 files, before the last two tests were added.
- pnpm-lock.yaml → it adds only `@aval-adr/eslint-config@0.6.0` and its plugin → `@aval-adr/eslint-config@0.6.0` (integrity `sha512-EMT9Ytj…`, the published tarball) and `@eslint-community/eslint-plugin-eslint-comments@4.8.1`. The preset resolves duro's own `typescript-eslint@8.67.0` and `eslint@9.39.5`, one copy each.

### Implementation review

- approve-with-changes (1 blocking, 2 high, 1 medium), then approve-with-changes on the Delta (1 new low), then approve on the binding Delta; 85k + 92k + 97k tokens, 185 s + 38 s + 35 s.
- Fixed:
  - the stack bans dropped inside a `files`-scoped layer, the common case for a layer contract;
  - `restrictedImports` without `stack` losing the UI bans silently: it now throws, and the type requires `stack`;
  - the four `result` placeholders (adr-lint candidates, ruled violations);
  - a ban doubled when two entries share a scope;
  - this record.
- Carried to the canonical plan's phase 7: `adr-lint sync` must emit `stack` when it writes `adrLint(...)`.
- The relais run (`run-65eb1409e09eb-12613`) stopped on `verification_inputs_changed`. It was verified by hand and recorded as salvaged at 6b4b8782.
