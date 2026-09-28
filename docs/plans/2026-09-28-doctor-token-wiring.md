---
status: done
branch: feat/doctor-token-wiring
---

# duro doctor: flag uncompiled @duro-app/tokens

## Goal

`duro doctor` reports an app whose build compiles its own code with StyleX but
never compiles `@duro-app/tokens`' sources. In such an app `css.create` cannot
import `@duro-app/tokens/tokens/*.css`: the subpath resolves to the package's
uncompiled `src/tokens/*.css.ts` (react-strict-dom `css.defineVars`), and
StyleX fails with "Could not resolve the path to the imported file. Please
ensure the theme file has a .stylex.js or .stylex.ts extension".
website-builder's `apps/builder-webapp` has exactly this gap and doctor said
"no problems found".

## Non-goals

- Executing or parsing the app's config: doctor stays static and
  dependency-free (regexes over comment-masked source), like every other rule.
- Proving the tokens rule is correct in detail (right preset options, filter
  regex actually matching): any config text that routes `@duro-app/tokens`
  somewhere is taken as intent. Conservative over clever.
- Changing website-builder or duro-app. The pilot only reads them.

## Behaviour

New rule `tokens-compiled`, per consumer package:

1. **StyleX in the build.** A `vite.*`/`babel.*`/`.babelrc` config (not
   `vitest.*`, not `postcss.*`) references a StyleX compiler:
   `@stylexjs/babel-plugin`, `@stylexjs/unplugin`, `@stylexjs/rollup-plugin`,
   `vite-plugin-stylex`, `@stylex-extend/*`, or `react-strict-dom/babel-preset`.
   None → silent (nothing compiles `css.create`, so nothing to route).
2. **Tokens routed.** Some config file mentions `@duro-app/tokens` (plain or
   regex-escaped, `@duro-app\/tokens`) outside comments and outside a
   `noExternal` list — a babel filter/include/transform. And, when the config
   is SSR (an `ssr:` key or the React Router / Remix vite plugin), a
   `noExternal` that lists `@duro-app/tokens` (or `noExternal: true`).
   Either missing → finding.
3. **Severity.** `error` when a source file under `app/`/`src/` both calls
   `css.create`/`stylex.create` and deep-imports `@duro-app/tokens/tokens/`:
   that build fails (or SSR throws) today. Otherwise `warn`: the gap is latent,
   but the design system's own rule 2 tells agents to write exactly that import,
   and apps then route around it with the forbidden barrel import
   (website-builder's `duroTheme.ts` does).
4. **Message** names the symptom (".stylex.ts extension" error), the cause and
   the fix: compile `node_modules/@duro-app/tokens` with
   `react-strict-dom/babel-preset` as duro-app does, and add it to
   `ssr.noExternal`.
5. Healthy → nothing, as before (session mode prints nothing).

## Phases

- [x] Phase 1 — plan (this file).
- [x] Phase 2 — `tokens-compiled` in `packages/cli/src/commands/doctor.ts`;
      tests in `packages/cli/test/doctor.test.ts`: fires on a
      website-builder-shaped config (warn; error with a deep import in a
      `css.create` file), silent on the duro-app shape, silent without StyleX,
      SSR without `noExternal` fires.
- [x] Phase 3 — docs: README rule table, CLAUDE.md doctor line.
- [x] Phase 4 — pilot against both real apps, repo checks, record below.

## Decision log

- **Warn by default, error on evidence.** The config alone cannot show the app
  imports tokens in `css.create`; a build that does is broken now (error), one
  that does not is one DS-conformant edit from broken (warn). An always-error
  rule would gate commits of apps that never touch tokens; never firing without
  evidence would have stayed silent on website-builder, which is the case that
  motivated this.
- **Any mention counts as routing.** A false alarm on a correctly wired app
  (duro-app) costs trust in doctor; a missed badly-written filter is cheaper.
- **Only vite/babel configs route the tokens** (found in the pilot): duro-app's
  `postcss.config.js` lists `node_modules/@duro-app/tokens/src/**` as an
  extraction `include`. That collects the rules; it does not compile the module
  the bundle imports. Counting it hid a falsified duro-app copy with the babel
  rule removed, so postcss (and vitest) configs no longer count.
- **Finding points at the config** (the file to fix), line of the StyleX
  reference; the evidence source file is named in the message.

## Verification

| Input                                                           | Expected                                                         | Actual                                                                                                            |
| --------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `website-builder/apps/builder-webapp`, `duro doctor`            | `tokens-compiled` warn at vite.config.ts                         | `0 error(s), 1 warning(s)`, `warn tokens-compiled vite.config.ts:6` (the `@stylexjs/babel-plugin` import), exit 0 |
| `duro-app`, `duro doctor` / `--session`                         | no finding / no output                                           | `duro doctor: no problems found` / empty                                                                          |
| duro-app copy, tokens babel rule and `noExternal` entry removed | error (its `app/root.tsx` deep-imports tokens into `css.create`) | `error tokens-compiled vite.config.ts:15`, `app/root.tsx:15 imports one into css.create`, exit 1                  |
| `vitest --project=unit`                                         | green                                                            | 248 passed (doctor: 25)                                                                                           |
| `pnpm lint`, `pnpm typecheck`                                   | green                                                            | 0 errors (26 pre-existing warnings), typecheck clean                                                              |
| `prettier --check` on changed files                             | clean                                                            | clean; `.github/workflows/release.yml`, `postcss.config.mjs` fail on origin/main already, untouched               |
| `build-registry.mjs --check` / `--check-docs`, CLI build        | up to date / builds                                              | up to date, builds                                                                                                |

## Outcome

Done. `duro doctor` now warns on website-builder's builder-webapp and stays
silent on duro-app. Ships in the next CLI minor (4.1.0).
