// Copied by render-consumer-emails.mjs into `<consumer>/.email-harness/` and run
// there with the consumer's own `tsx`, so every import (the templates, i18next,
// React, React Email and the installed @duro-app tarballs) resolves from the
// consumer's node_modules and tsconfig paths, exactly as in production.
//
//   tsx .email-harness/render-entry.tsx <manifest.json> <out-dir>

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {join, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import * as React from 'react'
import {render} from '@react-email/render'

type Manifest = {
  i18n: {module: string; export: string; locale: string}
  templates: {name: string; module: string; export: string; props: Record<string, unknown>}[]
  fixtures: string[]
}

const [manifestPath, outDir] = process.argv.slice(2)
if (!manifestPath || !outDir) throw new Error('usage: render-entry.tsx <manifest> <out-dir>')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
const root = process.cwd()
const load = (file: string) => import(pathToFileURL(resolve(root, file)).href)

const i18nModule = await load(manifest.i18n.module)
const i18n = await i18nModule[manifest.i18n.export](manifest.i18n.locale)
const t = i18n.getFixedT(manifest.i18n.locale)

mkdirSync(outDir, {recursive: true})
for (const entry of manifest.templates) {
  const mod = await load(entry.module)
  const component = mod[entry.export] as (props: Record<string, unknown>) => React.ReactElement
  // The templates are called as functions in production (render(InviteEmail({...}))).
  const html = await render(component({...entry.props, t}))
  writeFileSync(join(outDir, `${entry.name}.html`), html)
}

const fixtures = await import(pathToFileURL(join(root, '.email-harness', 'primitives.mjs')).href)
for (const name of manifest.fixtures) {
  const html = await render(fixtures.fixtures[name]())
  writeFileSync(join(outDir, `fixture.${name}.html`), html)
}
console.log(`rendered ${manifest.templates.length} templates, ${manifest.fixtures.length} fixtures`)
