import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    "The container for HTML Duro does not author — rendered Markdown, CMS output: headings, paragraphs, lists, tables, blockquotes, inline code, links and images are styled from tokens by descendant rules scoped to it (plain CSS in dist/index.css, :where() and its own cascade layer). Duro components inside it keep their styles, and an app's own CSS wins over every Prose rule. Web only.",
  whenToUse: [
    'The body of a docs page rendered from Markdown',
    'Any HTML produced by a renderer you do not write as JSX',
  ],
  whenNotToUse: [
    'Text you write as components — use Heading, Text and Stack',
    'A short label or paragraph — use Text',
  ],
  relatedTo: [
    {
      component: 'CodeBlock',
      kind: 'composition',
      relationship: "Pass CodeBlock as the Markdown renderer's pre, for a copy button",
    },
    {
      component: 'TextLink',
      kind: 'composition',
      relationship:
        "Pass TextLink as the renderer's a, for onNavigate; it keeps its own styles inside Prose",
    },
  ],
  example: `<Prose>
  <ReactMarkdown components={{pre: ({children}) => <CodeBlock copyLabel="Copy" copiedLabel="Copied">{children}</CodeBlock>}}>
    {body}
  </ReactMarkdown>
</Prose>`,
}
