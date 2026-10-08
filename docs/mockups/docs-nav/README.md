# docs-nav — the picked docs browser artboards

Copied unchanged from kb-vision `docs/mockups/docs-browser/` (commit `fc51408`),
the canvas https://claude.ai/artifact/Ghf3q9rV2izvQBkjQFjMGx — direction **A**
(Reader, Mobile) with **B**'s home and **C**'s section index, as picked in the
kb-vision docs browser plan (`docs/plans/2026-10-08-kb-vision-docs-browser-redesign.md`).

| Artboard          | Screen                     | Draws                                                   |
| ----------------- | -------------------------- | ------------------------------------------------------- |
| `Reader.dc.html`  | a docs page                | `Breadcrumb`, `TableOfContents` (list), `PageNav`, Tree |
| `Mobile.dc.html`  | a docs page below `sm`     | `Breadcrumb`, `TableOfContents` (menu), `PageNav` stacked |
| `Home.dc.html`    | `/docs`                    | the shell's Tree                                        |
| `Section.dc.html` | a section index            | `Breadcrumb`, the shell's Tree                          |

The artboards predate the components: they name them as proposals
(`Inline (Breadcrumb, proposed DS component)`, `List (TableOfContents, …)`,
`Card interactive (Pagination prev, proposed)`). The components' styles cite
the classes they follow (`.crumbs`, `.toc` / `.tocitem`, `.mtoc`, `.pn .card`).
