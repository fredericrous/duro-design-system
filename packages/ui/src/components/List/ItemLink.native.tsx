import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
// Explicit suffix: a native-only module has no web file for moduleSuffixes to pair.
import {followLink} from '../../shared/followLink.native'
import type {OnNavigate} from '../../shared/navigate'
import {styles} from './styles.css'

/** Nothing to share on native: the link answers its own press and stops it there. */
export type ItemLinkState = Record<string, never>

export function createItemLinkState(): ItemLinkState {
  return {}
}

/** The modifier keys of the row's press (unused on native). */
export interface RowPress {
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  button: number
}

interface ItemLinkProps {
  state: ItemLinkState
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
      onClick={(event) => {
        // Stopped, so the row never follows it a second time (native has no window listener
        // a stopped press could hide).
        event.stopPropagation()
        followLink(href, onNavigate, 'List.Item')
      }}
      style={[styles.content, styles.contentLink]}
    >
      {children}
    </html.div>
  )
}

/** A press on the row reaches here only from outside the link: it follows the link. */
export function pressItemLink(
  _state: ItemLinkState,
  href: string,
  onNavigate: OnNavigate | undefined,
  _event: RowPress,
) {
  followLink(href, onNavigate, 'List.Item')
}
