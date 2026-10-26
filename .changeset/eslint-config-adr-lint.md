---
'@duro-app/eslint-config': minor
---

New opt-in exports `adrLint` and `adrLintTyped`, built on `@aval-adr/eslint-config` 0.6.0: the decided code rules a linter matches exactly (no `@ts-ignore`, no unexplained eslint-disable, no swallowed catch, and with the typed variant an exhaustive `switch`). Name your presets in `stack` (`'react'` and/or `'effect'`) and the react and effect import bans are kept in the one merged `no-restricted-imports` that adr-lint emits, because flat config keeps only the last options of a rule; `restrictedImports` adds your own. `base`, `react`, `effect` and `tests` are unchanged.
