/**
 * Real touch input and viewport control for Storybook interaction tests
 * (the Drawer's, SplitPane's), through
 * Chrome DevTools Protocol: synthetic pointer events neither scroll nor go
 * through touch adjustment the way a finger does.
 */

export type Point = {x: number; y: number}

/**
 * A CDP command. `vitest/browser` loads only under the test runner, so it is
 * imported here, at call time: a static import breaks the built Storybook.
 * `CDPSession` is empty until the provider's typings load; `send` exists at runtime.
 */
export async function cdpSend(method: string, params: object) {
  const {cdp} = await import('vitest/browser')
  const session = cdp() as unknown as {send: (m: string, p: object) => Promise<unknown>}
  return session.send(method, params)
}

/** Set the page's viewport (test runner only, like `cdpSend`). */
export async function setViewport(width: number, height: number) {
  const {page} = await import('vitest/browser')
  await page.viewport(width, height)
}

export const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * CDP input lands in top-level page coordinates; the story runs in an iframe
 * the test runner offsets and may scale to fit. Map a point up every frame.
 */
export function toPage(p: Point): Point {
  let {x, y} = p
  let win: Window = window
  while (win.frameElement && win.parent !== win) {
    const rect = win.frameElement.getBoundingClientRect()
    const scale = rect.width / win.innerWidth
    x = rect.left + x * scale
    y = rect.top + y * scale
    win = win.parent
  }
  return {x, y}
}

/**
 * A page-coordinate touch point with a 1px radius: Chrome's touch adjustment
 * snaps a fat default touch onto the nearest control, which would turn every
 * drag in the list into a drag on a toggle.
 */
const touchAt = (p: Point) => ({...toPage(p), radiusX: 1, radiusY: 1})

/** A finger drag from one point to another, in `steps` moves 16 ms apart. */
export async function touchDrag(from: Point, to: Point, steps = 12) {
  const send = (type: string, touchPoints: Point[]) =>
    cdpSend('Input.dispatchTouchEvent', {type, touchPoints: touchPoints.map(touchAt)})
  await send('touchStart', [from])
  for (let i = 1; i <= steps; i++) {
    await send('touchMove', [
      {x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps},
    ])
    await pause(16)
  }
  await send('touchEnd', [])
}

/** A finger tap. */
export async function touchTap(at: Point) {
  await cdpSend('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [touchAt(at)]})
  await cdpSend('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []})
}

/** The centre of an element, in its own document's coordinates. */
export function centre(el: Element): Point {
  const r = el.getBoundingClientRect()
  return {x: r.left + r.width / 2, y: r.top + r.height / 2}
}
