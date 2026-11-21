---
'@greenharness/greenrack-eslint-config': minor
---

Exports `uiImportBans`, the `greenrack/no-restricted-imports` entry the `react` preset sets, and `greenrackPlugin`, the plugin it registers; the preset uses those same values. A repository that scopes `react` to part of its tree restates the bans for its other files by importing these names instead of searching the preset's blocks.
