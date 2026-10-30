import {mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vitest'
import {addDtsExtensions} from '../dts-extensions.mjs'

/** Runs `check` against a fresh temp dist directory and removes it after. */
function withDist(check: (dist: string) => void): void {
  const dist = mkdtempSync(path.join(tmpdir(), 'dts-ext-'))
  try {
    check(dist)
  } finally {
    rmSync(dist, {recursive: true, force: true})
  }
}

function put(dist: string, name: string, code: string): string {
  const file = path.join(dist, name)
  mkdirSync(path.dirname(file), {recursive: true})
  writeFileSync(file, code)
  return file
}

function fixture(dist: string): string {
  put(dist, 'a.d.ts', 'export type A = 1\n')
  put(dist, 'dir/index.d.ts', 'export type D = 1\n')
  put(dist, 'grow.css.d.ts', 'export const grow: string\n')
  return put(
    dist,
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
  it('rewrites file, directory, css, import() and export-star specifiers only', () =>
    withDist((dist) => {
      const entry = fixture(dist)
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
    }))

  it('changes nothing on a second run', () =>
    withDist((dist) => {
      const entry = fixture(dist)
      addDtsExtensions(dist)
      const first = readFileSync(entry, 'utf8')
      const modified = statSync(entry).mtimeMs
      addDtsExtensions(dist)
      expect(readFileSync(entry, 'utf8')).toBe(first)
      expect(statSync(entry).mtimeMs).toBe(modified)
    }))

  it('throws naming the file and the specifier when one does not resolve', () =>
    withDist((dist) => {
      const file = put(dist, 'broken.d.ts', "export * from './missing'\n")
      expect(() => addDtsExtensions(dist)).toThrow(
        new RegExp(`${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*\\./missing`),
      )
    }))
})
