import type {Registry} from './registry-types.js'

/** Two components and the sentence that relates them. */
export interface RelatedPair {
  /** Alphabetically first of the two, so a pair has one stable identity. */
  a: string
  b: string
  relationship: string
}

/**
 * Derive the neighbour pairs the session bootstrap ships alongside the index.
 *
 * The catalog in `duro list` says what EXISTS. It does not say which one, and
 * it does not say what goes inside what — and those are the two ways agents
 * go wrong: a Menu built out of a Select, or a hand-rolled label next to an
 * Input that should have been wrapped in Field.Root. Both answers are already
 * authored per component in `relatedTo`; they just need to be reachable
 * without a `duro <Component>` call the agent may never make.
 *
 * The two kinds render as separate sections because they answer different
 * questions. A `composition` edge shown as "Input vs Field" would read as a
 * choice between them, which is the opposite of the guidance.
 */
export function relatedPairs(registry: Registry, kind: 'contrast' | 'composition'): RelatedPair[] {
  const byPair = new Map<string, RelatedPair>()
  for (const [name, entry] of Object.entries(registry.components)) {
    for (const related of entry.meta?.relatedTo ?? []) {
      if (related.kind !== kind) continue
      // A pair is only useful if both sides are documented.
      if (!(related.component in registry.components) || related.component === name) continue
      const [a, b] = [name, related.component].sort()
      const candidate: RelatedPair = {a, b, relationship: related.relationship}
      const held = byPair.get(`${a}|${b}`)
      if (held === undefined || score(candidate) > score(held)) byPair.set(`${a}|${b}`, candidate)
    }
  }
  // Components sharing a meta file (ColorModeProvider / ColorModeToggle /
  // useColorMode, Table / useDataTable) emit the same sentence against the
  // same neighbour. One is guidance; three is noise in a payload every
  // session pays for. Keep the pair the sentence actually names.
  const best = new Map<string, RelatedPair>()
  for (const pair of byPair.values()) {
    const held = best.get(pair.relationship)
    if (held === undefined || score(pair) > score(held)) best.set(pair.relationship, pair)
  }
  // Sort on the fields, not a joined key: locale collation treats a "|"
  // separator as punctuation and reorders around it.
  return [...best.values()].sort((x, y) => x.a.localeCompare(y.a) || x.b.localeCompare(y.b))
}

/**
 * Most pairs are declared from both sides with different wording. Prefer the
 * phrasing that names both components — it reads correctly whichever side the
 * agent arrives from, which a one-sided "Vertical equivalent" does not. Ties
 * keep the first seen, and registry keys are sorted, so this is deterministic.
 */
function score(pair: RelatedPair): number {
  return pair.relationship.includes(pair.a) && pair.relationship.includes(pair.b) ? 1 : 0
}
