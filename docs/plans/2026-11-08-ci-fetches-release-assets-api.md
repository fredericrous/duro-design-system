---
canonical: fredericrous/adr-lint docs/plans/2026-11-08-ci-fetches-release-assets-api.md
phases: [1]
status: active
branch: fix/gh-api-downloads
repos: [duro-design-system]
---

# CI fetches GitHub release assets through the API, fleet-wide (pointer)

This repository's slice of the fleet plan: Phase 1. The plan, its review
and its recipe are canonical in adr-lint (pilot: fredericrous/adr-lint#53).

## Code review

- duro-design-system: none — a copy of the recipe A block that backend and platform approved in adr-lint#53, differing only in the `AVAL_VERSION` pin (the person's choice, 2026-11-08); implementation-review alone
