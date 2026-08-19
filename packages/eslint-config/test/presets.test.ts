import {describe, expect, it} from 'vitest'
import {ESLint} from 'eslint'
import {base, react, effect, tests} from '../src/index.js'

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

describe('base', () => {
  it('passes clean TypeScript', async () => {
    const result = await lint(base, 'export const n: number = 1\n', 'src/ok.ts')
    expect(result.messages).toEqual([])
  })

  it('applies the unused-vars convention with the _ escape', async () => {
    const flagged = await lint(base, 'const unused = 1\nexport {}\n', 'src/x.ts')
    expect(ruleIds(flagged)).toContain('@typescript-eslint/no-unused-vars')
    const escaped = await lint(base, 'const _unused = 1\nexport {}\n', 'src/x.ts')
    expect(escaped.messages).toEqual([])
  })
})

describe('react', () => {
  it('refuses a foreign UI library import, naming the replacement', async () => {
    const result = await lint(
      react,
      "import {Dialog} from '@radix-ui/react-dialog'\nexport {Dialog}\n",
      'src/App.tsx',
    )
    const message = result.messages.find((m) => m.ruleId === 'no-restricted-imports')
    expect(message?.message).toContain('@duro-app/ui')
    expect(message?.message).toContain('duro-design-system')
  })

  it('refuses raw lexical at the app layer', async () => {
    const result = await lint(
      react,
      "import {createEditor} from 'lexical'\nexport {createEditor}\n",
      'src/App.tsx',
    )
    const message = result.messages.find((m) => m.ruleId === 'no-restricted-imports')
    expect(message?.message).toContain('lexical-multi')
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

  it('warns on flexGrow in css.create without gating', async () => {
    const result = await lint(
      react,
      "import {css} from 'react-strict-dom'\nexport const s = css.create({row: {flexGrow: 1}})\n",
      'src/styles.ts',
    )
    const message = result.messages.find((m) => m.ruleId === 'duro/no-flex-grow-web')
    expect(message?.severity).toBe(1)
  })
})

describe('effect', () => {
  it('refuses kysely, pointing at @effect/sql', async () => {
    const result = await lint(
      effect,
      "import {Kysely} from 'kysely'\nexport {Kysely}\n",
      'src/db.ts',
    )
    const message = result.messages.find((m) => m.ruleId === 'no-restricted-imports')
    expect(message?.message).toContain('@effect/sql')
  })

  it('refuses the @effect/opentelemetry barrel but allows the subpath', async () => {
    const barrel = await lint(
      effect,
      "import {NodeSdk} from '@effect/opentelemetry'\nexport {NodeSdk}\n",
      'src/otel.ts',
    )
    expect(ruleIds(barrel)).toContain('no-restricted-imports')

    const subpath = await lint(
      effect,
      "import * as NodeSdk from '@effect/opentelemetry/NodeSdk'\nexport {NodeSdk}\n",
      'src/otel.ts',
    )
    expect(subpath.messages.filter((m) => m.ruleId === 'no-restricted-imports')).toEqual([])
  })
})

describe('tests preset', () => {
  const testFile = 'src/thing.test.ts'

  it('refuses the getByTestId family', async () => {
    const result = await lint(
      [...base, ...tests],
      'declare const screen: any\nscreen.getByTestId("editing-item")\n',
      testFile,
    )
    const message = result.messages.find((m) => m.ruleId === 'no-restricted-syntax')
    expect(message?.message).toContain('getByRole')
  })

  it('refuses CSS class locators but allows role locators', async () => {
    const flagged = await lint(
      [...base, ...tests],
      'declare const page: any\npage.locator(".af-input")\n',
      testFile,
    )
    expect(ruleIds(flagged)).toContain('no-restricted-syntax')

    const clean = await lint(
      [...base, ...tests],
      'declare const page: any\npage.getByRole("dialog")\npage.locator("[aria-busy=false]")\n',
      testFile,
    )
    expect(clean.messages.filter((m) => m.ruleId === 'no-restricted-syntax')).toEqual([])
  })

  it('leaves non-test files alone', async () => {
    const result = await lint(
      [...base, ...tests],
      'declare const screen: any\nscreen.getByTestId("fine-here")\n',
      'src/thing.ts',
    )
    expect(result.messages.filter((m) => m.ruleId === 'no-restricted-syntax')).toEqual([])
  })
})

describe('composition', () => {
  it('react + effect + tests flatten into one usable config', async () => {
    const combined = [...react, ...effect, ...tests]
    const result = await lint(
      combined,
      "import {Kysely} from 'kysely'\nexport const A = () => <div />\nexport {Kysely}\n",
      'src/App.tsx',
    )
    const ids = ruleIds(result)
    expect(ids).toContain('no-restricted-imports')
    expect(ids).toContain('duro/no-raw-html-element')
  })
})
