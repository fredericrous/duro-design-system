import {readFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'
import {extractCallArg} from '../scripts/lib/literals.mjs'
import {
  describeDropped,
  GROUP_ALIASES,
  GROUP_KEYS,
  kebab,
  THEMABLE_GROUPS,
  validateTokens,
} from '../src/theme'

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = join(here, '..', 'src')
const fixture = JSON.parse(readFileSync(join(here, 'fixtures', 'theme-tokens.json'), 'utf8')) as {
  valid: {group: string; key: string; value: string}[]
  invalid: {group: string; key: string; value: string; reason: string}[]
}

/** Where each themable group's shipped defaults are written (StyleX needs literals). */
const SOURCES: Record<string, [file: string, exportName: string]> = {
  colors: ['colors.css.ts', 'colors'],
  shadows: ['shadows.css.ts', 'shadows'],
  typography: ['typography.css.ts', 'typography'],
  typeScale: ['typography.css.ts', 'typeScale'],
  spacing: ['spacing.css.ts', 'spacing'],
  layoutSpacing: ['layout-spacing.css.ts', 'layoutSpacing'],
  radii: ['spacing.css.ts', 'radii'],
  sizes: ['sizes.css.ts', 'sizes'],
  borders: ['borders.css.ts', 'borders'],
  duration: ['motion.css.ts', 'duration'],
  easing: ['motion.css.ts', 'easing'],
  effects: ['effects.css.ts', 'effects'],
}

const defaultsOf = (group: string): Record<string, string> =>
  extractCallArg(join(srcDir, 'tokens', SOURCES[group][0]), 'defineVars', 0, SOURCES[group][1])

describe('validateTokens', () => {
  it.each(THEMABLE_GROUPS)('accepts every shipped default of %s', (group) => {
    const defaults = defaultsOf(group)
    // px6 and full are refused by design; every other shipped key is themable.
    const themable = Object.fromEntries(
      Object.entries(defaults).filter(([key]) => GROUP_KEYS[group].includes(key)),
    )
    expect(Object.keys(themable).length).toBeGreaterThan(0)
    const {kept, dropped} = validateTokens({[group]: themable})
    expect(dropped).toEqual([])
    expect(kept[group]).toEqual(themable)
  })

  it('lists exactly the shipped keys of each group, bar the refused ones', () => {
    for (const group of THEMABLE_GROUPS) {
      const refused = group === 'radii' ? ['px6', 'full'] : []
      expect([...GROUP_KEYS[group]]).toEqual(
        Object.keys(defaultsOf(group)).filter((key) => !refused.includes(key)),
      )
    }
  })

  it.each(fixture.valid)('keeps $group.$key = $value', ({group, key, value}) => {
    const {kept, dropped} = validateTokens({[group]: {[key]: value}})
    expect(dropped).toEqual([])
    expect((kept as Record<string, Record<string, string>>)[group][key]).toBe(value)
  })

  it.each(fixture.invalid)('drops $group.$key = $value', ({group, key, value, reason}) => {
    const {kept, dropped} = validateTokens({[group]: {[key]: value}})
    expect(kept).toEqual({})
    expect(dropped).toHaveLength(1)
    expect(dropped[0]).toMatchObject({group, key, value})
    expect(describeDropped(dropped[0])).toContain(`${group}.${key}: `)
    expect(dropped[0].reason).toContain(reason)
  })

  it('refuses touchTarget 40px and focusRing 1px with the floor in the reason', () => {
    const {dropped} = validateTokens({sizes: {touchTarget: '40px'}, borders: {focusRing: '1px'}})
    expect(dropped.map(describeDropped)).toEqual([
      'sizes.touchTarget: 40px is under the 44px floor',
      'borders.focusRing: 1px is under the 2px floor',
    ])
  })

  it('lists the groups of the table for an unknown group', () => {
    const {dropped} = validateTokens({font: {}})
    expect(dropped).toHaveLength(1)
    expect(describeDropped(dropped[0])).toBe(
      `font: unknown group (expected ${THEMABLE_GROUPS.join(' | ')})`,
    )
  })

  it('keeps the valid entries beside a dropped one, and reports a non-string', () => {
    const {kept, dropped} = validateTokens({radii: {sm: '2px', md: 6}})
    expect(kept).toEqual({radii: {sm: '2px'}})
    expect(dropped[0].reason).toContain('must be a string')
  })
})

describe('names', () => {
  it('publishes the aliases and kebab-case the CSS variables use', () => {
    expect(GROUP_ALIASES.radii).toBe('radius')
    expect(GROUP_ALIASES.typeScale).toBe('type-scale')
    expect(kebab('fontFamilyMono')).toBe('font-family-mono')
    expect(kebab('fontSize1')).toBe('font-size1')
  })
})
