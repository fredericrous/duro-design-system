import {spawnSync} from 'node:child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'
import {loadRegistry} from '../src/registry.js'
import {runContext} from '../src/commands/context.js'
import {runDoctor} from '../src/commands/doctor.js'
import {runHook} from '../src/commands/hook.js'
import {extensionPointer} from '../src/extension-pointer.js'
import {SKILL} from '../src/skill-template.js'

const registry = loadRegistry()
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const bin = join(packageRoot, 'dist/bin.js')
const repoRoot = join(packageRoot, '../..')
const text = (path: string) => readFileSync(path, 'utf8')

type TomlValue = string | string[]
interface Manifest {
  table: Record<string, Record<string, TomlValue>>
  arrays: Record<string, Array<Record<string, TomlValue>>>
}

/** The subset of TOML greenharness.toml uses: tables, arrays of tables, strings, string arrays. */
function parseToml(source: string): Manifest {
  const out: Manifest = {table: {}, arrays: {}}
  let current: Record<string, TomlValue> | undefined
  for (const raw of source.split('\n')) {
    const line = raw.trim()
    if (line === '' || line.startsWith('#')) continue
    const array = /^\[\[([\w-]+)\]\]$/.exec(line)
    const table = /^\[([\w-]+)\]$/.exec(line)
    if (array) {
      current = {}
      ;(out.arrays[array[1]!] ??= []).push(current)
    } else if (table) {
      current = out.table[table[1]!] = {}
    } else {
      const pair = /^([\w-]+)\s*=\s*(.*)$/.exec(line)
      if (!pair || !current) throw new Error(`unparsable line: ${line}`)
      current[pair[1]!] = JSON.parse(pair[2]!) as TomlValue
    }
  }
  return out
}

/** grh manifest v1 (grh docs/extension-manifest.md): every key it accepts, by section. */
const GRH_V1_KEYS: Record<string, string[]> = {
  extension: ['name', 'version', 'harness'],
  skill: ['path'],
  agent: ['path'],
  mcp: ['name', 'command', 'args'],
  session_context: ['command'],
  doctor: ['command'],
}

function unknownKeys(manifest: Manifest): string[] {
  const unknown: string[] = []
  for (const [section, entries] of [
    ...Object.entries(manifest.table).map(([name, entry]) => [name, [entry]] as const),
    ...Object.entries(manifest.arrays),
  ]) {
    const allowed = GRH_V1_KEYS[section]
    if (!allowed) {
      unknown.push(section)
      continue
    }
    for (const entry of entries) {
      for (const key of Object.keys(entry))
        if (!allowed.includes(key)) unknown.push(`${section}.${key}`)
    }
  }
  return unknown
}

const manifest = parseToml(text(join(packageRoot, 'greenharness.toml')))

function consumer(): string {
  const dir = mkdtempSync(join(tmpdir(), 'greenrack-context-'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({name: 'app', devDependencies: {'@greenharness/greenrack-ui': '1.0.0'}}),
  )
  return dir
}

function bystander(): string {
  const dir = mkdtempSync(join(tmpdir(), 'greenrack-bystander-'))
  writeFileSync(join(dir, 'package.json'), JSON.stringify({name: 'plain', dependencies: {}}))
  return dir
}

describe('greenharness.toml', () => {
  it('uses only the keys grh manifest v1 accepts, and an unknown key is caught', () => {
    expect(unknownKeys(manifest)).toEqual([])
    const withExtraKey = text(join(packageRoot, 'greenharness.toml')).replace(
      'path = "skills/ui"',
      'path = "skills/ui"\nlabel = "x"',
    )
    expect(unknownKeys(parseToml(withExtraKey))).toEqual(['skill.label'])
    expect(manifest.table.conform).toBeUndefined()
    expect(manifest.table.extension).toMatchObject({name: 'design', harness: '>=0.1'})
  })

  it('holds a SKILL.md at every skill path and a file at the agent path', () => {
    const skills = (manifest.arrays.skill ?? []).map((entry) => entry.path as string)
    expect(skills).toEqual([
      'skills/colors',
      'skills/typography',
      'skills/ui',
      'skills/greenrack-mockup',
    ])
    for (const path of skills) expect(existsSync(join(packageRoot, path, 'SKILL.md'))).toBe(true)
    const agents = (manifest.arrays.agent ?? []).map((entry) => entry.path as string)
    expect(agents).toEqual(['agents/design-system-lookup.md'])
    expect(existsSync(join(packageRoot, agents[0]!))).toBe(true)
  })

  it('carries the package version', () => {
    const pkg = JSON.parse(text(join(packageRoot, 'package.json'))) as {
      version: string
      files: string[]
    }
    expect(manifest.table.extension?.version).toBe(pkg.version)
    expect(pkg.files).toEqual(expect.arrayContaining(['greenharness.toml', 'skills', 'agents']))
  })

  it('registers the MCP server pinned to the v7 line', () => {
    expect(manifest.arrays.mcp).toEqual([
      {
        name: 'greenrack',
        command: 'npx',
        args: [
          '-y',
          '-p',
          '@greenharness/greenrack-cli@^7',
          '-p',
          '@modelcontextprotocol/sdk',
          'greenrack',
          'mcp',
        ],
      },
    ])
  })

  it('guards session_context and doctor: silent outside a greenrack consumer, once the hook is installed too', () => {
    const run = (cwd: string, command: string) =>
      spawnSync(
        'sh',
        ['-c', command.replace(/npx -y @greenharness\/greenrack-cli@\^7/, 'echo RAN')],
        {
          cwd,
          encoding: 'utf8',
        },
      )
    const [sessionContext] = manifest.arrays.session_context!.map(
      (entry) => entry.command as string,
    )
    const [doctor] = manifest.arrays.doctor!.map((entry) => entry.command as string)
    expect(run(bystander(), sessionContext!)).toMatchObject({status: 0, stdout: ''})
    expect(run(bystander(), doctor!)).toMatchObject({status: 0, stdout: ''})
    expect(run(consumer(), sessionContext!).stdout).toBe('RAN context\n')
    expect(run(consumer(), doctor!).stdout).toBe('RAN doctor\n')
    const nested = mkdtempSync(join(tmpdir(), 'greenrack-nested-'))
    mkdirSync(join(nested, 'apps', 'web'), {recursive: true})
    writeFileSync(
      join(nested, 'apps', 'web', 'package.json'),
      '{"dependencies":{"@greenharness/greenrack-ui":"1"}}',
    )
    expect(run(nested, doctor!).stdout).toBe('RAN doctor\n')
    const hooked = consumer()
    mkdirSync(join(hooked, '.claude', 'hooks'), {recursive: true})
    writeFileSync(join(hooked, '.claude', 'hooks', 'greenrack-catalog.sh'), '')
    expect(run(hooked, sessionContext!)).toMatchObject({status: 0, stdout: ''})
    expect(run(hooked, doctor!).stdout).toBe('RAN doctor\n')
  })
})

describe('the skills and the agent', () => {
  it('commits skills/greenrack-mockup/SKILL.md as the template renders it', () => {
    expect(text(join(packageRoot, 'skills/greenrack-mockup/SKILL.md'))).toBe(SKILL)
  })

  it('open with the gate after the front matter', () => {
    for (const name of ['colors', 'typography', 'ui', 'greenrack-mockup']) {
      const body = text(join(packageRoot, 'skills', name, 'SKILL.md'))
        .split('\n---\n')
        .slice(1)
        .join('\n---\n')
      expect(body.trimStart().startsWith('**Gate.**')).toBe(true)
      expect(body).toContain('@greenharness/greenrack-ui')
      expect(body.split('\n').find((line) => line.startsWith('**Gate.**'))).toContain('workspace:')
    }
  })

  it('states the agent tools and its no-consumer answer', () => {
    const agent = text(join(packageRoot, 'agents/design-system-lookup.md'))
    expect(agent).toContain('tools: Read, Grep, Glob, mcp__greenrack__greenrack_lookup')
    expect(agent).toContain('no design system in this repository')
    expect(agent).toContain('no decision was checked')
    expect(agent).toContain('`aval resolve <key>` outranks this')
    expect(agent).toContain('```design-lookup')
  })
})

describe('greenrack context', () => {
  it('prints nothing outside a greenrack consumer', () => {
    const cacheHome = mkdtempSync(join(tmpdir(), 'greenrack-cache-'))
    const result = runContext(registry, {cwd: bystander(), cacheHome})
    expect(result.text).toBe('')
    expect(result.exitCode).toBeUndefined()
    expect(readdirSync(cacheHome)).toEqual([])
  })

  it('--catalog-only is the catalog alone, and hook session-start prints exactly that', () => {
    const cwd = consumer()
    const cacheHome = mkdtempSync(join(tmpdir(), 'greenrack-cache-'))
    const catalogOnly = runContext(registry, {cwd, cacheHome, catalogOnly: true})
    expect(catalogOnly.text).toContain('SCREENS')
    expect(readdirSync(cacheHome)).toEqual([])
    expect(runHook(registry, 'session-start', {cwd}).text).toBe(catalogOnly.text)
  })

  it('adds the doctor block, re-run only when the build files change, cached outside the repo', () => {
    const cwd = consumer()
    const cacheHome = mkdtempSync(join(tmpdir(), 'greenrack-cache-'))
    const catalog = runContext(registry, {cwd, cacheHome, catalogOnly: true}).text
    runContext(registry, {cwd, cacheHome})
    const [slot] = readdirSync(join(cacheHome, 'greenrack'))
    expect(readdirSync(join(cacheHome, 'greenrack', slot!)).sort()).toEqual([
      'doctor',
      'doctor.key',
    ])
    writeFileSync(join(cacheHome, 'greenrack', slot!, 'doctor'), 'GREENRACK DOCTOR — cached')
    expect(runContext(registry, {cwd, cacheHome}).text).toBe(
      `${catalog}\n\nGREENRACK DOCTOR — cached`,
    )
    writeFileSync(join(cwd, 'vite.config.ts'), 'export default {}')
    expect(runContext(registry, {cwd, cacheHome}).text).not.toContain('cached')
    expect(existsSync(join(cwd, '.claude'))).toBe(false)
  })

  it('stays silent when the cache cannot be written', () => {
    const cwd = consumer()
    const blocker = join(mkdtempSync(join(tmpdir(), 'greenrack-cache-')), 'file')
    writeFileSync(blocker, '')
    expect(() => runContext(registry, {cwd, cacheHome: blocker})).not.toThrow()
  })
})

describe('greenrack doctor outside a consumer', () => {
  it('prints not a greenrack consumer and exits 0', () => {
    const result = runDoctor({cwd: bystander()})
    expect(result.text).toBe('not a greenrack consumer')
    expect(result.exitCode).toBeUndefined()
  })
})

describe('the grh pointer', () => {
  const fakeGrh = (): string => {
    const dir = mkdtempSync(join(tmpdir(), 'greenrack-grh-'))
    writeFileSync(join(dir, 'grh'), '#!/bin/sh\nexit 0\n')
    chmodSync(join(dir, 'grh'), 0o755)
    return dir
  }

  it('is a runnable command when grh is on PATH, a README pointer without it', () => {
    const cwd = consumer()
    expect(extensionPointer(cwd, fakeGrh())).toContain(
      'npm pack @greenharness/greenrack-cli@^7 && tar -xzf greenharness-greenrack-cli-7*.tgz && grh install --extension package',
    )
    mkdirSync(join(cwd, 'node_modules/@greenharness/greenrack-cli'), {recursive: true})
    writeFileSync(join(cwd, 'node_modules/@greenharness/greenrack-cli/greenharness.toml'), '')
    expect(extensionPointer(cwd, fakeGrh())).toContain(
      'grh install --extension node_modules/@greenharness/greenrack-cli',
    )
    expect(extensionPointer(cwd, '')).toContain('Extension section')
  })

  it('adds one stderr line to hook install and skill install and leaves stdout and the exit code alone', () => {
    const run = (path: string, ...args: string[]) =>
      spawnSync(process.execPath, [bin, ...args], {
        cwd: consumer(),
        env: {...process.env, PATH: path},
        encoding: 'utf8',
      })
    for (const args of [
      ['skill', 'install', '--check'],
      ['hook', 'install', '--check'],
    ]) {
      const withGrh = run(fakeGrh(), ...args)
      const without = run('', ...args)
      expect(withGrh.status).toBe(1)
      expect(without.status).toBe(1)
      expect(withGrh.stdout).toBe(without.stdout)
      expect(withGrh.stderr.trim().split('\n')).toHaveLength(1)
      expect(withGrh.stderr).toContain('grh install --extension')
      expect(without.stderr).toContain('Extension section')
    }
  })
})

describe('the release plumbing', () => {
  it('writes the tag version into greenharness.toml in the npm pkg set step', () => {
    const release = text(join(repoRoot, '.github/workflows/release.yml'))
    const step = release.split('- name:').find((chunk) => chunk.includes('npm pkg set'))!
    expect(step).toContain('packages/cli/greenharness.toml')
  })

  it('checks the pack listing in ci', () => {
    const ci = text(join(repoRoot, '.github/workflows/ci.yml'))
    expect(ci).toContain('npm pack --dry-run')
    expect(ci).toContain('agents/design-system-lookup.md')
  })
})
