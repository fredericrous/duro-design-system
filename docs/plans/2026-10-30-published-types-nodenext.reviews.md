# Reviews: Duro 5.37.1, published types resolve under nodenext

## Full reviews (reference)

- **backend round 1**, approve-with-changes (54k, 60 s):
  1. high: nothing showed that a throw in `afterBuild` fails `vite build` → real-build row 4b;
  2. medium: a regex catches comments → `ts.preProcessFile`;
  3. medium: the consumer missed `react-hook-form` and `"type": "module"`;
  4. medium: the release check must not rebuild;
  5. low: record the CI step time.

  All accepted.

- **backend round 2**, approve-with-changes (58k, 25 s): 2–5 resolved; row 4b must plant a hand-written `src/__probe.d.ts`; blocker: `/// <reference path>` must never be rewritten. Both applied.
- **backend re-run**, approve (61k, 12 s). Carried into implementation: if `copyDtsFiles` does not pick up `src/__probe.d.ts`, row 4b exits 0 and fails visibly; point the probe at an included path.
- **backend, final body**, approve (44k, 31 s), no new findings. Carried into implementation: in `release.yml`, the four tarballs at the unpublished tag version must resolve each other from the local tarballs, not the registry; check that step's log on the first tag.
