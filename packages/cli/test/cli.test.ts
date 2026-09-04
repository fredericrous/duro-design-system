import {execFileSync} from 'node:child_process'
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'
import {loadRegistry, lookup} from '../src/registry.js'
import {runLookup} from '../src/commands/lookup.js'
import {runList} from '../src/commands/list.js'
import {runManifest} from '../src/commands/manifest.js'
import {runHook} from '../src/commands/hook.js'
import {contrastPairs} from '../src/disambiguation.js'
import {search} from '../src/search.js'
import {COMMANDS} from '../src/manifest.js'
import {
  HOOK_CACHE_IGNORE,
  HOOK_COMMAND,
  HOOK_SCRIPT,
  HOOK_SCRIPT_PATH,
  HOOK_SETTINGS_PATH,
} from '../src/hook-script.js'

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
  it('every relatedTo edge declares its kind', () => {
    // The kind is what keeps composition ("Place Input inside Field.Root") out
    // of a section that promises to decide between alternatives. A new edge
    // without one is a type error at authoring time; this catches a registry
    // built before that guard existed.
    for (const [name, entry] of Object.entries(registry.components)) {
      for (const related of entry.meta?.relatedTo ?? []) {
        expect(['contrast', 'composition'], `${name} -> ${related.component}`).toContain(
          related.kind,
        )
      }
    }
  })

  it('contrast pairs exclude composition edges and hooks', () => {
    const pairs = contrastPairs(registry)
    const label = (pair: {a: string; b: string}) => `${pair.a} vs ${pair.b}`
    const labels = pairs.map(label)
    // Alternatives you pick between.
    expect(labels).toContain('Menu vs Select')
    expect(labels).toContain('Card vs Panel')
    expect(labels).toContain('Dialog vs Drawer')
    // Composition, not a choice — Input goes inside Field.Root.
    expect(labels).not.toContain('Field vs Input')
    expect(labels).not.toContain('Table vs ScrollArea')
    // A hook is never the alternative to a component.
    expect(pairs.some((pair) => pair.a.startsWith('use') || pair.b.startsWith('use'))).toBe(false)
  })

  it('contrast pairs are deduped and deterministic', () => {
    const pairs = contrastPairs(registry)
    const labels = pairs.map((pair) => `${pair.a} vs ${pair.b}`)
    expect(new Set(labels).size).toBe(labels.length)
    // Components sharing a meta file restate the same sentence; keep one.
    expect(new Set(pairs.map((pair) => pair.distinction)).size).toBe(pairs.length)
    expect(labels).toEqual([...labels].sort())
    expect(contrastPairs(registry)).toEqual(pairs)
  })

  it('session-start carries the pairs, not just the index', () => {
    const text = runHook(registry, 'session-start').text
    expect(text).toContain('PICKING BETWEEN NEIGHBORS')
    // The whole point: deciding between two components needs no second call.
    expect(text).toContain('Menu vs Select')
  })

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

describe('hook install', () => {
  const repo = () => mkdtempSync(join(tmpdir(), 'duro-hook-'))
  const at = (root: string, path: string) => join(root, path)
  const install = (root: string, check = false) => runHook(registry, 'install', {cwd: root, check})

  it('wires an empty repo: script, settings and gitignore', () => {
    const root = repo()
    const result = install(root)
    expect(result.exitCode).toBeUndefined()
    expect(readFileSync(at(root, HOOK_SCRIPT_PATH), 'utf8')).toBe(HOOK_SCRIPT)
    const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
    expect(settings.hooks.SessionStart[0].hooks[0].command).toBe(HOOK_COMMAND)
    expect(readFileSync(at(root, '.gitignore'), 'utf8')).toContain(HOOK_CACHE_IGNORE)
  })

  it('is idempotent and --check passes on a wired repo', () => {
    const root = repo()
    install(root)
    const again = install(root)
    expect(again.data).toMatchObject({ok: true})
    expect(
      (again.data as {changes: Array<{status: string}>}).changes.every(
        (c) => c.status === 'unchanged',
      ),
    ).toBe(true)
    expect(install(root, true).exitCode).toBeUndefined()
  })

  it('--check exits 1 on a repo that was never wired, and writes nothing', () => {
    const root = repo()
    const result = install(root, true)
    expect(result.exitCode).toBe(1)
    expect(result.text).toContain('hook install')
    expect(() => readFileSync(at(root, HOOK_SCRIPT_PATH), 'utf8')).toThrow()
  })

  it('--check catches a hand-edited script', () => {
    const root = repo()
    install(root)
    writeFileSync(at(root, HOOK_SCRIPT_PATH), '#!/bin/sh\necho tampered\n')
    expect(install(root, true).exitCode).toBe(1)
    expect(install(root).exitCode).toBeUndefined()
    expect(readFileSync(at(root, HOOK_SCRIPT_PATH), 'utf8')).toBe(HOOK_SCRIPT)
  })

  it('keeps unrelated settings and existing SessionStart hooks', () => {
    const root = repo()
    mkdirSync(at(root, '.claude'), {recursive: true})
    writeFileSync(
      at(root, HOOK_SETTINGS_PATH),
      JSON.stringify({
        permissions: {allow: ['Bash(pnpm test)']},
        hooks: {SessionStart: [{hooks: [{type: 'command', command: 'sh other.sh'}]}]},
      }),
    )
    install(root)
    const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
    expect(settings.permissions.allow).toEqual(['Bash(pnpm test)'])
    const commands = settings.hooks.SessionStart.flatMap((g: {hooks: Array<{command: string}>}) =>
      g.hooks.map((h) => h.command),
    )
    expect(commands).toEqual(['sh other.sh', HOOK_COMMAND])
  })

  it('migrates a legacy inline/renamed duro command in place', () => {
    const root = repo()
    mkdirSync(at(root, '.claude'), {recursive: true})
    writeFileSync(
      at(root, HOOK_SETTINGS_PATH),
      JSON.stringify({
        hooks: {
          SessionStart: [
            {hooks: [{type: 'command', command: 'sh ./.claude/hooks/duro-catalog.sh'}]},
          ],
        },
      }),
    )
    install(root)
    const settings = JSON.parse(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8'))
    expect(settings.hooks.SessionStart[0].hooks[0].command).toBe(HOOK_COMMAND)
    expect(settings.hooks.SessionStart).toHaveLength(1)
  })

  it('does not duplicate an existing gitignore rule', () => {
    const root = repo()
    writeFileSync(at(root, '.gitignore'), `node_modules\n${HOOK_CACHE_IGNORE}\n`)
    install(root)
    const ignore = readFileSync(at(root, '.gitignore'), 'utf8')
    expect(ignore.split('\n').filter((line) => line.trim() === HOOK_CACHE_IGNORE)).toHaveLength(1)
  })

  it('warns when .gitignore shadows the files it just wrote', () => {
    const root = repo()
    execFileSync('git', ['init', '-q'], {cwd: root})
    writeFileSync(at(root, '.gitignore'), '.claude/*\n')
    const result = install(root)
    expect((result.data as {ignored: string[]}).ignored).toContain(HOOK_SCRIPT_PATH)
    expect(result.text).toContain(`!${HOOK_SCRIPT_PATH}`)
  })

  it('refuses to clobber unparseable settings.json', () => {
    const root = repo()
    mkdirSync(at(root, '.claude'), {recursive: true})
    writeFileSync(at(root, HOOK_SETTINGS_PATH), '{ not json')
    const result = install(root)
    expect(result.exitCode).toBe(2)
    expect(readFileSync(at(root, HOOK_SETTINGS_PATH), 'utf8')).toBe('{ not json')
  })
})
