import {Children, isValidElement, type ReactNode} from 'react'

/** What a line of a unified diff is, for its colour. */
export type DiffLineRole = 'added' | 'removed' | 'hunk' | 'context'

export interface DiffLine {
  /** The line with its newline, so the lines joined are the raw text. */
  text: string
  role: DiffLineRole
}

/** `+++ b/file` and `--- a/file` are file headers, not changes. */
export function diffLineRole(line: string): DiffLineRole {
  if (line.startsWith('@@')) return 'hunk'
  if (line.startsWith('+++') || line.startsWith('---')) return 'context'
  if (line.startsWith('+')) return 'added'
  if (line.startsWith('-')) return 'removed'
  return 'context'
}

export function splitDiffLines(text: string): DiffLine[] {
  const parts = text.split('\n')
  const last = parts.length - 1
  const lines: DiffLine[] = []
  parts.forEach((part, index) => {
    if (index === last && part === '') return
    lines.push({text: index === last ? part : `${part}\n`, role: diffLineRole(part)})
  })
  return lines
}

/** The text content of a node: strings, numbers and the elements around them. */
export function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{children?: ReactNode}>(node)) {
    return Children.toArray(node.props.children).map(textOf).join('')
  }
  return ''
}
