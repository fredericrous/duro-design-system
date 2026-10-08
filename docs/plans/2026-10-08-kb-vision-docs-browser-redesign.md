---
canonical: kb-vision:docs/plans/2026-10-08-kb-vision-docs-browser-redesign.md
phases: [1b]
status: active
---

Part of [kb-vision docs browser redesign](https://git.daddyshome.fr/fredericrous/kb-vision/src/branch/feat/docs-browser/docs/plans/2026-10-08-kb-vision-docs-browser-redesign.md).
Phase 1 (`Breadcrumb`, `TableOfContents`, `PageNav`, `onNavigate`) shipped in
5.5.0. This branch carries Phase 1b, the gaps kb-vision's docs browser met
under `design-system.gaps-go-upstream`: `AppShell`, `Grid
layout="content-aside"` + `Aside`, `ref` on Grid / Aside / AppShell.Main and
`useContainerBelow`, `LiveRegion`, `Time` (`relative(date, {now, locale})`),
`Prose` (plain CSS, `:where(.duro-prose)`) + `CodeBlock`; `SideNav`
`aria-label`, `Heading` `id`, `Menu.Trigger` touch target. Issues for
Skeleton and a link Card. Released as the next free minor (expected 5.6.0).
