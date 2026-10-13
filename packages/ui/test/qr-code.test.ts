import {create} from 'qrcode'
import {describe, expect, it} from 'vitest'
import {QUIET_ZONE, qrGeometry} from '../src/components/QrCode/geometry'

/** Paints the path back onto a grid: each `M{x} {y}h{n}…z` run fills n cells of row y from x. */
function paint(d: string, size: number): boolean[][] {
  const grid = Array.from({length: size}, () => Array<boolean>(size).fill(false))
  for (const [, x, y, n] of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
    for (let i = 0; i < Number(n); i++) grid[Number(y)][Number(x) + i] = true
  }
  return grid
}

describe('qrGeometry', () => {
  const value = 'happier://account?key=0123456789abcdef'
  const {modules} = create(value, {errorCorrectionLevel: 'M'})
  const {size, d} = qrGeometry(value)
  const grid = paint(d, size)

  it('frames the symbol in a light quiet zone', () => {
    expect(size).toBe(modules.size + QUIET_ZONE * 2)
    const edge = [
      ...grid[0],
      ...grid[size - 1],
      ...grid.map((row) => row[0]),
      ...grid.map((row) => row[size - 1]),
    ]
    expect(edge.every((dark) => !dark)).toBe(true)
  })

  it('draws exactly the dark modules of the encoded symbol', () => {
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        expect(grid[row + QUIET_ZONE][col + QUIET_ZONE]).toBe(Boolean(modules.get(row, col)))
      }
    }
  })

  it('changes with the value', () => {
    expect(qrGeometry('another value').d).not.toBe(d)
  })
})
