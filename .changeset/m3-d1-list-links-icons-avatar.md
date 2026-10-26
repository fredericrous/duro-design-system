---
'@duro-app/ui': minor
'@duro-app/tokens': minor
---

List (web and native): an Item with `href` (and `onNavigate`, ADR-0002) makes its Content a real link, a press through `followLink` on native; a disabled link Item is plain text. `List.Leading` holds an icon or an Avatar before the Content, and `List.Root` takes a `title` that names the list and a muted `footer`.

Tokens: seven category hues (`categoryBlue`, `categoryGreen`, `categoryOrange`, `categoryYellow`, `categoryRed`, `categoryIndigo`, `categoryPurple`) in every theme, for telling categories apart (an icon tile, a tag), never a state.

Icon: Phosphor glyphs (regular weight, MIT) generated under their Phosphor names by `scripts/generate-phosphor-icons.mjs` from `phosphor-names.json`, drawn on their own viewBox; Duro's own glyphs keep their names. Avatar: a picture, else initials, else a neutral blank, circle or square, sm/md/lg.
