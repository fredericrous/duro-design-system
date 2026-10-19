import {describe, expect, it, vi} from 'vitest'
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

  it('asks for the full content height past maxRows (the AutoGrow story covers the cap and scrolling)', () => {
    const el = field({lines: 12, rows: 3, maxRows: 6})
    fitToContent(el)
    // the inline height asks for all 12 rows; the cap is the AutoGrow story's to prove
    expect(el.style.height).toBe('258px')
  })

  it('detects CSS field-sizing support', () => {
    expect(supportsFieldSizing({supports: (p, v) => p === 'field-sizing' && v === 'content'})).toBe(
      true,
    )
    expect(supportsFieldSizing({supports: () => false})).toBe(false)
    expect(supportsFieldSizing(undefined)).toBe(false)
  })
})

describe('useAutoGrowFallback without field-sizing', () => {
  it('grows an uncontrolled field on input, up to maxRows, then it scrolls', async () => {
    vi.resetModules()
    const effects: Array<() => void | (() => void)> = []
    vi.doMock('react', () => ({
      useLayoutEffect: (fn: () => void) => void effects.push(fn),
      useEffect: (fn: () => void) => void effects.push(fn),
    }))
    vi.stubGlobal('CSS', {supports: () => false})
    const {useAutoGrowFallback} = await import('../src/components/Textarea/useAutoGrowFallback')

    const el = field({lines: 2, rows: 2, maxRows: 4}) as ReturnType<typeof field> & {
      addEventListener: (type: string, fn: () => void) => void
      removeEventListener: (type: string, fn: () => void) => void
    }
    const listeners = new Map<string, () => void>()
    el.addEventListener = (type, fn) => void listeners.set(type, fn)
    el.removeEventListener = (type) => void listeners.delete(type)
    // the field is typed into: more lines, no re-render
    let lines = 2
    Object.defineProperty(el, 'scrollHeight', {get: () => lines * 20 + 16})
    Object.defineProperty(el, 'offsetHeight', {
      get() {
        const natural = (el.style.height === 'auto' ? 2 : lines) * 20 + 16 + 2
        return Math.min(natural, el.style.maxHeight)
      },
    })
    Object.defineProperty(el, 'clientHeight', {get: () => el.offsetHeight - 2})

    useAutoGrowFallback({current: el as unknown as HTMLTextAreaElement}, 'content')
    effects.forEach((run) => run())
    expect(el.style.height).toBe('58px')

    lines = 3
    listeners.get('input')!()
    expect(el.style.height).toBe('78px')

    // The cap and scrolling past maxRows are the AutoGrow story's (a real field).
    lines = 9
    listeners.get('input')!()
    expect(el.style.height).toBe('198px')

    vi.doUnmock('react')
    vi.unstubAllGlobals()
  })
})
