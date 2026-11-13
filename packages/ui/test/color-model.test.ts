import {describe, expect, it} from 'vitest'
import {
  formatColor,
  formatHex,
  formatHsl,
  formatRgb,
  hsvaToRgba,
  parseColor,
  rgbaToHsva,
} from '../src/components/ColorPicker/colorModel'

describe('parseColor', () => {
  it('reads every hex length', () => {
    expect(parseColor('#f80')).toEqual({r: 255, g: 136, b: 0, a: 1})
    expect(parseColor('#ff8800')).toEqual({r: 255, g: 136, b: 0, a: 1})
    expect(parseColor('#ff880080')).toEqual({r: 255, g: 136, b: 0, a: 0.5})
    expect(parseColor('#f808')).toEqual({r: 255, g: 136, b: 0, a: 0.53})
  })

  it('reads rgb, rgba, hsl and hsla', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual({r: 10, g: 20, b: 30, a: 1})
    expect(parseColor('rgba(10,20,30,0.25)')).toEqual({r: 10, g: 20, b: 30, a: 0.25})
    expect(parseColor('rgb(10 20 30 / 50%)')).toEqual({r: 10, g: 20, b: 30, a: 0.5})
    expect(parseColor('hsl(0, 100%, 50%)')).toEqual({r: 255, g: 0, b: 0, a: 1})
    expect(parseColor('hsla(120, 100%, 25%, 0.5)')).toEqual({r: 0, g: 128, b: 0, a: 0.5})
  })

  it('reads transparent in any case', () => {
    expect(parseColor(' Transparent ')).toEqual({r: 0, g: 0, b: 0, a: 0})
  })

  it('rejects what is not a colour', () => {
    for (const text of [
      '',
      '#',
      '#12',
      '#12345',
      '#gggggg',
      'red',
      'rgb(1,2)',
      'rgb(a,b,c)',
      'hsl(0,1,2)',
      'rgb(1,2,3',
      '12',
    ]) {
      expect(parseColor(text), text).toBeNull()
    }
  })
})

describe('format round trips', () => {
  const samples = [
    '#ff8800',
    '#11223344',
    'rgba(1, 2, 3, 0.5)',
    'hsla(200, 50%, 40%, 0.3)',
    'transparent',
  ]

  it('hex survives parse then format', () => {
    for (const text of ['#ff8800', '#11223380', '#000000']) {
      expect(formatHex(parseColor(text)!)).toBe(text)
    }
  })

  it('rgb and rgba survive parse then format', () => {
    expect(formatRgb(parseColor('rgb(1, 2, 3)')!)).toBe('rgb(1, 2, 3)')
    expect(formatRgb(parseColor('rgba(1, 2, 3, 0.5)')!)).toBe('rgba(1, 2, 3, 0.5)')
  })

  it('hsl and hsla survive parse then format', () => {
    expect(formatHsl(parseColor('hsl(210, 50%, 40%)')!)).toBe('hsl(210, 50%, 40%)')
    expect(formatHsl(parseColor('hsla(30, 100%, 50%, 0.5)')!)).toBe('hsla(30, 100%, 50%, 0.5)')
  })

  it('formatColor picks hex, rgba or transparent and reparses to the same colour', () => {
    expect(formatColor(parseColor('#ff0000')!)).toBe('#ff0000')
    expect(formatColor(parseColor('rgba(1, 2, 3, 0.5)')!)).toBe('rgba(1, 2, 3, 0.5)')
    expect(formatColor(parseColor('transparent')!)).toBe('transparent')
    for (const text of samples) {
      const color = parseColor(text)!
      expect(parseColor(formatColor(color))).toEqual(color)
    }
  })

  it('keeps the colour of a clear non-black', () => {
    expect(formatColor({r: 1, g: 2, b: 3, a: 0})).toBe('rgba(1, 2, 3, 0)')
  })
})

describe('HSV and RGB', () => {
  const known: [string, {h: number; s: number; v: number}][] = [
    ['#ff0000', {h: 0, s: 1, v: 1}],
    ['#00ff00', {h: 120, s: 1, v: 1}],
    ['#0000ff', {h: 240, s: 1, v: 1}],
    ['#ffffff', {h: 0, s: 0, v: 1}],
    ['#000000', {h: 0, s: 0, v: 0}],
    ['#808000', {h: 60, s: 1, v: 128 / 255}],
  ]

  it('converts known colours to HSV', () => {
    for (const [hex, {h, s, v}] of known) {
      const hsva = rgbaToHsva(parseColor(hex)!)
      expect(hsva.h, hex).toBeCloseTo(h, 5)
      expect(hsva.s, hex).toBeCloseTo(s, 5)
      expect(hsva.v, hex).toBeCloseTo(v, 5)
    }
  })

  it('converts HSV to RGB', () => {
    expect(hsvaToRgba({h: 240, s: 1, v: 1, a: 1})).toEqual({r: 0, g: 0, b: 255, a: 1})
    expect(hsvaToRgba({h: 300, s: 0.5, v: 0.5, a: 1})).toEqual({r: 128, g: 64, b: 128, a: 1})
  })

  it('round trips every RGB corner and a sweep through HSV', () => {
    for (let r = 0; r <= 255; r += 51) {
      for (let g = 0; g <= 255; g += 51) {
        for (let b = 0; b <= 255; b += 51) {
          const color = {r, g, b, a: 1}
          expect(hsvaToRgba(rgbaToHsva(color))).toEqual(color)
        }
      }
    }
  })

  it('carries alpha through both directions', () => {
    const color = {r: 12, g: 200, b: 99, a: 0.4}
    expect(rgbaToHsva(color).a).toBe(0.4)
    expect(hsvaToRgba(rgbaToHsva(color)).a).toBe(0.4)
  })
})
