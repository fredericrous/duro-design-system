---
'@duro-app/ui': patch
'@duro-app/tokens': patch
'@duro-app/diagrams': patch
'@duro-app/ui-email': patch
---

Published declarations now use explicit `.js` specifiers for every relative import, so a consumer with `moduleResolution: node16` or `nodenext` gets the real types. Until now, those imports failed to resolve: with `skipLibCheck: false` that was TS2834, and with `skipLibCheck: true` every type behind them silently became `any`. The build rewrites the emitted `.d.ts` files (`scripts/dts-extensions.mjs`, from `vite-plugin-dts`'s `afterBuild`) and fails on a specifier it cannot resolve; the sources keep their imports, which the native and web platform split relies on. CI and the release workflow now run `@arethetypeswrong/cli` (`pnpm check:types-packed`, esm-only profile) on the packed packages before anything is published.
