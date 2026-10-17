import {Linking} from 'react-native'
import type {LinkClickEvent, OnNavigate} from './navigate'

/**
 * Follows a link on native (ADR-0002, native addendum): a native link part
 * renders no `href`, because react-strict-dom replaces the press handler of an
 * `html.a` that has one. It builds a tracked `LinkClickEvent` (primary button,
 * no modifier), hands it to `onNavigate`, and opens the URL with the system
 * (`Linking.openURL`) unless `onNavigate` called `event.preventDefault()`.
 * `source` names the part in the warning when the URL cannot be opened.
 */
export function followLink(href: string, onNavigate: OnNavigate | undefined, source: string): void {
  let prevented = false
  const event: LinkClickEvent = {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    get defaultPrevented() {
      return prevented
    },
    preventDefault() {
      prevented = true
    },
  }
  onNavigate?.(href, event)
  if (!prevented) {
    Linking.openURL(href).catch((error: unknown) => {
      console.warn(`[duro] ${source}: could not open ${href}: ${String(error)}`)
    })
  }
}
