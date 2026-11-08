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

## Implementation review

- Round 1: approve-with-changes (78k, 29 s). Fixed: the placeholder names `result` and `tmp`. The dependency ownership and the 0.12 → 0.16 renumbering are in the PR body.
- Delta: approve (24k, 10 s).
- Verification: pnpm typecheck, lint and test green; the built CLI is silent in a Rust repo (`duro context` rc 0, `duro doctor` "not a Duro consumer"), prints the catalog and a summary-first doctor in duro-app, and writes nothing into either repo; the session guard's median is 68 ms over 10 runs in amont-agent. Next: release v6.0.0.
