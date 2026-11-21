# Full reviews: greenrack fields show their own native validation message

## Full reviews (reference)

- backend (opus-5-5): r1 approve-with-changes, 6 findings (blocking adds=contract; registerError counter; decisions line; RHF+native story; production signal rejected; tarball check), 29k, 27 s. r2 approve-with-changes (post-commit compare; decisions line; remove counter rejected: conditional Field.Error in happier and application-landscape), 47k, 54 s. Final body: approve, 48k, 30 s. Codex delta: resolved, 51k, 13 s.
- lang:typescript (opus-5-5): r1 approve-with-changes (setter type/updater, reset + RHF reset, layout-effect registration, tarball grep), 69k, 102 s. r2 approve-with-changes (high: record el.value in the invalid handler, defaultValue story; server error invalid), 70k, 17 s.
- react (opus-5-5): r1 approve-with-changes (registration counter, stable merged ref, InForm story, empty Error, 7.3.0 gate + role test, duplicate announcement), 58k, 37 s. r2 approve-with-changes (server error invalid; compare after commit), 63k, 23 s.
- ui-design (opus-5-5): r1 approve-with-changes (one error line, helper order, stale reopen, widths/themes, mockup note), 31k, 23 s. r2 approve-with-changes (high: server error invalid; Field.Description rejected, exists at Field.tsx:240; waitFor carried), 36k, 15 s.
- tui (opus-5-5): r1 approve-with-changes (meta placement, bullet width, CLI output check), 54k, 59 s. r2 approve (Phase 2 wording fixed; script names rejected, verified at package.json:17-18), 58k, 15 s.
- unix (opus-5-5): r1 approve-with-changes (registry + docs commands), 49k, 40 s. r2 approve-with-changes (88-column wrap width), 55k, 20 s.
- architect (opus-5-5): approve-with-changes (keep Field.Error render rule, server error invalid, how the compare runs), 67k, 68 s.
- po (opus-5-5): approve-with-changes (amend f31 answer; server error invalid; high: consumer sweep + rollback rule, scoped to social-planner with inbox lines for others), 57k, 57 s.
- codex (gpt, high effort): approve-with-changes. High: ref merger drops React 19 callback-ref cleanup (applied). Carried into implementation: InForm story seeds an RHF error with `setError` and proves the native fallback first; reconcile a shown message when constraints change with the value unchanged (`willValidate`, `validity.valid`).
- Carried into implementation (4): codex InForm seeding; codex constraint-change reconcile; ui-design `waitFor` on effect-driven clears; backend: run the social-planner sweep before its merge.

- Delta (prettier-stable body, 0abbe950e204): backend resolved; lang:typescript approve (low: object-ref cleanup sets `.current = null`, carried); react approve (merger cleanup must call RHF `field.ref(null)`, carried); ui-design resolved (React peer is ^19).
