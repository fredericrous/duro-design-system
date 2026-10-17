import type {Registry} from '../registry-types.js'
import {renderList} from '../format.js'
import {guideNames, lookupGuide} from '../registry.js'
import type {CommandResult} from './lookup.js'

const KINDS = new Set(['components', 'recipes', 'tokens', 'guides'])

export function runList(registry: Registry, kind?: string): CommandResult {
  if (kind !== undefined && !KINDS.has(kind)) {
    return {
      text: `duro list: unknown kind "${kind}" — expected components | recipes | tokens | guides`,
      data: {kind: 'usage-error'},
      exitCode: 2,
    }
  }
  const data = [
    ...(!kind || kind === 'components'
      ? Object.entries(registry.components).map(([key, entry]) => ({
          name: key,
          kind: entry.kind,
          importPath: entry.importPath,
          description: entry.meta?.description ?? null,
        }))
      : []),
    ...(!kind || kind === 'recipes'
      ? Object.entries(registry.recipes).map(([key, entry]) => ({
          name: key,
          kind: 'recipe',
          description: entry.meta.description,
        }))
      : []),
    ...(!kind || kind === 'tokens'
      ? Object.entries(registry.tokens.groups).map(([key, group]) => ({
          name: key,
          kind: 'tokens',
          importPath: group.importPath,
          description: `${group.entries.length} tokens`,
        }))
      : []),
    // Guides only when asked for: the session catalog and the manifest carry one index line.
    ...(kind === 'guides'
      ? guideNames(registry).map((name) => ({
          name,
          kind: 'guide',
          description: guideDescription(registry, name),
        }))
      : []),
  ]
  return {text: renderList(registry, kind), data}
}

/** SKILL.md: its front-matter description; any other file: its first heading. */
function guideDescription(registry: Registry, name: string): string | null {
  const guide = lookupGuide(registry, name)
  if (!guide.ok) return null
  const line = guide.content
    .split('\n')
    .find((text) => (guide.file === 'SKILL.md' ? /^description:/ : /^#\s/).test(text))
  if (!line) return null
  return line.replace(/^description:\s*|^#\s+/, '').replace(/^["']|["']$/g, '')
}
