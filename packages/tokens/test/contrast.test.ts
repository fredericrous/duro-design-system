import {describe, expect, it} from 'vitest'
import {darkColors, highContrastColors, lightColors} from '@duro-app/tokens/raw'

function luminance(hex: string): number {
  const digits = hex.replace('#', '')
  const channels = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((s) => (s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** An rgba() colour composited over an opaque hex background, as hex. */
function composite(rgba: string, backgroundHex: string): string {
  const [r, g, b, a] = rgba.match(/[\d.]+/g)!.map(Number) as [number, number, number, number]
  const bg = [0, 2, 4].map((i) => parseInt(backgroundHex.replace('#', '').slice(i, i + 2), 16))
  const mixed = [r, g, b].map((c, i) => Math.round(a * c + (1 - a) * bg[i]!))
  return '#' + mixed.map((c) => c.toString(16).padStart(2, '0')).join('')
}

describe('contrastSurface', () => {
  const themes = {dark: darkColors, light: lightColors, highContrast: highContrastColors}

  for (const [name, palette] of Object.entries(themes)) {
    it(`${name}: onContrastSurface reads at 4.5:1 or better`, () => {
      expect(contrast(palette.onContrastSurface, palette.contrastSurface)).toBeGreaterThanOrEqual(
        4.5,
      )
    })
  }

  // Non-text contrast (WCAG 1.4.11): the border, composited over the surface,
  // stands 3:1 or better against it.
  for (const [name, palette] of Object.entries(themes)) {
    it(`${name}: contrastBorder stands 3:1 or better on contrastSurface`, () => {
      const border = composite(palette.contrastBorder, palette.contrastSurface)
      expect(contrast(border, palette.contrastSurface)).toBeGreaterThanOrEqual(3)
    })
  }

  it('takes the opposite tone of the theme', () => {
    expect(darkColors.contrastSurface).toBe(lightColors.bgCard)
    expect(darkColors.onContrastSurface).toBe(lightColors.text)
    expect(lightColors.contrastSurface).toBe(darkColors.bgCard)
    expect(lightColors.onContrastSurface).toBe(darkColors.text)
    expect(highContrastColors.contrastSurface).toBe('#ffffff')
    expect(highContrastColors.onContrastSurface).toBe('#000000')
  })
})
