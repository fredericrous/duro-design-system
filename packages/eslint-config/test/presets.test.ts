import {describe, expect, it} from 'vitest'
import {ESLint} from 'eslint'
import {base, react, effect, tests, adrLint} from '../src/index.js'

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
    const message = result.messages.find(
      (m) => m.ruleId === '@typescript-eslint/no-restricted-imports',
    )
    expect(message?.message).toContain('@duro-app/ui')
    expect(message?.message).toContain('duro-design-system')
  })

  it('refuses raw lexical at the app layer', async () => {
    const result = await lint(
      react,
      "import {createEditor} from 'lexical'\nexport {createEditor}\n",
      'src/App.tsx',
    )
    const message = result.messages.find(
      (m) => m.ruleId === '@typescript-eslint/no-restricted-imports',
    )
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
    expect(
      result.messages.filter((m) => m.ruleId === '@typescript-eslint/no-restricted-imports'),
    ).toEqual([])
  })

  it('still refuses a VALUE import from a foreign UI library', async () => {
    const result = await lint(
      react,
      "import {Dialog} from '@radix-ui/react-dialog'\nexport {Dialog}\n",
      'src/App.tsx',
    )
    expect(ruleIds(result)).toContain('@typescript-eslint/no-restricted-imports')
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

describe('effect', () => {
  it('refuses kysely, pointing at @effect/sql', async () => {
    const result = await lint(
      effect,
      "import {Kysely} from 'kysely'\nexport {Kysely}\n",
      'src/db.ts',
    )
    const message = result.messages.find(
      (m) => m.ruleId === '@typescript-eslint/no-restricted-imports',
    )
    expect(message?.message).toContain('@effect/sql')
  })

  it('refuses the @effect/opentelemetry barrel but allows the subpath', async () => {
    const barrel = await lint(
      effect,
      "import {NodeSdk} from '@effect/opentelemetry'\nexport {NodeSdk}\n",
      'src/otel.ts',
    )
    expect(ruleIds(barrel)).toContain('@typescript-eslint/no-restricted-imports')

    const subpath = await lint(
      effect,
      "import * as NodeSdk from '@effect/opentelemetry/NodeSdk'\nexport {NodeSdk}\n",
      'src/otel.ts',
    )
    expect(
      subpath.messages.filter((m) => m.ruleId === '@typescript-eslint/no-restricted-imports'),
    ).toEqual([])
  })

  it('allows a TYPE import of the barrel, which cannot crash at module load', async () => {
    const result = await lint(
      effect,
      "import type {Resource} from '@effect/opentelemetry'\nexport type {Resource}\n",
      'src/otel.ts',
    )
    expect(
      result.messages.filter((m) => m.ruleId === '@typescript-eslint/no-restricted-imports'),
    ).toEqual([])
  })

  it('still refuses a TYPE import is not a loophole for kysely VALUES', async () => {
    const result = await lint(
      effect,
      "import {Kysely} from 'kysely'\nexport {Kysely}\n",
      'src/db.ts',
    )
    expect(ruleIds(result)).toContain('@typescript-eslint/no-restricted-imports')
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
    expect(ids).toContain('@typescript-eslint/no-restricted-imports')
    expect(ids).toContain('duro/no-raw-html-element')
  })
})

describe('adrLint', () => {
  const restricted = (report: {messages: {ruleId: string | null; message: string}[]}) =>
    report.messages.filter((m) => m.ruleId === '@typescript-eslint/no-restricted-imports')

  it('keeps the react bans when it comes last', async () => {
    const muiImportReport = await lint(
      [...react, ...adrLint({stack: ['react']})],
      "import {Button} from '@mui/material'\nexport {Button}\n",
      'src/App.tsx',
    )
    expect(restricted(muiImportReport)[0]?.message).toContain('@duro-app/ui')
  })

  it('keeps the react and effect bans together', async () => {
    const bothStacksReport = await lint(
      [...react, ...effect, ...adrLint({stack: ['react', 'effect']})],
      "import {Button} from '@mui/material'\nimport {Kysely} from 'kysely'\nexport {Button, Kysely}\n",
      'src/App.tsx',
    )
    const messages = restricted(bothStacksReport).map((m) => m.message)
    expect(messages.some((m) => m.includes('@duro-app/ui'))).toBe(true)
    expect(messages.some((m) => m.includes('@effect/sql'))).toBe(true)
  })

  it('adds the consumer restrictedImports to the same rule', async () => {
    const layeredReport = await lint(
      [
        ...react,
        ...effect,
        ...adrLint({
          stack: ['react', 'effect'],
          restrictedImports: [{patterns: [{group: ['**/infra/**']}]}],
        }),
      ],
      "import {Button} from '@mui/material'\nimport {Kysely} from 'kysely'\nimport {db} from '../infra/db'\nexport {Button, Kysely, db}\n",
      'src/App.tsx',
    )
    expect(restricted(layeredReport)).toHaveLength(3)
  })

  it('keeps the stack bans inside a files-scoped layer', async () => {
    const scopedReport = await lint(
      [
        ...react,
        ...adrLint({
          stack: ['react'],
          restrictedImports: [{files: ['src/**'], patterns: [{group: ['**/infra/**']}]}],
        }),
      ],
      "import {Button} from '@mui/material'\nimport {db} from '../infra/db'\nexport {Button, db}\n",
      'src/App.tsx',
    )
    const messages = restricted(scopedReport).map((m) => m.message)
    expect(messages.some((m) => m.includes('@duro-app/ui'))).toBe(true)
    expect(messages).toHaveLength(2)
  })

  it('reports a stack ban once when two entries share a scope', async () => {
    const sharedScopeReport = await lint(
      [
        ...react,
        ...adrLint({
          stack: ['react'],
          restrictedImports: [
            {files: ['src/**'], patterns: [{group: ['**/infra/**']}]},
            {files: ['src/**'], paths: ['fs']},
          ],
        }),
      ],
      "import {Button} from '@mui/material'\nexport {Button}\n",
      'src/App.tsx',
    )
    const uiMessages = restricted(sharedScopeReport).filter((m) =>
      m.message.includes('@duro-app/ui'),
    )
    expect(uiMessages).toHaveLength(1)
  })

  it('refuses restrictedImports without a stack', () => {
    expect(() => adrLint({restrictedImports: [{paths: ['fs']}]} as never)).toThrow('needs `stack`')
    expect(() => adrLint({stack: [], restrictedImports: [{paths: ['fs']}]})).not.toThrow()
  })

  it('flags a ts-ignore and a bare empty catch, and passes a justified one', async () => {
    const flagged = await lint(
      adrLint(),
      '// @ts-ignore\nconst a: number = "x"\ntry {\n  a.toString()\n} catch {}\nexport {a}\n',
      'src/x.ts',
    )
    const ids = ruleIds(flagged)
    expect(ids).toContain('@typescript-eslint/ban-ts-comment')
    expect(ids).toContain('adr-lint/no-swallowed-catch')

    const justified = await lint(
      adrLint(),
      'try {\n  JSON.parse("{}")\n} catch {} // the cache is optional\n',
      'src/x.ts',
    )
    expect(ruleIds(justified)).not.toContain('adr-lint/no-swallowed-catch')
  })

  it('leaves base unchanged', async () => {
    const baseReport = await lint(
      base,
      '// @ts-ignore\nconst a: number = "x"\ntry {\n  a.toString()\n} catch {}\nexport {a}\n',
      'src/x.ts',
    )
    expect(ruleIds(baseReport)).not.toContain('adr-lint/no-swallowed-catch')
    expect(base.some((config) => config.name?.startsWith('adr-lint'))).toBe(false)
  })

  describe('scoped stacks', () => {
    const lexicalCode = "import {x} from 'lexical'\nexport {x}\n"
    const lexicalHits = (report: {messages: {ruleId: string | null; message: string}[]}) =>
      restricted(report).filter(
        (m) => m.message.includes('lexical') || m.message.includes('@duro-app/ui'),
      )

    it('bans lexical only in the scoped files', async () => {
      const configs = adrLint({stack: [{name: 'react', files: ['apps/web/**']}]})
      expect(lexicalHits(await lint(configs, lexicalCode, 'apps/web/a.ts'))).toHaveLength(1)
      expect(lexicalHits(await lint(configs, lexicalCode, 'packages/headless/a.ts'))).toHaveLength(
        0,
      )
    })

    it('keeps a plain stack name repo-wide', async () => {
      const configs = adrLint({stack: ['react']})
      expect(lexicalHits(await lint(configs, lexicalCode, 'packages/headless/a.ts'))).toHaveLength(
        1,
      )
    })

    it('keeps the layer ban and adds the stack ban where they overlap', async () => {
      const configs = adrLint({
        stack: [{name: 'react', files: ['packages/editor/**']}],
        restrictedImports: [{files: ['packages/**'], paths: ['fs']}],
      })
      const code = "import {x} from 'lexical'\nimport fs from 'fs'\nexport {x, fs}\n"
      const inEditor = restricted(await lint(configs, code, 'packages/editor/a.ts'))
      expect(inEditor).toHaveLength(2)
      expect(inEditor.some((m) => m.message.includes("'fs'"))).toBe(true)
      const inOther = restricted(await lint(configs, code, 'packages/other/a.ts'))
      expect(inOther).toHaveLength(1)
      expect(inOther[0]?.message).toContain("'fs'")
    })

    it('keeps the plain stack bans inside a scoped stack and a layer', async () => {
      const configs = adrLint({
        stack: ['effect', {name: 'react', files: ['apps/web/**']}],
        restrictedImports: [{files: ['apps/**'], paths: ['fs']}],
      })
      const code =
        "import {x} from 'lexical'\nimport fs from 'fs'\nimport k from 'kysely'\nexport {x, fs, k}\n"
      const inWeb = restricted(await lint(configs, code, 'apps/web/a.ts')).map((m) => m.message)
      expect(inWeb).toHaveLength(3)
      expect(inWeb.some((m) => m.includes('lexical'))).toBe(true)
      expect(inWeb.some((m) => m.includes("'fs'"))).toBe(true)
      expect(inWeb.some((m) => m.includes('Kysely'))).toBe(true)
      const inOther = restricted(await lint(configs, code, 'apps/other/a.ts')).map((m) => m.message)
      expect(inOther).toHaveLength(2)
      expect(inOther.some((m) => m.includes('lexical'))).toBe(false)
    })

    it('holds both stacks bans where two scoped stacks overlap', async () => {
      const configs = adrLint({
        stack: [
          {name: 'react', files: ['packages/editor/**']},
          {name: 'effect', files: ['packages/**']},
        ],
      })
      const code = "import {x} from 'lexical'\nimport k from 'kysely'\nexport {x, k}\n"
      const inEditor = restricted(await lint(configs, code, 'packages/editor/a.ts')).map(
        (m) => m.message,
      )
      expect(inEditor.some((m) => m.includes('lexical'))).toBe(true)
      expect(inEditor.some((m) => m.includes('Kysely'))).toBe(true)
      const inOther = restricted(await lint(configs, code, 'packages/other/a.ts')).map(
        (m) => m.message,
      )
      expect(inOther).toHaveLength(1)
      expect(inOther[0]).toContain('Kysely')
    })

    it('carries an unscoped consumer ban into a scoped stack once', async () => {
      const configs = adrLint({
        stack: [{name: 'react', files: ['apps/**']}],
        restrictedImports: [{paths: ['fs']}],
      })
      const code = "import fs from 'fs'\nimport {$getRoot} from 'lexical'\nexport {fs, $getRoot}\n"
      const inApps = restricted(await lint(configs, code, 'apps/a.ts')).map((m) => m.message)
      // Both survive in the scoped files: the scope's own ban and the
      // repo-wide one, which is not the last match there.
      expect(inApps).toHaveLength(2)
      expect(inApps.filter((m) => m.includes("'fs'"))).toHaveLength(1)
      expect(inApps.some((m) => m.includes('lexical'))).toBe(true)
      const outside = restricted(await lint(configs, code, 'packages/a.ts')).map((m) => m.message)
      expect(outside).toHaveLength(1)
      expect(outside[0]).toContain("'fs'")
    })

    it('reports one ban where a stack name is scoped twice and overlaps', async () => {
      const configs = adrLint({
        stack: [
          {name: 'react', files: ['apps/**']},
          {name: 'react', files: ['apps/web/**']},
        ],
      })
      const inWeb = restricted(await lint(configs, lexicalCode, 'apps/web/a.ts')).filter((m) =>
        m.message.includes('lexical'),
      )
      expect(inWeb).toHaveLength(1)
    })

    it('refuses a scoped stack without files', () => {
      expect(() => adrLint({stack: [{name: 'react'} as never]})).toThrow('non-empty `files` array')
      expect(() => adrLint({stack: [{name: 'react', files: []} as never]})).toThrow(
        'non-empty `files` array',
      )
      expect(() => adrLint({stack: [{name: 'nope', files: ['a/**']} as never]})).toThrow('nope')
    })
  })

  it('refuses an unknown stack name', () => {
    expect(() => adrLint({stack: ['nope' as never]})).toThrow('nope')
  })
})
