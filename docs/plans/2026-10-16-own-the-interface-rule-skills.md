---
canonical: decisions:docs/plans/2026-10-16-own-the-interface-rule-skills.md
phases: [2]
status: active
---

Part of [Own the interface rule skills, split between the fleet and Duro](https://github.com/fredericrous/decisions/blob/main/docs/plans/2026-10-16-own-the-interface-rule-skills.md). This repository carries phase 2: colors, typography and ui under packages/cli/skills, served as duro-ds MCP guides (guide:<name>) and installed by duro skill install, then release v5.10.0 and the consumer installs.

## Observed (phase 2, steps 1–5)

| Check                                                                            | Expected                                                 | Actual                |
| -------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------- |
| `pnpm --filter @duro-app/cli run build` (prebuild runs `build-registry --check`) | exit 0                                                   | exit 0                |
| `pnpm exec vitest run --project=unit packages/cli`                               | all pass                                                 | 188/188 pass          |
| `npm pack --dry-run --json` in `packages/cli`                                    | lists `skills/{colors,typography,ui}/SKILL.md`           | 3 listed              |
| scratch git repo: `node dist/bin.js skill install`, then `--check`               | writes duro-mockup, colors, typography, ui; check exit 0 | written; exit 0       |
| `node dist/bin.js guide:typography` against `skills/typography/SKILL.md`         | `cmp` identical                                          | identical             |
| `registry.json` size                                                             | recorded                                                 | 429381 → 542794 bytes |
| no `better-` outside NOTICE.md in `packages/cli/skills`                          | 0 lines                                                  | 0 lines               |

Steps 6 (release v5.10.0) and 7 (consumer installs) follow the merge.

## Implementation review

- Round 1 approve-with-changes (84k, 69 s); Delta approve-with-changes (89k, 12 s). Fixed: gap issue #120 named in `ui`, `--force` prunes so a later install deletes nothing, ENOENT-only, walker/help/resource tests. deliberate: `--force` help wording and guide mime type, filed as #121.
