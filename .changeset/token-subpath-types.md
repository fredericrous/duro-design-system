---
'@duro-app/tokens': patch
'@duro-app/ui': patch
---

Every `@duro-app/tokens` subpath (`./tokens/*.css`, `./themes/*.css`, `./keys`) now resolves its TypeScript types from the built declarations in `dist/`, through a `types` condition; bundlers, the StyleX babel plugin and Metro still load the source (`default`, `source`, `react-native`). A consumer on `moduleResolution: node16` or `nodenext` importing `layers.css`, `type-presets.css`, `themes/light.css` or `themes/high-contrast.css` now gets their real types instead of `any`, and attw checks every token subpath (only the `vars.css` and `mockup.css` stylesheets stay excluded).
