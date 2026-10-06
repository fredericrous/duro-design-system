import {describe, expect, it} from 'vitest'
import {globToRegExp, matchesAnyGlob} from '../src/util/glob.js'

describe('globToRegExp', () => {
  it('matches literals, *, ? and {a,b}', () => {
    expect(globToRegExp('a/b.ts').test('a/b.ts')).toBe(true)
    expect(globToRegExp('a/b.ts').test('a/bxts')).toBe(false)
    expect(globToRegExp('a/*.ts').test('a/b.ts')).toBe(true)
    expect(globToRegExp('a/*.ts').test('a/c/b.ts')).toBe(false)
    expect(globToRegExp('a/?.ts').test('a/b.ts')).toBe(true)
    expect(globToRegExp('a/?.ts').test('a/bb.ts')).toBe(false)
    expect(globToRegExp('a.{ts,tsx}').test('a.tsx')).toBe(true)
    expect(globToRegExp('a.{ts,tsx}').test('a.js')).toBe(false)
  })

  it('** crosses directories', () => {
    expect(globToRegExp('src/**/x.ts').test('src/x.ts')).toBe(true)
    expect(globToRegExp('src/**/x.ts').test('src/a/b/x.ts')).toBe(true)
    expect(globToRegExp('**/x.ts').test('a/b/x.ts')).toBe(true)
    expect(globToRegExp('src/**').test('src/a/b')).toBe(true)
  })
})

describe('matchesAnyGlob', () => {
  it('matches relative to cwd and absolute', () => {
    expect(matchesAnyGlob('/r/p/a.ts', '/r', ['p/a.ts'])).toBe(true)
    expect(matchesAnyGlob('/r/p/a.ts', '/r', ['/r/p/*.ts'])).toBe(true)
    expect(matchesAnyGlob('/r/p/b.ts', '/r', ['p/a.ts'])).toBe(false)
    expect(matchesAnyGlob('/r/p/b.ts', '/r', [])).toBe(false)
  })
})
