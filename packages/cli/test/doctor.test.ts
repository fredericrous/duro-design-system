import {execFileSync} from 'node:child_process'
import {chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'
import {runDoctor, type DoctorFinding} from '../src/commands/doctor.js'
import {loadRegistry} from '../src/registry.js'
import {runHook} from '../src/commands/hook.js'
import {
  HOOK_DOCTOR_CACHE_PATH,
  HOOK_MIN_CLI,
  HOOK_SCRIPT,
  HOOK_SCRIPT_PATH,
} from '../src/hook-script.js'

const bin = fileURLToPath(new URL('../dist/bin.js', import.meta.url))

const PKG = JSON.stringify({name: 'app', dependencies: {'@duro-app/ui': '^3.0.0'}})

/** A consumer wired the way customer-vision is: stylesheet first, extraction layered. */
const HEALTHY: Record<string, string> = {
  'package.json': PKG,
  'vite.config.ts': `export default {plugins: [stylex({runtimeInjection: false})]}\n`,
  'postcss.config.mjs': `export default {plugins: {'react-strict-dom/postcss-plugin': {include: ['app/**']}}}\n`,
  'app/root.tsx': [
    `import {spacing} from '@duro-app/tokens/tokens/spacing.css'`,
    `import '@duro-app/ui/dist/index.css'`,
    `import './styles/global.css'`,
    `import './styles/strict.css'`,
    '',
  ].join('\n'),
  'app/styles/global.css': `@layer reset {\n  *, *::before { margin: 0; padding: 0; }\n}\nbody { margin: 0; }\n`,
  'app/styles/strict.css': `@react-strict-dom;\n`,
}

function app(files: Record<string, string>, base = HEALTHY): string {
  const root = mkdtempSync(join(tmpdir(), 'duro-doctor-'))
  for (const [path, content] of Object.entries({...base, ...files})) {
    mkdirSync(dirname(join(root, path)), {recursive: true})
    writeFileSync(join(root, path), content)
  }
  return root
}

const findings = (root: string) =>
  (runDoctor({cwd: root}).data as {findings: DoctorFinding[]}).findings

describe('duro doctor', () => {
  it('passes a correctly wired app, and says nothing in session mode', () => {
    const root = app({})
    const result = runDoctor({cwd: root})
    expect(findings(root)).toEqual([])
    expect(result.exitCode).toBeUndefined()
    expect(result.text).toContain('app/styles/strict.css')
    expect(runDoctor({cwd: root, session: true}).text).toBe('')
  })

  it('fails on runtimeInjection: true, naming the file and line', () => {
    const root = app({
      'vite.config.ts': `export default {\n  plugins: [\n    stylex({dev: true, runtimeInjection: true}),\n  ],\n}\n`,
    })
    const result = runDoctor({cwd: root})
    expect(result.exitCode).toBe(1)
    expect(findings(root)).toEqual([
      expect.objectContaining({
        rule: 'runtime-injection',
        severity: 'error',
        file: 'vite.config.ts',
        line: 3,
      }),
    ])
  })

  it('reads a comment about runtimeInjection as prose, not config', () => {
    const root = app({
      'vite.config.ts': `// never set runtimeInjection: true here\n/* runtimeInjection: true */\nexport default {runtimeInjection: false}\n`,
    })
    expect(findings(root)).toEqual([])
  })

  it('only warns when injection is in a test config, and when it is computed', () => {
    const root = app({
      'vitest.config.ts': `export default {runtimeInjection: true}\n`,
      'vite.config.ts': `export default {runtimeInjection: process.env.DEV === '1'}\n`,
    })
    expect(findings(root).map((f) => [f.file, f.severity])).toEqual([
      ['vite.config.ts', 'warn'],
      ['vitest.config.ts', 'warn'],
    ])
    expect(runDoctor({cwd: root}).exitCode).toBeUndefined()
  })

  it('fails on unlayered extraction', () => {
    const root = app({
      'postcss.config.mjs': `export default {plugins: {'react-strict-dom/postcss-plugin': {useCSSLayers: false}}}\n`,
    })
    expect(findings(root)).toEqual([
      expect.objectContaining({rule: 'layered-extraction', file: 'postcss.config.mjs', line: 1}),
    ])
  })

  it('fails when the entry never imports the stylesheet — a .css.ts token import does not count', () => {
    const root = app({
      'app/root.tsx': `import {spacing} from '@duro-app/tokens/tokens/spacing.css'\nimport './styles/global.css'\n`,
    })
    expect(findings(root)).toEqual([
      expect.objectContaining({rule: 'css-imported', severity: 'error', file: 'app/root.tsx'}),
    ])
  })

  it('accepts the stylesheet as a ?url import', () => {
    const root = app({
      'app/root.tsx': `import duro from '@duro-app/ui/dist/index.css?url'\nimport './styles/strict.css'\n`,
    })
    expect(findings(root)).toEqual([])
  })

  it('fails when app CSS declares the priority layers before reset', () => {
    const root = app({
      'app/root.tsx': `import './styles/strict.css'\nimport '@duro-app/ui/dist/index.css'\n`,
    })
    expect(findings(root)).toEqual([
      expect.objectContaining({
        rule: 'css-load-order',
        severity: 'error',
        file: 'app/styles/strict.css',
        line: 1,
      }),
    ])
  })

  it('accepts app CSS ahead of the stylesheet when it states the layer order first', () => {
    const root = app({
      'app/root.tsx': `import './styles/strict.css'\nimport '@duro-app/ui/dist/index.css'\n`,
      'app/styles/strict.css': `@layer reset, priority1, priority2, priority3, priority4, priority5;\n@react-strict-dom;\n`,
    })
    expect(findings(root)).toEqual([])
  })

  it('follows @import chains into nested stylesheets', () => {
    const root = app({
      'app/root.tsx': `import './styles/index.css'\nimport '@duro-app/ui/dist/index.css'\n`,
      'app/styles/index.css': `@import './strict.css';\n`,
    })
    expect(findings(root)).toEqual([
      expect.objectContaining({rule: 'css-load-order', file: 'app/styles/strict.css'}),
    ])
  })

  it('warns on an unlayered zero-spacing reset of component elements', () => {
    const root = app({
      'app/styles/global.css': `*,\n*::before {\n  box-sizing: border-box;\n  padding: 0;\n}\nbutton { margin: 0 }\nbody { margin: 0; }\n.x { padding: 0 }\n@layer reset {\n  input { padding: 0 }\n}\n`,
    })
    expect(findings(root).map((f) => [f.rule, f.severity, f.line])).toEqual([
      ['unlayered-reset', 'warn', 4],
      ['unlayered-reset', 'warn', 6],
    ])
    expect(runDoctor({cwd: root}).exitCode).toBeUndefined()
  })

  it('prints an agent-facing block in session mode, and still exits 0', () => {
    const root = app({'vite.config.ts': `export default {runtimeInjection: true}\n`})
    const result = runDoctor({cwd: root, session: true})
    expect(result.exitCode).toBeUndefined()
    expect(result.text).toMatch(/^DURO DOCTOR/)
    expect(result.text).toContain('runtime-injection at vite.config.ts:1')
  })

  it('ignores packages that do not use @duro-app/ui', () => {
    const root = app({'package.json': JSON.stringify({name: 'other'})}, {})
    expect(runDoctor({cwd: root})).toMatchObject({data: {ok: true, packages: []}})
    expect(runDoctor({cwd: root, session: true}).text).toBe('')
  })

  it('does not ask a library for an app entry', () => {
    const root = app(
      {
        'package.json': JSON.stringify({
          name: 'lib',
          exports: './dist/index.js',
          peerDependencies: {'@duro-app/ui': '*'},
        }),
      },
      {},
    )
    expect(findings(root)).toEqual([])
  })

  it('checks every consumer in a workspace from the repo root', () => {
    const nested = Object.fromEntries(
      Object.entries({
        ...HEALTHY,
        'vite.config.ts': `export default {runtimeInjection: true}\n`,
      }).map(([path, content]) => [`apps/web/${path}`, content]),
    )
    const root = app(
      {
        'package.json': JSON.stringify({name: 'monorepo', private: true}),
        'pnpm-workspace.yaml': `packages:\n  - 'apps/*'\n  - "!apps/ignored"\n`,
        'apps/tool/package.json': JSON.stringify({name: 'tool'}),
        ...nested,
      },
      {},
    )
    const result = runDoctor({cwd: root})
    expect(result.data).toMatchObject({packages: ['apps/web']})
    expect(findings(root)).toEqual([
      expect.objectContaining({rule: 'runtime-injection', file: 'apps/web/vite.config.ts'}),
    ])
  })

  it('finds an app kept one directory down when there is no workspace', () => {
    const nested = Object.fromEntries(
      Object.entries(HEALTHY).map(([path, content]) => [`web/${path}`, content]),
    )
    const root = app(nested, {})
    expect(runDoctor({cwd: root}).data).toMatchObject({ok: true, packages: ['web']})
  })

  it('exits 1 with parseable JSON from the bin', () => {
    const root = app({'vite.config.ts': `export default {runtimeInjection: true}\n`})
    let stdout = ''
    let code = 0
    try {
      stdout = execFileSync(process.execPath, [bin, 'doctor', '--json'], {
        cwd: root,
        encoding: 'utf8',
      })
    } catch (error) {
      const failure = error as {status?: number; stdout?: string}
      stdout = failure.stdout ?? ''
      code = failure.status ?? -1
    }
    expect(code).toBe(1)
    expect(JSON.parse(stdout)).toMatchObject({ok: false, findings: [{rule: 'runtime-injection'}]})
  })
})

describe('session hook runs doctor', () => {
  it('pins doctor to the same floor as the catalog', () => {
    expect(HOOK_SCRIPT).toContain(`npx -y @duro-app/cli@^${HOOK_MIN_CLI} doctor --session`)
  })

  it('re-runs doctor only when a file it reads changes', () => {
    const root = app({})
    runHook(loadRegistry(), 'install', {cwd: root})
    // A stand-in npx: logs each doctor run, and answers like a broken repo.
    const fakeBin = join(root, 'fake-bin')
    mkdirSync(fakeBin)
    const log = join(root, 'npx.log')
    writeFileSync(
      join(fakeBin, 'npx'),
      `#!/bin/sh\ncase "$*" in\n  *doctor*) echo doctor >>"${log}"; echo "DURO DOCTOR — broken" ;;\n  *) echo catalog ;;\nesac\n`,
    )
    chmodSync(join(fakeBin, 'npx'), 0o755)
    const session = () =>
      execFileSync('sh', [HOOK_SCRIPT_PATH], {
        cwd: root,
        encoding: 'utf8',
        env: {...process.env, PATH: `${fakeBin}:${process.env.PATH}`},
      })
    const runs = () => readFileSync(log, 'utf8').trim().split('\n').length

    expect(session()).toBe('catalog\n\nDURO DOCTOR — broken\n')
    expect(session()).toBe('catalog\n\nDURO DOCTOR — broken\n')
    expect(runs()).toBe(1)
    expect(readFileSync(join(root, HOOK_DOCTOR_CACHE_PATH), 'utf8')).toContain('broken')

    writeFileSync(
      join(root, 'vite.config.ts'),
      `export default {runtimeInjection: false} // edited\n`,
    )
    session()
    expect(runs()).toBe(2)
  })
})
