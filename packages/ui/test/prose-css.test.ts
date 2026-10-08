import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'
// The token stylesheet built from the token sources, as the registry builds
// it: the same --duro-* names as dist/vars.css, without needing a build.
import {buildMockupCss} from '../../tokens/scripts/lib/mockup-css.mjs'

// Prose ships as plain CSS (StyleX cannot write descendant rules), so the
// every-measure-is-a-token lint never sees it. This is that check: the
// source holds no raw length and no raw colour, only var(--duro-*). A zero
// length is allowed (ADR-0027: raw 0), as a var() fallback needs a unit.
const RAW = /\b(?!0(?:px|rem)\b)\d*\.?\d+(px|rem)\b|#[0-9a-fA-F]{3,8}\b|rgb\(/g

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

const prose = read('../src/components/Prose/prose.css')
const tokenBlock: string = buildMockupCss(
  fileURLToPath(new URL('../../tokens/src', import.meta.url)),
).css

describe('prose.css', () => {
  it('holds no raw length or colour', () => {
    expect(withoutComments(prose).match(RAW) ?? []).toEqual([])
  })

  it("lands a heading jump below AppShell's bar", () => {
    // Prose headings add the bar's height AppShell publishes; 0px elsewhere.
    expect(withoutComments(prose)).toMatch(
      /scroll-margin-top:\s*calc\(var\(--duro-spacing-lg\)\s*\+\s*var\(--duro-app-shell-bar,\s*0px\)\)/,
    )
  })

  it('only reads custom properties Duro publishes', () => {
    // dist/vars.css publishes all of these but the breakpoints (a query cannot read a var)
    const published = new Set(
      (tokenBlock.match(/--duro-[\w-]+(?=:)/g) ?? []).filter(
        (n) => !n.startsWith('--duro-breakpoint-'),
      ),
    )
    const used = [...new Set(prose.match(/var\((--[\w-]+)\)/g) ?? [])].map((v) => v.slice(4, -1))
    expect(used.length).toBeGreaterThan(10)
    expect(used.filter((name) => !published.has(name))).toEqual([])
  })

  it('scopes every rule under :where() inside the duro-prose layer', () => {
    const body = withoutComments(prose)
    expect(body).toMatch(/@layer reset, duro-prose;/)
    const selectors = [...body.matchAll(/^\s*([^@{}\n][^{}]*)\{/gm)].map((m) => m[1]!.trim())
    expect(selectors.length).toBeGreaterThan(10)
    for (const selector of selectors) {
      expect(selector.startsWith(':where(.duro-prose, [data-duro-prose])')).toBe(true)
    }
  })

  it('the same pattern does find raw values in the token block (control)', () => {
    expect((tokenBlock.match(RAW) ?? []).length).toBeGreaterThan(50)
  })
})
