import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, userEvent, waitFor, within} from 'storybook/test'
import {SIZES_PX, SPACING_PX} from '@duro-app/tokens/keys'
import {Pane} from './Pane'
import {Button} from '../Button/Button'
import {pause, setViewport} from '../Drawer/touchInput'
import {detentHeight} from '../Drawer/sheetPhysics'

const meta: Meta = {
  title: 'Components/Pane/Basics',
  parameters: {layout: 'fullscreen'},
}

export default meta
type Story = StoryObj

function Demo({onOpenChange}: {onOpenChange?: (open: boolean) => void}) {
  return (
    <Pane.Root defaultOpen onOpenChange={onOpenChange}>
      <Pane.Portal>
        <Pane.Header>
          <Pane.Title>Theme</Pane.Title>
          <Pane.Expand />
          <Pane.Close />
        </Pane.Header>
        <Pane.Body>
          <Button>Inside</Button>
        </Pane.Body>
      </Pane.Portal>
    </Pane.Root>
  )
}

// Longer than the exit animation, so a close that started would have finished.
const EXIT_WAIT_MS = 600
const getPanel = () => document.querySelector<HTMLElement>('[data-drawer-viewport] [role="dialog"]')
const panelWidth = () => getPanel()!.getBoundingClientRect().width
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(2)

async function open() {
  await setViewport(1200, 800)
  await waitFor(() => expect(getPanel()).not.toBeNull())
  // let the slide-in finish
  await pause(500)
}

export const OpensCompactAndExpandSteps: Story = {
  render: () => <Demo />,
  play: async () => {
    await open()
    await waitFor(() => near(panelWidth(), SIZES_PX.panelSm))
    const panel = within(getPanel()!)
    const expand = panel.getByRole('button', {name: 'Expand'})
    await userEvent.click(expand)
    await waitFor(() => near(panelWidth(), SIZES_PX.panelLg))
    const collapse = panel.getByRole('button', {name: 'Collapse'})
    await userEvent.click(collapse)
    await waitFor(() => near(panelWidth(), SIZES_PX.panelSm))
  },
}

export const FloatsInsetAndRounded: Story = {
  render: () => <Demo />,
  play: async () => {
    await open()
    const panel = getPanel()!
    const rect = panel.getBoundingClientRect()
    near(window.innerWidth - rect.right, SPACING_PX.md)
    near(rect.top, SPACING_PX.md)
    near(window.innerHeight - rect.bottom, SPACING_PX.md)
    const style = getComputedStyle(panel)
    expect(style.borderTopLeftRadius).not.toBe('0px')
    expect(style.borderTopWidth).not.toBe('0px')
    expect(style.borderLeftWidth).not.toBe('0px')
  },
}

export const PageBehindStaysClickable: StoryObj<{onClick: () => void}> = {
  args: {onClick: fn()},
  render: (args) => (
    <>
      <Button onClick={args.onClick}>Behind</Button>
      <Demo />
    </>
  ),
  play: async ({args, canvasElement}) => {
    await open()
    const behind = within(canvasElement).getByRole('button', {name: 'Behind'})
    const rect = behind.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    expect(document.elementFromPoint(x, y)).toBe(behind)
    await userEvent.click(behind)
    expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const EscapeNeedsFocusInside: StoryObj<{onOpenChange: (open: boolean) => void}> = {
  args: {onOpenChange: fn()},
  render: (args) => <Demo onOpenChange={args.onOpenChange} />,
  play: async ({args}) => {
    await open()
    const inside = within(getPanel()!).getByRole('button', {name: 'Inside'})
    ;(document.activeElement as HTMLElement).blur()
    await userEvent.keyboard('{Escape}')
    // The close notice comes after the exit animation: wait it out before asserting nothing happened.
    await new Promise((resolve) => setTimeout(resolve, EXIT_WAIT_MS))
    expect(getPanel()).not.toBeNull()
    expect(args.onOpenChange).not.toHaveBeenCalled()
    inside.focus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false))
  },
}

function Flippable() {
  const [anchor, setAnchor] = useState<'right' | 'bottom'>('right')
  return (
    <>
      <Button onClick={() => setAnchor('bottom')}>Flip to bottom</Button>
      <Pane.Root defaultOpen {...(anchor === 'bottom' ? {anchor: 'bottom'} : {anchor: 'right'})}>
        <Pane.Portal>
          <Pane.Header>
            <Pane.Title>Theme</Pane.Title>
            <Pane.Expand />
          </Pane.Header>
        </Pane.Portal>
      </Pane.Root>
    </>
  )
}

// One root whose anchor changes while it is open and expanded: it returns to the default detent.
export const AnchorFlipResetsTheDetent: Story = {
  render: () => <Flippable />,
  play: async ({canvasElement}) => {
    await open()
    await userEvent.click(within(getPanel()!).getByRole('button', {name: 'Expand'}))
    await waitFor(() => near(panelWidth(), SIZES_PX.panelLg))
    await userEvent.click(within(canvasElement).getByRole('button', {name: 'Flip to bottom'}))
    await waitFor(() =>
      near(
        getPanel()!.getBoundingClientRect().height,
        detentHeight('medium', window.innerHeight, 0),
      ),
    )
  },
}

export const ExpandedHoldsInsideANarrowWindow: Story = {
  render: () => <Demo />,
  play: async () => {
    await setViewport(500, 800)
    await waitFor(() => expect(getPanel()).not.toBeNull())
    // Compact is held to the window too: 360 fits in 500 - 2 * 16.
    await waitFor(() => near(panelWidth(), SIZES_PX.panelSm))
    await userEvent.click(within(getPanel()!).getByRole('button', {name: 'Expand'}))
    await waitFor(() => near(panelWidth(), 500 - 2 * SPACING_PX.md))
  },
}

const getHeader = () => document.querySelector<HTMLElement>('[data-pane-handle]')

// Synthetic pointer events on the header, at its left edge: the title's side, away from the controls.
function pointerAt(target: Element, type: string, x: number, y: number) {
  // As a real pointer does: the primary button is held from down to up, and released on up.
  const buttons = type === 'pointerup' ? 0 : 1
  target.dispatchEvent(
    new PointerEvent(type, {
      pointerId: 1,
      button: 0,
      buttons,
      bubbles: true,
      clientX: x,
      clientY: y,
    }),
  )
}
// A pane that cannot move has no handle: the drag then starts on its title, which must not move it either.
function dragHeader(dx: number, dy: number) {
  const header = getHeader() ?? getPanel()!.querySelector<HTMLElement>('h2')!
  const r = header.getBoundingClientRect()
  const x = r.left + 24
  const y = r.top + r.height / 2
  pointerAt(header, 'pointerdown', x, y)
  pointerAt(header, 'pointermove', x + dx, y + dy)
  pointerAt(header, 'pointerup', x + dx, y + dy)
}

function MovableDemo({
  movable = true,
  anchor = 'right',
}: {
  movable?: boolean
  anchor?: 'right' | 'bottom'
}) {
  const parts = (
    <Pane.Portal>
      <Pane.Header>
        <Pane.Title>Theme</Pane.Title>
        <Pane.Move />
        <Pane.Expand />
        <Pane.Close />
      </Pane.Header>
      <Pane.Body>
        <Button>Inside</Button>
      </Pane.Body>
    </Pane.Portal>
  )
  return anchor === 'bottom' ? (
    <Pane.Root defaultOpen movable={movable} anchor="bottom">
      <Pane.Trigger>
        <Button variant="secondary">Open theme</Button>
      </Pane.Trigger>
      {parts}
    </Pane.Root>
  ) : (
    <Pane.Root defaultOpen movable={movable} anchor="right">
      <Pane.Trigger>
        <Button variant="secondary">Open theme</Button>
      </Pane.Trigger>
      {parts}
    </Pane.Root>
  )
}

export const MovesFromTheHeaderAndDoubleClickPutsItBack: Story = {
  render: () => <MovableDemo />,
  play: async () => {
    await open()
    const panel = getPanel()!
    const home = panel.getBoundingClientRect().left
    dragHeader(-120, 0)
    await waitFor(() => expect(panel.getBoundingClientRect().left).toBeLessThan(home - 100))
    getHeader()!.dispatchEvent(new MouseEvent('dblclick', {bubbles: true}))
    await waitFor(() => near(panel.getBoundingClientRect().left, home))
  },
}

export const DragStopsAtTheWindowEdge: Story = {
  render: () => <MovableDemo />,
  play: async () => {
    await open()
    const panel = getPanel()!
    dragHeader(-5000, 0)
    // It stops at the edge gap a floating pane keeps, never past the window.
    await waitFor(() => near(panel.getBoundingClientRect().left, SPACING_PX.md))
  },
}

export const ArrowKeysNudgeAndHomeResets: Story = {
  render: () => <MovableDemo />,
  play: async () => {
    await open()
    const panel = getPanel()!
    const home = panel.getBoundingClientRect().left
    const move = within(panel).getByRole('button', {name: 'Move panel'})
    move.focus()
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => near(panel.getBoundingClientRect().left, home - SPACING_PX.md))
    await userEvent.keyboard('{Home}')
    await waitFor(() => near(panel.getBoundingClientRect().left, home))
  },
}

export const ADragNeedsMovable: Story = {
  render: () => <MovableDemo movable={false} />,
  play: async () => {
    await open()
    const panel = getPanel()!
    const home = panel.getBoundingClientRect().left
    dragHeader(-120, 0)
    await pause(200)
    near(panel.getBoundingClientRect().left, home)
    expect(panel.style.left).toBe('')
    expect(getHeader()).toBeNull()
  },
}

export const ABottomPaneIgnoresMovable: Story = {
  render: () => <MovableDemo anchor="bottom" />,
  play: async () => {
    await open()
    // A bottom pane's detents still settle after its slide-in: let them.
    await pause(800)
    const panel = getPanel()!
    dragHeader(0, -200)
    await pause(200)
    // The Drawer's own sheet drag may move a bottom pane; movable must not add an offset to it.
    expect(panel.style.top).toBe('')
    expect(panel.style.left).toBe('')
  },
}

export const ReopenedPaneIsAtItsDefaultPlace: Story = {
  render: () => <MovableDemo />,
  play: async ({canvasElement}) => {
    await open()
    const home = getPanel()!.getBoundingClientRect().left
    dragHeader(-120, 0)
    await waitFor(() => expect(getPanel()!.getBoundingClientRect().left).toBeLessThan(home - 100))
    await userEvent.click(within(getPanel()!).getByRole('button', {name: 'Close'}))
    await waitFor(() => expect(getPanel()).toBeNull())
    await userEvent.click(within(canvasElement).getByRole('button', {name: 'Open theme'}))
    await waitFor(() => expect(getPanel()).not.toBeNull())
    await pause(500)
    near(getPanel()!.getBoundingClientRect().left, home)
  },
}

export const DraggingBackTowardTheEdgeNeverDismisses: Story = {
  render: () => <MovableDemo />,
  play: async () => {
    await open()
    const panel = getPanel()!
    const home = panel.getBoundingClientRect().left
    dragHeader(-200, 0)
    await waitFor(() => expect(panel.getBoundingClientRect().left).toBeLessThan(home - 150))
    // Back toward the right edge: the swipe that dismisses a right pane must not start from the header.
    dragHeader(400, 0)
    await pause(500)
    expect(getPanel()).not.toBeNull()
    expect(getPanel()!.style.transform).toBe('')
    near(getPanel()!.getBoundingClientRect().left, home)
  },
}

export const ShiftArrowTakesALargerStep: Story = {
  render: () => <MovableDemo />,
  play: async () => {
    await open()
    const panel = getPanel()!
    const home = panel.getBoundingClientRect().left
    within(panel).getByRole('button', {name: 'Move panel'}).focus()
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    await waitFor(() => near(panel.getBoundingClientRect().left, home - SPACING_PX.xxxl))
  },
}

export const TheMoveMenuSendsItToAnEdgeAndBack: Story = {
  render: () => <MovableDemo />,
  play: async () => {
    await open()
    const panel = getPanel()!
    const home = panel.getBoundingClientRect().left
    await userEvent.click(within(panel).getByRole('button', {name: 'Move panel'}))
    await userEvent.click(
      await within(document.body).findByRole('menuitem', {name: 'Move to the left edge'}),
    )
    await waitFor(() => near(panel.getBoundingClientRect().left, SPACING_PX.md))
    await userEvent.click(within(panel).getByRole('button', {name: 'Move panel'}))
    await userEvent.click(
      await within(document.body).findByRole('menuitem', {name: 'Back to its place'}),
    )
    await waitFor(() => near(panel.getBoundingClientRect().left, home))
  },
}

export const MoveSitsBesideExpandAndClose: Story = {
  render: () => <MovableDemo />,
  play: async () => {
    await open()
    const panel = getPanel()!
    const move = within(panel).getByRole('button', {name: 'Move panel'}).getBoundingClientRect()
    const expand = within(panel).getByRole('button', {name: 'Expand'}).getBoundingClientRect()
    // One group at the header's end: Move is right before Expand, not floating mid-header.
    expect(expand.left - move.right).toBeLessThanOrEqual(SPACING_PX.lg)
  },
}
