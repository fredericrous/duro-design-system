# @greenharness/greenrack-cli

Machine-queryable docs for the Duro design system. One lookup verb over a
generated registry: component props and usage guidance, runnable recipes,
design tokens, and the critical rules — as human output, `--json`, or an MCP
server. Zero runtime dependencies.

```
npx @greenharness/greenrack-cli manifest --json    # the one-call agent bootstrap
npx @greenharness/greenrack-cli Button             # props, usage, example, related
npx @greenharness/greenrack-cli Select --part Root
npx @greenharness/greenrack-cli login-form --source-only > src/LoginForm.tsx
npx @greenharness/greenrack-cli spacing            # token scale + the deep import to copy
npx @greenharness/greenrack-cli rules              # critical rules + what the lint plugin enforces
npx @greenharness/greenrack-cli "tags that wrap"   # free text falls back to a need-search
npx @greenharness/greenrack-cli list
npx @greenharness/greenrack-cli hook install       # wire the Claude Code session + plan-mode hooks
npx @greenharness/greenrack-cli skill install      # /greenrack-mockup plus the colors, typography and ui skills
npx @greenharness/greenrack-cli mockup seed --out docs/mockups/approvals   # token-seeded artboard
npx @greenharness/greenrack-cli mockup check docs/mockups/approvals/*.dc.html
npx @greenharness/greenrack-cli mockup canvas docs/mockups/approvals               # one review page
```

Install for the short bin: `pnpm add -D @greenharness/greenrack-cli` → `duro Button`.

Exit codes: `0` ok · `1` not found (with "did you mean") · `2` usage error ·
`3` unreadable/incompatible registry.

## MCP server

```
claude mcp add greenrack -- npx -y -p @greenharness/greenrack-cli -p @modelcontextprotocol/sdk greenrack mcp
```

Tools: `greenrack_lookup` (same fallback-to-search behavior as the CLI),
`greenrack_list`, `greenrack_manifest`, `greenrack_mockup_check` (an artboard's HTML
in, findings out — see below), `greenrack_mockup_canvas` (artboards' HTML in, the
review page out). Resources: `greenrack://component/<Name>`,
`greenrack://recipe/<name>`. Prompt: `greenrack/build-ui` primes a session with the
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

The CLI and `@greenharness/greenrack-ui` are released in lockstep; a version mismatch with
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

`greenrack hook session-start` prints a consult-first preamble, the full catalog,
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
npx -y @greenharness/greenrack-cli hook install          # wire this repo
npx -y @greenharness/greenrack-cli hook install --check  # CI: exit 1 if it drifted
```

`install` is idempotent, and touches exactly four files:

| File                                 | What install does                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/hooks/greenrack-catalog.sh` | Writes the generated hook: fetches the catalog, caches it for 7 days (npx resolution dominates session start; the catalog only changes on upgrade), stays silent when offline with no cache. Then runs [`greenrack doctor --session`](#duro-doctor), re-run only when a file it reads changes. |
| `.claude/hooks/greenrack-plan.sh`    | Writes the generated [plan-mode nudge](#plan-mode-nudge).                                                                                                                                                                                                                                      |
| `.claude/settings.json`              | Adds the `SessionStart` and `UserPromptSubmit` entries. Existing hooks, permissions and skill overrides are preserved; a hand-renamed duro command is migrated in place rather than duplicated. Unparseable JSON is reported, never clobbered.                                                 |
| `.gitignore`                         | Ignores `.claude/.greenrack-session.cache*` — a glob, because a hook killed mid-`npx` leaves the staging `.tmp` behind.                                                                                                                                                                        |

Do not hand-edit the generated scripts — `--check` is a byte comparison, so an
edit shows up as drift and the next `install` overwrites it. **Repo-specific
caveats go in `.claude/greenrack-hook.local.md`**: the hook appends that file after
the catalog, and regeneration leaves it alone. Use it for the things the
generic preamble can't know — local styling conventions, what NOT to convert,
which packages are off-limits:

```markdown
This repo specifically (see CLAUDE.md): the raw-markup convention licenses
raw div/span MARKUP around Duro components — it is NOT a license to
hand-roll widgets the DS ships.
```

Wire `--check` into the repo's lint or CI job to catch a stale hook after a
CLI upgrade. The generated script pins `@greenharness/greenrack-cli@^7` — a floating
pin, so patch releases never read as drift, but a **floor**: a repo whose
script still pins `^3.4.0` never resolves a 4.x payload and never sees what
the session-start injection gained since. The release refuses a tag whose
major differs from that floor (`scripts/check-pin-major.mjs`). After a major,
re-run `hook install` (and `skill install`, which also refreshes the colors, typography and ui skills) in every consumer: the cache
records the floor it was fetched with, so the next session refetches it on its
own, and a failed refetch says so on stderr.

### Plan-mode nudge

The second hook runs on Claude Code's `UserPromptSubmit`. While the session is
in plan mode (the event's `permission_mode` is `"plan"`) it adds five lines to
the planner's context: a plan that adds a new screen, or makes a material
choice in layout, hierarchy or interaction, starts by picking a direction —
load the `greenrack-mockup` skill and draw 2–4 directions with `greenrack mockup` before
`ExitPlanMode` (fleet decision `handoff.fresh-directions-trigger`). A fix that
restores an existing design reuses the picked artboard; any other UI change
needs no mockup. So fresh directions come up while planning without anyone
typing `/greenrack-mockup`.

Outside plan mode, and on any payload it cannot read, it prints nothing. It
runs on every prompt, so it is plain `sh` and one `grep` over the event JSON —
no npx, no node, no network — and every path exits 0: it can never block or
fail a prompt. Existing `UserPromptSubmit` hooks in `settings.json` are kept;
the duro entry joins the array.

## Extension (Green Harness)

`@greenharness/greenrack-cli` is also the `design` extension of [grh](https://github.com/fredericrous/grh),
the Green Harness installer. `greenharness.toml` at the package root is a grh manifest v1; install
it from a repository that depends on the CLI:

```
grh install --extension node_modules/@greenharness/greenrack-cli
```

or, without a local dependency:

```
npm pack @greenharness/greenrack-cli@^7 && tar -xzf duro-app-cli-6*.tgz && grh install --extension package
```

What each manifest entry does:

| Entry                 | What grh places                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `[[skill]]` ×4        | the `colors`, `typography`, `ui` and `greenrack-mockup` skills, copied to `~/.claude/skills/`                                          |
| `[[agent]]`           | `design-system-lookup`: given a plan, answers what its UI needs from the catalog as a `design-lookup` block                            |
| `[[mcp]]`             | the `greenrack` MCP server (`greenrack mcp`, through `npx`), registered for the user                                                   |
| `[[session_context]]` | `greenrack context`: the catalog, then the doctor block; silent outside a Duro consumer and where `greenrack hook install` already ran |
| `[[doctor]]`          | `greenrack doctor`, shown by `grh status`; silent outside a Duro consumer                                                              |

The skills gate themselves: each opens by saying it applies only in a repository whose `package.json`
depends on `@greenharness/greenrack-ui` (a `workspace:` dependency counts), and to stop anywhere else, so a
user-level install costs other repositories nothing. The two session commands are `sh -c` guards
that exit at once unless the root `package.json`, or a `package.json` one or two directories below it, names
`@greenharness/greenrack-`.

`greenrack context` prints the catalog `greenrack hook session-start` prints (which now delegates to
`greenrack context --catalog-only`) and then the `doctor --session` block, re-run only when the build files'
key changes. Its cache is `${XDG_CACHE_HOME:-~/.cache}/duro/<repo path hash>`: written to a temporary
file and renamed, a failed write is silent, and nothing is ever created in the repository's `.claude/`.
`greenrack hook install` and `greenrack skill install` still work as before and print one extra line on stderr
pointing here.

## greenrack doctor

The design system's stylesheet is layered: `reset`, then StyleX's
`priority1`…`priority5`, so a component's `padding-left` beats the reset's
`padding: 0`. An app can break that without touching a component, and the
symptom is always the same — buttons, inputs and page wrappers rendered with
almost no padding while `@greenharness/greenrack-ui`'s CSS is fine. `greenrack doctor` checks the
app's wiring, statically, from its package root (or a repo root: it follows
pnpm/npm workspaces, else looks one directory down):

| Rule                 | Severity       | What breaks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runtime-injection`  | error          | `runtimeInjection: true` in a vite/babel config. StyleX injects react-strict-dom's element reset into an unlayered `<style>`, and unlayered beats every layer. A warning in `vitest.*` (jsdom only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `layered-extraction` | error          | `useCSSLayers: false` in postcss.config: the app's extracted rules — react-strict-dom's reset included — land unlayered.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `css-imported`       | error          | The entry (`app/root.tsx`, `src/main.tsx`, …) never imports `@greenharness/greenrack-ui/dist/index.css`. The JavaScript does not load it; components render unstyled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `css-load-order`     | error          | A stylesheet declares the `priority*` layers before `reset`. The first declaration fixes layer order for the page, which puts the reset on top.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `unlayered-reset`    | warn           | `* { padding: 0 }` (or on `button`, `input`, `main`, …) outside any `@layer` in the app's own CSS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `version-skew`       | warn           | The installed `@greenharness/greenrack-ui` is not the version this CLI checks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tokens-compiled`    | warn, or error | A vite/babel config compiles with StyleX but nothing routes `@greenharness/greenrack-tokens` through `react-strict-dom/babel-preset` (or, in an SSR app, `ssr.noExternal` misses it). `css.create` then cannot import `@greenharness/greenrack-tokens/tokens/*.css`: StyleX fails with "…ensure the theme file has a .stylex.js or .stylex.ts extension". An error once a `css.create` file in `app/`/`src/` deep-imports the tokens; until then a warning, since that is the import the design system prescribes. `noExternal` may be inline, a const in the config, the `{noExternal}` shorthand or a const a sibling module exports; a declared list never counts as routing. When the binding cannot be resolved, a warning names it. |
| `media-var`          | error          | Built CSS (`build/`, `dist/`) holds an `@media` whose condition reads a `var(--…)`: a media query cannot read a custom property, so it never matches. The breakpoint consts reached the CSS uncompiled. Reads only output newer than every config and source file (capped scan); with none, the check is reported as `skipped (no fresh build)` and left out of `--json` `checked`. A path it cannot read (anything but a missing one) is a warning that names it and the error code.                                                                                                                                                                                                                                                     |

**Exit codes:** `0` when there are no findings or only warnings, `1` when
there is at least one error, so it gates on errors only. `--session` always
exits 0. `--json` prints `{ok, findings, checked, skipped, packages}`.

Two places run it, and a consuming repo wires both:

- **Every agent session** — the [session hook](#claude-code-session-hook)
  runs `doctor --session`, which prints nothing when the repo is healthy and
  an agent-facing block when it is not. `hook install` wires it.
- **Every commit that touches the wiring** — an [amont](https://github.com/fredericrous/amont)
  row in `greengate.conf`. Add any custom config file the app has (a
  `vite.strict-dom.ts`) to the scope:

```
# stage     name         scope                                                                                                          severity  command
pre-commit  duro-doctor  *.css,package.json,root.tsx,main.tsx,vite.config.ts,vitest.config.ts,postcss.config.js,postcss.config.mjs,babel.config.js  block     npx -y @greenharness/greenrack-cli@^7 doctor
```

## Mockups that speak the design system

A mockup drawn outside the token system has to be translated when it is
implemented, and the translation drifts — one four-direction canvas used
485 distinct colours, 15 of them in the palette, and the implementation
carried `marginTop: 23` and a raw `768px` query past every lint rule. Three
commands and one skill make the artboard the contract instead.

```
npx -y @greenharness/greenrack-cli mockup seed --out docs/mockups/<screen> --name Main
npx -y @greenharness/greenrack-cli mockup check docs/mockups/<screen>/*.dc.html   # exit 1 on findings
npx -y @greenharness/greenrack-cli mockup canvas docs/mockups/<screen>            # the page to pick from
npx -y @greenharness/greenrack-cli skill install                                   # /greenrack-mockup + colors, typography, ui
```

`seed` writes a `.dc.html` whose `<style>` opens with the tokens as **resolved** custom properties for
every theme (`--gr-color-bg`, `--gr-spacing-md`, … — the same names as
`@greenharness/greenrack-tokens/vars.css`, generated from the same sources). `--theme
light|high-contrast` stamps `<html data-theme>` so the block switches.

`--overrides <file.json>` seeds an artboard for an app that themes with tokens. The file is the object
`ThemeProvider` takes as `tokens`, so an app passes the same file to both:

```json
{
  "colors": {"bg": "#020803", "success": "#39ff7a"},
  "typography": {
    "fontFamily": "'JetBrains Mono', ui-monospace, Menlo, monospace",
    "fontFamilyMono": "'JetBrains Mono', ui-monospace, Menlo, monospace"
  },
  "radii": {"xs": "2px", "sm": "4px", "md": "6px", "lg": "8px"},
  "sizes": {"dialogSm": "360px"}
}
```

Every group is optional. The groups are `colors`, `shadows`, `typography`, `typeScale`, `spacing`,
`layoutSpacing`, `radii`, `sizes`, `borders`, `duration`, `easing` and `effects`; each holds a partial map
of that group's token keys (camelCase, as in `greenrack list`), and each value is checked by the rule of its
kind (a colour, a font-family list, a non-negative `px`/`rem` length, a fluid `clamp()` length, a weight,
a shadow list, a duration, an easing, a blur). `layers`, `breakpoints`, `microSpacing`, `radii.px6` and
`radii.full` are refused, and `sizes.touchTarget` (44px), `borders.focusRing` (2px) and
`borders.focusOffset` keep their floors. A font list starts with a face the app loads. A file with no
group is the earlier flat map of colour keys (`{"bg": "#020803"}`) and still works; a file that has a group
and any other top-level key is refused (`bg: unknown group (expected colors | shadows | …)`). The validation
is `@greenharness/greenrack-tokens/theme`, the module `ThemeProvider` uses, so the CLI refuses what the app would drop.

The overrides are written inside the token block as `--gr-<group>-<key>` rules (`--gr-color-bg`,
`--gr-typography-font-family`, `--gr-radius-md`, `--gr-size-dialog-sm`, … for `:root` and for both
`data-theme` selectors, so they win whatever the theme), and `check` accepts them there while still refusing
a raw colour anywhere else. The success line lists the groups that have entries, in the group table's order (`with overrides from
theme.json: colors 1, typography 2, radii 4`). A missing or non-JSON file, an unknown key or a refused
value exits 2 with `<group>.<key>: <reason>` on stderr (`radii.md: "-1px" must be 0 or a non-negative
px/rem length`); nothing is written, and with `--json` the result (`kind`, `problems`) is still printed on
stdout. The artboard is written to `<path>.tmp` and renamed, so an interrupted run leaves nothing that
blocks the next seed.

`check` reads an artboard back and refuses, with `file:line rule: message`:

| Rule                  | Finding                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `raw-color`           | A hex / `rgb()` / `hsl()` literal anywhere outside the token block, in a rule or an inline `style`.                                                                                                                                                                                                                                                    |
| `raw-length`          | A literal on a spacing, radius, font, shadow or motion property (`padding: 23px`, `font-weight: 600`, `transition: opacity 150ms`). Widths, heights and positions are geometry, not tokens — never reported.                                                                                                                                           |
| `raw-breakpoint`      | A `@media` / `@container` width off the breakpoint scale (480 / 640 / 768 / 1024 / 1280). Queries cannot read a variable, so a literal on the scale is the right spelling.                                                                                                                                                                             |
| `unknown-component`   | `data-gr="<Name>"` or `<Name>.<Part>` the registry does not know, with suggestions.                                                                                                                                                                                                                                                                    |
| `no-component-map`    | No `data-gr` anywhere. An artboard names the component behind every control or it cannot be implemented from.                                                                                                                                                                                                                                          |
| `unannotated-control` | An element that draws like a control but names none. Canvas artboards draw controls as `div`/`span`, so the tag is not the signal: a class is a control when the union of every rule that mentions it has a pointer cursor, a `:hover`/`:active`/`:focus` state, or a padded rounded fill. A named parent covers only a bare native control inside it. |

When the app's installed `@greenharness/greenrack-ui` differs from the CLI, `check` and
`canvas` say so under their findings (doctor's `version-skew`): npx reuses any
cached CLI that satisfies a range, and a checker older than the app reports a
newer component as `unknown-component`.

`canvas <dir>` writes `<dir>/canvas.html` (`--out`, `--title`): one
self-contained page with every `*.dc.html` in the directory, grouped into
lettered directions by file stem (`Tree.dc.html` and `Tree-Phone.dc.html` are
direction `Tree`, `Main` first), each artboard inlined by `srcdoc` and scaled
to its frame. It refuses, writing nothing, while any artboard fails `check`.
Publish it as the Artifact the person picks from, or open it from disk.

`skill install` writes `.claude/skills/greenrack-mockup/SKILL.md` and every file of
the packaged `colors`, `typography` and `ui` skills to `.claude/skills/<name>/`
(byte-compared by `--check`, like the hook; a file the package does not ship is
stale, and install removes it only where the directory carries the shipped
`NOTICE.md`). Install refuses to write into an existing `colors`, `typography`
or `ui` directory without that `NOTICE.md` (a skill of your own) unless you pass
`--force`, which also removes the files of the overwritten directory that the
package does not ship. The same three skills are served by the MCP server as guides:
`greenrack_lookup guide:colors`, or `guide:colors/contrast.md` for a reference
file. The skill runs the whole path — seed directions,
check, publish the canvas, implement the picked direction from its
`data-gr` map, screenshot the built route and put artboard and screenshot
side by side in the PR — with nothing outside the CLI, and it explicitly
overrides the `design` skill's "lift resolved values" step. Repo notes go in `.claude/greenrack-mockup.local.md`.
Its description triggers on a request for a screen, page or mockups, and also
while planning (plan mode) a new screen or a material layout, hierarchy or
interaction change — the moment the [plan-mode nudge](#plan-mode-nudge) points
at it.
