---
canonical: fredericrous/decisions docs/plans/2026-10-31-design-is-an-optional-part.md
phases: [2]
status: active
branch: feat/design-extension
---

# Design is an optional part: Duro v6 (pointer)

This repository's slice of the ADR-0048 plan is section 2, "Duro v6.0.0":

- `@duro-app/eslint-config` keeps only `react`, extending
  `@aval-adr/eslint-config` (peer `>=0.16.0 <1`; the canonical body says
  0.12, renumbered by its Decision log), with its UI bans under
  `duro/no-restricted-imports`;
- the plugin re-registers that rule;
- the root lint config moves to aval's `base` and `tests`;
- the `design` extension manifest (`packages/cli/greenharness.toml`), the
  `design-system-lookup` agent, self-gating skills and `duro context`;
- `duro hook` and `duro skill install` print a stderr pointer;
- the release is **v6.0.0** for every package.

Carried from the review: `hook session-start` uses `duro context
--catalog-only`, and the SessionStart bar is a 100 ms median of 10 runs in
a Rust repo.
