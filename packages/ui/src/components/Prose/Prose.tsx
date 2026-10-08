import type {ReactNode, Ref} from 'react'
import {html} from 'react-strict-dom'
import './prose.css'

interface ProseProps {
  /** HTML Duro does not author: the output of a Markdown renderer. */
  children: ReactNode
  /** The container element. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Prose — the container for HTML Duro does not author (rendered Markdown, CMS
 * output): headings, paragraphs, lists, tables, blockquotes, inline code,
 * links and images are styled from tokens by descendant rules scoped to it.
 * Duro components inside it (a TextLink, a CodeBlock) keep their own styles,
 * and an app's own CSS wins over every Prose rule. Web only.
 */
export function Prose({children, ref}: ProseProps) {
  return (
    <html.div ref={ref} data-duro-prose="">
      {children}
    </html.div>
  )
}
