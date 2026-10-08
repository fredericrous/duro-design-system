import {expect, waitFor} from 'storybook/test'
import {cdp} from 'vitest/browser'

/** `CDPSession` is empty until the provider's typings load; `send` exists at runtime. */
const cdpSend = (method: string, params: object) =>
  (cdp() as unknown as {send: (method: string, params: object) => Promise<unknown>}).send(
    method,
    params,
  )

/**
 * Runs `check` with Chrome's touch emulation on, so `(pointer: coarse)` matches
 * (as DrawerScroll's CoarsePointerRows does), then turns it off again so the
 * stories after this one see a mouse.
 */
export async function withCoarsePointer(check: () => Promise<void>) {
  await cdpSend('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1})
  try {
    await waitFor(() => expect(matchMedia('(pointer: coarse)').matches).toBe(true))
    await check()
  } finally {
    await cdpSend('Emulation.setTouchEmulationEnabled', {enabled: false})
    await waitFor(() => expect(matchMedia('(pointer: coarse)').matches).toBe(false))
  }
}
