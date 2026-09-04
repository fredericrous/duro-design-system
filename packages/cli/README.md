# @duro-app/cli

Machine-queryable docs for the Duro design system. One lookup verb over a
generated registry: component props and usage guidance, runnable recipes,
design tokens, and the critical rules — as human output, `--json`, or an MCP
server. Zero runtime dependencies.

```
npx @duro-app/cli manifest --json    # the one-call agent bootstrap
npx @duro-app/cli Button             # props, usage, example, related
npx @duro-app/cli Select --part Root
npx @duro-app/cli login-form --source-only > src/LoginForm.tsx
npx @duro-app/cli spacing            # token scale + the deep import to copy
npx @duro-app/cli rules              # critical rules + what the lint plugin enforces
npx @duro-app/cli "tags that wrap"   # free text falls back to a need-search
npx @duro-app/cli list
npx @duro-app/cli hook install       # wire the Claude Code SessionStart hook
```

Install for the short bin: `pnpm add -D @duro-app/cli` → `duro Button`.

Exit codes: `0` ok · `1` not found (with "did you mean") · `2` usage error ·
`3` unreadable/incompatible registry.

## MCP server

```
claude mcp add duro -- npx -y -p @duro-app/cli -p @modelcontextprotocol/sdk duro mcp
```

Tools: `duro_lookup` (same fallback-to-search behavior as the CLI),
`duro_list`, `duro_manifest`. Resources: `duro://component/<Name>`,
`duro://recipe/<name>`. Prompt: `duro/build-ui` primes a session with the
critical rules and the component index. The SDK is an optional peer — plain
CLI use never loads it.

## The registry

`registry.json` is generated from the monorepo sources by
`scripts/build-registry.mjs` (ts-morph, build-time only) and committed: it
aggregates the 57 `*.meta.ts` files, per-component prop tables extracted from
the TypeScript source, recipe sources rewritten to publishable imports, the
token scales, and the lint-rule metadata. It is a pure function of the source
tree — sorted keys, no timestamps — so `--check` (run in prebuild, CI, and
the amont pre-push hook) is a byte comparison. The same script maintains the
generated regions of the repo's CLAUDE.md (`--write-docs` / `--check-docs`).

The CLI and `@duro-app/ui` are released in lockstep; a version mismatch with
a locally installed ui prints a one-line stderr warning.

### Authoring `relatedTo`

Every `relatedTo` entry declares a `kind`, and the type makes it required:

```ts
relatedTo: [
  {
    component: 'Menu',
    kind: 'contrast',
    relationship: 'Menu triggers actions; Select picks a value',
  },
  {component: 'Field', kind: 'composition', relationship: 'Place Select inside Field.Root'},
]
```

- **`contrast`** — the two are alternatives; you pick one _instead of_ the
  other. These become the session-start neighbors table, so write the
  relationship so it decides in **either** direction: `X for A; Y for B`, not
  "Vertical equivalent" (which of the two is vertical?).
- **`composition`** — one goes _inside_ the other. Real guidance, different
  question; rendered as "Input vs Field" it would mislead, so it stays out of
  the table.

Filing an edge under the wrong kind quietly either drops it from the table or
pollutes it, which is why the field is not optional and not inferred.

## Claude Code session hook

`duro hook session-start` prints a consult-first preamble, the full catalog,
and a **PICKING BETWEEN NEIGHBORS** table, designed to be injected into agent
context by a Claude Code `SessionStart` hook — so "check the design system
before building UI" stops being a remembered step an agent can skip.

The catalog answers "what exists"; the neighbors table answers "which one",
which is where agents actually go wrong (a Menu built out of a Select, a Card
where Panel was meant). Both ship in the same injection so neither waits on a
`duro <Component>` call the agent may never make. The table is derived from
the `contrast` edges in each component's `relatedTo` — see below.

Every consuming repo wires it the same way, and the CLI does the wiring:

```
npx -y @duro-app/cli hook install          # wire this repo
npx -y @duro-app/cli hook install --check  # CI: exit 1 if it drifted
```

`install` is idempotent, and touches exactly three files:

| File                            | What install does                                                                                                                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/hooks/duro-catalog.sh` | Writes the generated hook: fetches the catalog, caches it for 7 days (npx resolution dominates session start; the catalog only changes on upgrade), stays silent when offline with no cache.                          |
| `.claude/settings.json`         | Adds the `SessionStart` entry. Existing hooks, permissions and skill overrides are preserved; a hand-renamed duro command is migrated in place rather than duplicated. Unparseable JSON is reported, never clobbered. |
| `.gitignore`                    | Ignores `.claude/.duro-session.cache*` — a glob, because a hook killed mid-`npx` leaves the staging `.tmp` behind.                                                                                                    |

Do not hand-edit the generated script — `--check` is a byte comparison, so an
edit shows up as drift and the next `install` overwrites it. **Repo-specific
caveats go in `.claude/duro-hook.local.md`**: the hook appends that file after
the catalog, and regeneration leaves it alone. Use it for the things the
generic preamble can't know — local styling conventions, what NOT to convert,
which packages are off-limits:

```markdown
This repo specifically (see CLAUDE.md): the raw-markup convention licenses
raw div/span MARKUP around Duro components — it is NOT a license to
hand-roll widgets the DS ships.
```

Wire `--check` into the repo's lint or CI job to catch a stale hook after a
CLI upgrade. The generated script pins `@duro-app/cli@^1.2.0` (the floor where
`hook session-start` landed; older versions treat `hook` as a lookup and cache
junk) — a floating pin, so patch releases never read as drift.
