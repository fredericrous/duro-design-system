/* Router-agnostic links (docs/adr/0002-link-parts-navigate-through-onnavigate.md).
 *
 * Every link part renders a real `<a href>`, so the browser keeps what a link
 * does on its own: cmd/ctrl-click and middle-click open a tab, shift-click a
 * window, alt-click downloads, "Copy link" works. An app with a client router
 * passes `onNavigate`; the part calls it for a plain primary click only, and
 * the app then decides:
 *
 *   onNavigate={(href, event) => {
 *     event.preventDefault()
 *     navigate(href)
 *   }}
 *
 * The part never prevents the default itself: without `onNavigate`, or for a
 * click it does not hand over, the browser follows the link. */

/** The part of a click event a link part reads and hands to `onNavigate`. */
export interface LinkClickEvent {
  readonly button: number
  readonly metaKey: boolean
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
  readonly defaultPrevented: boolean
  preventDefault(): void
}

/**
 * Called for a plain primary click on a link part. Call
 * `event.preventDefault()`, then your router's navigate; leave the event alone
 * to let the browser follow the link.
 */
export type OnNavigate = (href: string, event: LinkClickEvent) => void

/** A primary-button click with no modifier key, not already prevented. */
export function isPlainClick(event: LinkClickEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.defaultPrevented
  )
}

/**
 * The `onClick` of a link part: hands a plain click on a link with no
 * `target` to `onNavigate`, and does nothing otherwise, so the browser default
 * runs. Undefined when there is no `onNavigate` (no handler at all).
 */
export function linkClickHandler(
  href: string,
  onNavigate: OnNavigate | undefined,
  target?: string | null,
): ((event: LinkClickEvent) => void) | undefined {
  if (!onNavigate) return undefined
  return (event) => {
    if (target != null || !isPlainClick(event)) return
    onNavigate(href, event)
  }
}
