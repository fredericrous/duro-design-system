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
