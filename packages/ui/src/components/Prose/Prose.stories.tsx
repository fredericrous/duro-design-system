import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor} from 'storybook/test'
import {Prose} from './Prose'
import {Heading} from '../Heading/Heading'
import {Text} from '../Text/Text'
import {CodeBlock} from '../CodeBlock/CodeBlock'
import {onThemeSurface} from '../../docs/themedSurface'

const meta: Meta = {
  title: 'Components/Prose',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj

// What a Markdown renderer hands over: HTML that is never authored as JSX.
const RENDERED_MARKDOWN = `
<p>Flux reconciles every cluster from <code>kubernetes/</code>. Read the
<a href="#bootstrap">bootstrap notes</a> first.</p>
<h2 id="bootstrap" class="docs_title__a1b2">Bootstrap</h2>
<p>Each cluster starts from the same three steps:</p>
<ol>
  <li>Install the operator.</li>
  <li>Seed the secrets:
    <ul>
      <li>the Vault token</li>
      <li>the registry pull secret</li>
    </ul>
  </li>
  <li>Point Flux at the repository.</li>
</ol>
<blockquote><p>Never commit a decrypted secret.</p></blockquote>
<h3>Clusters</h3>
<table>
  <thead><tr><th>Cluster</th><th>Nodes</th><th>Role</th></tr></thead>
  <tbody>
    <tr><td>homelab</td><td>5</td><td>Applications</td></tr>
    <tr><td>nas</td><td>1</td><td>Storage</td></tr>
  </tbody>
</table>
<pre><code>flux bootstrap git --url=ssh://git@forge/homelab</code></pre>
<hr>
<p><img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'/%3E"></p>
`

function Markdown() {
  return (
    <Prose
      ref={(el) => {
        if (el) el.innerHTML = RENDERED_MARKDOWN
      }}
    >
      {null}
    </Prose>
  )
}

/** The computed value of a token, read the way the page resolves it. */
function resolved(property: 'color' | 'fontSize', token: string, host: HTMLElement) {
  const probe = document.createElement('span')
  probe.style[property] = `var(${token})`
  host.appendChild(probe)
  const value = getComputedStyle(probe)[property]
  probe.remove()
  return value
}

const style = (el: Element) => getComputedStyle(el)

export const RenderedMarkdown: Story = {
  render: () => <Markdown />,
  play: async ({canvasElement}) => {
    const prose = canvasElement.querySelector('[data-duro-prose]') as HTMLElement
    await waitFor(() => expect(prose.querySelector('h2')).not.toBeNull())
    const q = (selector: string) => prose.querySelector(selector) as HTMLElement

    // flow: no gap before the first block, the scale between the rest
    await expect(style(q('p')).marginTop).toBe('0px')
    await expect(style(q('ol')).marginTop).toBe('16px')
    // headings from the type scale, more room above than below
    await expect(style(q('h2')).fontSize).toBe('30px')
    await expect(style(q('h2')).marginTop).toBe('32px')
    await expect(style(q('h3')).fontSize).toBe('24px')
    // lists keep their markers and indent
    await expect(style(q('ol')).listStyleType).toBe('decimal')
    await expect(style(q('ol ul')).listStyleType).toBe('disc')
    await expect(style(q('ol')).paddingLeft).toBe('24px')
    await expect(style(q('li + li')).marginTop).toBe('4px')
    // tables: ruled cells, a heading row, sideways scroll of their own
    await expect(style(q('th')).borderTopWidth).toBe('1px')
    await expect(style(q('th')).fontWeight).toBe('600')
    await expect(style(q('td')).paddingLeft).toBe('12px')
    await expect(style(q('table')).overflowX).toBe('auto')
    // code: monospace inline and in a block
    await expect(style(q('p code')).fontFamily).toMatch(/mono|Menlo|Consolas|monospace/i)
    await expect(style(q('pre')).overflowX).toBe('auto')
    await expect(style(q('pre code')).borderTopWidth).toBe('0px')
    // links read as links
    await expect(style(q('a')).color).toBe(resolved('color', '--duro-color-accent', prose))
    await expect(style(q('a')).textDecorationLine).toBe('underline')
    await expect(style(q('blockquote')).borderLeftWidth).toBe('3px')
    await expect(style(q('img')).maxWidth).toBe('100%')
  },
}

/**
 * An app's own CSS wins over every Prose rule: a CSS Module class and even a
 * bare element selector, loaded after Duro's stylesheet. Prose sits in its
 * own cascade layer and weighs nothing (:where()).
 */
export const AppCssWins: Story = {
  render: () => <Markdown />,
  play: async ({canvasElement}) => {
    const prose = canvasElement.querySelector('[data-duro-prose]') as HTMLElement
    await waitFor(() => expect(prose.querySelector('h2')).not.toBeNull())
    const h2 = prose.querySelector('h2') as HTMLElement
    const h3 = prose.querySelector('h3') as HTMLElement
    await expect(style(h2).fontSize).toBe('30px')
    await expect(style(h3).fontSize).toBe('24px')

    const sheet = document.createElement('style')
    // what kb-vision's docs.module.css compiles to, and the weakest rule an app can write
    sheet.textContent = `.docs_title__a1b2 { font-size: 13px; margin-top: 0px; } h3 { font-size: 15px; }`
    document.head.appendChild(sheet)
    try {
      await expect(style(h2).fontSize).toBe('13px')
      await expect(style(h2).marginTop).toBe('0px')
      await expect(style(h3).fontSize).toBe('15px')
    } finally {
      sheet.remove()
    }
  },
}

/** A Duro component inside Prose keeps its own styles: Prose is below them. */
export const DuroComponentsInside: Story = {
  render: () => (
    <Prose>
      <Heading level={2} variant="headingSm">
        Kept at headingSm
      </Heading>
      <Text>A paragraph from Text.</Text>
      <CodeBlock copyLabel="Copy" copiedLabel="Copied">
        pnpm add @duro-app/ui
      </CodeBlock>
    </Prose>
  ),
  play: async ({canvas}) => {
    const heading = canvas.getByRole('heading', {level: 2, name: 'Kept at headingSm'})
    // headingSm is 20px; a Prose h2 would be 30px
    await expect(style(heading).fontSize).toBe('20px')
    await expect(canvas.getByRole('button', {name: 'Copy'})).toBeVisible()
  },
}
