import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {afterAll, describe, expect, it} from 'vitest'
// @ts-expect-error -- plain .mjs script, no declaration file
import {lintNativeGraph} from '../check-native-graph.mjs'

type Violation = {file: string; line: number; column: number; form: string}
const lint = lintNativeGraph as (files: string[], root: string) => Promise<Violation[]>

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
