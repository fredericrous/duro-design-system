/**
 * Fallback for browsers without CSS `field-sizing: content`: size the field to
 * its content. The element's own `rows` give the floor, the style's maxHeight
 * the ceiling (past it the field scrolls).
 */
export interface GrowableField {
  style: {height: string}
  scrollHeight: number
  offsetHeight: number
  clientHeight: number
}

/** True when the browser sizes a textarea to its content in CSS. */
export function supportsFieldSizing(
  css: {supports?: (property: string, value: string) => boolean} | undefined = (
    globalThis as {CSS?: {supports?: (property: string, value: string) => boolean}}
  ).CSS,
): boolean {
  return css?.supports?.('field-sizing', 'content') === true
}

/** Resize `el` to fit its content; returns the height set, in px. */
export function fitToContent(el: GrowableField): number {
  el.style.height = 'auto'
  // scrollHeight excludes the border; add it back for a border-box field.
  const border = el.offsetHeight - el.clientHeight
  const height = el.scrollHeight + border
  el.style.height = `${height}px`
  return height
}
