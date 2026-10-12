import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, userEvent, waitFor} from 'storybook/test'
import {Drawer, type SnapPoint} from './Drawer'
import {Button} from '../Button/Button'
import {List} from '../List/List'
import {cdpSend, centre, pause, setViewport, touchDrag, type Point} from './touchInput'

const meta: Meta = {
  title: 'Components/Drawer/Snap points',
  parameters: {layout: 'fullscreen'},
}

export default meta
type Story = StoryObj

const SESSIONS = Array.from({length: 40}, (_, i) => `Session ${i + 1}`)

interface SheetArgs {
  snapPoints: SnapPoint[]
  defaultSnapPoint: SnapPoint
  titleAlign: 'start' | 'center'
  onOpenChange?: (open: boolean) => void
}

const DEFAULT_ARGS: SheetArgs = {
  snapPoints: ['medium', 'large'],
  defaultSnapPoint: 'medium',
  titleAlign: 'center',
}

/** The picked B0 direction (docs/mockups/native-sheet/Done.dc.html): grabber, centred title, a text Done. */
function Sheet(props: Partial<SheetArgs>) {
  const {snapPoints, defaultSnapPoint, titleAlign, onOpenChange} = {...DEFAULT_ARGS, ...props}
  return (
    <Drawer.Root
      anchor="bottom"
      snapPoints={snapPoints}
      defaultSnapPoint={defaultSnapPoint}
      onOpenChange={onOpenChange}
      defaultOpen
    >
      <Drawer.Portal>
        <Drawer.Header titleAlign={titleAlign}>
          <Drawer.Title>Move to project</Drawer.Title>
          <Drawer.Close>
            <Button variant="link">Done</Button>
          </Drawer.Close>
        </Drawer.Header>
        <Drawer.Body>
          <List.Root aria-label="Sessions">
            {SESSIONS.map((s) => (
              <List.Item key={s}>
                <List.Text>{s}</List.Text>
              </List.Item>
            ))}
          </List.Root>
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export const SnapSheet: StoryObj<SheetArgs> = {
  args: {...DEFAULT_ARGS, onOpenChange: fn()},
  argTypes: {
    snapPoints: {
      control: 'check',
      options: ['medium', 'large'],
      description: "The detents: 'medium' half the window, 'large' the window less its top inset",
    },
    defaultSnapPoint: {
      control: 'inline-radio',
      options: ['medium', 'large'],
      description: 'The detent the sheet opens at',
    },
    titleAlign: {
      control: 'inline-radio',
      options: ['start', 'center'],
      description: 'Drawer.Header: the title at the start, or centred with the close at the end',
    },
  },
  render: (args) => (
    <Sheet {...args} snapPoints={args.snapPoints.length > 0 ? args.snapPoints : ['medium']} />
  ),
}

const getDialog = () => document.querySelector<HTMLElement>('[role="dialog"]')
const getGrabber = () => document.querySelector<HTMLElement>('[data-drawer-grabber]')!
const getBody = () => document.querySelector<HTMLElement>('[role="dialog"] [data-duro-scroll]')!
const sheetHeight = () => getDialog()!.getBoundingClientRect().height

const WINDOW_H = 844
const MEDIUM = WINDOW_H / 2
const LARGE = WINDOW_H // no top safe-area inset in a desktop browser

async function setup() {
  await setViewport(390, WINDOW_H)
  await cdpSend('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1})
  await waitFor(() => expect(getDialog()).not.toBeNull())
  // let the slide-in finish
  await pause(500)
}

const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(2)

async function dragGrabber(dy: number) {
  const from: Point = centre(getGrabber())
  await touchDrag(from, {x: from.x, y: from.y + dy})
  await pause(400)
}

export const DragBetweenDetentsThenDismiss: Story = {
  render: () => <Sheet />,
  play: async () => {
    await setup()
    await waitFor(() => near(sheetHeight(), MEDIUM))
    await dragGrabber(-300)
    await waitFor(() => near(sheetHeight(), LARGE))
    await dragGrabber(300)
    await waitFor(() => near(sheetHeight(), MEDIUM))
    await dragGrabber(300)
    await waitFor(() => expect(getDialog()).toBeNull())
  },
}

export const SlowShortDragSnapsBack: Story = {
  render: () => <Sheet />,
  play: async () => {
    await setup()
    const from = centre(getGrabber())
    // 60px over 40 moves: well under the fling speed, well short of the next detent
    await touchDrag(from, {x: from.x, y: from.y - 60}, 40)
    await pause(400)
    await waitFor(() => near(sheetHeight(), MEDIUM))
  },
}

export const GrabberTapCyclesDetents: Story = {
  render: () => <Sheet />,
  play: async () => {
    await setup()
    const grabber = getGrabber()
    await expect(grabber).toHaveAccessibleName('Expand sheet')
    await userEvent.click(grabber)
    await waitFor(() => near(sheetHeight(), LARGE))
    await expect(grabber).toHaveAccessibleName('Shrink sheet')
    await userEvent.click(grabber)
    await waitFor(() => near(sheetHeight(), MEDIUM))
  },
}

export const DragUpOnContentGrowsThenScrolls: Story = {
  render: () => <Sheet />,
  play: async () => {
    await setup()
    const from = centre(getBody())
    // At medium, the content's upward drag grows the sheet …
    await touchDrag(from, {x: from.x, y: from.y - 250})
    await pause(400)
    await waitFor(() => near(sheetHeight(), LARGE))
    await expect(getBody().scrollTop).toBe(0)
    // … at the largest detent it scrolls the list.
    const again = centre(getBody())
    await touchDrag(again, {x: again.x, y: again.y - 120})
    await pause(300)
    await expect(getBody().scrollTop).toBeGreaterThan(0)
    near(sheetHeight(), LARGE)
  },
}

export const DoneCloses: Story = {
  render: () => <Sheet />,
  play: async () => {
    await setup()
    await userEvent.click(
      document.querySelector('[role="dialog"] button:not([data-drawer-grabber])')!,
    )
    await waitFor(() => expect(getDialog()).toBeNull())
  },
}
