import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor} from 'storybook/test'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {Drawer} from './Drawer'
import {Text} from '../Text/Text'
import {cdpSend, centre, pause, setViewport, touchDrag} from './touchInput'

const meta: Meta = {
  title: 'Components/Drawer/Side snap points',
  parameters: {layout: 'fullscreen'},
}

export default meta
type Story = StoryObj

function SidePanel() {
  return (
    <Drawer.Root anchor="right" snapPoints={['compact', 'expanded']} defaultOpen>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Inspector</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Text>Opens compact; the grabber on the inner edge widens it.</Text>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

const getDialog = () => document.querySelector<HTMLElement>('[role="dialog"]')
const getGrabber = () => document.querySelector<HTMLElement>('[data-drawer-grabber]')!
const panelWidth = () => getDialog()!.getBoundingClientRect().width

const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(2)

async function setup(width: number) {
  await setViewport(width, 800)
  await cdpSend('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1})
  await waitFor(() => expect(getDialog()).not.toBeNull())
  // let the slide-in finish
  await pause(500)
}

export const OpensCompactAndTapSteps: Story = {
  render: () => <SidePanel />,
  play: async () => {
    await setup(1200)
    await waitFor(() => near(panelWidth(), SIZES_PX.panelSm))
    const grabber = getGrabber()
    await expect(grabber).toHaveAccessibleName('Expand panel')
    await userEvent.click(grabber)
    await waitFor(() => near(panelWidth(), SIZES_PX.panelLg))
    await expect(grabber).toHaveAccessibleName('Shrink panel')
    await userEvent.click(grabber)
    await waitFor(() => near(panelWidth(), SIZES_PX.panelSm))
  },
}

export const NeverWiderThanTheWindow: Story = {
  render: () => <SidePanel />,
  play: async () => {
    await setup(500)
    await userEvent.click(getGrabber())
    await waitFor(() => near(panelWidth(), 500))
    await expect(panelWidth()).toBeLessThanOrEqual(500)
  },
}

export const SwipeDismisses: Story = {
  render: () => <SidePanel />,
  play: async () => {
    await setup(1200)
    const from = centre(getDialog()!)
    await touchDrag(from, {x: from.x + 300, y: from.y})
    await pause(400)
    await waitFor(() => expect(getDialog()).toBeNull())
  },
}
