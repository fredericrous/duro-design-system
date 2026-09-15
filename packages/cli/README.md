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
npx @duro-app/cli skill install      # wire the /duro-mockup workflow skill
npx @duro-app/cli mockup seed --out docs/mockups/approvals   # token-seeded artboard
npx @duro-app/cli mockup check docs/mockups/approvals/*.dc.html
```

Install for the short bin: `pnpm add -D @duro-app/cli` → `duro Button`.

Exit codes: `0` ok · `1` not found (with "did you mean") · `2` usage error ·
`3` unreadable/incompatible registry.

## MCP server

```
claude mcp add duro-ds -- npx -y -p @duro-app/cli -p @modelcontextprotocol/sdk duro mcp
```

Tools: `duro_ds_lookup` (same fallback-to-search behavior as the CLI),
`duro_ds_list`, `duro_ds_manifest`, `duro_ds_mockup_check` (an artboard's HTML
in, findings out — see below). Resources: `duro://component/<Name>`,
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
- **`composition`** — one goes _inside_ the other, or is _built on_ it.
  React composes, so this covers "wraps", "renders" and "built on" too, not
  just literal nesting. These get their own table: rendered as "Input vs
  Field" they would read as the opposite advice.

Filing an edge under the wrong kind puts it under a heading that contradicts
it, which is why the field is not optional and not inferred. Write the
relationship to match: a `contrast` edge decides ("X for A; Y for B"), a
`composition` edge says what wraps what.

## Claude Code session hook

`duro hook session-start` prints a consult-first preamble, the full catalog,
and two neighbour tables, designed to be injected into agent context by a
Claude Code `SessionStart` hook — so "check the design system before building
UI" stops being a remembered step an agent can skip.

The catalog answers "what exists". The tables answer the two questions it
doesn't, which is where agents actually go wrong:

- **PICKING BETWEEN NEIGHBORS** — a Menu built out of a Select, a Card where
  Panel was meant
- **COMPOSE — DO NOT HAND-ROLL THE WRAPPER** — a hand-rolled label beside an
  Input that should have been wrapped in `Field.Root`

All three ship in one injection, so none waits on a `duro <Component>` call
the agent may never make. The tables are the `contrast` and `composition`
edges of each component's `relatedTo` — see above.

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
CLI upgrade. The generated script pins `@duro-app/cli@^3.0.0` — a floating
pin, so patch releases never read as drift, but a **floor**: a repo whose
script still pins `^1.2.0` never resolves a 2.x or 3.x payload and never sees
what the session-start injection gained since. After a major, re-run
`hook install` in every consumer and delete `.claude/.duro-session.cache*`
(the payload is cached seven days).

## Mockups that speak the design system

A mockup drawn outside the token system has to be translated when it is
implemented, and the translation drifts — one four-direction canvas used
485 distinct colours, 15 of them in the palette, and the implementation
carried `marginTop: 23` and a raw `768px` query past every lint rule. Two
commands and one skill make the artboard the contract instead.

```
npx -y @duro-app/cli mockup seed --out docs/mockups/<screen> --name Main
npx -y @duro-app/cli mockup check docs/mockups/<screen>/*.dc.html   # exit 1 on findings
npx -y @duro-app/cli skill install                                   # /duro-mockup
```

`seed` writes a `.dc.html` in the shape Claude Code's `design` skill expects,
whose `<style>` opens with the tokens as **resolved** custom properties for
every theme (`--duro-color-bg`, `--duro-spacing-md`, … — the same names as
`@duro-app/tokens/vars.css`, generated from the same sources). `--theme
light|high-contrast` stamps `<html data-theme>` so the block switches.

`check` reads an artboard back and refuses, with `file:line rule: message`:

| Rule                  | Finding                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `raw-color`           | A hex / `rgb()` / `hsl()` literal anywhere outside the token block, in a rule or an inline `style`.                                                                                                                                                                                                                                                    |
| `raw-length`          | A literal on a spacing, radius, font, shadow or motion property (`padding: 23px`, `font-weight: 600`, `transition: opacity 150ms`). Widths, heights and positions are geometry, not tokens — never reported.                                                                                                                                           |
| `raw-breakpoint`      | A `@media` / `@container` width off the breakpoint scale (480 / 640 / 768 / 1024 / 1280). Queries cannot read a variable, so a literal on the scale is the right spelling.                                                                                                                                                                             |
| `unknown-component`   | `data-duro="<Name>"` or `<Name>.<Part>` the registry does not know, with suggestions.                                                                                                                                                                                                                                                                  |
| `no-component-map`    | No `data-duro` anywhere. An artboard names the component behind every control or it cannot be implemented from.                                                                                                                                                                                                                                        |
| `unannotated-control` | An element that draws like a control but names none. Canvas artboards draw controls as `div`/`span`, so the tag is not the signal: a class is a control when the union of every rule that mentions it has a pointer cursor, a `:hover`/`:active`/`:focus` state, or a padded rounded fill. A named parent covers only a bare native control inside it. |

`skill install` writes `.claude/skills/duro-mockup/SKILL.md` (byte-compared
by `--check`, like the hook). The skill runs the whole path — seed directions,
check, publish the canvas, implement the picked direction from its
`data-duro` map, screenshot the built route and put artboard and screenshot
side by side in the PR — and it explicitly overrides the `design` skill's
"lift resolved values" step. Repo notes go in `.claude/duro-mockup.local.md`.
