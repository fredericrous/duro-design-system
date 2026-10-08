import {useState, type ReactNode} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor, within} from 'storybook/test'
import {html} from 'react-strict-dom'
import {LAYERS} from '@duro-app/tokens/keys'
import {Popover} from './Popover'
import {Button} from '../Button/Button'
import {Dialog} from '../Dialog/Dialog'
import {Drawer} from '../Drawer/Drawer'
import {Select} from '../Select/Select'
import {Stack} from '../Stack/Stack'
import {Text} from '../Text/Text'
import {useInModal} from '../../index'

/**
 * `Popover.Popup raised`: one floating surface over another (a link editor
 * over a selection format bar). Outside a modal it is `floatingRaised` (60),
 * inside a Dialog or Drawer `popoverRaised` (1041). The raised Popover renders
 * first, so without the layer the plain one, portalled after it, would be on
 * top.
 */
const meta: Meta = {
  title: 'Components/Popover/Raised',
}

export default meta
type Story = StoryObj

const page = () => within(document.body)

/** A small rect at the viewport's centre: every Popover here anchors to it. */
const centre = () => new DOMRect(window.innerWidth / 2 - 10, window.innerHeight / 2 - 10, 20, 20)

/** True when the element drawn at (x, y) is `el` or inside it. */
const drawnAt = (el: Element, x: number, y: number) => {
  const hit = document.elementFromPoint(x, y)
  return hit !== null && el.contains(hit)
}

const centreOf = (el: Element) => {
  const r = el.getBoundingClientRect()
  return [r.left + r.width / 2, r.top + r.height / 2] as const
}

const zIndexOf = (el: Element) => getComputedStyle(el).zIndex

/** The format bar: wider and taller than the link editor drawn over it. */
function FormatBar() {
  return (
    <Popover.Root defaultOpen anchor={centre} align="center">
      <Popover.Popup label="Format bar">
        <Stack gap="md">
          <Text>Bold · Italic · Underline · Strikethrough · Code · Link</Text>
          <Text>Second row of formatting</Text>
          <Text>Third row of formatting</Text>
        </Stack>
      </Popover.Popup>
    </Popover.Root>
  )
}

function LinkEditor({children}: {children?: ReactNode}) {
  return (
    <Popover.Root defaultOpen anchor={centre} align="center">
      <Popover.Popup label="Link editor" raised>
        <Stack gap="sm">
          <Text>https://</Text>
          {children}
        </Stack>
      </Popover.Popup>
    </Popover.Root>
  )
}

/** Raised first, then the plain one: DOM order alone would put the bar on top. */
function Pair({children}: {children?: ReactNode}) {
  return (
    <>
      <LinkEditor>{children}</LinkEditor>
      <FormatBar />
    </>
  )
}

function OpenDialog({children}: {children: ReactNode}) {
  return (
    <Dialog.Root open>
      <Dialog.Portal size="sm">
        <Dialog.Header>
          <Dialog.Title>Editor</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Stack gap="md">
            {/* Enough body for the panel to reach under the Popovers. */}
            {['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'].map((n) => (
              <Text key={n}>{`${n} paragraph of the document being edited.`}</Text>
            ))}
            {children}
          </Stack>
        </Dialog.Body>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

async function expectRaisedOverBar(layer: number) {
  const editor = await page().findByRole('dialog', {name: 'Link editor'})
  const bar = await page().findByRole('dialog', {name: 'Format bar'})
  await expect(zIndexOf(editor)).toBe(String(layer))
  await waitFor(() => expect(drawnAt(editor, ...centreOf(editor))).toBe(true))
  // The bar is still drawn where the editor does not cover it.
  const b = bar.getBoundingClientRect()
  const e = editor.getBoundingClientRect()
  await expect(b.left).toBeLessThan(e.left)
  await expect(drawnAt(bar, b.left + 2, b.top + b.height / 2)).toBe(true)
  return {editor, bar}
}

/** Outside a modal: the raised editor (60) is over the bar (50). */
export const RaisedOverFloating: Story = {
  render: () => <Pair />,
  play: async () => {
    const {bar} = await expectRaisedOverBar(LAYERS.floatingRaised)
    await expect(zIndexOf(bar)).toBe(String(LAYERS.floating))
  },
}

/** Inside an open Dialog: the raised editor (1041) is over the bar (1040),
 *  and both are over the Dialog panel. */
export const RaisedInDialog: Story = {
  render: () => (
    <OpenDialog>
      <Pair />
    </OpenDialog>
  ),
  play: async () => {
    const {editor, bar} = await expectRaisedOverBar(LAYERS.popoverRaised)
    await expect(zIndexOf(bar)).toBe(String(LAYERS.popover))
    // Both overlap the panel and are drawn there: the editor at its centre,
    // the bar where the editor leaves it uncovered.
    const panel = page().getByRole('dialog', {name: 'Editor'})
    const p = panel.getBoundingClientRect()
    const b = bar.getBoundingClientRect()
    const e = editor.getBoundingClientRect()
    // Under the editor, inside the bar.
    const x = b.left + b.width / 2
    const y = (e.bottom + b.bottom) / 2
    await expect(x > p.left && x < p.right && y > p.top && y < p.bottom).toBe(true)
    await expect(drawnAt(bar, x, y)).toBe(true)
    const [ex, ey] = centreOf(editor)
    await expect(ex > p.left && ex < p.right && ey > p.top && ey < p.bottom).toBe(true)
    await expect(drawnAt(editor, ex, ey)).toBe(true)
  },
}

/** The Settings dialog's centre once it is open, the viewport's before. */
const settingsCentre = () => {
  const dialog = page().queryByRole('dialog', {name: 'Settings'})
  if (!dialog) return centre()
  // Just above the centre: the editor opens below its anchor, over the centre.
  const [x, y] = centreOf(dialog)
  return new DOMRect(x - 10, y - 30, 20, 20)
}

function RaisedThenDialog() {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <>
      <Popover.Root open anchor={settingsCentre} align="center">
        <Popover.Popup label="Link editor" raised>
          <Text>Stays open: controlled</Text>
        </Popover.Popup>
      </Popover.Root>
      <html.button type="button" onClick={() => setDialogOpen(true)}>
        Open dialog
      </html.button>
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal size="sm">
          <Dialog.Header>
            <Dialog.Title>Settings</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text>A modal opened over a raised Popover.</Text>
          </Dialog.Body>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

/** A raised Popover held open, then a Dialog: the Popover is still mounted
 *  and the Dialog covers it at the Dialog's centre. */
export const DialogOverRaised: Story = {
  render: () => <RaisedThenDialog />,
  play: async ({canvas}) => {
    const editor = await page().findByRole('dialog', {name: 'Link editor'})
    await userEvent.click(canvas.getByRole('button', {name: 'Open dialog'}))
    const dialog = await page().findByRole('dialog', {name: 'Settings'})
    await expect(editor).toBeInTheDocument()
    // Re-place the editor against the open Dialog, so it sits under the
    // Dialog's centre: the check below is not vacuous.
    window.dispatchEvent(new Event('resize'))
    await waitFor(() => {
      const [x, y] = centreOf(dialog)
      const e = editor.getBoundingClientRect()
      expect(x >= e.left && x <= e.right && y >= e.top && y <= e.bottom).toBe(true)
    })
    const [x, y] = centreOf(dialog)
    await waitFor(() => expect(drawnAt(dialog, x, y)).toBe(true))
  },
}

/** A Popover nested in a raised one inherits `raised`: it is drawn over its
 *  parent, not at the plain layer under it. */
function NestedInRaised() {
  return (
    <Popover.Root defaultOpen anchor={centre} align="center">
      <Popover.Popup label="Link editor" raised>
        <Stack gap="md">
          <Popover.Root align="center">
            <Popover.Trigger>Open child</Popover.Trigger>
            <Popover.Popup label="Child">
              <Text>Child</Text>
            </Popover.Popup>
          </Popover.Root>
          <Text>Parent: a raised Popover, wider than the child</Text>
          <Text>Second row</Text>
          <Text>Third row</Text>
          <Text>Fourth row</Text>
        </Stack>
      </Popover.Popup>
    </Popover.Root>
  )
}

async function expectChildOnTop(layer: number) {
  await userEvent.click(await page().findByRole('button', {name: 'Open child'}))
  const child = await page().findByRole('dialog', {name: 'Child'})
  // Non-vacuous: the child overlaps its parent.
  const parent = page().getByRole('dialog', {name: 'Link editor'}).getBoundingClientRect()
  const [cx, cy] = centreOf(child)
  await expect(cx > parent.left && cx < parent.right && cy > parent.top && cy < parent.bottom).toBe(
    true,
  )
  await expect(zIndexOf(child)).toBe(String(layer))
  await waitFor(() => expect(drawnAt(child, ...centreOf(child))).toBe(true))
}

export const NestedInRaised_NoModal: Story = {
  name: 'Nested in raised, no modal',
  render: () => <NestedInRaised />,
  play: async () => expectChildOnTop(LAYERS.floatingRaised),
}

export const NestedInRaised_InDialog: Story = {
  name: 'Nested in raised, in a Dialog',
  render: () => (
    <OpenDialog>
      <NestedInRaised />
    </OpenDialog>
  ),
  play: async () => expectChildOnTop(LAYERS.popoverRaised),
}

/** A Select opened from a raised Popover in a Dialog: its listbox (popup,
 *  1050) is on top. */
export const SelectInRaisedInDialog: Story = {
  render: () => (
    <OpenDialog>
      <Pair>
        <Select.Root defaultValue="https">
          <Select.Trigger aria-label="Scheme">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Popup>
            <Select.Item value="https">https</Select.Item>
            <Select.Item value="mailto">mailto</Select.Item>
            <Select.Item value="tel">tel</Select.Item>
          </Select.Popup>
        </Select.Root>
      </Pair>
    </OpenDialog>
  ),
  play: async () => {
    await userEvent.click(await page().findByRole('combobox', {name: 'Scheme'}))
    const listbox = await page().findByRole('listbox')
    await expect(zIndexOf(listbox)).toBe(String(LAYERS.popup))
    for (const name of ['https', 'mailto', 'tel']) {
      const option = await page().findByRole('option', {name})
      await waitFor(() => expect(drawnAt(option, ...centreOf(option))).toBe(true))
    }
  },
}

function InModalProbe({label}: {label: string}) {
  return <Text>{`${label}: ${String(useInModal())}`}</Text>
}

/** `useInModal()` from the package root: true in a Dialog and a Drawer,
 *  false outside. */
export const UseInModal: Story = {
  render: () => (
    <>
      <InModalProbe label="page" />
      <Button>Unrelated</Button>
      <Dialog.Root open>
        <Dialog.Portal size="sm">
          <Dialog.Header>
            <Dialog.Title>In a dialog</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <InModalProbe label="dialog" />
          </Dialog.Body>
        </Dialog.Portal>
      </Dialog.Root>
      <Drawer.Root open>
        <Drawer.Portal>
          <Drawer.Header>
            <Drawer.Title>In a drawer</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <InModalProbe label="drawer" />
          </Drawer.Body>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  ),
  play: async () => {
    await expect(await page().findByText('page: false')).toBeInTheDocument()
    await expect(await page().findByText('dialog: true')).toBeInTheDocument()
    await expect(await page().findByText('drawer: true')).toBeInTheDocument()
  },
}
