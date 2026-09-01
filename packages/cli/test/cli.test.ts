import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'
import {loadRegistry, lookup} from '../src/registry.js'
import {runLookup} from '../src/commands/lookup.js'
import {runList} from '../src/commands/list.js'
import {runManifest} from '../src/commands/manifest.js'
import {runHook} from '../src/commands/hook.js'
import {search} from '../src/search.js'
import {COMMANDS} from '../src/manifest.js'

const registry = loadRegistry()
const bin = fileURLToPath(new URL('../dist/bin.js', import.meta.url))

function duro(...args: string[]): {stdout: string; code: number} {
  try {
    return {stdout: execFileSync(process.execPath, [bin, ...args], {encoding: 'utf8'}), code: 0}
  } catch (error) {
    const failure = error as {status?: number; stdout?: string}
    return {stdout: failure.stdout ?? '', code: failure.status ?? -1}
  }
}

describe('lookup dispatch', () => {
  it('components, recipes, token groups, icons and rules all resolve', () => {
    for (const name of ['Button', 'login-form', 'spacing', 'icons', 'rules']) {
      expect(lookup(registry, name), name).not.toBeNull()
    }
  })
  it('is case-insensitive on exact names', () => {
    expect(lookup(registry, 'button')?.key).toBe('Button')
  })
  it('search ranks Cluster first for wrapping tags', () => {
    expect(search(registry, 'tags that wrap')[0].key).toBe('Cluster')
  })
  it('falls back to search then not-found', () => {
    expect(runLookup(registry, 'tags that wrap', {}).exitCode).toBeUndefined()
    const notFound = runLookup(registry, 'zzzz-nope', {})
    expect(notFound.exitCode).toBe(1)
  })
  it('unknown part is a not-found error naming the parts', () => {
    expect(() => runLookup(registry, 'Select', {part: 'Nope'})).toThrowError(/parts: /)
  })
})

describe('command results', () => {
  it('hook session-start emits the preamble plus the list, other events are usage errors', () => {
    const ok = runHook(registry, 'session-start')
    expect(ok.exitCode).toBeUndefined()
    expect(ok.text).toContain('hand-rolling')
    expect(ok.text).toContain(runList(registry).text)
    expect(runHook(registry, 'nope').exitCode).toBe(2)
    expect(runHook(registry).exitCode).toBe(2)
  })
  it('list returns entries for each kind', () => {
    const all = runList(registry).data as Array<{name: string; kind: string}>
    expect(all.some((entry) => entry.kind === 'compound')).toBe(true)
    expect(all.some((entry) => entry.kind === 'recipe')).toBe(true)
    expect(all.some((entry) => entry.kind === 'tokens')).toBe(true)
    expect(runList(registry, 'nope').exitCode).toBe(2)
  })
  it('manifest enums cover the lookup namespace and commands match dispatch', () => {
    const manifest = runManifest(registry).data as {
      enums: {names: string[]}
      commands: Array<{name: string}>
    }
    expect(manifest.enums.names).toContain('Button')
    expect(manifest.enums.names).toContain('login-form')
    expect(manifest.enums.names).toContain('rules')
    expect(COMMANDS.map((command) => command.name).sort()).toEqual([
      'hook',
      'list',
      'lookup',
      'manifest',
      'mcp',
    ])
  })
})

describe('bin end-to-end', () => {
  it('duro Button prints the prop table', () => {
    const {stdout, code} = duro('Button')
    expect(code).toBe(0)
    expect(stdout).toContain("import {Button} from '@duro-app/ui'")
    expect(stdout).toContain('ButtonVariant')
  })
  it('--json emits parseable JSON and nothing else on stdout', () => {
    const {stdout, code} = duro('Button', '--json')
    expect(code).toBe(0)
    const parsed = JSON.parse(stdout) as {kind: string; key: string}
    expect(parsed).toMatchObject({kind: 'component', key: 'Button'})
  })
  it('--source-only output is pipeable source', () => {
    const {stdout} = duro('login-form', '--source-only')
    expect(stdout).toMatch(/^import \{Schema\} from 'effect'/)
    expect(stdout).not.toContain('recipeMeta')
  })
  it('misspellings suggest and exit 1', () => {
    const {code} = duro('Buton')
    expect(code).toBe(1)
  })
  it('unknown flags exit 2', () => {
    const {code} = duro('Button', '--frobnicate')
    expect(code).toBe(2)
  })
})
