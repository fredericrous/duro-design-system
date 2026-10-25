---
canonical: decisions:docs/plans/2026-10-24-code-rules-reach-the-reviewer.md
phases: [6]
status: active
branch: feat/eslint-config-adr-lint
---

# Code rules reach the reviewer (pointer)

Canonical plan: [decisions/docs/plans/2026-10-24-code-rules-reach-the-reviewer.md](https://github.com/fredericrous/decisions/blob/main/docs/plans/2026-10-24-code-rules-reach-the-reviewer.md) (ADR-0044).

This repository carries Phase 6: `@duro-app/eslint-config` gains opt-in `adrLint` and `adrLintTyped` exports, built on `@aval-adr/eslint-config` (adr-lint 0.6.0). They are never part of `base`, `react` or `effect`, for the reason of the react-hooks v7 note in index.js: a new error rule is a per-repository migration, not a default gate.

Flat config keeps only the last options for a rule. So `adrLint` passes duro's own `react` and `effect` import bans to the preset, merged with the consumer's layers, and one `no-restricted-imports` holds them all. Spreading `react` and then `adrLint` keeps the UI bans. This also fixes the react+effect case today, where effect's entry drops the UI bans. The dependency runs one way, duro → adr-lint.

## Verification

(filled at finish)
