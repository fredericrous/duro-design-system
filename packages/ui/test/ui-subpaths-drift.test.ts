import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import {UI_SUBPATH_EXPORTS} from '../../eslint-plugin/src/util/ui-subpaths.js'

// Export names of an entry module, read from its source text (the ui package
// is TSX + StyleX, so importing it in Node is not an option).
function exportNames(file: string): Set<string> {
  const text = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const names = new Set<string>()
  for (const match of text.matchAll(/^export\s+(?:type\s+)?\{([^}]*)\}/gm)) {
    for (const part of match[1]!.split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop()!
        .trim()
      if (name) names.add(name)
    }
  }
  for (const match of text.matchAll(/^export\s+(?:const|function|type|interface)\s+(\w+)/gm)) {
    names.add(match[1]!)
  }
  return names
}

describe('UI_SUBPATH_EXPORTS matches packages/ui', () => {
  const root = exportNames('index.ts')
  const subpaths = {form: exportNames('form.ts'), table: exportNames('table.ts')}

  it('lists exactly the subpath names the root does not export', () => {
    const expected: Record<string, string> = {}
    for (const [subpath, names] of Object.entries(subpaths)) {
      for (const name of names) if (!root.has(name)) expected[name] = subpath
    }
    const actual = Object.fromEntries(
      Object.entries(UI_SUBPATH_EXPORTS).map(([name, entry]) => [name, entry.subpath]),
    )
    expect(actual).toEqual(expected)
  })

  it('the root no longer exports Form', () => {
    expect(root.has('Form')).toBe(false)
    expect(root.has('Field')).toBe(true)
  })
})
