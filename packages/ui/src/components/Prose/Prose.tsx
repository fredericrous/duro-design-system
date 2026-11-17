import type {ReactNode, Ref} from 'react'
import {html} from 'react-strict-dom'
import './prose.css'

interface ProseProps {
  /** HTML greenrack does not author: the output of a Markdown renderer. */
  children: ReactNode
  /** The container element. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Prose — the container for HTML greenrack does not author (rendered Markdown, CMS
 * output): headings, paragraphs, lists, tables, blockquotes, inline code,
 * links and images are styled from tokens by descendant rules scoped to it.
 * greenrack components inside it (a TextLink, a CodeBlock) keep their own styles,
 * and an app's own CSS wins over every Prose rule. Native: Prose.native.tsx.
 */
export function Prose({children, ref}: ProseProps) {
  return (
    <html.div ref={ref} data-gr-prose="">
      {children}
    </html.div>
  )
}
