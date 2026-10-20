import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A block of code with a copy button: a pre that scrolls sideways when a line is long, and a Button that copies its text, shows the copied label for copiedDuration ms and announces it through a polite LiveRegion. Labels come from props. With language="diff", added, removed and hunk lines are coloured from tokens. On native the text is selectable and scrolls sideways; there is no copy button. A diff can carry a lineAction (a button beside each line inside a hunk, one tab stop, Up and Down between them; the line handed over has its old and new line numbers) and renderAfterLine (content under a line, full width: a review comment, an editor); the copied text stays the diff.',
  whenToUse: [
    'Code or a command the reader is likely to paste: a docs page, an install step',
    "A Markdown renderer's pre, inside Prose",
    'A diff people comment on line by line (lineAction, renderAfterLine)',
  ],
  whenNotToUse: [
    'A short identifier in running text — use inline code (Prose styles it)',
    'Editable code — use Textarea',
  ],
  relatedTo: [
    {
      component: 'Prose',
      kind: 'composition',
      relationship: 'CodeBlock keeps its own styles inside Prose',
    },
    {
      component: 'LiveRegion',
      kind: 'composition',
      relationship: 'The copied confirmation is announced through a LiveRegion',
    },
  ],
  example: `<CodeBlock copyLabel="Copy" copiedLabel="Copied">
  <code>pnpm add @duro-app/ui</code>
</CodeBlock>`,
}
