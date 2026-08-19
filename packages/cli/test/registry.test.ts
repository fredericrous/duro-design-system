import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import {SPACING_PX, RADII_PX, ICON_SIZES, DURATION_MS} from '@duro-app/tokens/keys'
import type {Registry} from '../src/registry-types.js'

const registry = JSON.parse(
  readFileSync(new URL('../registry.json', import.meta.url), 'utf8'),
) as Registry

// Compile-time shape check: the committed JSON satisfies the published type.
const _shape: Registry = registry
void _shape

describe('registry completeness', () => {
  it('has the expected schema version and top-level keys', () => {
    expect(registry.schemaVersion).toBe(1)
    expect(Object.keys(registry).sort()).toEqual([
      'components',
      'icons',
      'recipes',
      'rules',
      'schemaVersion',
      'tokens',
      'unions',
    ])
  })

  it('documents every component with a meta except hooks/providers', () => {
    for (const [key, entry] of Object.entries(registry.components)) {
      if (entry.kind === 'component' || entry.kind === 'compound') {
        expect(entry.meta, `${key} has no meta`).not.toBeNull()
        expect(entry.meta!.description.length, `${key} empty description`).toBeGreaterThan(10)
        expect(entry.meta!.whenToUse.length, `${key} empty whenToUse`).toBeGreaterThan(0)
      }
      expect(entry.importPath).toMatch(/^@duro-app\//)
      expect(entry.sourcePath).toMatch(/^packages\//)
    }
  })

  it('every component has props or parts', () => {
    for (const [key, entry] of Object.entries(registry.components)) {
      if (entry.kind === 'compound') {
        expect(Object.keys(entry.parts ?? {}).length, `${key} has no parts`).toBeGreaterThan(0)
      }
    }
  })

  it('covers the known surface', () => {
    for (const name of ['Button', 'Select', 'Table', 'Stack', 'Icon', 'Form', 'Diagram']) {
      expect(registry.components[name], `missing ${name}`).toBeDefined()
    }
    expect(Object.keys(registry.recipes).length).toBeGreaterThanOrEqual(6)
    expect(registry.icons.names.length).toBeGreaterThanOrEqual(40)
  })

  it('has no unintended lookup-namespace collisions', () => {
    const names = [
      ...Object.keys(registry.components),
      ...Object.keys(registry.recipes),
      ...Object.keys(registry.tokens.groups),
      'icons',
      'rules',
    ]
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('registry purity', () => {
  const raw = JSON.stringify(registry)
  it('contains no absolute paths or timestamps', () => {
    expect(raw).not.toMatch(/\/Users\/|\/home\//)
    expect(raw).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:/)
  })
})

describe('token drift', () => {
  const groups = registry.tokens.groups
  const asMap = (group: (typeof groups)[string]) =>
    Object.fromEntries(group.entries.map((entry) => [entry.key, entry.value]))

  it('spacing matches @duro-app/tokens/keys', () => {
    expect(asMap(groups.spacing)).toEqual(
      Object.fromEntries(Object.entries(SPACING_PX).map(([token, px]) => [token, `${px}px`])),
    )
  })
  it('radii matches keys', () => {
    expect(asMap(groups.radii)).toEqual(
      Object.fromEntries(Object.entries(RADII_PX).map(([token, px]) => [token, `${px}px`])),
    )
  })
  it('icon sizes match keys', () => {
    expect(registry.icons.sizes).toEqual(ICON_SIZES)
  })
  it('motion durations match keys', () => {
    for (const [token, ms] of Object.entries(DURATION_MS)) {
      expect(asMap(groups.motion)[`duration.${token}`]).toBe(`${ms}ms`)
    }
  })
  it('every group import path is a real tokens exports key', () => {
    const tokensPkg = JSON.parse(
      readFileSync(new URL('../../tokens/package.json', import.meta.url), 'utf8'),
    ) as {exports: Record<string, unknown>}
    for (const [key, group] of Object.entries(groups)) {
      if (group.importPath.startsWith('@duro-app/tokens')) {
        const subpath = group.importPath.replace('@duro-app/tokens', '.')
        expect(tokensPkg.exports[subpath], `${key}: ${subpath} not exported`).toBeDefined()
      }
    }
  })
})

describe('recipes', () => {
  it('rewrote every import to a publishable specifier', () => {
    for (const [name, recipe] of Object.entries(registry.recipes)) {
      expect(recipe.source, `${name} leaks repo paths`).not.toContain('packages/ui/src')
      expect(recipe.source, `${name} kept recipeMeta`).not.toContain('recipeMeta')
      expect(recipe.usesComponents.length, `${name} uses nothing?`).toBeGreaterThan(0)
    }
  })
  it('login-form declares its effect peer', () => {
    expect(registry.recipes['login-form'].peerDeps).toEqual(['effect'])
    expect(registry.recipes['login-form'].source).toContain("from '@duro-app/ui'")
  })
})

describe('rules', () => {
  it('mirrors the lint rules with recommended severities', () => {
    expect(registry.rules.lint.map((rule) => `${rule.severity} ${rule.id}`)).toEqual([
      'error duro/no-deprecated-table-parts',
      'warn duro/no-flex-grow-web',
      'warn duro/no-raw-design-values',
      'error duro/no-raw-html-element',
      'error duro/no-tokens-barrel-import',
      'error duro/prefer-ds-form-components',
    ])
  })
  it('carries the CLAUDE.md critical slice', () => {
    expect(registry.rules.critical).toContain('html.*')
    expect(registry.rules.critical.length).toBeGreaterThan(500)
  })
})
