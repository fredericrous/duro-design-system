import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor, within} from 'storybook/test'
import {Drawer} from './Drawer'
import {Button} from '../Button/Button'

const meta: Meta = {
  title: 'Components/Drawer/Floating card',
  parameters: {layout: 'fullscreen'},
}

export default meta
type Story = StoryObj

const getPanel = () => document.querySelector<HTMLElement>('[data-drawer-viewport] [role="dialog"]')
const getBackdrop = () => document.querySelector<HTMLElement>('[data-drawer-backdrop]')

function Card({backdrop}: {backdrop?: 'dim' | 'ramp'}) {
  return (
    <Drawer.Root defaultOpen anchor="bottom">
      <Drawer.Portal
        placement="floating"
        backdrop={backdrop}
        above={<Button variant="secondary">Close</Button>}
      >
        <Drawer.Title>New session</Drawer.Title>
        <Drawer.Body>
          <Button>Start</Button>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function CloseOnPress() {
  return (
    <Drawer.Root defaultOpen anchor="bottom">
      <Drawer.Portal
        placement="floating"
        backdrop="ramp"
        above={
          <Drawer.Close>
            <Button variant="secondary">Close</Button>
          </Drawer.Close>
        }
      >
        <Drawer.Title>New session</Drawer.Title>
        <Drawer.Body>
          <Button>Start</Button>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export const FloatingCard: Story = {
  render: () => <CloseOnPress />,
  play: async () => {
    await waitFor(() => expect(getPanel()).not.toBeNull())
    const panel = getPanel()!
    const close = within(panel).getByRole('button', {name: 'Close'})
    expect(close.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      panel.getBoundingClientRect().top,
    )

    // Inside the dialog and first in its focus order, ahead of the body's
    // controls (Drawer keeps focus order, not a focus trap).
    const start = within(panel).getByRole('button', {name: 'Start'})
    expect(panel.contains(close)).toBe(true)
    expect(close.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    await userEvent.click(close)
    await waitFor(() => expect(getPanel()).toBeNull())
  },
}

export const FloatingCardBackdropClick: Story = {
  render: () => <CloseOnPress />,
  play: async () => {
    await waitFor(() => expect(getBackdrop()).not.toBeNull())
    await userEvent.click(getBackdrop()!)
    await waitFor(() => expect(getPanel()).toBeNull())
  },
}

export const RampBackdrop: Story = {
  render: () => <Card backdrop="ramp" />,
  play: async () => {
    await waitFor(() => expect(getBackdrop()).not.toBeNull())
    expect(getComputedStyle(getBackdrop()!).backgroundImage).toContain('gradient')
  },
}

export const DimBackdropIsFlat: Story = {
  render: () => <Card />,
  play: async () => {
    await waitFor(() => expect(getBackdrop()).not.toBeNull())
    expect(getComputedStyle(getBackdrop()!).backgroundImage).toBe('none')
  },
}
