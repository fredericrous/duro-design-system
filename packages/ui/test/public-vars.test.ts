import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'

// .storybook/publicVars.ts rebuilds the --duro-* aliases at runtime because
// Storybook does not build dist/vars.css. Its group list is a copy of the
// shared GROUP_ALIASES (packages/tokens/src/names.ts, which the generator
// imports); this keeps the two in step, order included.
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

describe('Storybook token aliases', () => {
  it('use the generator group names, in its order', () => {
    const names = read('../../tokens/src/names.ts')
    const block = names.match(/const GROUP_ALIASES = \{([\s\S]*?)\}/)?.[1] ?? ''
    // Breakpoints are constants, not defineVars: they have an alias for the
    // mockup tokens but no public variable, so Storybook has nothing to rebuild.
    const expected = [...block.matchAll(/:\s*'([a-z-]+)'/g)]
      .map((m) => m[1])
      .filter((name) => name !== 'breakpoint')
    const storybook = read('../../../.storybook/publicVars.ts')
    const groups = storybook.match(/const GROUPS[^=]*=\s*\[([\s\S]*?)\n\]/)?.[1] ?? ''
    const actual = [...groups.matchAll(/\['([a-z-]+)',/g)].map((m) => m[1])
    expect(expected.length).toBeGreaterThan(10)
    expect(actual).toEqual(expected)
  })
})
