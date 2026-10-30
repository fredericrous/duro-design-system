import {mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {addDtsExtensions} from '../dts-extensions.mjs'

let dist: string

beforeEach(() => {
  dist = mkdtempSync(path.join(tmpdir(), 'dts-ext-'))
})
afterEach(() => rmSync(dist, {recursive: true, force: true}))

function put(name: string, code: string): string {
  const file = path.join(dist, name)
  mkdirSync(path.dirname(file), {recursive: true})
  writeFileSync(file, code)
  return file
}

function fixture(): string {
  put('a.d.ts', 'export type A = 1\n')
  put('dir/index.d.ts', 'export type D = 1\n')
  put('grow.css.d.ts', 'export const grow: string\n')
  return put(
    'index.d.ts',
    [
      "import {A} from './a'",
      "export * from './dir'",
      "export {grow} from './grow.css'",
      "export type T = import('./a').A",
      "import {B} from './b.js'",
      "import {Bare} from 'react'",
      "// import {X} from './a'",
      '/// <reference path="./a" />',
      '',
    ].join('\n'),
  )
}

describe('addDtsExtensions', () => {
  it('rewrites file, directory, css, import() and export-star specifiers only', () => {
    const entry = fixture()
    addDtsExtensions(dist)
    expect(readFileSync(entry, 'utf8')).toBe(
      [
        "import {A} from './a.js'",
        "export * from './dir/index.js'",
        "export {grow} from './grow.css.js'",
        "export type T = import('./a.js').A",
        "import {B} from './b.js'",
        "import {Bare} from 'react'",
        "// import {X} from './a'",
        '/// <reference path="./a" />',
        '',
      ].join('\n'),
    )
  })

  it('changes nothing on a second run', () => {
    const entry = fixture()
    addDtsExtensions(dist)
    const first = readFileSync(entry, 'utf8')
    const modified = statSync(entry).mtimeMs
    addDtsExtensions(dist)
    expect(readFileSync(entry, 'utf8')).toBe(first)
    expect(statSync(entry).mtimeMs).toBe(modified)
  })

  it('throws naming the file and the specifier when one does not resolve', () => {
    const file = put('broken.d.ts', "export * from './missing'\n")
    expect(() => addDtsExtensions(dist)).toThrow(
      new RegExp(`${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*\\./missing`),
    )
  })
})
