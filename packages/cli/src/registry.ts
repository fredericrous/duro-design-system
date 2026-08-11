import {readFileSync} from 'node:fs'
import type {Registry} from './registry-types.js'

let cached: Registry | null = null

/**
 * Load the registry shipped next to dist/. readFileSync + JSON.parse rather
 * than a JSON import — import attributes aren't stable across the supported
 * Node range.
 */
export function loadRegistry(): Registry {
  if (cached) return cached
  const url = new URL('../registry.json', import.meta.url)
  let parsed: Registry
  try {
    parsed = JSON.parse(readFileSync(url, 'utf8')) as Registry
  } catch (error) {
    process.stderr.write(`duro: cannot read registry at ${url.pathname}: ${String(error)}\n`)
    process.exit(3)
  }
  if (parsed.schemaVersion !== 1) {
    process.stderr.write(
      `duro: registry schemaVersion ${String(parsed.schemaVersion)} is not supported by this CLI — update @duro-app/cli\n`,
    )
    process.exit(3)
  }
  cached = parsed
  return parsed
}

export type LookupResult =
  | {kind: 'component'; key: string; entry: Registry['components'][string]}
  | {kind: 'recipe'; key: string; entry: Registry['recipes'][string]}
  | {kind: 'tokens'; key: string; entry: Registry['tokens']['groups'][string]}
  | {kind: 'icons'; key: string; entry: Registry['icons']}
  | {kind: 'rules'; key: string; entry: Registry['rules']}

/** All lookup names, for suggestions and the manifest's enums. */
export function lookupNames(registry: Registry): string[] {
  return [
    ...Object.keys(registry.components),
    ...Object.keys(registry.recipes),
    ...Object.keys(registry.tokens.groups),
    'icons',
    'rules',
  ]
}

export function lookup(registry: Registry, name: string): LookupResult | null {
  if (name === 'rules') return {kind: 'rules', key: name, entry: registry.rules}
  if (name === 'icons') return {kind: 'icons', key: name, entry: registry.icons}
  if (registry.components[name]) {
    return {kind: 'component', key: name, entry: registry.components[name]}
  }
  if (registry.recipes[name]) return {kind: 'recipe', key: name, entry: registry.recipes[name]}
  if (registry.tokens.groups[name]) {
    return {kind: 'tokens', key: name, entry: registry.tokens.groups[name]}
  }
  // Case-insensitive exact fallback (duro button).
  const lower = name.toLowerCase()
  const ciKey = lookupNames(registry).find((candidate) => candidate.toLowerCase() === lower)
  if (ciKey && ciKey !== name) return lookup(registry, ciKey)
  return null
}
