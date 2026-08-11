import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import type {Registry} from '../src/registry-types.js'

const registry = JSON.parse(
  readFileSync(new URL('../registry.json', import.meta.url), 'utf8'),
) as Registry

const prop = (component: string, name: string) => {
  const entry = registry.components[component]
  return (entry.props ?? []).find((candidate) => candidate.name === name)
}

describe('prop extraction goldens', () => {
  it('Button: defaults, unions, and the aria-label alias', () => {
    expect(prop('Button', 'variant')).toMatchObject({
      type: 'ButtonVariant',
      default: "'primary'",
      union: ['primary', 'secondary', 'inverseSecondary', 'link', 'danger'],
      required: false,
    })
    expect(prop('Button', 'aria-label')).toMatchObject({type: 'string'})
    expect(prop('Button', 'children')).toMatchObject({required: true})
  })

  it('Table: compound parts with Container deprecated', () => {
    const table = registry.components.Table
    expect(table.kind).toBe('compound')
    expect(Object.keys(table.parts!)).toEqual(
      expect.arrayContaining(['Root', 'Header', 'Body', 'Row', 'HeaderCell', 'Cell', 'Container']),
    )
    expect(table.parts!.Container.deprecated).toMatch(/Table\.Root/)
    expect(table.parts!.HeaderCell.props.map((entry) => entry.name)).toContain('label')
    expect(table.parts!.HeaderCell.props.map((entry) => entry.name)).not.toContain('isActions')
  })

  it('the table subpath merge carries the TanStack pieces', () => {
    const merged = registry.components['Table (ui/table)']
    expect(merged.importPath).toBe('@duro-app/ui/table')
    expect(Object.keys(merged.parts!)).toEqual(
      expect.arrayContaining(['Root', 'FromTanstack', 'Pagination', 'SortChip']),
    )
    expect(merged.meta).not.toBeNull()
    expect(merged.parts!.FromTanstack.props.map((entry) => entry.name)).toContain('table')
  })

  it('Select: seven parts, Root has the value props', () => {
    const select = registry.components.Select
    expect(Object.keys(select.parts!).length).toBe(7)
    expect(select.parts!.Root.props.map((entry) => entry.name)).toEqual(
      expect.arrayContaining(['value', 'onValueChange', 'defaultValue']),
    )
  })

  it('Stack/Grid: token-union gaps resolve their members', () => {
    expect(prop('Stack', 'gap')?.union).toEqual(['xs', 'sm', 'ms', 'md', 'lg', 'xl', 'xxl', 'xxxl'])
    expect(prop('Grid', 'columns')).toBeDefined()
  })

  it('JSDoc descriptions survive extraction', () => {
    const withDocs = Object.values(registry.components)
      .flatMap((entry) => [
        ...(entry.props ?? []),
        ...Object.values(entry.parts ?? {}).flatMap((part) => part.props),
      ])
      .filter((entry) => entry.description)
    expect(withDocs.length).toBeGreaterThan(20)
  })
})
