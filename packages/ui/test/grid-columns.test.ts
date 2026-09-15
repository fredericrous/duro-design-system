import {afterEach, describe, expect, it, vi} from 'vitest'
import {cellBasis, cellPosition, columnWeights, gridTemplate} from '../src/components/Grid/columns'

describe('columnWeights', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('expands a count into equal weights and passes a weight list through', () => {
    expect(columnWeights(3)).toEqual([1, 1, 1])
    expect(columnWeights([1, 2])).toEqual([1, 2])
    expect(columnWeights(undefined)).toBeUndefined()
  })

  it('reports an invalid weight list in development and falls back to one column', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(columnWeights([])).toEqual([1])
    expect(columnWeights([1, 0])).toEqual([1])
    expect(columnWeights([1, Number.NaN])).toEqual([1])
    expect(columnWeights([2, -1])).toEqual([1])
    expect(error).toHaveBeenCalledTimes(4)
  })
})

describe('gridTemplate', () => {
  it('renders weights as fr tracks', () => {
    expect(gridTemplate([1, 2])).toBe('1fr 2fr')
    expect(gridTemplate([1, 1, 1])).toBe('1fr 1fr 1fr')
    expect(gridTemplate([3, 1.5])).toBe('3fr 1.5fr')
  })
})

describe('cellBasis', () => {
  it("gives each child its column's share of the row, wrapping columns in order", () => {
    expect(cellBasis([1, 2], 0)).toBe('33.3333%')
    expect(cellBasis([1, 2], 1)).toBe('66.6666%')
    expect(cellBasis([1, 2], 2)).toBe('33.3333%')
    expect(cellBasis([1, 1, 1, 1], 3)).toBe('25%')
  })

  it('never lets a row exceed 100% after rounding', () => {
    for (const weights of [
      [1, 2],
      [1, 1, 1],
      [2, 3, 5],
      [1, 1, 1, 1, 1, 1, 1],
    ]) {
      const row = weights.reduce((sum, _w, i) => sum + Number.parseFloat(cellBasis(weights, i)), 0)
      expect(row).toBeLessThanOrEqual(100)
      expect(row).toBeGreaterThan(99.99)
    }
  })
})

describe('cellPosition', () => {
  it('knows which children open a row and which sit on the first row', () => {
    expect(cellPosition(0, 2)).toEqual({opensRow: true, firstRow: true})
    expect(cellPosition(1, 2)).toEqual({opensRow: false, firstRow: true})
    expect(cellPosition(2, 2)).toEqual({opensRow: true, firstRow: false})
    expect(cellPosition(5, 3)).toEqual({opensRow: false, firstRow: false})
  })
})
