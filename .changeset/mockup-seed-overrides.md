---
'@duro-app/cli': minor
---

`duro mockup seed --overrides <file.json>` writes colour token overrides (the JSON a `ThemeProvider` `overrides` prop takes) into the seeded artboard's token block, for every theme. An unknown key, a value that is not a CSS colour, or an unreadable file exits 2.
