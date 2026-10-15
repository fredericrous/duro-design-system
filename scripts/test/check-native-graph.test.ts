import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {afterAll, describe, expect, it} from 'vitest'
import {lintNativeGraph as lint} from '../check-native-graph.mjs'

const root = mkdtempSync(path.join(tmpdir(), 'native-graph-'))
mkdirSync(path.join(root, 'src'))
afterAll(() => rmSync(root, {recursive: true, force: true}))

async function formsIn(name: string, code: string): Promise<string[]> {
  const file = path.join(root, 'src', name)
  writeFileSync(file, code)
  return (await lint([file], root)).map((v) => v.form)
}

describe('check-native-graph', () => {
  it('reports a raw <svg>', async () => {
    expect(
      await formsIn('svg.tsx', 'export const A = () => <svg viewBox="0 0 1 1" />\n'),
    ).toContain('raw <svg>')
  })

  it('reports css.keyframes', async () => {
    const code = "import {css} from 'react-strict-dom'\nexport const k = css.keyframes({})\n"
    expect(await formsIn('keyframes.ts', code)).toContain('css.keyframes')
  })

  it.each(['checkbox', 'radio', 'date'])('reports html.input type="%s"', async (type) => {
    const code = `import {html} from 'react-strict-dom'\nexport const I = () => <html.input type="${type}" />\n`
    expect(await formsIn(`input-${type}.tsx`, code)).toContain(
      'html.input type checkbox, radio or date',
    )
  })

  it.each([
    ['template', 'const s = {padding: `${a} ${b}`}\n'],
    ['string', "const s = {margin: '4px 8px'}\n"],
  ])('reports a multi-value %s shorthand', async (kind, code) => {
    expect(await formsIn(`shorthand-${kind}.ts`, `const a = 1, b = 2\n${code}`)).toContain(
      'multi-value shorthand',
    )
  })

  it('reports html.a with an href', async () => {
    const code = `import {html} from 'react-strict-dom'\nexport const L = () => <html.a href="/x" />\n`
    expect(await formsIn('anchor-href.tsx', code)).toContain('html.a with href')
  })

  it('leaves an html.a without href alone', async () => {
    const code = `import {html} from 'react-strict-dom'\nexport const L = () => <html.a />\n`
    expect(await formsIn('anchor.tsx', code)).toEqual([])
  })

  it('ignores an eslint-disable comment', async () => {
    const code =
      "// eslint-disable-next-line\nimport {createPortal} from 'react-dom'\nexport const p = createPortal\n"
    expect(await formsIn('disabled.ts', code)).toContain('react-dom import')
  })

  it('leaves a single-value shorthand alone', async () => {
    expect(await formsIn('shorthand-one.ts', 'const a = 1\nconst s = {padding: a}\n')).toEqual([])
  })

  it('leaves a text html.input alone', async () => {
    const code = `import {html} from 'react-strict-dom'\nexport const I = () => <html.input type="text" />\n`
    expect(await formsIn('input-text.tsx', code)).toEqual([])
  })

  it('reports an animationName key', async () => {
    expect(await formsIn('anim.ts', "export const s = {animationName: 'spin'}\n")).toContain(
      'animationName',
    )
  })

  it.each([
    ['named', "import {createPortal} from 'react-dom'\nexport const p = createPortal\n"],
    ['namespace', "import * as ReactDOM from 'react-dom'\nexport const p = ReactDOM\n"],
    ['side-effect', "import 'react-dom'\n"],
  ])('reports a %s react-dom import', async (kind, code) => {
    expect(await formsIn(`dom-${kind}.ts`, code)).toContain('react-dom import')
  })

  it('reports position as line and column, relative to the root', async () => {
    const file = path.join(root, 'src', 'pos.tsx')
    writeFileSync(file, 'export const A = () => (\n  <div />\n)\n')
    expect(await lint([file], root)).toEqual([
      {file: path.join('src', 'pos.tsx'), line: 2, column: 4, form: 'raw <div>'},
    ])
  })

  it('passes a clean file', async () => {
    expect(await formsIn('clean.ts', 'export const x = 1\n')).toEqual([])
  })
})
