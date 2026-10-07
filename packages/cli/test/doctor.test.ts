import {execFileSync} from 'node:child_process'
import {chmodSync, mkdirSync, mkdtempSync, readFileSync, utimesSync, writeFileSync} from 'node:fs'
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

  // website-builder moved its StyleX options out of vite.config.ts into a
  // module it imports; doctor read only the config and went blind to them.
  it('follows a config into the sibling module that holds its StyleX options', () => {
    const root = app({
      'vite.config.ts': `import {stylexOpts} from './vite-stylex'\nexport default {plugins: [stylex(stylexOpts)]}\n`,
      'vite-stylex.ts': `export const stylexOpts = {\n  dev: true,\n  runtimeInjection: true,\n}\n`,
    })
    expect(findings(root)).toEqual([
      expect.objectContaining({
        rule: 'runtime-injection',
        severity: 'error',
        file: 'vite-stylex.ts',
        line: 3,
      }),
    ])
    expect(runDoctor({cwd: root}).text).toContain('vite-stylex.ts')
  })

  it('does not follow imports out of the package root or into tests', () => {
    const root = app({
      'vite.config.ts': `import {x} from './src/opts'\nimport {y} from './setup.test'\nexport default {plugins: [stylex({runtimeInjection: false})]}\n`,
      'src/opts.ts': `export const x = {runtimeInjection: true}\n`,
      'setup.test.ts': `export const y = {runtimeInjection: true}\n`,
    })
    expect(findings(root)).toEqual([])
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

  describe('tokens-compiled', () => {
    /** website-builder's shape: bare StyleX over app code, nothing over the tokens. */
    const BARE_STYLEX = [
      `import react from '@vitejs/plugin-react'`,
      `import stylexPlugin from '@stylexjs/babel-plugin'`,
      `const stylexBabelOpts = {runtimeInjection: false, importSources: [{from: 'react-strict-dom', as: 'css'}]}`,
      `const rsdSourceRE = /\\/react-strict-dom\\/dist\\/(web|dom)\\/[^/]+\\.js(\\?|$)/`,
      `// @duro-app/tokens is read through the barrel (prose, not config)`,
      `export default {`,
      `  optimizeDeps: {exclude: ['react-strict-dom']},`,
      `  plugins: [react({babel: {plugins: [[stylexPlugin, stylexBabelOpts]]}})],`,
      `}`,
      '',
    ].join('\n')

    /** duro-app's shape: the preset over app code AND over the tokens, both SSR-inlined. */
    const DURO_APP = [
      `import {reactRouter} from '@react-router/dev/vite'`,
      `import babel from 'vite-plugin-babel'`,
      `const preset = ['react-strict-dom/babel-preset', {dev: true, platform: 'web'}]`,
      `export default {`,
      `  plugins: [`,
      `    reactRouter(),`,
      `    babel({filter: /\\/app\\/.*\\.[jt]sx?$/, babelConfig: {presets: [preset]}}),`,
      `    babel({filter: /node_modules\\/@duro-app\\/tokens\\/.*\\.[jt]sx?$/, babelConfig: {presets: [preset]}}),`,
      `    babel({filter: /node_modules\\/react-strict-dom/, babelConfig: {plugins: [['@stylexjs/babel-plugin', {runtimeInjection: false}]]}}),`,
      `  ],`,
      `  ssr: {noExternal: ['react-strict-dom', '@duro-app/tokens']},`,
      `}`,
      '',
    ].join('\n')

    const tokens = (root: string) => findings(root).filter((f) => f.rule === 'tokens-compiled')

    it('warns when StyleX compiles the app but nothing compiles the tokens', () => {
      const root = app({'vite.config.ts': BARE_STYLEX})
      expect(tokens(root)).toEqual([
        expect.objectContaining({severity: 'warn', file: 'vite.config.ts', line: 2}),
      ])
      const [finding] = tokens(root)
      expect(finding!.message).toContain('.stylex.ts extension')
      expect(finding!.message).toContain('Latent')
      expect(finding!.fix).toContain('react-strict-dom/babel-preset')
      expect(finding!.fix).toContain('ssr.noExternal')
      expect(runDoctor({cwd: root}).exitCode).toBeUndefined()
      expect(runDoctor({cwd: root, session: true}).text).toContain('tokens-compiled')
    })

    it('fails when a css.create file already deep-imports the tokens', () => {
      const root = app({
        'vite.config.ts': BARE_STYLEX,
        'app/components/Card.tsx': [
          `import {css} from 'react-strict-dom'`,
          `import {spacing} from '@duro-app/tokens/tokens/spacing.css'`,
          `export const styles = css.create({card: {padding: spacing.md}})`,
          '',
        ].join('\n'),
      })
      expect(tokens(root)).toEqual([expect.objectContaining({severity: 'error'})])
      expect(tokens(root)[0]!.message).toContain('app/components/Card.tsx:2')
      expect(runDoctor({cwd: root}).exitCode).toBe(1)
    })

    it('is silent on the duro-app wiring', () => {
      const root = app({'vite.config.ts': DURO_APP})
      expect(findings(root)).toEqual([])
    })

    it('does not take a postcss extraction include for compiling the tokens', () => {
      const root = app({
        'vite.config.ts': DURO_APP.replace(
          / {4}babel\(\{filter: \/node_modules\\\/@duro-app.*\n/,
          '',
        ),
        'postcss.config.mjs': `export default {plugins: {'react-strict-dom/postcss-plugin': {include: ['app/**', 'node_modules/@duro-app/tokens/src/**/*.ts']}}}\n`,
      })
      expect(tokens(root)).toEqual([expect.objectContaining({rule: 'tokens-compiled'})])
    })

    it('is silent when nothing compiles with StyleX', () => {
      const root = app({
        'vite.config.ts': `import react from '@vitejs/plugin-react'\nexport default {plugins: [react()]}\n`,
      })
      expect(findings(root)).toEqual([])
    })

    it('fails on an SSR app that compiles the tokens but does not inline them', () => {
      const root = app({
        'vite.config.ts': DURO_APP.replace(`, '@duro-app/tokens'`, ''),
        'app/root.tsx': `${HEALTHY['app/root.tsx']}export const s = css.create({})\n`,
      })
      expect(tokens(root)).toEqual([expect.objectContaining({severity: 'error'})])
      expect(tokens(root)[0]!.fix).toContain('ssr.noExternal')
    })

    /** DURO_APP with its noExternal list moved into a binding. */
    const withList = (binding: string) =>
      DURO_APP.replace(`ssr: {noExternal: ['react-strict-dom', '@duro-app/tokens']},`, binding)

    it('passes an imported noExternal const when the tokens are routed through Babel', () => {
      const root = app({
        'vite.config.ts': `import {SSR_NO_EXTERNAL} from './ssr-externals'\n${withList('ssr: {noExternal: SSR_NO_EXTERNAL},')}`,
        'ssr-externals.ts': `export const SSR_NO_EXTERNAL = ['react-strict-dom', '@duro-app/tokens']\n`,
      })
      expect(findings(root)).toEqual([])
      expect(runDoctor({cwd: root}).exitCode).toBeUndefined()
    })

    it('passes the {noExternal} shorthand over a local const', () => {
      const root = app({
        'vite.config.ts': `const noExternal = ['react-strict-dom', '@duro-app/tokens']\n${withList('ssr: {noExternal},')}`,
      })
      expect(findings(root)).toEqual([])
    })

    it('warns, naming the identifier, when noExternal cannot be resolved', () => {
      const root = app({
        'vite.config.ts': `import {externals} from 'some-preset'\n${withList('ssr: {noExternal: externals},')}`,
      })
      const result = runDoctor({cwd: root})
      expect(tokens(root)).toEqual([
        expect.objectContaining({severity: 'warn', file: 'vite.config.ts', line: 12}),
      ])
      expect(tokens(root)[0]!.message).toContain('`externals`')
      expect(tokens(root)[0]!.fix).toContain("'@duro-app/tokens' is in `externals`")
      expect(result.exitCode).toBeUndefined()
      expect(result.data).toMatchObject({ok: true})
    })

    it('does not take a declared list for Babel routing', () => {
      const root = app({
        'vite.config.ts': [
          `import stylexPlugin from '@stylexjs/babel-plugin'`,
          `import {reactRouter} from '@react-router/dev/vite'`,
          `const noExternal = ['react-strict-dom', '@duro-app/tokens']`,
          `export default {plugins: [reactRouter(), stylexPlugin()], ssr: {noExternal}}`,
          '',
        ].join('\n'),
        'app/components/Card.tsx': [
          `import {css} from 'react-strict-dom'`,
          `import {spacing} from '@duro-app/tokens/tokens/spacing.css'`,
          `export const styles = css.create({card: {padding: spacing.md}})`,
          '',
        ].join('\n'),
      })
      expect(tokens(root)).toEqual([expect.objectContaining({severity: 'error'})])
      expect(tokens(root)[0]!.message).toContain('nothing compiles')
      expect(runDoctor({cwd: root}).exitCode).toBe(1)
    })
  })

  describe('media-var', () => {
    const BROKEN_CSS = `.a{color:red}@media (max-width: var(--x-1abc)){.b{display:none}}`
    const media = (root: string) => findings(root).filter((f) => f.rule === 'media-var')
    /** Back-date every input so the build output is the newest file. */
    const ageInputs = (root: string, files: string[]) => {
      const past = new Date(Date.now() - 60_000)
      for (const file of files) utimesSync(join(root, file), past, past)
    }

    it('fails on a fresh built @media that reads a variable', () => {
      const root = app({'dist/assets/x.css': BROKEN_CSS})
      ageInputs(root, Object.keys(HEALTHY))
      const result = runDoctor({cwd: root})
      expect(media(root)).toEqual([
        expect.objectContaining({severity: 'error', file: 'dist/assets/x.css', line: 1}),
      ])
      expect(media(root)[0]!.message).toContain('@media (max-width: var(--x-1abc))')
      expect(media(root)[0]!.fix).toContain('breakpoints.css.ts')
      expect(result.exitCode).toBe(1)
      expect(result.data).toMatchObject({checked: expect.arrayContaining(['dist/assets/x.css'])})
      expect(result.text).not.toContain('skipped')
    })

    it('skips build output older than the config', () => {
      const root = app({'dist/assets/x.css': BROKEN_CSS})
      const past = new Date(Date.now() - 60_000)
      utimesSync(join(root, 'dist/assets/x.css'), past, past)
      const result = runDoctor({cwd: root})
      expect(media(root)).toEqual([])
      expect(result.exitCode).toBeUndefined()
      expect(result.text).toContain('skipped: media-var (no fresh build)')
      const data = result.data as {checked: string[]; skipped: string[]}
      expect(data.checked).not.toContain('dist/assets/x.css')
      expect(data.skipped).toEqual(['media-var (no fresh build)'])
    })

    it('passes fresh CSS whose media queries hold px', () => {
      const root = app({'build/client/a.css': `@media (max-width:768px){.b{display:none}}`})
      ageInputs(root, Object.keys(HEALTHY))
      expect(findings(root)).toEqual([])
      expect(runDoctor({cwd: root}).text).not.toContain('skipped')
    })

    it('keeps the report columns aligned', () => {
      const root = app({
        'dist/x.css': BROKEN_CSS,
        'vite.config.ts': `export default {runtimeInjection: true}\n`,
      })
      ageInputs(root, [...Object.keys(HEALTHY)])
      const heads = runDoctor({cwd: root})
        .text.split('\n')
        .filter((line) => /^ {2}(?:error|warn) /.test(line))
      expect(heads.length).toBe(2)
      // severity (5) + rule (18) columns: the location starts at the same column.
      const starts = heads.map((line) => line.indexOf(line.trim().split(/\s+/)[2]!))
      expect(new Set(starts).size).toBe(1)
      for (const line of heads) expect(line.length).toBeLessThanOrEqual(80)
    })
  })

  it('prints an agent-facing block in session mode, and still exits 0', () => {
    const root = app({'vite.config.ts': `export default {runtimeInjection: true}\n`})
    const result = runDoctor({cwd: root, session: true})
    expect(result.exitCode).toBeUndefined()
    expect(result.text).toMatch(/^DURO DOCTOR/)
    expect(result.text).toContain('runtime-injection at vite.config.ts:1')
  })

  it('words the session opening line by finding type', () => {
    const root = app({'dist/x.css': `@media (min-width: var(--bp)){a{b:c}}`})
    const past = new Date(Date.now() - 60_000)
    for (const file of Object.keys(HEALTHY)) utimesSync(join(root, file), past, past)
    const [first] = runDoctor({cwd: root, session: true}).text.split('\n')
    expect(first).toBe(
      "DURO DOCTOR — 1 error in this repo's @duro-app/ui setup: breakpoint media queries never match until fixed. Fix before any styling work:",
    )
    expect(first).not.toContain('spacing flattened')
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
    // Four real `sh` runs, each forking find, cksum and the stand-in npx:
    // well under a second alone, but the pre-push gate runs every suite at
    // once and has taken this past vitest's 5s default.
  }, 30_000)
})
