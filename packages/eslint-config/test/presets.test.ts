import {describe, expect, it} from 'vitest'
import {ESLint} from 'eslint'
import {react} from '../src/index.js'
import {effect} from '@aval-adr/eslint-config'

/**
 * Fixture-consumer smoke tests: run the real ESLint engine over sample code
 * with each preset, exactly as a consumer repo would. This is what proves the
 * presets compose (plugins resolve, configs flatten, scoping applies) — the
 * rule-level behavior is covered by the plugin's own RuleTester suites.
 */

function lint(configs: object[], code: string, filePath: string) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: configs as never,
    cwd: import.meta.dirname,
  })
  return eslint.lintText(code, {filePath}).then(([result]) => result)
}

function ruleIds(result: {messages: {ruleId: string | null}[]}) {
  return result.messages.map((m) => m.ruleId)
}

describe('react', () => {
  it('refuses a foreign UI library import, naming the replacement', async () => {
    const result = await lint(
      react,
      "import {Dialog} from '@radix-ui/react-dialog'\nexport {Dialog}\n",
      'src/App.tsx',
    )
    const message = result.messages.find((m) => m.ruleId === 'duro/no-restricted-imports')
    expect(message?.message).toContain('@duro-app/ui')
    expect(message?.message).toContain('duro-design-system')
  })

  it('refuses raw lexical at the app layer', async () => {
    const result = await lint(
      react,
      "import {createEditor} from 'lexical'\nexport {createEditor}\n",
      'src/App.tsx',
    )
    const message = result.messages.find((m) => m.ruleId === 'duro/no-restricted-imports')
    expect(message?.message).toContain('lexical-multi')
  })

  it('allows a TYPE import from a banned module', async () => {
    // A type import erases at compile time: it reaches no runtime module, so
    // it bypasses nothing the ban protects. Banning by module name caught it
    // anyway, and a consumer needing one type the wrapper does not re-export
    // had to carry a local override to say so.
    const result = await lint(
      react,
      "import type {SerializedEditorState} from 'lexical'\nexport type {SerializedEditorState}\n",
      'src/App.tsx',
    )
    expect(result.messages.filter((m) => m.ruleId === 'duro/no-restricted-imports')).toEqual([])
  })

  it('still refuses a VALUE import from a foreign UI library', async () => {
    const result = await lint(
      react,
      "import {Dialog} from '@radix-ui/react-dialog'\nexport {Dialog}\n",
      'src/App.tsx',
    )
    expect(ruleIds(result)).toContain('duro/no-restricted-imports')
  })

  it('carries the duro plugin: raw intrinsics and form primitives report', async () => {
    const result = await lint(
      react,
      'export const A = () => (\n  <div>\n    <html.input />\n  </div>\n)\n',
      'src/App.tsx',
    )
    const ids = ruleIds(result)
    expect(ids).toContain('duro/no-raw-html-element')
    expect(ids).toContain('duro/prefer-ds-form-components')
  })

  it('carries classic hooks correctness, not the compiler-era rules', async () => {
    const configured = new Set(react.flatMap((c) => Object.keys(c.rules ?? {})))
    expect(configured).toContain('react-hooks/rules-of-hooks')
    expect(configured).not.toContain('react-hooks/set-state-in-effect')
    expect(configured).not.toContain('react-hooks/refs')

    const flagged = await lint(
      react,
      'function notAComponent() { useState(0) }\ndeclare function useState(n: number): unknown\nnotAComponent()\n',
      'src/x.ts',
    )
    expect(ruleIds(flagged)).toContain('react-hooks/rules-of-hooks')
  })

  it('no longer reports flexGrow (react-strict-dom honours it on web)', async () => {
    const result = await lint(
      react,
      "import {css} from 'react-strict-dom'\nexport const s = css.create({row: {flexGrow: 1}})\n",
      'src/styles.ts',
    )
    expect(result.messages.find((m) => m.ruleId === 'duro/no-flex-grow-web')).toBeUndefined()
  })
})

describe('composition with the harness effect preset', () => {
  it('reports a foreign UI import and kysely in one file', async () => {
    const result = await lint(
      [...react, ...effect],
      "import {Button} from '@mui/material'\nimport {Kysely} from 'kysely'\nexport {Button, Kysely}\n",
      'src/App.tsx',
    )
    const banned = result.messages.filter((m) =>
      ['duro/no-restricted-imports', '@typescript-eslint/no-restricted-imports'].includes(
        m.ruleId ?? '',
      ),
    )
    const text = banned.map((m) => m.message).join('\n')
    expect(text).toContain('@duro-app/ui')
    expect(text).toContain('@effect/sql')
  })
})
