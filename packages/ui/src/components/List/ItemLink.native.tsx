import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
// Explicit suffix: a native-only module has no web file for moduleSuffixes to pair.
import {followLink} from '../../shared/followLink.native'
import type {OnNavigate} from '../../shared/navigate'
import {styles} from './styles.css'

/** What a link row shares with its link: whether the press was the link's. */
export interface ItemLinkState {
  linkPressed: boolean
}

export function createItemLinkState(): ItemLinkState {
  return {linkPressed: false}
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
export function ItemLink({state, href, onNavigate, children}: ItemLinkProps) {
  return (
    <html.div
      role="link"
      onClick={() => {
        state.linkPressed = true
        followLink(href, onNavigate, 'List.Item')
      }}
      style={[styles.content, styles.contentLink]}
    >
      {children}
    </html.div>
  )
}

/** A press on the row outside the link follows it, as the link itself does. */
export function pressItemLink(
  state: ItemLinkState,
  href: string,
  onNavigate: OnNavigate | undefined,
) {
  if (state.linkPressed) {
    state.linkPressed = false
    return
  }
  followLink(href, onNavigate, 'List.Item')
}
