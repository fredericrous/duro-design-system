import type {Registry} from '../registry-types.js'
import {lookup} from '../registry.js'
import {search, suggestions} from '../search.js'
import {
  renderComponent,
  renderIcons,
  renderRecipe,
  renderRules,
  renderTokenGroup,
} from '../format.js'

export interface LookupOptions {
  part?: string
  propsOnly?: boolean
  sourceOnly?: boolean
}

export interface CommandResult {
  text: string
  data: unknown
  exitCode?: number
}

export function runLookup(
  registry: Registry,
  query: string,
  options: LookupOptions,
): CommandResult {
  const hit = lookup(registry, query)
  if (hit) {
    switch (hit.kind) {
      case 'component':
        return {
          text: renderComponent(registry, hit.key, hit.entry, {
            part: options.part,
            propsOnly: options.propsOnly,
          }),
          data: {kind: hit.kind, key: hit.key, entry: hit.entry},
        }
      case 'recipe':
        return {
          text: renderRecipe(hit.entry, {sourceOnly: options.sourceOnly}),
          data: {kind: hit.kind, key: hit.key, entry: hit.entry},
        }
      case 'tokens':
        return {
          text: renderTokenGroup(hit.key, hit.entry),
          data: {kind: hit.kind, key: hit.key, entry: hit.entry},
        }
      case 'icons':
        return {text: renderIcons(hit.entry), data: {kind: hit.kind, entry: hit.entry}}
      case 'rules':
        return {text: renderRules(hit.entry), data: {kind: hit.kind, entry: hit.entry}}
    }
  }

  // Not a name: try full-text search over the metas.
  const hits = search(registry, query)
  if (hits.length > 0) {
    const width = Math.max(...hits.map((searchHit) => searchHit.key.length)) + 2
    const text = [
      `No exact match for "${query}" — closest by usage:`,
      ...hits.map(
        (searchHit) =>
          `  ${searchHit.key.padEnd(width)}${searchHit.kind === 'recipe' ? '(recipe) ' : ''}${searchHit.description}`,
      ),
      '',
      `duro ${hits[0].key} for details`,
    ].join('\n')
    return {text, data: {kind: 'search', query, hits}}
  }

  const didYouMean = suggestions(registry, query)
  const hint = didYouMean.length > 0 ? ` Did you mean: ${didYouMean.join(', ')}?` : ''
  return {
    text: `duro: nothing found for "${query}".${hint} Try: duro list`,
    data: {kind: 'not-found', query, suggestions: didYouMean},
    exitCode: 1,
  }
}
