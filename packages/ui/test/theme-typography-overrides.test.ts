import {describe, expect, it} from 'vitest'
import {
  isSafeFontFamily,
  isSafeLength,
  validateOwnTypography,
} from '../src/components/ThemeProvider/validate'
import {mergeOverrides, type EffectiveOverrides} from '../src/components/ThemeProvider/overrides'
import {overrideRule} from '../src/components/ThemeProvider/overrideRule'
import {nativeThemeInputs} from '../src/components/ThemeProvider/nativeInputs'

const none: EffectiveOverrides = {theme: null, colors: {}, fonts: {}, radii: {}}
const noColour = () => null

describe('isSafeFontFamily', () => {
  it('accepts quoted and bare lists', () => {
    expect(isSafeFontFamily('"JetBrains Mono", monospace')).toBe(true)
    expect(isSafeFontFamily("'JetBrains Mono', ui-monospace, Menlo, monospace")).toBe(true)
  })
  it('refuses unbalanced quotes and anything that leaves the declaration', () => {
    for (const bad of ["'Jet", "a, 'b", 'a;b', 'a/*b', 'a*/b', 'url(x)', 'var(--x)', 'a\\b', '']) {
      expect(isSafeFontFamily(bad)).toBe(false)
    }
  })
})

describe('isSafeLength', () => {
  it('accepts 0 and non-negative px or rem', () => {
    for (const ok of ['0', '4px', '0.5rem']) expect(isSafeLength(ok)).toBe(true)
  })
  it('refuses negative, unitless and other units', () => {
    for (const bad of ['-1px', '6', '1em', '']) expect(isSafeLength(bad)).toBe(false)
  })
})

describe('mergeOverrides fonts and radii', () => {
  it('keeps the outer fonts and radii under a provider on another theme', () => {
    const outer = mergeOverrides(none, 'dark', undefined, {fontFamily: 'Menlo'}, {md: '6px'})
    const inner = mergeOverrides(outer, 'light', undefined)
    expect(inner.fonts).toEqual({fontFamily: 'Menlo'})
    expect(inner.radii).toEqual({md: '6px'})
  })
  it('leaves the inherited value where the child entry is invalid', () => {
    const outer = mergeOverrides(none, 'dark', undefined, undefined, {md: '6px'})
    const inner = mergeOverrides(outer, 'dark', undefined, undefined, {md: '-1px', sm: '2px'})
    expect(inner.radii).toEqual({md: '6px', sm: '2px'})
    expect(mergeOverrides(inner, 'dark', undefined).radii).toEqual({md: '6px', sm: '2px'})
  })
  it('drops px6 and full', () => {
    const valid = validateOwnTypography(undefined, {px6: '1px', full: '1px', xs: '1px'} as never)
    expect(valid.radii).toEqual({xs: '1px'})
  })
})

describe('nativeThemeInputs', () => {
  it('strips quotes from the first family and leaves colours alone', () => {
    const effective = mergeOverrides(
      none,
      'dark',
      {accent: '#fff'},
      {fontFamilyMono: '"JetBrains Mono", monospace'},
    )
    const inputs = nativeThemeInputs(effective)
    expect(inputs.typography).toEqual({fontFamilyMono: 'JetBrains Mono'})
    expect(inputs.colors).toEqual({accent: '#fff'})
    expect(Object.keys(inputs.colors)).not.toContain('fonts')
  })
})

describe('overrideRule typography and radii', () => {
  const groups = {
    fonts: {values: {fontFamily: 'Menlo, monospace'}, variableOf: () => '--font-x'},
    radii: {values: {md: '6px'}, variableOf: () => '--radius-x'},
  }
  it('emits both variables, identically on repeat', () => {
    const first = overrideRule('s', {}, noColour, groups)
    expect(first).toBe(
      '[data-duro-theme="s"][data-duro-theme="s"] { --font-x: Menlo, monospace; --radius-x: 6px; }',
    )
    expect(overrideRule('s', {}, noColour, groups)).toBe(first)
  })
})
