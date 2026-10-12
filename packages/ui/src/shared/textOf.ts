import {isValidElement, type ReactNode} from 'react'

/**
 * The text a React node would render, read from its props: a native picker's
 * option label, where there is no DOM `textContent` to read it from.
 */
export function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{children?: ReactNode}>(node)) return textOf(node.props.children)
  return ''
}
