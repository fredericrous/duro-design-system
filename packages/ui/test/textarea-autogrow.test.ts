import {describe, expect, it} from 'vitest'
import {
  fitToContent,
  supportsFieldSizing,
  type GrowableField,
} from '../src/components/Textarea/autoGrow'

// A textarea whose content is `lines` rows tall: `height: auto` shows `rows`
// rows, scrollHeight is the whole content, and maxHeight (CSS) caps the box.
function field({
  lines,
  rows,
  maxRows,
  lineH = 20,
  pad = 16,
  border = 2,
}: {
  lines: number
  rows: number
  maxRows?: number
  lineH?: number
  pad?: number
  border?: number
}) {
  const el = {
    style: {
      height: '',
      maxHeight: maxRows === undefined ? Infinity : maxRows * lineH + pad + border,
    },
    get scrollHeight() {
      return lines * lineH + pad
    },
    get offsetHeight() {
      const natural = (this.style.height === 'auto' ? rows : lines) * lineH + pad + border
      return Math.min(natural, this.style.maxHeight)
    },
    get clientHeight() {
      return this.offsetHeight - border
    },
  }
  return el as unknown as GrowableField & {style: {height: string; maxHeight: number}}
}

describe('Textarea autoGrow fallback', () => {
  it('grows with the content', () => {
    const el = field({lines: 5, rows: 3})
    expect(fitToContent(el)).toBe(5 * 20 + 16 + 2)
    expect(el.style.height).toBe('118px')
  })

  it('grows to maxRows, then the cap holds and the content scrolls', () => {
    const el = field({lines: 12, rows: 3, maxRows: 6})
    fitToContent(el)
    // the inline height asks for all 12 rows; the 6-row cap is what shows
    expect(parseInt(el.style.height)).toBeGreaterThan(6 * 20 + 16 + 2)
    expect(Math.min(parseInt(el.style.height), el.style.maxHeight)).toBe(6 * 20 + 16 + 2)
    expect(el.scrollHeight).toBeGreaterThan(el.clientHeight)
  })

  it('detects CSS field-sizing support', () => {
    expect(supportsFieldSizing({supports: (p, v) => p === 'field-sizing' && v === 'content'})).toBe(
      true,
    )
    expect(supportsFieldSizing({supports: () => false})).toBe(false)
    expect(supportsFieldSizing(undefined)).toBe(false)
  })
})
