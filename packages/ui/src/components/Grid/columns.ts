// Pure column arithmetic behind Grid. No react-strict-dom, no platform: this
// is what the unit project tests, and what both the web and native renderers
// derive their styles from.

export type GridColumnCount = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Column spec: a count (equal columns) or a list of weights (`[1, 2]` is a
 * one-third / two-thirds split). Weights are the portable form of
 * `grid-template-columns: 1fr 2fr` — the only shape both runtimes can
 * honour, since React Native has no grid.
 */
export type GridColumns = GridColumnCount | readonly number[]

/** Normalise a column spec to weights; `undefined` when no spec was given
 *  (the caller then falls back to auto-fit or a single column). An invalid
 *  weight list (empty, non-finite or non-positive entries) is a programming
 *  error, reported in development and treated as one column. */
export function columnWeights(columns: GridColumns | undefined): readonly number[] | undefined {
  if (columns === undefined) return undefined
  if (typeof columns === 'number') return Array.from({length: columns}, () => 1)
  const valid = columns.length > 0 && columns.every((w) => Number.isFinite(w) && w > 0)
  if (!valid) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `Grid: \`columns\` must be a non-empty list of positive numbers, got ${JSON.stringify(columns)}. Falling back to one column.`,
      )
    }
    return [1]
  }
  return columns
}

/** Web track list: `[1, 2]` → `"1fr 2fr"`. */
export function gridTemplate(weights: readonly number[]): string {
  return weights.map((w) => `${w}fr`).join(' ')
}

/** Native cell basis for the child at `index`: its column's share of the row
 *  as a percentage string Yoga accepts (`"33.3333%"`). Children flow into
 *  columns in order and wrap, exactly like grid auto-placement. */
export function cellBasis(weights: readonly number[], index: number): string {
  const total = weights.reduce((sum, w) => sum + w, 0)
  const share = (weights[index % weights.length] / total) * 100
  // Four decimals keeps a row summing to 100% within Yoga's tolerance while
  // never exceeding it (which would wrap the last cell).
  return `${Math.floor(share * 10000) / 10000}%`
}

/** Where the child at `index` sits in an `columnCount`-wide flow: whether it
 *  opens a row (no gap to its left) and whether it is on the first row (no
 *  gap above). Drives the native gap-as-padding scheme. */
export function cellPosition(
  index: number,
  columnCount: number,
): {opensRow: boolean; firstRow: boolean} {
  return {opensRow: index % columnCount === 0, firstRow: index < columnCount}
}
