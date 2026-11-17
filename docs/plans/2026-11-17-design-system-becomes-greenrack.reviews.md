# Reviews: 2026-11-17-design-system-becomes-greenrack

## Full reviews (reference)

**Round 1** (body 71bd741fa237). All 9 seats returned approve-with-changes:

| Seat            | Findings                | Tokens, time |
| --------------- | ----------------------- | ------------ |
| architect       | 2 high, 1 medium, 1 low | 54k, 42 s    |
| backend         | 3 medium, 3 low         | 33k, 34 s    |
| lang:typescript | 1 high, 4 medium        | 66k, 60 s    |
| platform        | 2 high, 3 medium, 1 low | 54k, 42 s    |
| po              | 2 high, 3 medium, 1 low | 30k, 36 s    |
| react           | 2 high, 1 medium, 1 low | 55k, 35 s    |
| tui             | 2 high, 3 medium, 1 low | 29k, 23 s    |
| ui-design       | 2 high, 2 low           | 59k, 62 s    |
| unix            | 2 high, 1 medium, 1 low | 56k, 40 s    |

23 patches applied. Rejected:

- platform#3, a custom npm view skip: pnpm already skips published versions;
- ui-design#1's `--duro-*` alias: it works against the destination, though its doctor-report half is accepted;
- backend#3 (a duplicate), backend#6 (no change), tui#5 and tui#6.

**Round 2** (body 6f0fbbfb768b):

| Seat            | Verdict                                                          | Tokens, time |
| --------------- | ---------------------------------------------------------------- | ------------ |
| architect       | approve                                                          | 62k, 20 s    |
| platform        | approve                                                          | 63k, 17 s    |
| po              | approve                                                          | 38k, 14 s    |
| tui             | approve                                                          | 37k, 15 s    |
| ui-design       | approve                                                          | 68k, 23 s    |
| lang:typescript | approve-with-changes, 1 high: pack tokens and cli at rc together | 76k, 31 s    |
| react           | approve-with-changes                                             | 63k, 23 s    |
| backend         | approve-with-changes                                             | 72k, 43 s    |
| unix            | approve-with-changes                                             | 64k, 22 s    |

The high from lang and the duplicate pair backend#1 and unix#5 were applied together: as written, the stop number always fired after the 6.x re-run. Backend then re-bound and approved (76k, 24 s).

**Codex** (body 347a1d9555ff): approve-with-changes, with 3 high findings, all applied:

- install before regenerating;
- protect this repo's own legacy skill marker, and move the packaged skill directory;
- make every doctor check scope-aware.

Backend then re-bound on 3e511b4d2b59.

**Carried into implementation (13):**

1. The colour-mode legacy key stays a literal `LEGACY_STORAGE_KEY` in `ColorMode.tsx`, listed in the allowlist, because `ui` cannot import `cli` (react, backend).
2. A test: `hook install --check` on a legacy wiring exits 1 and names the old script (lang).
3. `TAG` is passed through `env:`, never interpolated into `run:` (lang).
4. `skill install --check` exits 1 while a kept `duro-mockup` remains (unix).
5. Doctor caps the leftover-CSS hits at 10, then prints "and N more" (tui).
6. The migration lines print on the first install and not on the second (tui).
7. The pnpm skip log is read on every resume run (platform).
8. Never transfer the repo back after the tag, because 7.0.0's provenance names `greenharness/greenrack` (platform).
9. The t08 hand-off records the first swept app's hook count (po).
10. The ColorMode test also asserts the `localStorage` keys (ui-design).
11. Phase 2's file list gains `legacy-names.ts`, `rename-allowlist.txt` and `ui-email/package.json` (backend).
12. The scratch app installs `@modelcontextprotocol/sdk` for the `mcp` check, and the rc version bump is never committed (backend).
13. The t08 hand-off notes that a 6.x reinstall after migration duplicates the hook until the next greenrack install (architect).
