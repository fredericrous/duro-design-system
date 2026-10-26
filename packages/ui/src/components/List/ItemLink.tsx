import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {linkClickHandler, type OnNavigate} from '../../shared/navigate'
import {styles} from './styles.css'

/** What a link row shares with its link: the anchor, and whether the press was the link's. */
export interface ItemLinkState {
  anchor: HTMLAnchorElement | null
  linkPressed: boolean
}

export function createItemLinkState(): ItemLinkState {
  return {anchor: null, linkPressed: false}
}

/** The modifier keys and button of the row's press, replayed on the link. */
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

/** The Content of a List.Item with an href: a real `<a href>` (ADR-0002). */
export function ItemLink({state, href, onNavigate, children}: ItemLinkProps) {
  const handler = linkClickHandler(href, onNavigate)
  return (
    <html.a
      ref={(anchor: HTMLAnchorElement | null) => {
        state.anchor = anchor
      }}
      href={href}
      onClick={(event) => {
        // Marked rather than stopped: stopping it would hide the click from window listeners.
        state.linkPressed = true
        handler?.(event)
      }}
      style={[styles.content, styles.contentLink]}
    >
      {children}
    </html.a>
  )
}

/**
 * A press on the row: the link's own press bubbling up is left alone; any other (the Leading
 * icon, the padding) is replayed on the anchor with the same button and modifier keys, so the
 * browser and `onNavigate` see one link click (a cmd-click still opens a tab, ADR-0002).
 */
export function pressItemLink(
  state: ItemLinkState,
  _href: string,
  _onNavigate: OnNavigate | undefined,
  press: RowPress,
) {
  if (state.linkPressed) {
    state.linkPressed = false
    return
  }
  const {altKey, ctrlKey, metaKey, shiftKey, button} = press
  state.anchor?.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      altKey,
      ctrlKey,
      metaKey,
      shiftKey,
      button,
    }),
  )
}
