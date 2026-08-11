#!/usr/bin/env node
// Generates packages/cli/registry.json — the machine-queryable docs registry
// aggregating component metas, extracted props, recipes, tokens, icons and
// rules. A pure function of the source tree: sorted keys, no timestamps, no
// absolute paths. `--check` verifies the committed file is current.

import {readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'
import {createProject} from './lib/project.mjs'
import {extractSurface} from './lib/components.mjs'
import {extractTokens, extractTokenUnions} from './lib/tokens.mjs'
import {extractIcons} from './lib/icons.mjs'
import {extractRecipes} from './lib/recipes.mjs'
import {extractRules} from './lib/rules.mjs'
import {spliceDocs} from './lib/docs.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const registryPath = join(here, '..', 'registry.json')

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeysDeep(value[key])]),
    )
  }
  return value
}

function firstDifference(a, b, path = '$') {
  if (a === b) return null
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') {
    return `${path}: ${JSON.stringify(a)?.slice(0, 80)} != ${JSON.stringify(b)?.slice(0, 80)}`
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const diff = firstDifference(a[key], b[key], `${path}.${key}`)
    if (diff) return diff
  }
  return null
}

export function buildRegistry() {
  const project = createProject()

  const surface = extractSurface(project, 'packages/ui/src/index.ts', '@duro-app/ui', {
    components: {},
    unions: extractTokenUnions(project),
  })
  extractSurface(project, 'packages/ui/src/table.ts', '@duro-app/ui/table', surface)
  extractSurface(project, 'packages/diagrams/src/index.ts', '@duro-app/diagrams', surface)

  const registry = {
    schemaVersion: 1,
    components: surface.components,
    recipes: extractRecipes(project, surface.components),
    tokens: extractTokens(project),
    icons: extractIcons(project),
    rules: extractRules(project),
    unions: surface.unions,
  }
  return sortKeysDeep(registry)
}

const args = new Set(process.argv.slice(2))
const registry = buildRegistry()
const serialized = JSON.stringify(registry, null, 2) + '\n'

if (args.has('--write-docs')) {
  const {changed} = spliceDocs(registry, {write: true})
  console.log(changed ? 'CLAUDE.md: generated regions updated' : 'CLAUDE.md: already current')
}
if (args.has('--check-docs')) {
  const {changed, changedRegion} = spliceDocs(registry, {write: false})
  if (changed) {
    console.error(`CLAUDE.md generated region "${changedRegion}" is stale — run: pnpm duro:docs`)
    process.exit(1)
  }
  console.log('CLAUDE.md: generated regions up to date')
}

if (args.has('--check')) {
  let committed
  try {
    committed = readFileSync(registryPath, 'utf8')
  } catch {
    console.error(`registry missing at ${registryPath} — run: pnpm duro:registry`)
    process.exit(1)
  }
  if (committed !== serialized) {
    const diff = firstDifference(JSON.parse(committed), registry)
    console.error(
      `registry stale (first difference at ${diff ?? 'formatting'}) — run: pnpm duro:registry`,
    )
    process.exit(1)
  }
  console.log('registry: up to date')
} else {
  writeFileSync(registryPath, serialized)
  console.log(
    `registry: ${Object.keys(registry.components).length} components, ${Object.keys(registry.recipes).length} recipes, ${registry.icons.names.length} icons -> ${registryPath}`,
  )
}
