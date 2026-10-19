import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {describe, expect, it, vi} from 'vitest'

const tag = (name: string) => (props: Record<string, unknown>) => {
  const {style, children, ...rest} = props
  const roles = (Array.isArray(style) ? style : [style]).filter(Boolean)
  return createElement(
    name,
    {...rest, 'data-style': roles.map((r) => JSON.stringify(r)).join('|')},
    children as never,
  )
}
vi.mock('react-strict-dom', () => ({
  html: {div: tag('div'), pre: tag('pre'), span: tag('span'), code: tag('code')},
}))
vi.mock('../src/components/CodeBlock/styles.css', () => ({
  styles: new Proxy({}, {get: (_t, k) => ({name: String(k)})}),
}))
vi.mock('@duro-app/tokens/tokens/type-presets.css', () => ({typePresets: {code: {name: 'code'}}}))
vi.mock('../src/components/Button/Button', () => ({Button: tag('button')}))
vi.mock('../src/components/LiveRegion/LiveRegion', () => ({LiveRegion: tag('div')}))

const {CodeBlock} = await import('../src/components/CodeBlock/CodeBlock')
const {diffLineRole, splitDiffLines} = await import('../src/components/CodeBlock/diffRoles')

const DIFF = '@@ -1,2 +1,2 @@\n context\n-old\n+new\n'

const render = (language?: string) =>
  renderToStaticMarkup(
    createElement(CodeBlock, {copyLabel: 'Copy', copiedLabel: 'Copied', language}, DIFF),
  )

describe('CodeBlock language="diff"', () => {
  it('gives +, - and @@ lines their roles', () => {
    expect(diffLineRole('+new')).toBe('added')
    expect(diffLineRole('-old')).toBe('removed')
    expect(diffLineRole('@@ -1 +1 @@')).toBe('hunk')
    expect(diffLineRole(' context')).toBe('context')
    expect(diffLineRole('+++ b/file')).toBe('context')
    expect(diffLineRole('--- a/file')).toBe('context')
  })

  it('keeps the raw text when the lines are joined', () => {
    expect(
      splitDiffLines(DIFF)
        .map((l) => l.text)
        .join(''),
    ).toBe(DIFF)
  })

  it('renders each line with its role and exposes the language', () => {
    const html = render('diff')
    expect(html).toContain('data-language="diff"')
    expect(html).toMatch(/data-diff-line="hunk"[^>]*>@@/)
    expect(html).toMatch(/data-diff-line="removed"[^>]*>-old/)
    expect(html).toMatch(/data-diff-line="added"[^>]*>\+new/)
    expect(html).toContain('&quot;name&quot;:&quot;added&quot;')
    expect(html).toContain('&quot;name&quot;:&quot;removed&quot;')
  })

  it('leaves a non-diff block unstyled by line', () => {
    const html = render('ts')
    expect(html).toContain('data-language="ts"')
    expect(html).not.toContain('data-diff-line')
  })
})
