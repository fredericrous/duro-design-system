---
canonical: happier:docs/plans/2026-10-26-m3-shared-routes.md
phases: [D1]
status: done
branch: feat/m3-d1-list-icons
---

# M3: the remaining routes on shared Duro screens (pointer)

Canonical plan: happier `docs/plans/2026-10-26-m3-shared-routes.md` (M3 of the Happier fork programme; reviewed by the panel and Codex, body `c92ffe463973`). It moves every remaining route of Happier's React Native app onto shared Duro screens, mirroring the RN screens with no mockups (the person's decision, 2026-10-26).

This repository carries **D1**, the Duro gaps the first slices meet (settings home, new session):

- `List`: a link item (`href` / `onNavigate`, a real link like every other link part, ADR-0002), a `Leading` slot before the content, and a `title` / `footer` on the root (RN's `ItemGroup`).
- Category colour tokens (`categoryBlue`, `categoryGreen`, `categoryOrange`, `categoryYellow`, `categoryRed`, `categoryIndigo`, `categoryPurple`): RN colours each settings icon by category, and Duro's other colours all carry a status meaning.
- Phosphor glyphs: the person chose (2026-10-26) to generate them from `@phosphor-icons/core` (MIT, regular weight) under the names Happier's RN app uses, so the shared screens draw the same icons as RN. A generator script reads a name list; the 49 glyphs Duro draws itself stay, and a name both define keeps Duro's.
- `Avatar`: an image, or initials when there is none, circle or square.

## Decision log

- 2026-10-26: icons generated from Phosphor rather than drawn in Duro's stroke style or mapped to the nearest existing glyph (the person's choice, offered with both alternatives).

## Verification (D1)

| Input                                         | Expected                                               | Actual                                                                                                                                                                                                                                                |
| --------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck` (web + native)               | exit 0                                                 | exit 0                                                                                                                                                                                                                                                |
| `pnpm lint`                                   | 0 errors                                               | 0 errors (13 warnings, all pre-existing files)                                                                                                                                                                                                        |
| `pnpm test:unit --run`                        | all pass                                               | 40 files pass (after the category hexes joined the eslint-plugin colour table and Avatar the native example)                                                                                                                                          |
| Storybook tests: List, Avatar, Icon, TextLink | all pass                                               | pass (List LinkItems: link role and href, plain click → onNavigate, modified click → browser default, a press on the Leading icon follows the link once, cmd-click there keeps the modifier; Avatar: image, initials, blank, broken image → initials) |
| `pnpm native:install && pnpm native:export`   | exit 0                                                 | exit 0                                                                                                                                                                                                                                                |
| Phosphor generator run twice                  | no diff                                                | identical (128 names)                                                                                                                                                                                                                                 |
| Storybook in Chrome, dark and light           | rows with category icons, title, footer; Avatar states | as expected (attestations/bebd3a69)                                                                                                                                                                                                                   |

## Implementation review

approve, after round 1 approve-with-changes and one delta (≈ 237k tokens in all, 97 s).
Fixed: a press anywhere on a link row follows the link (anchor replay with the row's modifier keys on the web; on native the link stops its own press and the row follows); Avatar broken-image story; generator comment matches geometry.ts.
Carried to the PR body: the `@phosphor-icons/core` argument (devDependency only, output committed).
Still to check by hand on a device: one tap per navigation on a native link row (text and icon).
