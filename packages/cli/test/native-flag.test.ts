import {readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vitest'

const registry = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, '../registry.json'), 'utf8'),
) as {components: Record<string, {native?: boolean; importPath: string}>}

describe('registry native flag', () => {
  it('marks what the native barrel exports, and only that', () => {
    expect(registry.components.Dialog.native).toBe(true)
    expect(registry.components.Spinner.native).toBe(true)
    expect(registry.components.Select.native).toBe(false)
  })

  it('leaves subpath and diagram entries without a flag', () => {
    const others = Object.values(registry.components).filter(
      (entry) => entry.importPath !== '@duro-app/ui',
    )
    expect(others.length).toBeGreaterThan(0)
    expect(others.every((entry) => entry.native === undefined)).toBe(true)
  })
})
