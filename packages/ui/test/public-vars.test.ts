import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'

// .storybook/publicVars.ts rebuilds the --duro-* aliases at runtime because
// Storybook does not build dist/vars.css. Its group list is a copy of the
// generator's GROUP_NAMES; this keeps the two in step, order included.
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

describe('Storybook token aliases', () => {
  it('use the generator group names, in its order', () => {
    const generator = read('../../tokens/scripts/generate-vars-css.mjs')
    const block = generator.match(/const GROUP_NAMES = \{([\s\S]*?)\}/)?.[1] ?? ''
    const expected = [...block.matchAll(/:\s*'([a-z-]+)'/g)].map((m) => m[1])
    const storybook = read('../../../.storybook/publicVars.ts')
    const groups = storybook.match(/const GROUPS[^=]*=\s*\[([\s\S]*?)\n\]/)?.[1] ?? ''
    const actual = [...groups.matchAll(/\['([a-z-]+)',/g)].map((m) => m[1])
    expect(expected.length).toBeGreaterThan(10)
    expect(actual).toEqual(expected)
  })
})
