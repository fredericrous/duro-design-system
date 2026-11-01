import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, userEvent, waitFor, within} from 'storybook/test'
import {Drawer} from './Drawer'
import {Button} from '../Button/Button'
import {Popover} from '../Popover/Popover'

const meta: Meta = {
  title: 'Components/Drawer/Non-modal',
  parameters: {layout: 'fullscreen'},
}

export default meta
type Story = StoryObj

const getPanel = () => document.querySelector<HTMLElement>('[data-drawer-viewport] [role="dialog"]')
// Longer than the exit animation, so a close that started would have finished.
const EXIT_WAIT_MS = 600
const getViewport = () => document.querySelector<HTMLElement>('[data-drawer-viewport]')

function Panel({modal, onOpenChange}: {modal?: boolean; onOpenChange?: (open: boolean) => void}) {
  return (
    <Drawer.Root defaultOpen modal={modal} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Body>
          <Button>Inside</Button>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export const NonModalHasNoModalChrome: Story = {
  render: () => <Panel modal={false} />,
  play: async () => {
    await waitFor(() => expect(getPanel()).not.toBeNull())
    expect(getPanel()!.hasAttribute('aria-modal')).toBe(false)
    expect(document.querySelector('[aria-modal]')).toBeNull()
    expect(document.querySelector('[data-drawer-backdrop]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  },
}

export const ModalKeepsBackdropAndScrollLock: Story = {
  render: () => <Panel />,
  play: async () => {
    await waitFor(() => expect(getPanel()).not.toBeNull())
    expect(getPanel()!.getAttribute('aria-modal')).toBe('true')
    expect(document.querySelector('[data-drawer-backdrop]')).not.toBeNull()
    expect(document.body.style.overflow).toBe('hidden')
  },
}

export const NonModalEscapeNeedsFocusInside: StoryObj<{onOpenChange: (open: boolean) => void}> = {
  args: {onOpenChange: fn()},
  render: (args) => <Panel modal={false} onOpenChange={args.onOpenChange} />,
  play: async ({args}) => {
    await waitFor(() => expect(getPanel()).not.toBeNull())
    const {onOpenChange} = args
    const inside = within(getPanel()!).getByRole('button', {name: 'Inside'})
    ;(document.activeElement as HTMLElement).blur()
    await userEvent.keyboard('{Escape}')
    // The close notice comes after the exit animation: wait it out before asserting nothing happened.
    await new Promise((resolve) => setTimeout(resolve, EXIT_WAIT_MS))
    expect(getPanel()).not.toBeNull()
    expect(onOpenChange).not.toHaveBeenCalled()
    inside.focus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  },
}

export const NonModalLeavesPageClickable: StoryObj<{onClick: () => void}> = {
  args: {onClick: fn()},
  render: (args) => (
    <>
      <Button onClick={args.onClick}>Behind</Button>
      <Panel modal={false} />
    </>
  ),
  play: async ({args, canvasElement}) => {
    await waitFor(() => expect(getPanel()).not.toBeNull())
    const behind = within(canvasElement).getByRole('button', {name: 'Behind'})
    const panelRect = getPanel()!.getBoundingClientRect()
    const rect = behind.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    expect(
      x < panelRect.left || x > panelRect.right || y < panelRect.top || y > panelRect.bottom,
    ).toBe(true)
    expect(document.elementFromPoint(x, y)).toBe(behind)
    await userEvent.click(behind)
    expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const PopoverInNonModalDrawerStacksAbove: Story = {
  render: () => (
    <Drawer.Root defaultOpen modal={false}>
      <Drawer.Portal>
        <Drawer.Title>Filters</Drawer.Title>
        <Popover.Root defaultOpen>
          <Popover.Trigger>More</Popover.Trigger>
          <Popover.Popup label="Extra filters">Extra</Popover.Popup>
        </Popover.Root>
      </Drawer.Portal>
    </Drawer.Root>
  ),
  play: async () => {
    const getPopup = () =>
      document.querySelector<HTMLElement>('[role="dialog"][aria-label="Extra filters"]')
    await waitFor(() => expect(getPopup()).not.toBeNull())
    const popup = getPopup()!
    const rect = popup.getBoundingClientRect()
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    expect(top).not.toBeNull()
    expect(popup.contains(top)).toBe(true)
    const popupLayer = Number(getComputedStyle(popup).zIndex)
    const viewportLayer = Number(getComputedStyle(getViewport()!).zIndex)
    expect(popupLayer).toBeGreaterThan(viewportLayer)
  },
}

export const NonModalFocusMovesInAndBack: Story = {
  render: () => (
    <Drawer.Root modal={false}>
      <Drawer.Trigger>
        <Button>Open filters</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Body>
          <Button>Inside</Button>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  ),
  play: async ({canvasElement}) => {
    const trigger = within(canvasElement).getByRole('button', {name: 'Open filters'})
    trigger.focus()
    await userEvent.click(trigger)
    await waitFor(() => expect(getPanel()).not.toBeNull())
    await waitFor(() => expect(getPanel()!.contains(document.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(getPanel()).toBeNull())
    expect(document.activeElement).toBe(trigger)
  },
}
