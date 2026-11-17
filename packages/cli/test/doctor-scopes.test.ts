import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {describe, expect, it} from 'vitest'
import {isGreenrackConsumer, runDoctor, type DoctorFinding} from '../src/commands/doctor.js'
import {
  LEGACY_CSS_VARIABLE_PREFIX,
  LEGACY_PROSE_LAYER,
  LEGACY_TOKENS_PACKAGE,
  LEGACY_UI_PACKAGE,
} from '../src/legacy-names.js'

interface ScopeFixture {
  label: string
  kind: 'greenrack' | 'legacy'
  ui: string
  tokens: string
  proseLayer: string
}

const SCOPES: ScopeFixture[] = [
  {
    label: 'new scope',
    kind: 'greenrack',
    ui: '@greenharness/greenrack-ui',
    tokens: '@greenharness/greenrack-tokens',
    proseLayer: 'gr-prose',
  },
  {
    label: 'old scope',
    kind: 'legacy',
    ui: LEGACY_UI_PACKAGE,
    tokens: LEGACY_TOKENS_PACKAGE,
    proseLayer: LEGACY_PROSE_LAYER,
  },
]

const inRegex = (name: string) => name.replace(/\//g, '\\/')

function write(root: string, files: Record<string, string>): string {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), {recursive: true})
    writeFileSync(join(root, path), content)
  }
  return root
}

/** An SSR app that compiles its tokens package through Babel, unless told otherwise. */
function app(scope: ScopeFixture, options: {compileTokens?: boolean; inline?: boolean} = {}) {
  const {compileTokens = true, inline = true} = options
  const lines = [
    `import {reactRouter} from '@react-router/dev/vite'`,
    `import babel from 'vite-plugin-babel'`,
    `const preset = ['react-strict-dom/babel-preset', {dev: true, platform: 'web'}]`,
    `export default {`,
    `  plugins: [`,
    `    reactRouter(),`,
    `    babel({filter: /\\/app\\/.*\\.[jt]sx?$/, babelConfig: {presets: [preset]}}),`,
    ...(compileTokens
      ? [
          `    babel({filter: /node_modules\\/${inRegex(scope.tokens)}\\/.*\\.[jt]sx?$/, babelConfig: {presets: [preset]}}),`,
        ]
      : []),
    `  ],`,
    `  ssr: {noExternal: ['react-strict-dom'${inline ? `, '${scope.tokens}'` : ''}]},`,
    `}`,
    '',
  ]
  return write(mkdtempSync(join(tmpdir(), 'doctor-scopes-')), {
    'package.json': JSON.stringify({name: 'app', dependencies: {[scope.ui]: '^1.0.0'}}),
    'vite.config.ts': lines.join('\n'),
    'postcss.config.mjs': `export default {plugins: {'react-strict-dom/postcss-plugin': {include: ['app/**']}}}\n`,
    'app/root.tsx': `import '${scope.ui}/dist/index.css'\nimport './styles/strict.css'\n`,
    'app/styles/strict.css': `@react-strict-dom;\n`,
  })
}

const findings = (root: string) =>
  (runDoctor({cwd: root}).data as {findings: DoctorFinding[]}).findings

describe.each(SCOPES)('greenrack doctor on the $label', (scope) => {
  it('is a consumer', () => {
    expect(isGreenrackConsumer(app(scope))).toBe(true)
  })

  it('finds nothing in a healthy app', () => {
    expect(findings(app(scope))).toEqual([])
  })

  it('wants the stylesheet of its own scope', () => {
    const root = app(scope)
    const other = SCOPES.find((candidate) => candidate !== scope)!
    write(root, {'app/root.tsx': `import '${other.ui}/dist/index.css'\n`})
    expect(findings(root)).toEqual([
      expect.objectContaining({
        rule: 'css-imported',
        fix: expect.stringContaining(`'${scope.ui}/dist/index.css'`),
      }),
    ])
  })

  it('reports tokens that are never compiled, naming its own package', () => {
    const [finding] = findings(app(scope, {compileTokens: false}))
    expect(finding).toMatchObject({rule: 'tokens-compiled'})
    expect(finding!.fix).toContain(`node_modules/${scope.tokens} `)
    expect(finding!.fix).toContain(inRegex(scope.tokens))
  })

  it('reports tokens missing from SSR noExternal, naming its own package', () => {
    const [finding] = findings(app(scope, {inline: false}))
    expect(finding).toMatchObject({rule: 'tokens-compiled'})
    expect(finding!.fix).toContain(`'${scope.tokens}'`)
  })

  it('does not take the other scope tokens for its own', () => {
    const other = SCOPES.find((candidate) => candidate !== scope)!
    const root = app(scope, {compileTokens: false, inline: false})
    write(root, {
      'vite.config.ts': `${`import babel from 'vite-plugin-babel'\nconst a = '${other.tokens}'\n`}export default {plugins: [babel({filter: /x/, babelConfig: {presets: ['react-strict-dom/babel-preset']}})], ssr: {noExternal: ['${other.tokens}']}}\n`,
    })
    expect(findings(root).map(({rule}) => rule)).toContain('tokens-compiled')
  })

  it('names the scope in a banner under 80 columns', () => {
    const root = app(scope, {inline: false})
    const session = runDoctor({cwd: root, session: true}).text
    const plain = runDoctor({cwd: root}).text
    for (const text of [session, plain]) {
      // The scope is named in the banner or the line under it, every line within 80 columns.
      const [banner, next] = text.split('\n')
      expect(`${banner}\n${next}`).toContain(scope.ui)
      expect(banner!.length).toBeLessThan(80)
      expect(next!.length).toBeLessThan(80)
    }
    expect(runDoctor({cwd: app(scope)}).text.split('\n')[0]).toContain(scope.ui)
  })

  it('reports an old CSS variable with its new name', () => {
    const root = app(scope)
    write(root, {
      'app/styles/own.css': `.a { padding: var(${LEGACY_CSS_VARIABLE_PREFIX}spacing-md); }\n`,
    })
    const legacy = findings(root).filter(({rule}) => rule === 'legacy-names')
    expect(legacy).toHaveLength(1)
    if (scope.kind === 'greenrack') {
      expect(legacy[0]!.message).toContain('--gr-spacing-md')
      expect(legacy[0]!.file).toBe('app/styles/own.css')
    } else {
      // Still right on the old scope: one line saying what to do on the move.
      expect(legacy[0]!.message).toContain('1 old CSS name(s)')
      expect(legacy[0]!.fix).toContain('when the app moves to @greenharness/greenrack-ui')
    }
  })

  it('reports the first 10 old names, then how many more', () => {
    const root = app(scope)
    const rules = Array.from(
      {length: 13},
      (_, index) => `.a${index} { gap: var(${LEGACY_CSS_VARIABLE_PREFIX}spacing-md); }`,
    )
    write(root, {'app/styles/own.css': rules.join('\n')})
    const legacy = findings(root).filter(({rule}) => rule === 'legacy-names')
    if (scope.kind === 'greenrack') {
      expect(legacy).toHaveLength(11)
      expect(legacy[10]!.message).toBe('… and 3 more')
    } else {
      expect(legacy).toHaveLength(1)
      expect(legacy[0]!.message).toContain('13 old CSS name(s)')
    }
  })
})
