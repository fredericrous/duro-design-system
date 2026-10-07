import {describe, expect, it} from 'vitest'
import {
  BORDERS_PX,
  BREAKPOINTS_PX,
  DURATION_MS,
  EASINGS,
  FONT_SIZE_REM,
  FONT_WEIGHTS,
  MICRO_SPACING_PX,
  RADII_PX,
  SHADOWS,
  SIZES_PX,
  SPACING_PX,
  TYPE_SCALE_FONT_SIZE_REM,
} from '@duro-app/tokens/keys'
import {darkColors, lightColors, highContrastColors} from '@duro-app/tokens/raw'
import {
  BORDER_TOKENS_BY_PX,
  BREAKPOINT_TOKENS_BY_PX,
  COLOR_TOKENS,
  CONTRAST_MIRROR_TOKENS,
  DURATION_TOKENS_BY_MS,
  EASING_TOKENS,
  FONT_SIZE_TOKENS_BY_REM,
  FONT_WEIGHT_TOKENS,
  MICRO_SPACING_TOKENS_BY_PX,
  RADII_TOKENS_BY_PX,
  SHADOW_TOKENS,
  SIZE_TOKENS_BY_PX,
  SPACING_TOKENS_BY_PX,
  TOKEN_DEEP_PATHS,
  normalizeValue,
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

  it('MICRO_SPACING_TOKENS_BY_PX mirrors MICRO_SPACING_PX', () => {
    expect(MICRO_SPACING_TOKENS_BY_PX).toEqual(
      Object.fromEntries(Object.entries(MICRO_SPACING_PX).map(([token, px]) => [px, token])),
    )
  })

  it('RADII_TOKENS_BY_PX mirrors RADII_PX', () => {
    const expected = Object.fromEntries(Object.entries(RADII_PX).map(([token, px]) => [px, token]))
    expect(RADII_TOKENS_BY_PX).toEqual(expected)
  })

  // Several tokens share a px value, so the tables hold lists: nothing may be
  // dropped (no last-one-wins).
  const groupByPx = (scale: Record<string, number>) => {
    const out: Record<number, string[]> = {}
    for (const [token, px] of Object.entries(scale)) (out[px] ??= []).push(token)
    return out
  }

  it('SIZE_TOKENS_BY_PX lists every SIZES_PX token', () => {
    expect(SIZE_TOKENS_BY_PX).toEqual(groupByPx(SIZES_PX))
    const listed = Object.values(SIZE_TOKENS_BY_PX).flat()
    for (const token of Object.keys(SIZES_PX)) expect(listed).toContain(token)
  })

  it('BORDER_TOKENS_BY_PX lists every BORDERS_PX token', () => {
    expect(BORDER_TOKENS_BY_PX).toEqual(groupByPx(BORDERS_PX))
    const listed = Object.values(BORDER_TOKENS_BY_PX).flat()
    for (const token of Object.keys(BORDERS_PX)) expect(listed).toContain(token)
  })

  it('COLOR_TOKENS mirrors the three raw palettes, first entry wins', () => {
    const expected: Record<string, string> = {}
    const palettes = [darkColors, lightColors, highContrastColors]
    for (const mirrors of [false, true]) {
      for (const palette of palettes) {
        for (const [token, value] of Object.entries(palette)) {
          if (CONTRAST_MIRROR_TOKENS.includes(token) !== mirrors) continue
          const key = value.toLowerCase()
          if (!(key in expected)) expected[key] = token
        }
      }
    }
    expect(COLOR_TOKENS).toEqual(expected)
  })

  it('BREAKPOINT_TOKENS_BY_PX mirrors BREAKPOINTS_PX', () => {
    expect(BREAKPOINT_TOKENS_BY_PX).toEqual(
      Object.fromEntries(Object.entries(BREAKPOINTS_PX).map(([token, px]) => [px, token])),
    )
  })

  it('FONT_SIZE_TOKENS_BY_REM is typeScale under typography, typography wins', () => {
    const expected: Record<number, {group: string; token: string}> = {}
    for (const [token, rem] of Object.entries(TYPE_SCALE_FONT_SIZE_REM)) {
      expected[rem] = {group: 'typeScale', token}
    }
    for (const [token, rem] of Object.entries(FONT_SIZE_REM)) {
      expected[rem] = {group: 'typography', token}
    }
    expect(FONT_SIZE_TOKENS_BY_REM).toEqual(expected)
  })

  it('FONT_WEIGHT_TOKENS mirrors FONT_WEIGHTS', () => {
    expect(FONT_WEIGHT_TOKENS).toEqual(
      Object.fromEntries(Object.entries(FONT_WEIGHTS).map(([token, w]) => [w, token])),
    )
  })

  it('SHADOW_TOKENS mirrors SHADOWS, whitespace-normalized', () => {
    expect(SHADOW_TOKENS).toEqual(
      Object.fromEntries(Object.entries(SHADOWS).map(([token, v]) => [normalizeValue(v), token])),
    )
  })

  it('DURATION_TOKENS_BY_MS mirrors DURATION_MS', () => {
    expect(DURATION_TOKENS_BY_MS).toEqual(
      Object.fromEntries(Object.entries(DURATION_MS).map(([token, ms]) => [ms, token])),
    )
  })

  it('EASING_TOKENS mirrors EASINGS, whitespace-normalized', () => {
    expect(EASING_TOKENS).toEqual(
      Object.fromEntries(Object.entries(EASINGS).map(([token, v]) => [normalizeValue(v), token])),
    )
  })

  it('TOKEN_DEEP_PATHS keys.ts entries stay in sync with the module', async () => {
    const keys = await import('@duro-app/tokens/keys')
    for (const name of Object.keys(keys)) {
      expect(TOKEN_DEEP_PATHS[name], `missing deep path for keys.ts export ${name}`).toBe('keys')
    }
  })
})
