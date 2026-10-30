---
'@duro-app/eslint-config': minor
---

`adrLint` and `adrLintTyped` take a scope per stack: `stack: ['effect', {name: 'react', files: ['apps/web/**']}]` applies the react import bans only to those files, so a repo that scopes its react preset no longer sees UI bans on headless and server packages. A plain string still means repo-wide. Where a `restrictedImports` entry with `files` overlaps a scoped stack, an intersection entry after it keeps both sets of bans.

Scoped stacks are exact in every overlap: repo-wide bans (plain stacks and unscoped `restrictedImports` entries) ride every scoped and intersection entry, overlapping scoped stacks (alone or with a `restrictedImports` layer) get an intersection entry holding all their bans, most specific last, and a ban repeated across scopes is reported once.
