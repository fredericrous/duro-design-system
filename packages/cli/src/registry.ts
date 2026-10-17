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
  | {kind: 'guide'; key: string; skill: string; file: string; content: string}

export const GUIDE_PREFIX = 'guide:'
const GUIDE_ENTRY = 'SKILL.md'

export type GuideLookup =
  | {ok: true; skill: string; file: string; content: string}
  | {ok: false; message: string}

/** `guide:<skill>` is the skill's SKILL.md; `guide:<skill>/<file>` is one of its files. */
export function lookupGuide(registry: Registry, name: string): GuideLookup {
  const guides = registry.guides
  const spec = name.slice(GUIDE_PREFIX.length)
  const slash = spec.indexOf('/')
  const skill = slash === -1 ? spec : spec.slice(0, slash)
  const file = slash === -1 ? GUIDE_ENTRY : spec.slice(slash + 1)
  if (!guides || Object.keys(guides).length === 0) {
    return {ok: false, message: `unknown guide "${skill}" — this registry has no guides`}
  }
  const files = guides[skill]
  if (!files) {
    return {
      ok: false,
      message: `unknown guide "${skill}" — guides: ${Object.keys(guides).join(', ')}`,
    }
  }
  const content = files[file]
  if (content === undefined) {
    return {
      ok: false,
      message: `unknown file "${file}" in guide "${skill}" — files: ${Object.keys(files).join(', ')}`,
    }
  }
  return {ok: true, skill, file, content}
}

/** Lookup names of the guides: `guide:<skill>` and `guide:<skill>/<file>` for the rest. */
export function guideNames(registry: Registry): string[] {
  return Object.entries(registry.guides ?? {}).flatMap(([skill, files]) =>
    Object.keys(files).map((file) =>
      file === GUIDE_ENTRY ? `${GUIDE_PREFIX}${skill}` : `${GUIDE_PREFIX}${skill}/${file}`,
    ),
  )
}

/** All lookup names, for suggestions and the manifest's enums. */
export function lookupNames(registry: Registry): string[] {
  return [
    ...Object.keys(registry.components),
    ...Object.keys(registry.recipes),
    ...Object.keys(registry.tokens.groups),
    'icons',
    'rules',
    ...guideNames(registry),
  ]
}

export function lookup(registry: Registry, name: string): LookupResult | null {
  // Resolved first: typography, colors and spacing are also token-group names.
  if (name.startsWith(GUIDE_PREFIX)) {
    const guide = lookupGuide(registry, GUIDE_PREFIX + name.slice(GUIDE_PREFIX.length))
    return guide.ok ? {kind: 'guide', key: name, ...guide} : null
  }
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
