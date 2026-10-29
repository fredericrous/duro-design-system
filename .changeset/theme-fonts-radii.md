---
'@duro-app/ui': minor
'@duro-app/tokens': minor
'@duro-app/cli': minor
---

`ThemeProvider` takes `fonts` (`fontFamily`, `fontFamilyMono`) and `radii` (`xs`, `sm`, `md`, `lg`) beside colour `overrides`. Each provider's own values are validated before merging (a font-family grammar; `0` or a non-negative px/rem radius), an invalid value is dropped with one development warning, and fonts and radii inherit across nested providers whatever their theme. `FontOverrides` and `RadiusOverrides` are exported. Three size tokens size a page hero: `heroMinH` 360px, `heroReserve` 272px, `heroMaxH` 720px. `duro mockup seed --overrides` reads a grouped `{colors?, fonts?, radii?}` file and writes font and radius variables too; usage errors now go to stderr.
