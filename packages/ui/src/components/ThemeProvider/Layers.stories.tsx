import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor, within} from 'storybook/test'
import {Dialog} from '../Dialog/Dialog'
import {Drawer} from '../Drawer/Drawer'
import {DragDrop} from '../DragDrop/DragDrop'
import {Popover} from '../Popover/Popover'
import {ToastProvider, useToast} from '../Toast/ToastProvider'
import {Button} from '../Button/Button'
import {Stack} from '../Stack/Stack'
import {Text} from '../Text/Text'

/**
 * What stacks above what. Dialog, Drawer, the popups and the toast region all
 * portal into the ThemeProvider mount, so their `layers` values order them in
 * one stacking context: a popup or a toast opened over a modal must be the
 * topmost element where it is drawn.
 */
const meta: Meta = {
  title: 'Theme/Layers',
}

export default meta
type Story = StoryObj

const page = () => within(document.body)

/** True when the element drawn at `el`'s centre is `el` or inside it. */
function onTop(el: Element): boolean {
  const r = el.getBoundingClientRect()
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return hit !== null && el.contains(hit)
}

function LinkPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger>Insert link</Popover.Trigger>
      <Popover.Popup label="Link">
        <Stack gap="sm">
          <Text>Paste a URL.</Text>
          <Popover.Close>Apply</Popover.Close>
        </Stack>
      </Popover.Popup>
    </Popover.Root>
  )
}

export const PopoverInDialog: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Open editor</Button>
      </Dialog.Trigger>
      <Dialog.Portal size="sm">
        <Dialog.Header>
          <Dialog.Title>Editor</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <LinkPopover />
        </Dialog.Body>
      </Dialog.Portal>
    </Dialog.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Open editor'}))
    await userEvent.click(await page().findByRole('button', {name: 'Insert link'}))
    const popup = await page().findByRole('dialog', {name: 'Link'})
    await waitFor(() => expect(onTop(popup)).toBe(true))
  },
}

export const PopoverInDrawer: Story = {
  render: () => (
    <Drawer.Root>
      <Drawer.Trigger>
        <Button>Open details</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Header>
          <Drawer.Title>Details</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <LinkPopover />
        </Drawer.Body>
      </Drawer.Portal>
    </Drawer.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Open details'}))
    await userEvent.click(await page().findByRole('button', {name: 'Insert link'}))
    const popup = await page().findByRole('dialog', {name: 'Link'})
    await waitFor(() => expect(onTop(popup)).toBe(true))
  },
}

function SaveButton() {
  const {toast} = useToast()
  return (
    <Button onClick={() => toast({variant: 'success', message: 'Draft saved', duration: 0})}>
      Save draft
    </Button>
  )
}

export const ToastOverDialog: Story = {
  render: () => (
    <ToastProvider>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button>Open draft</Button>
        </Dialog.Trigger>
        <Dialog.Portal size="sm">
          <Dialog.Header>
            <Dialog.Title>Draft</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <SaveButton />
          </Dialog.Body>
        </Dialog.Portal>
      </Dialog.Root>
    </ToastProvider>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Open draft'}))
    await userEvent.click(await page().findByRole('button', {name: 'Save draft'}))
    const message = await page().findByText('Draft saved')
    const toast = message.closest('[role="status"]') as Element
    await waitFor(() => expect(onTop(toast)).toBe(true))
  },
}

const ITEMS = [
  {id: 'a', name: 'Alpha'},
  {id: 'b', name: 'Beta'},
]

export const DragDropInDialog: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Open board</Button>
      </Dialog.Trigger>
      <Dialog.Portal size="sm">
        <Dialog.Header>
          <Dialog.Title>Board</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <DragDrop.Root<{id: string; name: string}> onDrop={() => {}}>
            <Stack gap="md">
              <DragDrop.Zone id="from" label="From">
                <Stack gap="sm">
                  {ITEMS.map((item) => (
                    <DragDrop.Item
                      key={item.id}
                      id={item.id}
                      zone="from"
                      label={item.name}
                      data={item}
                    >
                      <Button variant="secondary">{item.name}</Button>
                    </DragDrop.Item>
                  ))}
                </Stack>
              </DragDrop.Zone>
              <DragDrop.Zone id="to" label="To">
                <Text>Drop here.</Text>
              </DragDrop.Zone>
            </Stack>
          </DragDrop.Root>
        </Dialog.Body>
      </Dialog.Portal>
    </Dialog.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Open board'}))
    const alpha = await page().findByRole('button', {name: 'Alpha'})
    const target = page().getByText('Drop here.')
    const from = alpha.parentElement as Element
    const a = from.getBoundingClientRect()
    const b = target.getBoundingClientRect()
    const init = (x: number, y: number) => ({
      bubbles: true,
      cancelable: true,
      pointerId: 7,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y,
    })
    const start = {x: a.left + a.width / 2, y: a.top + a.height / 2}
    const end = {x: b.left + b.width / 2, y: b.top + b.height / 2}
    from.dispatchEvent(new PointerEvent('pointerdown', init(start.x, start.y)))
    for (let i = 1; i <= 6; i++) {
      const x = start.x + ((end.x - start.x) * i) / 6
      const y = start.y + ((end.y - start.y) * i) / 6
      document.dispatchEvent(new PointerEvent('pointermove', init(x, y)))
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    }
    // Mid-drag: the ghost is the aria-hidden copy. It is click-through, so it
    // takes hits for the duration of the check only.
    const ghost = await waitFor(() => {
      const found = [...document.querySelectorAll('[aria-hidden="true"]')].find(
        (el) => el.textContent === 'Alpha' && getComputedStyle(el).position === 'fixed',
      ) as HTMLElement | undefined
      if (!found) throw new Error('no ghost yet')
      return found
    })
    ghost.style.pointerEvents = 'auto'
    const visible = onTop(ghost)
    ghost.style.pointerEvents = ''
    document.dispatchEvent(new PointerEvent('pointerup', {...init(end.x, end.y), buttons: 0}))
    await expect(visible).toBe(true)
  },
}
