import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, userEvent, waitFor, within} from 'storybook/test'
import {SIZES_PX, SPACING_PX} from '@duro-app/tokens/keys'
import {Pane} from './Pane'
import {Button} from '../Button/Button'
import {pause, setViewport} from '../Drawer/touchInput'

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
      {anchor === 'bottom' ? (
        <Pane.Root defaultOpen anchor="bottom">
          <Pane.Portal>
            <Pane.Header>
              <Pane.Title>Theme</Pane.Title>
              <Pane.Expand />
            </Pane.Header>
          </Pane.Portal>
        </Pane.Root>
      ) : (
        <Pane.Root defaultOpen anchor="right">
          <Pane.Portal>
            <Pane.Header>
              <Pane.Title>Theme</Pane.Title>
              <Pane.Expand />
            </Pane.Header>
          </Pane.Portal>
        </Pane.Root>
      )}
    </>
  )
}

// The two roots are different elements, so this checks the bottom pane opens at its own default
// detent (medium) after an expanded side pane, not that one root survives a flip.
export const BottomPaneOpensAtItsDefaultDetent: Story = {
  render: () => <Flippable />,
  play: async ({canvasElement}) => {
    await open()
    const side = within(getPanel()!)
    await userEvent.click(side.getByRole('button', {name: 'Expand'}))
    await waitFor(() => near(panelWidth(), SIZES_PX.panelLg))
    await userEvent.click(within(canvasElement).getByRole('button', {name: 'Flip to bottom'}))
    await waitFor(() => expect(getPanel()!.getBoundingClientRect().height).toBeLessThan(800))
    await pause(500)
    await expect(within(getPanel()!).getByRole('button', {name: 'Expand'})).toBeVisible()
  },
}
