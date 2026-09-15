#!/usr/bin/env node
// Emits dist/mockup.css: the design tokens as RESOLVED literal values under the
// same public names vars.css publishes (`--duro-color-bg`, `--duro-spacing-md`).
//
// WHY THIS EXISTS
// vars.css aliases the StyleX variables, so it only resolves inside a page that
// loads the @duro-app/ui stylesheet. A mockup artboard is a sandboxed HTML file
// with no stylesheet at all — it needs the values themselves. Rather than let a
// mockup carry hand-copied hex (which is how every artboard drifted from the
// palette so far), this file gives it the palette under the durable names, per
// theme, so an artboard can be written in token names end to end and the
// implementation is a lookup rather than a translation.
//
// The values are read out of the src/**/*.css.ts literals with the same reader
// check-token-drift.mjs uses, so what a mockup calls `--duro-color-accent` is
// what the component library paints.
//
// Breakpoints are included for reference (`--duro-breakpoint-md: 768px`), but a
// media query cannot read a custom property — an artboard writes the literal
// width in its @media, and `duro mockup check` accepts exactly the values on
// this scale.

import {mkdir, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildMockupCss} from './lib/mockup-css.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const {css, count} = buildMockupCss(join(here, '..', 'src'))
const distDir = join(here, '..', 'dist')

await mkdir(distDir, {recursive: true})
await writeFile(join(distDir, 'mockup.css'), css, 'utf8')
console.log(`generate-mockup-css: ${count} resolved variables -> dist/mockup.css`)
