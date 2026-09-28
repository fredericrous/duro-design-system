import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import {BREAKPOINTS_PX} from '@duro-app/tokens/keys'
import {breakpointsPx} from '@duro-app/tokens/raw'

// `@duro-app/tokens/tokens/breakpoints.css` is css.defineConsts, which throws
// when imported where StyleX isn't compiling it. `raw` is the runtime-safe
// copy: these tests load it in plain Node, the way a hook under vitest does.

describe('@duro-app/tokens/raw breakpointsPx', () => {
  it('loads without StyleX and carries the breakpoint scale in px', () => {
    expect(breakpointsPx).toEqual({xs: 480, sm: 640, md: 768, lg: 1024, xl: 1280})
    expect(breakpointsPx).toEqual(BREAKPOINTS_PX)
  })

  it('builds a runtime media query', () => {
    expect(`(max-width: ${breakpointsPx.md}px)`).toBe('(max-width: 768px)')
  })

  it('matches the defineConsts literals in breakpoints.css.ts', () => {
    const source = readFileSync(
      new URL('../src/tokens/breakpoints.css.ts', import.meta.url),
      'utf8',
    )
    for (const [key, px] of Object.entries(breakpointsPx)) {
      expect(source).toContain(`${key}: '${px}px'`)
    }
  })

  it('keeps raw.ts free of react-strict-dom, so importing it can never throw', () => {
    const source = readFileSync(new URL('../src/raw.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^\s*import\b[^\n]*react-strict-dom/m)
    expect(source).not.toMatch(/=\s*css\.define/)
  })
})
