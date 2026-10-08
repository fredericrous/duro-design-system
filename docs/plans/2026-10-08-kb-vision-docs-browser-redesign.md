---
canonical: kb-vision:docs/plans/2026-10-08-kb-vision-docs-browser-redesign.md
phases: [1]
status: active
---

Part of [kb-vision docs browser redesign](https://git.daddyshome.fr/fredericrous/kb-vision/src/branch/feat/docs-browser/docs/plans/2026-10-08-kb-vision-docs-browser-redesign.md).
This repository carries Phase 1: `Breadcrumb`, `TableOfContents`, `PageNav`,
`onNavigate` on link parts (`TextLink`, `LinkButton`) and `href` on
`Tree.Item`, released as the next free minor (expected 5.5.0).

## Phase 1 status

- [x] `Breadcrumb`, `TableOfContents`, `PageNav`; `onNavigate` on
      `TextLink`, `LinkButton`, `Tree.Item href`; local ADR 0002
      (`components.link-navigation`); stories, registry and docs regenerated
- [ ] released as the next free minor (`npm view @duro-app/ui version`
      checked at tag time; the canonical plan records the result)

## Verification record

| Input                                                                               | Expected                               | Actual                                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `pnpm typecheck`                                                                    | pass                                   | pass                                                             |
| `pnpm lint`                                                                         | 0 errors                               | 0 errors, 16 warnings (all pre-existing)                         |
| storybook vitest (play + axe)                                                       | pass                                   | 64 files, 401 tests pass                                         |
| unit vitest                                                                         | pass                                   | 24 files, 392 tests pass                                         |
| `pnpm duro:registry` / `duro:docs`                                                  | no diff                                | no diff                                                          |
| `shared/linkParts.typecheck.tsx` with an illegal `current` + `href` Breadcrumb item | type error                             | type error (falsified, then restored)                            |
| `TouchTargets` stories under CDP touch emulation, minHeight removed                 | fail                                   | fail (falsified, then restored); with it: links ≥ 44 px          |
| Playwright trusted input on `Tree/WithLinks`: plain click, Enter                    | `onNavigate` once each                 | once each                                                        |
| same: cmd-click, middle-click                                                       | default kept, new tab, no `onNavigate` | new tab, no call                                                 |
| `PageNav/OnlyPrev`                                                                  | one link, Prev in the left half        | pass                                                             |
| `pnpm build`                                                                        | no `*.typecheck.d.ts` in `dist`        | none (they shipped before `1b812d2f`)                            |
| TOC list link with a mouse                                                          | `display: block` (artboard rail)       | block; flex only under `pointer: coarse` and in the menu variant |
| Tree/WithLinks axe `color-contrast` (AAA)                                           | disabled with a ceiling                | `holds-until` issue #79                                          |

Side effect for consumers: the CLI registry now merges union props, so
`ui/table` `FromTanstack` lists `onRowClick` and `rowAriaLabel` (named in
the PR and the release notes).
