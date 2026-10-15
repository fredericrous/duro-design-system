---
status: active
branch: feat/mockup-canvas
repos: [duro-design-system]
adrs: []
---

# duro mockup canvas: the review page ships with the CLI

## Why

The `/duro-mockup` skill (generated from `packages/cli/src/skill-template.ts`)
tells the agent to build the review canvas with the `design` skill's
`seed-canvas.mjs`, "under the current Claude Code version's bundled-skills
directory". Duro neither ships nor checks that helper, and on 2026-10-15 it
was not installed at all (Happier M1 shell directions): the agent hand-wrote
a canvas page. The same session's `npx -y @duro-app/cli@^5.0.0 mockup check`
reused a cached 5.10.0 that did not know `SplitPane`, and reported it as an
unknown component with nothing saying the checker was older than the app.

## Scope (the person, in conversation, 2026-10-15: "do the change … I want all even the optional duro_ds_mockup_canvas")

1. `duro mockup canvas <dir> [--out <file>] [--title <text>]`: one
   self-contained HTML review page for every `*.dc.html` in `<dir>` (each
   artboard inlined by `srcdoc`, scaled to its cell, grouped into lettered
   directions by file stem: `Tree` and `Tree-Phone` are direction `Tree`).
   It refuses (exit 1, writes nothing) when an artboard fails `mockup check`.
   Default output `<dir>/canvas.html`.
2. MCP tool `duro_ds_mockup_canvas`: the same page from
   `artboards: [{file, html}]`, returned as text, with the findings.
3. The skill template uses `duro mockup canvas` and stops naming the
   `design` skill's helper; the `Main`-name comments go.
4. `mockup check` and `canvas` add the doctor's `version-skew` note when the
   app's installed `@duro-app/ui` differs from the CLI (reusing
   `uiVersionSkew`, not a second detector).
5. A test that every `duro mockup <sub>` the skill names is a real
   subcommand, and that the skill names no helper Duro does not ship.

## Non-goals

- Publishing the Artifact from the CLI (the agent publishes the page).
- Changing the artboard format, `seed`'s defaults or the check rules.

## Verification

| Check          | Input                                                 | Expected                                                                        |
| -------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| canvas on disk | the Happier M1 shell artboards (`Tree`, `Rail-Phone`) | `canvas.html` written; opens in Chrome showing both artboards in two directions |
| canvas refuses | a directory holding a failing artboard                | exit 1, no file, findings listed                                                |
| MCP tool       | `duro_ds_mockup_canvas` via `callTool`                | `{ok, html, findings}`                                                          |
| skew note      | `mockup check` in a dir whose `@duro-app/ui` differs  | the note names both versions                                                    |
| skill drift    | the rendered skill                                    | names only real subcommands, no `seed-canvas`                                   |
| repo gate      | `pnpm --filter @duro-app/cli test`, typecheck, lint   | green                                                                           |

## Decision log

- 2026-10-15: plan written from the person's chat approval; no review panel
  ran (a one-line CLI addition beside `seed`/`check`, scope set by the person).
