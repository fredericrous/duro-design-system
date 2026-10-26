---
canonical: happier:docs/plans/2026-10-26-m3-shared-routes.md
phases: [D1]
status: active
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
