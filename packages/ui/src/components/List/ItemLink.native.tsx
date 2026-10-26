import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
// Explicit suffix: a native-only module has no web file for moduleSuffixes to pair.
import {followLink} from '../../shared/followLink.native'
import type {OnNavigate} from '../../shared/navigate'
import {styles} from './styles.css'

interface ItemLinkProps {
  href: string
  onNavigate: OnNavigate | undefined
  children: ReactNode
}

/**
 * The Content of a List.Item with an href, on native (ADR-0002, native addendum): a
 * `role="link"` that renders no `href` and follows the press through `followLink`.
 */
export function ItemLink({href, onNavigate, children}: ItemLinkProps) {
  return (
    <html.div
      role="link"
      onClick={() => followLink(href, onNavigate, 'List.Item')}
      style={[styles.content, styles.contentLink]}
    >
      {children}
    </html.div>
  )
}
