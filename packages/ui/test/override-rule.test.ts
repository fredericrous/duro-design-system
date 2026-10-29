import {describe, expect, it} from 'vitest'
import {isSafeColor, overrideRule} from '../src/components/ThemeProvider/overrideRule'

const variableOf = (_group: string, key: string) =>
  key === 'bg' ? '--bg-x1' : key === 'accent' ? '--accent-x2' : null

describe('ThemeProvider override rule', () => {
  it('builds on the server, where there is no CSS global', () => {
    expect(typeof (globalThis as {CSS?: unknown}).CSS).toBe('undefined')
    expect(
      overrideRule('«r1»', {colors: {bg: '#1b2433', accent: 'rgb(255, 90, 31)'}}, variableOf),
    ).toBe(
      '[data-duro-theme="«r1»"][data-duro-theme="«r1»"] { --bg-x1: #1b2433; --accent-x2: rgb(255, 90, 31); }',
    )
  })

  it('drops a value that could leave its declaration or rule', () => {
    expect(overrideRule('s', {colors: {bg: 'red} body{background:red'}}, variableOf)).toBeNull()
    expect(overrideRule('s', {colors: {bg: 'red; color: blue'}}, variableOf)).toBeNull()
    expect(overrideRule('s', {colors: {bg: 'url("x")'}}, variableOf)).toBeNull()
  })

  it('accepts hex, colour functions and keywords', () => {
    for (const ok of ['#fff', '#1b2433cc', 'rgba(0, 0, 0, 0.4)', 'oklch(70% 0.1 250)', 'tomato']) {
      expect(isSafeColor(ok)).toBe(true)
    }
    for (const bad of ['', 'calc(1px)', 'var(--x)', 'rgb(1, 2, 3) red', '12px']) {
      expect(isSafeColor(bad)).toBe(false)
    }
  })

  it('renders nothing for keys that are not colour tokens', () => {
    expect(overrideRule('s', {colors: {unknown: '#fff'}} as never, variableOf)).toBeNull()
  })
})
