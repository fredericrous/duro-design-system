import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.native.css'

interface ProseProps {
  /** Duro primitives (Heading, Text, TextLink, CodeBlock) a Markdown renderer produced. */
  children: ReactNode
}

/**
 * Native Prose: the reading container. Native has no descendant CSS, so it
 * styles nothing inside it: a renderer maps Markdown to Duro primitives, and
 * Prose gives them one column at reading width with a token gap between blocks.
 */
export function Prose({children}: ProseProps) {
  return <html.div style={styles.root}>{children}</html.div>
}
