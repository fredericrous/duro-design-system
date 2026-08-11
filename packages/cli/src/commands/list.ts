import type {Registry} from '../registry-types.js'
import {renderList} from '../format.js'
import type {CommandResult} from './lookup.js'

const KINDS = new Set(['components', 'recipes', 'tokens'])

export function runList(registry: Registry, kind?: string): CommandResult {
  if (kind !== undefined && !KINDS.has(kind)) {
    return {
      text: `duro list: unknown kind "${kind}" — expected components | recipes | tokens`,
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
  ]
  return {text: renderList(registry, kind), data}
}
