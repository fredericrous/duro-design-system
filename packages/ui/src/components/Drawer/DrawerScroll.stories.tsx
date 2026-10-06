import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor} from 'storybook/test'
import {cdp, page} from 'vitest/browser'
import {Drawer} from './Drawer'
import {ToggleGroup} from '../ToggleGroup/ToggleGroup'
import {Toggle} from '../Toggle/Toggle'
import {Icon, type IconName} from '../Icon'
import {ROW_HEIGHT} from '../Toggle/rowHeight'

const meta: Meta = {
  title: 'Components/Drawer/Scroll',
  parameters: {layout: 'fullscreen'},
}

export default meta
type Story = StoryObj

const ICON_NAMES: IconName[] = [
  'x-circle',
  'check-circle',
  'check-done',
  'clock',
  'forbidden',
  'info-circle',
  'alert-triangle',
  'shield',
  'lock',
  'key',
  'map',
  'layers',
  'repeat',
  'database',
  'shield-check',
  'route',
  'git-branch',
  'menu',
  'pin',
  'server',
  'hard-drive',
  'box',
  'image',
  'tag',
  'pie-chart',
  'users',
  'user-plus',
  'mail',
  'file-text',
  'plug',
  'search',
  'mic',
  'sun',
  'moon',
  'monitor',
  'contrast',
  'info-circle-filled',
  'alert-triangle-filled',
  'check-circle-filled',
  'x-circle-filled',
  'shield-filled',
  'lock-filled',
]

function Scene({pressed}: {pressed?: string} = {}) {
  return (
    <Drawer.Root anchor="bottom" defaultOpen>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Pick an icon</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <ToggleGroup
            wrap
            maxRows={3}
            size="small"
            aria-label="Icon"
            defaultValue={pressed ? [pressed] : []}
          >
            {ICON_NAMES.map((name) => (
              <Toggle key={name} value={name} aria-label={name}>
                <Icon name={name} size="sm" />
              </Toggle>
            ))}
          </ToggleGroup>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

type Point = {x: number; y: number}

/** `CDPSession` is empty until the provider's typings load; `send` exists at runtime. */
const cdpSend = (method: string, params: object) =>
  (cdp() as unknown as {send: (method: string, params: object) => Promise<unknown>}).send(
    method,
    params,
  )

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * CDP input lands in top-level page coordinates; the story runs in an iframe
 * the test runner offsets and may scale to fit. Map a point up every frame.
 */
function toPage(p: Point): Point {
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

/** Real touch drag through CDP; synthetic pointer events don't scroll. */
async function touchDrag(from: Point, to: Point) {
  const steps = 12
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

const getViewport = () => document.querySelector<HTMLElement>('[data-duro-scroll]')!
const getDialog = () => document.querySelector('[role="dialog"]')

/**
 * A point inside the list that is not on a toggle, so a drag starting there
 * is the case the deferral decides (a drag starting on a toggle is decided
 * the same way, but on origin/main it was left to the native scroll).
 */
function freePoint(el: HTMLElement, fy: number): Point {
  const r = el.getBoundingClientRect()
  const y = r.top + r.height * fy
  for (let dy = 0; dy < 12; dy++) {
    for (let x = r.left + 2; x < r.right; x += 2) {
      const hit = document.elementFromPoint(x, y + dy)
      if (hit && el.contains(hit) && !hit.closest('button')) return {x, y: y + dy}
    }
  }
  throw new Error('no free point in the list')
}

async function setup() {
  await page.viewport(390, 844)
  await cdpSend('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1})
  await waitFor(() => expect(getViewport()).toBeTruthy())
  const viewport = getViewport()
  await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight)
  // let the slide-in animation finish
  await pause(500)
  return viewport
}

export const DragUpAtTopScrolls: Story = {
  render: () => <Scene />,
  play: async () => {
    const viewport = await setup()
    await expect(viewport.scrollTop).toBe(0)
    const from = freePoint(viewport, 0.7)
    await touchDrag(from, {x: from.x, y: from.y - 60})
    await pause(300)
    await expect(viewport.scrollTop).toBeGreaterThan(0)
    await expect(getDialog()).not.toBeNull()
  },
}

export const DragDownMidListScrolls: Story = {
  render: () => <Scene />,
  play: async () => {
    const viewport = await setup()
    viewport.scrollTop = 40
    await pause(100)
    const before = viewport.scrollTop
    await expect(before).toBeGreaterThan(0)
    const from = freePoint(viewport, 0.5)
    await touchDrag(from, {x: from.x, y: from.y + 20})
    await pause(300)
    await expect(viewport.scrollTop).toBeLessThan(before)
    await expect(getDialog()).not.toBeNull()
  },
}

export const DragDownAtTopDismisses: Story = {
  render: () => <Scene />,
  play: async () => {
    const viewport = await setup()
    await expect(viewport.scrollTop).toBe(0)
    const from = freePoint(viewport, 0.5)
    await touchDrag(from, {x: from.x, y: from.y + 300})
    await waitFor(() => expect(getDialog()).toBeNull())
  },
}

export const DragDownOnHeaderDismisses: Story = {
  render: () => <Scene />,
  play: async () => {
    await setup()
    const title = [...document.querySelectorAll('[role="dialog"] *')].find(
      (el) => el.textContent === 'Pick an icon',
    ) as HTMLElement
    const r = title.getBoundingClientRect()
    const from = {x: r.left + r.width / 2, y: r.top + r.height / 2}
    await touchDrag(from, {x: from.x, y: from.y + 300})
    await waitFor(() => expect(getDialog()).toBeNull())
  },
}

export const TapOnToggleStillPresses: Story = {
  render: () => <Scene />,
  play: async () => {
    await setup()
    const key = document.querySelector<HTMLElement>('[role="dialog"] button[aria-label="key"]')!
    const r = key.getBoundingClientRect()
    const at = toPage({x: r.left + r.width / 2, y: r.top + r.height / 2})
    await cdpSend('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{...at, radiusX: 1, radiusY: 1}],
    })
    await cdpSend('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []})
    await waitFor(() => expect(key).toHaveAttribute('aria-pressed', 'true'))
    await expect(getDialog()).not.toBeNull()
  },
}

export const MountKeepsTheDrawerStill: Story = {
  // size the page before the render: a drawer mounts at its final width
  beforeEach: async () => {
    await page.viewport(390, 844)
  },
  render: () => <Scene pressed={ICON_NAMES[39]} />,
  play: async () => {
    const pageScroll = document.scrollingElement?.scrollTop
    await waitFor(() => expect(getViewport()).toBeTruthy())
    await pause(500)
    const viewport = getViewport()
    const body = viewport.closest('[role="dialog"]')!
    // the list scrolled itself to the pressed icon …
    await expect(viewport.scrollTop).toBeGreaterThan(0)
    const pressed = viewport.querySelector('[aria-pressed="true"]')!.getBoundingClientRect()
    const v = viewport.getBoundingClientRect()
    await expect(pressed.top).toBeGreaterThanOrEqual(v.top - 1)
    await expect(pressed.bottom).toBeLessThanOrEqual(v.bottom + 1)
    // … and nothing outside it moved
    for (const el of body.querySelectorAll<HTMLElement>('*')) {
      if (el !== viewport && !viewport.contains(el)) await expect(el.scrollTop).toBe(0)
    }
    await expect(document.scrollingElement?.scrollTop).toBe(pageScroll)
  },
}

/** The coarse-pointer rows of a wrapping group, measured, not inferred. */
export const CoarsePointerRows: Story = {
  render: () => (
    <ToggleGroup wrap maxRows={3} size="small" aria-label="Icon">
      {ICON_NAMES.map((name) => (
        <Toggle key={name} value={name} aria-label={name}>
          <Icon name={name} size="sm" />
        </Toggle>
      ))}
    </ToggleGroup>
  ),
  play: async () => {
    // phone width, so 42 icons overflow three rows
    await page.viewport(390, 844)
    await cdpSend('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1})
    await waitFor(() => expect(matchMedia('(pointer: coarse)').matches).toBe(true))
    const viewport = getViewport()
    const expected = 3.5 * ROW_HEIGHT.coarse + 3 * 4 + 2 * 4
    await waitFor(() => expect(Math.abs(viewport.clientHeight - expected)).toBeLessThanOrEqual(2))
    const toggle = viewport.querySelector('button')!.getBoundingClientRect()
    await expect(toggle.height).toBeGreaterThanOrEqual(ROW_HEIGHT.coarse)
    await expect(toggle.width).toBeGreaterThanOrEqual(ROW_HEIGHT.coarse)
  },
}
