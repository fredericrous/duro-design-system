import {describe, expect, it} from 'vitest'
import {SPACING_PX, RADII_PX} from '@duro-app/tokens/keys'
import {darkColors, lightColors, highContrastColors} from '@duro-app/tokens/raw'
import {
  COLOR_TOKENS,
  RADII_TOKENS_BY_PX,
  SPACING_TOKENS_BY_PX,
  TOKEN_DEEP_PATHS,
} from '../src/util/tokens.js'

// The plugin ships with zero runtime dependencies, so src/util/tokens.ts
// duplicates token data as literals. These tests rebuild each table from
// @duro-app/tokens (a workspace devDependency) with the same construction and
// fail when the packages drift.

describe('token tables match @duro-app/tokens', () => {
  it('SPACING_TOKENS_BY_PX mirrors SPACING_PX', () => {
    const expected = Object.fromEntries(
      Object.entries(SPACING_PX).map(([token, px]) => [px, token]),
    )
    expect(SPACING_TOKENS_BY_PX).toEqual(expected)
  })

  it('RADII_TOKENS_BY_PX mirrors RADII_PX', () => {
    const expected = Object.fromEntries(Object.entries(RADII_PX).map(([token, px]) => [px, token]))
    expect(RADII_TOKENS_BY_PX).toEqual(expected)
  })

  it('COLOR_TOKENS mirrors the three raw palettes, first entry wins', () => {
    const expected: Record<string, string> = {}
    for (const palette of [darkColors, lightColors, highContrastColors]) {
      for (const [token, value] of Object.entries(palette)) {
        const key = value.toLowerCase()
        if (!(key in expected)) expected[key] = token
      }
    }
    expect(COLOR_TOKENS).toEqual(expected)
  })

  it('TOKEN_DEEP_PATHS keys.ts entries stay in sync with the module', async () => {
    const keys = await import('@duro-app/tokens/keys')
    for (const name of Object.keys(keys)) {
      expect(TOKEN_DEEP_PATHS[name], `missing deep path for keys.ts export ${name}`).toBe('keys')
    }
  })
})
