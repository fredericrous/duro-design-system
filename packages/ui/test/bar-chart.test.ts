import {describe, expect, it} from 'vitest'
import {niceScale} from '../src/components/BarChart/scale'
import {darkColors, highContrastColors, lightColors} from '@duro-app/tokens/raw'

describe('niceScale', () => {
  it('rounds the top up to a nice step and returns three gridlines', () => {
    expect(niceScale(297)).toEqual({top: 300, gridlines: [100, 200, 300]})
    expect(niceScale(100)).toEqual({top: 150, gridlines: [50, 100, 150]})
  })

  it('never returns a top below the largest stack', () => {
    for (const max of [1, 3, 7, 14, 59, 100, 297, 301, 999, 1234]) {
      const {top, gridlines} = niceScale(max)
      expect(top).toBeGreaterThanOrEqual(max)
      expect(gridlines[2]).toBe(top)
      const step = gridlines[0]
      const mantissa = step / 10 ** Math.floor(Math.log10(step))
      expect([1, 2, 5]).toContain(Math.round(mantissa * 1e6) / 1e6)
    }
  })

  it('handles an empty chart', () => {
    const {top, gridlines} = niceScale(0)
    expect(top).toBeGreaterThan(0)
    expect(gridlines).toHaveLength(3)
    expect(niceScale(Number.NaN).top).toBeGreaterThan(0)
  })
})

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

for (const [theme, colors] of Object.entries({
  dark: darkColors,
  light: lightColors,
  'high-contrast': highContrastColors,
})) {
  describe(`BarChart segment contrast (${theme} theme, WCAG 1.4.11)`, () => {
    const tones = {
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
      info: colors.info,
      muted: colors.textMuted,
    }
    for (const [tone, value] of Object.entries(tones)) {
      it(`${tone} holds 3:1 against bgCard`, () => {
        expect(contrast(value, colors.bgCard)).toBeGreaterThanOrEqual(3)
      })
    }
  })
}
