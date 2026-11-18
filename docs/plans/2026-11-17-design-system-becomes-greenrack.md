---
status: done
branch: feat/greenrack
repos: [duro-design-system, decisions]
adrs: [ADR-0075, ADR-0076]
plan-id: p-01M7MD04J17SQ6WS6FTSEE02HZ
---

# The Duro design system moves to greenharness/greenrack and releases greenrack 7.0.0

## Review panel

👉 **Decide:** none. Approve if a transfer, one PR of sed plus migrations, and a 7.0.0 tested before its tag rename safely. Your one step comes before the tag: confirm `NPM_TOKEN` writes `@greenharness`.
📍 duro-design-system, decisions · 5 phases · 4 releases · next: Phase 1, the transfer. Panel: architect, backend, lang:typescript, platform, po, react, tui, ui-design, unix (opus), codex.
**Changed by review:** the dispatch resume reads `TAG`; migration is proved on rc tarballs before the tag; the installers migrate old hooks and skills, with output and tests.
**Verdicts:** round 1, 9 approve-with-changes; round 2, 6 approve and 3 approve-with-changes; codex approve-with-changes (3 high applied); 13 carried; words 1732 → 2371 (×1.37); remove 0, merge 0.
📄 Full reviews: [2026-11-17-design-system-becomes-greenrack.reviews.md](2026-11-17-design-system-becomes-greenrack.reviews.md)

## Context

This is ticket t06 of the greenrack-rename programme
(`decisions/docs/programmes/greenrack-rename/`). The person chose the name greenrack (ADR-0075) and the version 7.0.0
(ADR-0076). They also asked to move the repository into the greenharness
org (2026-11-17). A plain sed would break a consumer in three places:

- The hook installer finds its entries by the old script path, so it would
  double each hook.
- The skill installer would leave the old skill directory behind.
- Detection would miss apps that are still on `@duro-app/*`.

## Picture

```
           today                           after this plan
 repo      fredericrous/duro-design-system greenharness/greenrack
 packages  @duro-app/<p> 6.3.0             @greenharness/greenrack-<p> 7.0.0
 CLI, MCP  duro, duro_ds_*                 greenrack, greenrack_*
 CSS       --duro-*, data-duro*            --gr-*, data-gr*, .gr-prose
 hooks     duro-catalog.sh, duro-plan.sh   greenrack-*.sh (install migrates)
 publish   NPM_TOKEN                       NPM_TOKEN + OIDC, then trusted
 Pages     fredericrous.github.io/duro-…   greenharness.github.io/greenrack
```

Each row is one kind of name, today and after the release.

## Behaviour

**Transfer first.** Run `gh api -X POST
repos/fredericrous/duro-design-system/transfer -f new_owner=greenharness -f
new_name=greenrack`; the person is an admin of the org and the name is
free. A transfer keeps the issues, PRs, tags, secrets and branches, the
person's `feat/breakpoints-doctor-overlay` and `feat/kbd-barchart`
included. Then check, and repair what fails:

- `git ls-remote` works through the old URL, and both the old web URL and
  `releases/download` redirect;
- Pages is still enabled (build type `workflow`) and the `github-pages`
  environment still deploys;
- `NPM_TOKEN` is still listed;
- the `origin` of the live checkout is set to the new URL;
- the branch rules and the org's Actions policy still let `ci.yaml` run
  `fredericrous/attest@v1` and download from `fredericrous/aval`. A green
  CI run on a throwaway PR shows it, before the rename PR. The old Pages
  URL has no redirect.

**The rename, on a branch from `origin/main`, in one PR.** The two
branches of the person are not touched.

1. **sed, in this order.** Each rule asserts its count of replacements.
   History is excluded: `docs/plans`, `docs/adr`, `.adr/packs`,
   `.changeset/*.md` (dead drafts) and the lockfiles. `docs/mockups` is
   rewritten, with its own count. Exclude the bodies of CLAUDE.md's
   generated regions and `packages/cli/registry.json`; regenerate them
   in step 3. Rename CLAUDE.md's opening and closing marker delimiters
   explicitly so the renamed generator can find them.
   Exclude `.claude/skills/duro-mockup/` entirely from sed and hand edits:
   its original GENERATED marker must survive until step 3's installer
   migrates it. Before registry generation, explicitly move
   `packages/cli/skills/duro-mockup/` to
   `packages/cli/skills/greenrack-mockup/`; regenerate its contents in
   step 3. Verify neither old directory remains and registry guides
   contain neither mockup workflow directory. The order matters:
   - `--duro-` → `--gr-` comes first, because `--duro-app-*` variables
     share the npm scope's text.
   - The pins come next: `@duro-app/cli@^<n>…` and `@duro-app/cli@<x.y.z>`
     → `@greenharness/greenrack-cli@^7`.
   - Then `@duro-app/` → `@greenharness/greenrack-`.
   - Then the attributes: `data-duro` → `data-gr`, matched as `data-duro`
     followed by `-`, `=` or a quote, never a glob.
   - Then the classes and layer: `duro-prose` → `gr-prose`, and
     `duro-diagram` → `gr-diagram`.
   - `duro-ds` → `greenrack` comes before `duro_ds_` → `greenrack_`.
   - Then the URIs and ids: `duro://` → `greenrack://`, `duro/build-ui`,
     `duro/ai-meta`, and the nine ESLint rule ids, matched as
     `duro/<rule>` from the list only, and `duro.configs`/`duro-config/`.
   - Then the skill, hooks and their files: `duro-mockup`,
     `duro-catalog.sh`, `duro-plan.sh`, `duro-hook.local.md`,
     `.duro-session.cache` and `#duro-hook-pin`, each to its greenrack
     name.
   - Then the markers: `duro:generated:`, `duro:rules:` and
     `duro:tokens`.
   - Then the remaining names:
     - `duro-color-mode`, `duro-arrow` and `duro-pane-moved`;
     - `isDuroConsumer`, `DuroComponentsInside` and `DURO DOCTOR`;
     - the UMD globals `DuroUI`, `DuroTokens`, `DuroDiagrams` and
       `DuroUIEmail`;
     - the cache directory `~/.cache/duro`, and the Storybook id
       `duro-public-vars`;
     - `fredericrous/duro-design-system` → `greenharness/greenrack`, then
       bare `duro-design-system` → `greenrack`.
   - `duro-stack` is never matched (t12). Nor is
     `packages/cli/src/legacy-names.ts`, which holds every old name the
     migrations and detection read: the old script paths, the old skill's
     `GENERATED by \`duro skill install\``line,`@duro-app/ui`and`duro-color-mode`.
2. **Hand edits.**
   - **The CLI name.** About 160 literal `duro` command words in
     `packages/cli/src` and `test`, plus the bin in
     `packages/cli/package.json:27`, become `greenrack`. They are reviewed
     per file, because a bare `duro` can be prose.
   - **Capital `Duro`** in prose: 128 lines. Each is reviewed by hand and
     becomes greenrack. Three things that mean an app stay:
     `packages/ui-email/scripts/duro-app.variants.json` (`appName`), the
     identity of `examples/native` (bundle ids, scheme, its brand text),
     and the demo URL `duro.app`.
   - **The hook installer migrates the old wiring**
     (`packages/cli/src/commands/hook.ts:76-107`). A `LEGACY_WIRINGS`
     list names `.claude/hooks/duro-catalog.sh` and `duro-plan.sh`.
     `nextSettings` treats an entry whose command holds an old script as
     its own, and rewrites it to the new command, so there is never a
     second entry. Install deletes the old script files, and renames
     `.claude/duro-hook.local.md` to the new notes path when the new one
     does not exist. `--check` reports a legacy wiring as drift, and names
     `npx @greenharness/greenrack-cli@^7 hook install`.
     - Writes go through a temp file and a rename, in this order: new
       scripts, then `settings.json`, then the old scripts are deleted.
     - Every entry whose command holds an old script is dropped after the
       first one is rewritten.
     - Each migrated, removed or kept item prints one plain line:
       `migrated: <old> -> <new>`, `removed: <path>` or `kept: <path>`.
   - **The skill installer migrates the old skill**
     (`packages/cli/src/commands/skill.ts`). It removes
     `.claude/skills/duro-mockup/`, but only when its `SKILL.md` carries
     the `GENERATED` line the old CLI wrote. It removes that `SKILL.md`,
     then the directory if it is empty. Anything else is kept, with a line
     saying why and giving `rm -r .claude/skills/duro-mockup`. `--check`
     exits non-zero while it stays; install exits zero. It also renames
     `.claude/duro-mockup.local.md` to the new notes path.
   - **Detection matches both scopes until the census.** A dated check
     opened in Phase 5 removes the old scope after t08b. Until then:
     - doctor accepts the `duro-prose` layer name too;
     - it reports each `--duro-`, `data-duro` or `duro-prose` left in the
       app's own CSS, with its new name;
     - its banner names the scope the app uses and stays under 80
       columns.
     - `dependsOnUi` (`doctor.ts:336`) accepts `@greenharness/greenrack-ui`
       or `@duro-app/ui`. Carry the detected package identity through
       doctor's stylesheet recognition, installed-version lookup,
       token compilation checks, SSR noExternal checks, deep-import
       evidence and suggested commands. Hand-edit escaped regexes and
       split scope/package filesystem paths, which the scope sed misses.
       Recognize each scope's stylesheet paths and layer names without
       treating the other scope's configuration as evidence of correctness.
       Add paired legacy/new-scope fixtures: healthy configurations have
       no spurious build-wiring findings, and missing token compilation
       or SSR exclusions produce the expected findings and valid fixes.
     - The `Gate.` line of the four skills and the agent
       (`agents/design-system-lookup.md:14`) name both.
     - `greenharness.toml`'s `session_context` and `doctor` grep
       `grep -l -e '@duro-app/' -e '@greenharness/greenrack-'`. There is no
       `\|`, because TOML rejects the escape. Its catalog guard exits on
       either hook script.
   - **The colour mode** migrates only when no `storageKey` prop is
     passed. When the new key is absent, it reads `duro-color-mode` in the
     existing mount effect, never in the `useState` initialiser, so
     hydration still matches. It writes that value under the new key and
     removes the old one.
   - **A new test** seeds the old key and expects the toggle named
     `Color mode: dark`. A custom key and `null` both ignore the old key.
   - **Floors and pins move to 7.**
     - `HOOK_MIN_CLI` and `SKILL_MIN_CLI` become `'7.0.0'`, which
       `check-pin-major.mjs` checks at the tag.
     - The pins in `greenharness.toml` become `@^7`.
     - `extension-pointer.ts:29` becomes `@7` and `-7*.tgz`.
     - The v6 assertions in `extension.test.ts` move to v7.
   - **Tests.** The sed keeps the tests consistent. New tests keep the old
     names literal on purpose:
     - an app wired by the old CLI gets exactly one entry per hook, and
       no `duro-*` file is left;
     - a second install changes nothing;
     - settings that hold both an old and a new entry end with one;
     - an old generated `duro-mockup` directory is removed, and a foreign
       one is kept;
     - detection finds an app on either scope.
   - **The ESLint config** keeps `@aval-adr/eslint-config >=0.16.0 <1`
     (ADR-0076).
3. **Regenerate, never sed.** First run `pnpm install` to regenerate
   `pnpm-lock.yaml`, install generator dependencies and link the renamed
   workspace packages. Run `pnpm --ignore-workspace install` in
   `examples/native` for its lock. Then run `pnpm greenrack:registry`
   and `pnpm greenrack:docs` (`build-registry.mjs --write-docs`), with
   both the generator's markers and CLAUDE.md's marker delimiters renamed.
   Run `pnpm --filter @greenharness/greenrack-tokens run build`, then
   `pnpm --filter @greenharness/greenrack-cli run skill:generate`, then
   `node packages/cli/dist/bin.js skill install` for this repo's own
   `.claude/skills`. Finally run `greengate agents-md` and verify registry
   and docs freshness. Prove this sequence from a fresh worktree without
   pre-existing node_modules or dist directories.
4. **The release workflow** (`.github/workflows/release.yaml`), as shipped
   on 2026-11-18 (the Decision log and Phase 3 say why it changed):
   - `id-token: write` is the only credential: npm's trusted publishing,
     with no `NPM_TOKEN` and no setup-node `registry-url` (its `.npmrc`
     sent the token instead of the OIDC one);
   - install npm 11.6.2, because trusted publishing needs 11.5.1 or later;
   - `--provenance`. It needs every `package.json` to carry a `repository`
     URL naming `greenharness/greenrack`, and `ui-email` has none, so it
     gets one;
   - add `workflow_dispatch` with a `tag` input, so a failed publish can
     be resumed. One `TAG` (`inputs.tag || github.ref_name`) feeds
     `actions/checkout`'s `ref`, the version step and `check-pin-major.mjs`,
     which today read `GITHUB_REF_NAME` (`main` on a dispatch);
   - pnpm packs each package (rewriting `workspace:` ranges) in dependency
     order, and npm publishes each unpacked directory, skipping a
     `name@version` already on npm (`already on npm, skipped:` in the log).

**Release.** npm cannot create a package through trusted publishing, so
the person publishes a `0.0.0-reserved` placeholder of each new name and
names `greenharness/greenrack`'s `release.yaml` (no environment) as its
trusted publisher on npmjs.com. Then use the `tag-release` skill to tag
`v7.0.0` on the merge commit and read the run's `conclusion`. A failed
publish is resumed with `gh workflow run release.yaml -f tag=v7.0.0`,
which runs the workflow from `main` and checks out the tag.

## Non-goals

- Sweeping any consuming app: that is t08 and t08b. Lexical is t07, and
  the Claude side and grh are t09.
- The person's DS branches `feat/breakpoints-doctor-overlay` and
  `feat/kbd-barchart`: the person decides what happens to them after the
  rename.
- Renaming the aval scope `duro-stack` (t12), and anything under history.
- Moving the ESLint config onto greenspotter's package, which does not
  exist yet (ADR-0076).
- Deprecating or yanking `@duro-app/*` (ADR-0074).

## Code review

- duro-design-system: backend, lang:typescript, unix, tui, react, architect, platform (platform added for the release workflow; ui-design left out, because nothing renders differently and only names change)
- decisions: none — markdown only

## Phases

- [x] Phase 1 — Transfer: run the transfer and then the checks under
      Behaviour: Pages deploys through `.github/workflows/pages.yaml` from the
      new repo, and the live checkout's `origin` is set to the new URL.
- [x] Phase 2 — The rename PR: worktree `duro-design-system-wt-greenrack`
      on `feat/greenrack` from `origin/main`. It covers steps 1–4 of the
      Behaviour, in four commits: sed, hand edits, regenerated files, release
      workflow. The key files:
  - `packages/cli/src/commands/hook.ts`, `hook-script.ts`, `skill.ts`,
    `skill-template.ts`, `doctor.ts`, `mcp.ts`, `manifest.ts`, `bin.ts`,
    `extension-pointer.ts`;
  - `packages/cli/greenharness.toml` and `packages/cli/package.json`;
  - `packages/cli/scripts/lib/docs.mjs` and `rules.mjs`;
  - `packages/tokens/scripts/generate-vars-css.mjs` and
    `scripts/lib/mockup-css.mjs`;
  - `.storybook/publicVars.ts` and `packages/eslint-plugin/src/index.ts`;
  - `packages/ui/src/components/ColorMode/ColorMode.tsx`;
  - `.github/workflows/release.yaml`.
- [x] Phase 3 — Once Phase 4 has passed, release `v7.0.0` through `.github/workflows/release.yaml`
      and `.github/workflows/pages.yaml`: read the conclusion, check that npm
      lists the seven packages at 7.0.0, and check that
      `greenharness.github.io/greenrack` serves Storybook.
- [x] Phase 4 — Before the tag, prove the migration on a scratch app
      outside the repo. Wire it with `npx @duro-app/cli@^6 hook install` and
      `skill install`. Then, in the worktree, set every package to `7.0.0-rc.0` (as
      `release.yaml` does), `pnpm pack` tokens and cli, and install both
      tarballs together, because cli needs tokens. Run that CLI's `hook
install`, `skill install` and `doctor`. Then run the old 6.x `hook
install`, which adds a second entry and rewrites `duro-catalog.sh`.
      Then run `hook install` again, which must collapse it back to one
      entry per hook. The stop number is read after that last install. The scratch app's files are
      `.claude/settings.json`, `.claude/hooks/greenrack-catalog.sh` and
      `.claude/skills/greenrack-mockup/SKILL.md`.
- [x] Phase 5 — Record t06's Resolution in
      `docs/programmes/greenrack-rename/t06-move-and-release.md` and
      `docs/programmes/greenrack-rename/map.md`, on
      `prog/greenrack-rename/t06-move-and-release` in decisions. Open the dated
      checks: trusted publishers and the `NPM_TOKEN` deletion, before
      2026-11-30. Also open one for removing the old-scope detection after
      t08b.

## Verification

- **Phase 1:** `gh api repos/greenharness/greenrack` returns the repo.
  `git ls-remote https://github.com/fredericrous/duro-design-system` lists
  `main`, and the old web URL answers 301. Pages reports `build_type`
  `workflow`.
- **Phase 2:**
  - `pnpm -r test`, `pnpm lint`, `pnpm build` and
    `node packages/cli/scripts/build-registry.mjs --check --check-docs`
    all pass;
  - `git grep -nE 'duro' -- ':!<history>'` lists only the allowlist
    committed as `scripts/rename-allowlist.txt`: `duro-stack`, the app-data lines and the legacy-name tests
    and lists;
  - each sed rule's count matches the dry-run count recorded in the PR
    before the sed;
  - a browser-check run compares Storybook on `main` and on the branch,
    for Prose, Diagram, ThemeOverrides and ColorModeToggle, and finds no
    visual change;
  - CI is green, `native` included;
  - all seven `packages/*/package.json` name `greenharness/greenrack` in
    `repository`, `homepage` and `bugs`.
- **Phase 3:** the release run's `conclusion` is `success`.
  `npm view @greenharness/greenrack-<pkg> version` gives `7.0.0` for all
  seven packages, and `npm view … dist.attestations` shows provenance.
- **Phase 4:**
  - after `greenrack hook install`, `.claude/settings.json` holds exactly
    one SessionStart and one UserPromptSubmit entry of ours, and no
    `.claude/hooks/duro-*` file is left;
  - `.claude/skills/duro-mockup` is gone and `greenrack-mockup` is
    present;
  - `greenrack doctor` reports the app as a consumer while its
    `package.json` still names `@duro-app/ui`;
  - `greenrack mcp` lists the five `greenrack_*` tools;
  - **the stop number:** one duplicate hook entry or one `duro-*` file
    left means no tag.

## Rollback

- **Transfer:** transfer the repo back with
  `gh api -X POST repos/greenharness/greenrack/transfer -f
new_owner=fredericrous -f new_name=duro-design-system`. Never create a
  repo at the old name.
- **Rename PR:** revert the merge. Nothing has been published before the
  tag. A partial 7.0.0 is finished by dispatching the same tag, never by
  retagging.
- **After 7.0.0:** the packages stay published, because ADR-0074 rules
  out yanking. A fix ships as 7.0.1. Apps are unaffected until their
  sweep, because they still pull `@duro-app/*` 6.3.0.

## Outcome

Done 2026-11-18: `@greenharness/greenrack-*` 7.0.0 is on npm with provenance, published by trusted publishing only; t06 is closed in decisions (decisions#245).

**Phase 3, observed 2026-11-18:**

- `v7.0.0` was tagged on 8a8a0180 through `greengate land --tag` (the audit
  gate passed under the waivers). Six release runs, all on that tag; nothing
  was published before the sixth:
  1. tag push (44183194939): `E404 PUT` for tokens. `NPM_TOKEN` could not
     write `@greenharness`, though both of us expected it could.
  2. The person published a `0.0.0-reserved` placeholder of each name
     (`/tmp/greenrack-reserve.sh`), since npm cannot create a package
     through trusted publishing; dispatch 44206061893 still got `E404`.
  3. Dispatch 44210797865, with trusted publishers on tokens and ui: still
     `E404`. greengate's release showed why: setup-node's `registry-url`
     writes an `.npmrc` that sends the token. greenrack#191 dropped it and
     the token.
  4. Dispatch 44212830665: `ENEEDAUTH`. greenrack#192 packs with pnpm and
     publishes each unpacked directory with npm.
  5. Dispatch 44215483246: `ENEEDAUTH` again. A `--loglevel silly` run from a
     branch (44216423533) showed GitHub issuing the identity token (200) and
     npm's exchange answering `404 OIDC token exchange error - package not
found`: no trusted-publisher entry matched.
  6. The workflows were renamed `*.yaml` like the org (greenrack#193), the
     person re-entered all seven entries (`greenharness` / `greenrack` /
     `release.yaml`, no environment), and dispatch 44258504572 concluded
     `success`: seven exchanges answered 201, seven `Signed provenance
statement` lines, seven `published:` lines.
- The registry → `latest` 7.0.0 for all seven, each with attestations, and
  the internal ranges `^7.0.0` → yes, 144 s after the run.
- A scratch `npm install --prefer-online` of cli and tokens 7.0.0 →
  `greenrack --version` prints 7.0.0, `greenrack Button` answers from
  `@greenharness/greenrack-ui`, and `npm audit signatures` verifies 2
  signatures and 2 attestations. Without `--prefer-online` this Mac's cache
  answered `ETARGET` (it held the packument from before the publish).
- `greenharness.github.io/greenrack` answers 200.
- `NPM_TOKEN` is deleted from the repo; trusted publishing is the only
  credential. The debug branch is deleted.

**Phase 5, observed 2026-11-18:** decisions#245 closes t06 with the
Resolution and the map line, gives t08 the hook-count and npm-cache notes,
and opens t13, "Drop the old scope from greenrack's detection", blocked on
t08 and t08b (the nine deliberate lows can ride it). No dated check is
needed for the trusted publishers or the token: both are done.
`relais programme check` exits 0.

**Phase 1, observed 2026-11-17:**

- `gh api repos/greenharness/greenrack` returns the repo, and the transfer
  went through.
- `git ls-remote` on the old URL lists `main` at c27accb7, so the git
  redirect works.
- The old web URL answers 200 with no redirect header (the plan expected
  301). GitHub serves the moved page. Only a release tag page was checked,
  not `releases/download`.
- Pages: `build_type` `workflow`, at `greenharness.github.io/greenrack`.
  `NPM_TOKEN` is still listed. No branch rules existed before or after.
- The org Actions-policy read was refused (403: the token lacks
  `admin:org`). Instead, the main CI re-run under the new owner concluded
  `success` on every job, `fredericrous/attest@v1` and the aval download
  included. This replaced the planned throwaway PR.
- The live checkout's `origin` is now `git@github.com:greenharness/greenrack.git`.

**Phase 2, observed 2026-11-17** (input → expected → actual):

- The sed's 38 ordered rules → each count equals its dry run → equal (for
  example 6,979 `--duro-` → `--gr-`, 1,231 `@duro-app/`, 756 `data-gr`).
  `cache-dir` and `pages-url` matched 0, as the dry run did.
- `pnpm build`, `pnpm lint`, `build-registry.mjs --check --check-docs` →
  pass → pass (lint has 13 warnings, no errors). The full unit suite →
  pass → 868 tests in 49 files.
- `scripts/check-rename-allowlist.sh` → no `duro` outside the committed
  allowlist → exit 0.
- All seven `packages/*/package.json` → `repository`, `homepage` and `bugs`
  name `greenharness/greenrack` → yes; `ui-email` gained them.
- A browser check compared Storybook on `main` (6106) and on the branch
  (6107), for Prose ×3, Diagram ×2, ThemeProvider overrides ×2 and
  ColorMode. Expected no visual change; got no measured difference.
  - 7 of the 8 screenshot pairs are byte-identical. The 8th differs only in
    the story's sample text, `pnpm add @duro-app/ui` →
    `pnpm add @greenharness/greenrack-ui`.
  - `--gr-color-bg-card` (#1a1a1a) and `--gr-spacing-md` (16px) equal the
    old `--duro-*` values. The screenshots are under
    `attestations/greenrack-sb`.
- This repo's own `skill install` → the old generated `duro-mockup`
  removed → `removed: .claude/skills/duro-mockup/SKILL.md`, and
  `greenrack-mockup` written.
- Fresh-worktree regeneration (Codex#1): `pnpm install` →
  `greenrack:registry` → `greenrack:docs` → `skill:generate` → build →
  `--check --check-docs` all exit 0. The worktree started without
  node_modules or dist.

**Phase 4, observed 2026-11-17**, on a scratch app wired by
`@duro-app/cli@^6` (`duro-catalog.sh`, `duro-plan.sh`, the `duro-mockup`
skill):

- `7.0.0-rc.0` tarballs of tokens and cli were packed. The version bump was
  reverted, never committed. They were installed with
  `@modelcontextprotocol/sdk`, and `greenrack --version` printed
  `7.0.0-rc.0`.
- The first `hook install` printed two `migrated:` lines and two `removed:`
  lines. A second install printed no migration line.
- `skill install` printed `removed: .claude/skills/duro-mockup/SKILL.md`.
- `doctor` on an app still on `@duro-app/ui`: its banner names
  `@duro-app/ui`, and its fix names `@duro-app/ui/dist/index.css`.
- `mcp` lists the server `greenrack` and its five `greenrack_*` tools.
- The old 6.x `hook install` was run again (each hook doubled), then
  `greenrack hook install`. **Stop number:** SessionStart 1 entry,
  UserPromptSubmit 1 entry, and no `duro-*` file left, so it passes.
- It also found a bug: the skew warning told an app on `@duro-app/ui` 6.3.0
  to install `@greenharness/greenrack-cli@6.3.0`. The fix and its test are
  in da9b9fa1.

**relais:** runs (a) hook and (b) skill were blocked waiting for a host
slot. Their candidates were applied by hand and verified locally, and are
recorded as salvaged. Run (c) doctor was accepted. Run (d) colour mode never
launched, and was done by hand.

## Implementation review

- **implementation-review:** approve-with-changes, then approve on Delta. Fixed: the flag argument (now a plan/apply union) and the placeholder names. The CI record lives in the PR checks. ~100k tokens, about 95 s.
- **Profiles:** react approve. backend, lang:typescript, unix, tui, architect and platform approve-with-changes, then approve or low-only on Delta. Every medium was fixed in 62031315: migrate after write, the kept-skill `--check` fix, both scopes in the manifest and gates, the banner, the settings shape, the tag ref and concurrency.
- **deliberate (low, 7.0.x follow-up, no effect on correctness):**
  - `--check` counts `settings.json` once per old wiring;
  - "Then" when a kept directory is the only fix;
  - two `--check` lines over 80 columns;
  - doctor's recheck line has no `@^7`;
  - an edited old script is not flagged by `--check`;
  - `parseSettings` does not check group shape;
  - no test of kept-skill `--check`;
  - one comment on an empty catch;
  - `Scope` and `SCOPES` live in `doctor.ts` instead of a `scopes.ts`.
- **Header risk raised on Delta, verified:** every old CLI wrote `` GENERATED by `duro hook install` ``. That holds across hook-script history (3c64b7bb, cb7551f3, wording unchanged) and in real 3.x, 4.x, 5.x and 6.x installs (marker present).

## Decision log

- 2026-11-17: move into the greenharness org by transfer (t04, and the
  person: "we will move /duro-design-system to greenharness org").
- 2026-11-17: publish 7.0.0 with the existing `NPM_TOKEN` (the person),
  with OIDC beside it, because npm cannot create a package through trusted
  publishing. Each package moves to trusted publishing after 7.0.0.

<!-- panel: repos=duro-design-system,decisions adds=contract reviewers=architect,backend,lang:typescript,platform,po,react,tui,ui-design,unix body-sha=3e511b4d2b59 -->

- 2026-11-18: publish through trusted publishing only, no token; a new
  name is created once by hand as a `0.0.0-reserved` placeholder (the
  person published the seven, then set each trusted publisher).
- 2026-11-18: the workflows are named `*.yaml`, like every other
  greenharness repo (the person: "let's get consistent").
