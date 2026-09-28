import {existsSync, readFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'

// A bundler resolves every static import before it can tree-shake, so an
// optional peer is only optional if the root entry's module graph never
// imports it. Walks the source graph (type-only imports erase, so they are
// skipped) from each entry and reports the bare specifiers it reaches.

const src = resolve(dirname(fileURLToPath(import.meta.url)), '../src')
const IMPORT_RE =
  /^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*?\sfrom\s*)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/gm
const EXTENSIONS = ['.web.tsx', '.web.ts', '.tsx', '.ts', '/index.ts', '/index.tsx']

function resolveLocal(from: string, spec: string): string | null {
  const base = resolve(dirname(from), spec)
  for (const candidate of [base, ...EXTENSIONS.map((ext) => base + ext)]) {
    if (/\.[cm]?[jt]sx?$/.test(candidate) && existsSync(candidate)) return candidate
  }
  return null
}

function bareImports(entry: string): Set<string> {
  const seen = new Set<string>()
  const bare = new Set<string>()
  const stack = [resolve(src, entry)]
  while (stack.length > 0) {
    const file = stack.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    for (const match of readFileSync(file, 'utf8').matchAll(IMPORT_RE)) {
      const spec = (match[1] ?? match[2])!
      if (spec.startsWith('.')) {
        const local = resolveLocal(file, spec)
        if (local) stack.push(local)
      } else {
        bare.add(spec)
      }
    }
  }
  return bare
}

const FORM_PEERS = /^(?:react-hook-form|@hookform\/)/
const TABLE_PEERS = /^@tanstack\/react-table/

describe('optional peers stay behind their subpaths', () => {
  it('the root reaches no react-hook-form, @hookform or @tanstack/react-table', () => {
    const bare = [...bareImports('index.ts')]
    expect(bare.filter((spec) => FORM_PEERS.test(spec) || TABLE_PEERS.test(spec))).toEqual([])
  })

  it('@duro-app/ui/form is where react-hook-form comes in', () => {
    const bare = [...bareImports('form.ts')]
    expect(bare).toContain('react-hook-form')
    expect(bare).toContain('@hookform/resolvers/effect-ts')
  })
})
