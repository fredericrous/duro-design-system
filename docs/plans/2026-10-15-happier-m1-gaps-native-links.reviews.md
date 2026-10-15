# Full reviews: Happier M1 gaps: native links and landmarks

Round 1. Every reviewer returned approve-with-changes. The main session merged their findings in
one pass, because the patches overlapped too much for `plan-apply`.

- **architect** (56k, 85 s):
  - ADR-0002 has no native clause, so a native addendum was added.
  - The web `followLink` stub was replaced by a TreeLinkRow split.
  - Native rows use no `aria-labelledby`; the row reads its own text.
  - The landmark change goes in the release notes.
- **backend** (45k, 36 s):
  - `_blank` skips `onNavigate`.
  - `followLink` gets unit tests.
  - Landmark release notes, plus a consumer grep.
  - An RSD issue is filed.
  - The CI ceiling is 3× the measured baseline.
  - `onNavigate` is required for in-app routes on native.
  - 5.16 is explained.
- **game-ux** (20k, 20 s):
  - A pressed state.
  - A Panel overflow check.
  - A dev warning when `onNavigate` is missing.
  - A numeric native trigger.
  - The length of the announced name.
- **lang:typescript** (45k, 35 s):
  - Native unit tests and a static `href` check.
  - The `_blank` rule.
  - REJECTED, superseded by the architect's TreeLinkRow split: the web-stub guard.
  - Decide on production-build numbers.
  - The landmark change is noted and the provider wraps the Drawer portal.
  - REJECTED as moot: the `useId` comma test.
- **po** (41k, 30 s):
  - A cut line.
  - A rollback trigger.
  - A Panel pass condition.
  - REJECTED: drop the native tree-bench. Happier is a phone app whose rail is always a drawer on
    native, and the bench is cheap during the checkpoint.
  - The consumer grep.
  - The CI ceiling from a baseline.
  - The 5.16 note.
- **react** (57k, 95 s):
  - Native `_blank`.
  - The chevron leaf gutter.
  - The name on the focused row.
  - Memoise context before windowing.
  - Decide on the production build.
  - A changeset note.
- **tui** (46k, 55 s):
  - Regenerate the registry, plus the CI gate.
  - Assert LinkButton false.
  - Check the CLI output.
- **ui-design** (42k, 32 s):
  - A meta-less row gets no `aria-labelledby` reference.
  - A Panel 50-row Body.
  - A pressed state and the 2.5.8 inline exception.
  - Name verbosity.
  - Narrow the no-mockup non-goal.
  - A numeric native trigger.
- **unix** (44k, 27 s):
  - Regenerate the registry, plus `--check --check-docs`.
  - Assert LinkButton false.
- **ux-research** (74k, 82 s):
  - Inline TextLink screen-reader reachability on native (RN #32004 and PR #33215).
  - Selected and expanded state on the focused native row.
  - Cite WCAG 1.3.1, not 2.5.3.
  - A RAIL 50 ms budget at 4× CPU.
  - "Navigation navigation" in the docs example.

Round 2, backend delta (36k, 22 s): approve-with-changes. All seven round-1 findings resolved, no
new blocker. Carried into implementation:

- [medium] Unit tests for `TextLink.native`: `target` drops `onNavigate`.
- [medium] Unit tests for `TreeRow.native`: select, then `followLink` once; no chevron
  `onClick` on a leaf; a dev warning once.
- [low] The TextLink meta also says that `onNavigate` is required for in-app routes on native.

The person's review of the presented plan (4 findings: native expansion must block the release;
meta inside Text; rows without `href`; the keystroke-to-paint gate and context broadcast) was
applied in full.

- Backend delta (61k, 67 s): approve-with-changes. One new high finding: a chevron inside a
  Pressable is hidden from VoiceOver, so it becomes a sibling pressable. Also `role="none"` on
  `li`/`ul`, an `expandLabel` empty-name warning, and an Event Timing `durationThreshold` of 16 with
  50 entries. Patches applied by `plan-apply`.
- Backend bind (66k, 117 s): approve-with-changes. All resolved, no blocker. Carried into
  implementation (low, so no body edit):
  - `expandLabel` wording: "the default returns the Item's text".
  - Merge the deprecation bullet into "After the release".
- Backend bind 2 (53k, 52 s): approve-with-changes.
  - The Event Timing gate counts a missing entry as under 16 ms.
  - `aria-expanded` sits on the chevron only.
  - Indent and leaf-gutter placement.
  - No `stopPropagation`.
    Patches applied by `plan-apply`.
- Final bind (29k, 27 s): approve-with-changes, no blocker. Carried into implementation (low,
  so no body edit):
  - Drop the doubled "cross-checked" clause in the Perf300 keystroke bullet.
  - Add the leaf-spacer descendant test to the `TreeRow.native` Verification list.
