/* Story helper for the onNavigate contract (shared/navigate.ts): dispatches a
 * click on a link and reports whether anything before the window — the link
 * part, or the onNavigate it called — prevented the default. The window
 * listener then prevents it itself, so a story never navigates the frame or
 * opens a tab, whatever modifier the click carries. */
export function clickLink(
  link: Element,
  init: Pick<MouseEventInit, 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'button'> = {},
): {defaultPrevented: boolean} {
  let defaultPrevented = false
  const onClick = (event: MouseEvent) => {
    defaultPrevented = event.defaultPrevented
    event.preventDefault()
  }
  window.addEventListener('click', onClick)
  try {
    link.dispatchEvent(
      new MouseEvent('click', {bubbles: true, cancelable: true, button: 0, ...init}),
    )
  } finally {
    window.removeEventListener('click', onClick)
  }
  return {defaultPrevented}
}
