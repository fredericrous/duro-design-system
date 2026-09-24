<!-- amont:start -->

## Git hooks (amont)

This repository enforces pre-commit / pre-push checks. Ask the registry
rather than guessing before assuming a change is safe:

```sh
amont list --json
amont list --json --stage pre-push --pushed  # exactly what pushing next gates
```

Each check reports its _effective_ severity (`block`/`warn`, including any
`amont.severity.*` override) and whether it fires here. The same output
carries `commit_style`: the subject and description limits `commit-msg`
enforces, and where the type's gitmoji is placed. It also carries
`branch_style`: name a branch `<prefix>/<name>` BEFORE creating it —
prefixes are add, automation, build, chore, docs, feat, fix, hotfix, perf, refactor, remove, revert, style, test — because `pre-push` refuses a
new branch that breaks the pattern, at the end of the work instead of the
start.

`git commit` and `git push` both run their checks first, and neither is
instant: pre-commit can invoke formatters, linters or clippy (a workspace
build), and pre-push can run the test suite. Run `amont rehearse --wait`
BEFORE `git push`: it runs the same push gate on a snapshot of HEAD with no
connection open and stamps the tree, so the push itself skips the suite and
holds the remote for seconds instead of minutes (git connects before
pre-push runs, and a remote may drop the idle session while a suite runs).
Where `amont.rehearseOnCommit` is on, every commit already starts that
rehearsal in the background and `--wait` only follows it. Give both commands the
longest timeout your tooling allows, never its default: here a check is
killed only after 2m00s of silence or 1h00m in total
(`amont.idleTimeout` / `amont.timeout`), and a test suite may legitimately
run for most of that. If your tooling caps a foreground command below it,
run the command in the background and read its result when it exits —
while it runs, a line a minute on stderr says which check is alive and
when it last printed. A push killed mid-suite pushed nothing; a commit
killed mid-check committed nothing, and your unstaged work stays parked
until the next run says how to recover it. Neither is the checks failing —
it is the timeout. Run both bare and check the effect (`git log --oneline
-1`, `git ls-remote origin <branch>`): trimming their output with `| tail`
reports the pipe's exit status, so a killed or rejected run reads as
success.

Never bypass with `--no-verify`. To change enforcement, downgrade it
intentionally instead:

```sh
git config amont.severity.<check-id> warn
```

`commit-msg` takes neither `hook.skip` nor a severity override. Write the
message it asks for, or change what it asks for — `amont setup`, or
`amont.commit.*` directly.

<!-- amont:end -->
