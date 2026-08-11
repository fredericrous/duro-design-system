import type {Registry} from './registry-types.js'
import {lookupNames} from './registry.js'

export function levenshtein(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const dist = Array.from({length: rows}, (_, i) => {
    const row = new Array<number>(cols).fill(0)
    row[0] = i
    return row
  })
  for (let j = 0; j < cols; j++) dist[0][j] = j
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1
      dist[i][j] = Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1, dist[i - 1][j - 1] + cost)
    }
  }
  return dist[a.length][b.length]
}

/** Closest names for "did you mean" — distance <= 2, best first. */
export function suggestions(registry: Registry, query: string): string[] {
  return lookupNames(registry)
    .map((name) => ({name, distance: levenshtein(query, name)}))
    .filter(({distance}) => distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(({name}) => name)
}

export interface SearchHit {
  kind: 'component' | 'recipe'
  key: string
  description: string
  score: number
}

/**
 * Full-text need-search over metas: agents rarely know the name — they know
 * the need, and whenToUse text is exactly need-phrased.
 */
export function search(registry: Registry, query: string): SearchHit[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2)
  if (terms.length === 0) return []

  const hits: SearchHit[] = []
  const score = (fields: Array<[string, number]>): number => {
    let total = 0
    for (const [text, weight] of fields) {
      const haystack = text.toLowerCase()
      for (const term of terms) {
        if (haystack.includes(term)) total += weight
      }
    }
    return total
  }

  for (const [key, entry] of Object.entries(registry.components)) {
    if (!entry.meta) continue
    const total = score([
      [entry.name, 5],
      [entry.meta.description, 3],
      [entry.meta.whenToUse.join(' '), 2],
      [entry.meta.whenNotToUse.join(' '), 1],
    ])
    if (total > 0)
      hits.push({kind: 'component', key, description: entry.meta.description, score: total})
  }
  for (const [key, entry] of Object.entries(registry.recipes)) {
    const total = score([
      [entry.name, 5],
      [entry.meta.description, 3],
      [entry.meta.whenToUse.join(' '), 2],
    ])
    if (total > 0)
      hits.push({kind: 'recipe', key, description: entry.meta.description, score: total})
  }
  return hits.sort((a, b) => b.score - a.score || (a.key < b.key ? -1 : 1)).slice(0, 8)
}
