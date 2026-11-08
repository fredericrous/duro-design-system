---
canonical: fredericrous/adr-lint docs/plans/2026-11-08-ci-fetches-release-assets-api.md
phases: [1]
status: done
branch: fix/gh-api-downloads
repos: [duro-design-system]
---

# CI fetches GitHub release assets through the API, fleet-wide (pointer)

This repository's slice of the fleet plan: Phase 1. The plan, its review
and its recipe are canonical in adr-lint (pilot: fredericrous/adr-lint#53).

## Code review

- duro-design-system: none — a copy of the recipe A block that backend and platform approved in adr-lint#53, differing only in the `AVAL_VERSION` pin (the person's choice, 2026-11-08); implementation-review alone

## Outcome

- input: this repository's "Ensure aval" step script, `AVAL_VERSION=1.11.0`, GH_TOKEN from `gh auth token`, on macOS → expected: aval fetched through `gh release download`, `bin/aval` extracted, GITHUB_PATH written → actual: `bin/aval` is an ELF x86-64 executable, GITHUB_PATH written (`aval --version` cannot run a Linux ELF on macOS; the PR job log is that check).
- input: this hunk diffed against adr-lint#53's, ignoring line numbers → expected: identical → actual: identical.
- input: repository-wide grep for the web route and raw.githubusercontent, outside comments and docs → expected: only non-goals → actual: none.

## Implementation review

- duro-design-system implementation-review: approve (low: record outcome, done here); 72k, 28 s (opus).
