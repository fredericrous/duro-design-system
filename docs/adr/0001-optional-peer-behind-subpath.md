---
id: ADR-0001
status: accepted
decisions:
  - key: packaging.optional-peer-entry
    choice: A component whose peer dependency is optional is exported from its own subpath, never from the package root
    first: true
    reason: A bundler resolves every static import reachable from the entry an app imports, so an "optional" peer imported by the root is required in practice
---

# 0001 — a component whose peer is optional lives behind a subpath

## Context

`@duro-app/ui` declared `@hookform/resolvers` and `effect` optional peers, yet
the root entry re-exported `Form`, whose module imports
`@hookform/resolvers/effect-ts`. Every app importing anything from the root
therefore failed to build without them — builder-native, which uses no Effect,
included. `@duro-app/ui/table` had already solved the same problem for
`@tanstack/react-table`.

## Decision

A component that needs a peer the package declares optional is exported from a
dedicated subpath (`@duro-app/ui/table`, `@duro-app/ui/form`), with its own Vite
lib entry and `exports` entry. Nothing reachable from `dist/index.js` may import
an optional peer. A peer the root does reach is declared required.

For 4.0.0 this moves `Form` and `FormProps` to `@duro-app/ui/form` and makes
`react-hook-form` a required peer (`Field` and the inputs bind to it).
`LabelPosition` and `NecessityIndicator` stay on the root: `FormContext` imports
only React.

## Consequences

- Breaking for apps importing `Form` from the root; the migration is one line:
  `import {Form} from '@duro-app/ui/form'`.
- The CLI registry records each component's `importPath`, so recipes and
  `duro <Name>` print the subpath.
- Check: walk the chunk graph from `dist/index.js`; no optional peer may appear
  among its external imports.
