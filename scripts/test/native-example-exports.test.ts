import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vitest'

const here = path.dirname(new URL(import.meta.url).pathname)
const barrel = readFileSync(path.resolve(here, '../../packages/ui/src/index.native.ts'), 'utf8')
const example = path.resolve(here, '../../examples/native')
// Every screen file of the example: an export may belong on one route (PortalHost
// in the modal route), not in AllExports.
const screen = ['app', 'src']
  .flatMap((dir) =>
    readdirSync(path.join(example, dir))
      .filter((file) => file.endsWith('.tsx'))
      .map((file) => readFileSync(path.join(example, dir, file), 'utf8')),
  )
  .join('\n')

/** Value names exported by the native barrel (type-only exports excluded). */
function valueExports(source: string): string[] {
  const names: string[] = []
  for (const match of source.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
    for (const raw of match[1].split(',')) {
      const name = raw.trim()
      if (!name || name.startsWith('type ')) continue
      names.push(
        name
          .split(/\s+as\s+/)
          .pop()!
          .trim(),
      )
    }
  }
  return names
}

describe('examples/native renders every native export', () => {
  const names = valueExports(barrel)

  it('finds the barrel exports', () => {
    expect(names).toContain('Button')
  })

  it.each(names)('%s is rendered or called by an example screen', (name) => {
    const used = new RegExp(`<${name}[\\s.>/]|\\b${name}\\(`).test(screen)
    expect(used).toBe(true)
  })
})
