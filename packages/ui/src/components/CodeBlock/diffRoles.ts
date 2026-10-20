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

/** One line of a diff as a line action or after-line content sees it. */
export interface DiffLineInfo {
  /** The line's position in the diff text, from 0. */
  index: number
  role: DiffLineRole
  /** The line without its newline. */
  text: string
  /** Its line number in the old file: removed and context lines inside a hunk, else null. */
  oldLine: number | null
  /** Its line number in the new file: added and context lines inside a hunk, else null. */
  newLine: number | null
}

const HUNK_HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/

/**
 * Numbers a diff's lines from its hunk headers (`@@ -12,4 +12,6 @@`). Lines
 * before the first hunk (file headers) and the headers themselves have no
 * line numbers.
 */
export function numberDiffLines(lines: readonly DiffLine[]): DiffLineInfo[] {
  let oldNext: number | null = null
  let newNext: number | null = null
  return lines.map((line, index) => {
    const text = line.text.endsWith('\n') ? line.text.slice(0, -1) : line.text
    if (line.role === 'hunk') {
      const match = HUNK_HEADER.exec(text)
      oldNext = match ? Number(match[1]) : null
      newNext = match ? Number(match[2]) : null
      return {index, role: line.role, text, oldLine: null, newLine: null}
    }
    if (oldNext === null || newNext === null) {
      return {index, role: line.role, text, oldLine: null, newLine: null}
    }
    const oldLine = line.role === 'added' ? null : oldNext
    const newLine = line.role === 'removed' ? null : newNext
    if (oldLine !== null) oldNext += 1
    if (newLine !== null) newNext += 1
    return {index, role: line.role, text, oldLine, newLine}
  })
}
