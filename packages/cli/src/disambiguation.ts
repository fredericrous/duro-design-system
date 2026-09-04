import type {Registry} from './registry-types.js'

/** Two components you pick between, and the sentence that decides. */
export interface ContrastPair {
  /** Alphabetically first of the two, so a pair has one stable identity. */
  a: string
  b: string
  distinction: string
}

/**
 * Derive the wrong-pick guard from the components' `contrast` edges.
 *
 * The catalog in `duro list` says what EXISTS; it does not say which one, and
 * choosing is where agents go wrong — a Menu built out of a Select, a Card
 * where Panel was meant. That guidance is already authored per component in
 * `relatedTo`; it just needs to be reachable without a second lookup the
 * agent may never make.
 *
 * Only `contrast` edges qualify. `composition` edges ("Place Input inside
 * Field.Root") are real guidance but answer a different question, and reading
 * as "Input vs Field" they would actively mislead.
 */
export function contrastPairs(registry: Registry): ContrastPair[] {
  const byPair = new Map<string, ContrastPair>()
  for (const [name, entry] of Object.entries(registry.components)) {
    // You never pick a hook instead of a component, and a hook's meta is its
    // component's meta, so hooks only ever restate an edge already listed.
    if (entry.kind === 'hook') continue
    for (const related of entry.meta?.relatedTo ?? []) {
      if (related.kind !== 'contrast') continue
      // A pair is only useful if both sides are documented.
      if (!(related.component in registry.components) || related.component === name) continue
      if (registry.components[related.component].kind === 'hook') continue
      const [a, b] = [name, related.component].sort()
      const candidate: ContrastPair = {a, b, distinction: related.relationship}
      const existing = byPair.get(`${a}|${b}`)
      if (existing === undefined || score(candidate) > score(existing)) {
        byPair.set(`${a}|${b}`, candidate)
      }
    }
  }
  // Components that share a meta file (ColorModeProvider / ColorModeToggle)
  // emit the same sentence against the same neighbour. One is guidance; three
  // is noise in a payload every session pays for. Keep the pair the sentence
  // actually names, so the label and the text agree.
  const best = new Map<string, ContrastPair>()
  for (const pair of byPair.values()) {
    const held = best.get(pair.distinction)
    if (held === undefined || score(pair) > score(held)) best.set(pair.distinction, pair)
  }
  return [...best.values()].sort((x, y) => `${x.a}|${x.b}`.localeCompare(`${y.a}|${y.b}`))
}

/**
 * Most pairs are declared from both sides with different wording. Prefer the
 * phrasing that names both components — it reads correctly in either
 * direction, which a one-sided "Vertical equivalent" does not. Ties keep the
 * first seen, and registry keys are sorted, so the choice is deterministic.
 */
function score(pair: ContrastPair): number {
  return pair.distinction.includes(pair.a) && pair.distinction.includes(pair.b) ? 1 : 0
}
