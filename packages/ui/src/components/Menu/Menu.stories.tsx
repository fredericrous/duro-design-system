import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, spyOn, waitFor, within} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {Menu} from './Menu'
import {Button} from '../Button/Button'
import {Dialog} from '../Dialog/Dialog'
import {Icon} from '../Icon/Icon'
import {onThemeSurface} from '../../docs/themedSurface'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {withCoarsePointer, withFinePointer} from '../../docs/coarsePointer'

const meta: Meta = {
  title: 'Components/Menu',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const handleSettings = fn()
    const handleProfile = fn()
    return (
      <Menu.Root>
        <Menu.Trigger>
          Options{' '}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{verticalAlign: 'middle'}}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onClick={handleSettings}>Settings</Menu.Item>
          <Menu.Item onClick={handleProfile}>Profile</Menu.Item>
          <Menu.Item>Logout</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    )
  },
  play: async ({canvas}) => {
    const trigger = canvas.getByRole('button', {name: /Options/})
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
  },
}

export const OpenClose: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>Options</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Settings</Menu.Item>
        <Menu.Item>Profile</Menu.Item>
        <Menu.Item>Logout</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: /Options/})

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const items = page().getAllByRole('menuitem')
    await expect(items.length).toBe(3)

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(page().queryByRole('menu')).not.toBeInTheDocument())
  },
}

export const KeyboardNavigation: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>
        Navigate{' '}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{verticalAlign: 'middle'}}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>First</Menu.Item>
        <Menu.Item>Second</Menu.Item>
        <Menu.Item>Third</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: /Navigate/})
    await userEvent.click(trigger)
    await expect(page().getByRole('menu')).toBeInTheDocument()
  },
}

export const WithLinks: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>
        Account{' '}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{verticalAlign: 'middle'}}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.LinkItem href="#admin">Admin</Menu.LinkItem>
        <Menu.LinkItem href="#settings">Settings</Menu.LinkItem>
        <Menu.LinkItem href="#logout">Logout</Menu.LinkItem>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: /Account/}))

    const items = page().getAllByRole('menuitem')
    await expect(items.length).toBe(3)

    // Link items should be anchor elements with href
    await expect(items[0].tagName).toBe('A')
    await expect(items[0]).toHaveAttribute('href', '#admin')
  },
}

export const WithSeparator: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>History</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Added SCADA to Operations</Menu.Item>
        <Menu.Item>Renamed 2 capabilities</Menu.Item>
        <Menu.Separator />
        <Menu.Item>See full history</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: /History/}))
    const menu = page().getByRole('menu')
    const separator = page().getByRole('separator')
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    // The separator is not an item: three items, and arrows pass over it.
    const items = page().getAllByRole('menuitem')
    await expect(items.length).toBe(3)
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await expect(menu).toHaveAttribute('aria-activedescendant', items[2].id)
  },
}

// Misuse on purpose, so it runs as a test but stays out of the sidebar:
// Menu.Trigger is the button, and a Button inside it earns a dev warning.
export const NestedControlWarns: Story = {
  tags: ['!dev', '!autodocs'],
  beforeEach: () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    return () => warn.mockRestore()
  },
  render: () => (
    <Menu.Root>
      <Menu.Trigger>
        <Button variant="secondary">Nested</Button>
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Edit</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async () => {
    await expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Menu.Trigger is itself the button'),
    )
  },
}

// The popup is portalled into the ThemeProvider mount: query the document.
const page = () => within(document.body)

const storyStyles = css.create({
  scroller: {
    height: sizes.panelSm,
    overflow: 'auto',
    borderWidth: 0,
  },
  toolbar: {
    position: 'sticky',
    top: 0,
    overflow: 'auto',
    display: 'flex',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.bgCard,
  },
  filler: {
    height: sizes.pageMd,
  },
  editor: {
    minHeight: sizes.editorMinH,
    padding: spacing.sm,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
})

// react-strict-dom has no contentEditable prop; a rich-text editor sets it.
const makeEditable = (el: HTMLElement | null) => el?.setAttribute('contenteditable', 'true')

const THIRTY = Array.from({length: 30}, (_, i) => `Action ${i + 1}`)

// A sticky, overflow:auto toolbar used to clip the popup; portalled, it is
// placed in the viewport and scrolls inside its own max height.
export const InStickyOverflowToolbar: Story = {
  render: () => (
    <html.div style={storyStyles.scroller}>
      <html.div style={storyStyles.toolbar}>
        <Menu.Root>
          <Menu.Trigger>Insert</Menu.Trigger>
          <Menu.Popup>
            {THIRTY.map((label) => (
              <Menu.Item key={label}>{label}</Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Root>
      </html.div>
      <html.div style={storyStyles.filler} />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Insert'}))
    const menu = await page().findByRole('menu', {name: 'Insert'})
    const box = menu.getBoundingClientRect()
    await expect(box.top).toBeGreaterThanOrEqual(0)
    await expect(box.left).toBeGreaterThanOrEqual(0)
    await expect(box.bottom).toBeLessThanOrEqual(window.innerHeight)
    await expect(box.right).toBeLessThanOrEqual(window.innerWidth)
    await expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight)
    await expect(page().getAllByRole('menuitem')).toHaveLength(30)
    // The last item scrolls into view when it is highlighted.
    await userEvent.keyboard('{End}')
    const last = page().getByRole('menuitem', {name: 'Action 30'})
    const lastBox = last.getBoundingClientRect()
    await expect(lastBox.bottom).toBeLessThanOrEqual(menu.getBoundingClientRect().bottom + 1)
  },
}

// APG menu button: focus moves to the menu, and the menu's
// aria-activedescendant names the highlighted item.
export const FocusAndActiveDescendant: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>Edit</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Cut</Menu.Item>
        <Menu.Item>Copy</Menu.Item>
        <Menu.Item>Paste</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: 'Edit'})
    await userEvent.click(trigger)
    const menu = await page().findByRole('menu', {name: 'Edit'})
    await waitFor(() => expect(document.activeElement).toBe(menu))
    await userEvent.keyboard('{ArrowDown}')
    const copy = page().getByRole('menuitem', {name: 'Copy'})
    await expect(document.activeElement).toBe(menu)
    await expect(menu).toHaveAttribute('aria-activedescendant', copy.id)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(page().queryByRole('menu')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

// One Escape closes the innermost layer only: the Menu, not its Dialog.
const onMenuOpenChange = fn()
const onDialogOpenChange = fn()

export const EscapeInsideDialog: Story = {
  beforeEach: () => {
    onMenuOpenChange.mockClear()
    onDialogOpenChange.mockClear()
  },
  render: () => (
    <Dialog.Root defaultOpen onOpenChange={onDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Header>
          <Dialog.Title>Format</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Menu.Root onOpenChange={onMenuOpenChange}>
            <Menu.Trigger>Align</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Left</Menu.Item>
              <Menu.Item>Center</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
        </Dialog.Body>
      </Dialog.Portal>
    </Dialog.Root>
  ),
  play: async ({userEvent}) => {
    await userEvent.click(page().getByRole('button', {name: 'Align'}))
    await page().findByRole('menu', {name: 'Align'})
    await expect(onMenuOpenChange).toHaveBeenCalledWith(true)
    // The popup stacks above the dialog: its item is what a press hits.
    const center = page().getByRole('menuitem', {name: 'Center'})
    const box = center.getBoundingClientRect()
    await expect(
      document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2),
    ).toBe(center)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(page().queryByRole('menu')).not.toBeInTheDocument())
    // The Escape closes the menu once: onOpenChange(true) on open, then
    // exactly one onOpenChange(false).
    await expect(onMenuOpenChange.mock.calls.filter(([open]) => open === false)).toHaveLength(1)
    await expect(onMenuOpenChange).toHaveBeenLastCalledWith(false)
    await expect(onDialogOpenChange).toHaveBeenCalledTimes(0)
    await expect(page().getByRole('dialog', {name: 'Format'})).toBeInTheDocument()
  },
}

// The keydown handler sits on the menu, never on document: typing in an
// editor while the menu is open reaches the editor.
export const TypingElsewhereIsNotIntercepted: Story = {
  render: () => (
    <html.div>
      <Menu.Root>
        <Menu.Trigger>Blocks</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Heading</Menu.Item>
          <Menu.Item>Quote</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <html.div ref={makeEditable} role="textbox" aria-label="Editor" style={storyStyles.editor} />
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Blocks'}))
    await page().findByRole('menu', {name: 'Blocks'})
    const editor = canvas.getByRole('textbox', {name: 'Editor'})
    editor.focus()
    await userEvent.keyboard('a b{ArrowDown}c')
    await expect(editor).toHaveTextContent('a bc')
    await expect(page().getByRole('menu', {name: 'Blocks'})).not.toHaveAttribute(
      'aria-activedescendant',
      page().getByRole('menuitem', {name: 'Quote'}).id,
    )
  },
}

// A toolbar icon trigger: ghost variant, named by aria-label, ref forwarded.
export const GhostIconTrigger: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger variant="ghost" aria-label="More actions">
        <Icon name="menu" size="sm" />
      </Menu.Trigger>
      <Menu.Popup align="end">
        <Menu.Item>Rename</Menu.Item>
        <Menu.Item>Delete</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('button', {name: 'More actions'})
    await userEvent.click(trigger)
    await expect(await page().findByRole('menu', {name: 'More actions'})).toBeVisible()
  },
}

const onRename = fn()

// Enter activates the highlighted item exactly once.
export const EnterActivatesOnce: Story = {
  beforeEach: () => {
    onRename.mockClear()
  },
  render: () => (
    <Menu.Root>
      <Menu.Trigger>File</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item onClick={onRename}>Rename</Menu.Item>
        <Menu.Item>Delete</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'File'}))
    await page().findByRole('menu', {name: 'File'})
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(page().queryByRole('menu')).not.toBeInTheDocument())
    await expect(onRename).toHaveBeenCalledTimes(1)
  },
}

// Tab from a menu portalled out of a Dialog closes it and continues from the
// trigger, so focus lands on the next control in the dialog. Under the Vitest
// browser runner a real keyboard (Playwright) presses Tab; the simulated
// keydown below is what the Storybook UI can run.
export const TabInsideDialog: Story = {
  render: () => (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Header>
          <Dialog.Title>Insert</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Menu.Root>
            <Menu.Trigger>Block</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Quote</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
          <Button variant="secondary">After</Button>
        </Dialog.Body>
      </Dialog.Portal>
    </Dialog.Root>
  ),
  play: async ({userEvent}) => {
    const trigger = page().getByRole('button', {name: 'Block'})
    await userEvent.click(trigger)
    const menu = await page().findByRole('menu', {name: 'Block'})
    menu.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true}))
    await waitFor(() => expect(page().queryByRole('menu')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()

    const keyboard = await realKeyboard()
    if (!keyboard) return
    await userEvent.click(trigger)
    await page().findByRole('menu', {name: 'Block'})
    await keyboard('{Tab}')
    await waitFor(() => expect(page().queryByRole('menu')).not.toBeInTheDocument())
    await expect(page().getByRole('button', {name: 'After'})).toHaveFocus()
  },
}

/**
 * The Vitest browser runner's keyboard, which drives the browser itself
 * (Playwright) so Tab moves focus the way a person's would. Outside that
 * runner (the Storybook UI) the module throws on import, and there is none.
 */
async function realKeyboard(): Promise<((keys: string) => Promise<void>) | null> {
  try {
    const {userEvent} = await import('vitest/browser')
    return (keys) => userEvent.keyboard(keys)
  } catch {
    return null
  }
}

/**
 * A touch screen gets 44px triggers (coarse pointer), the default and the
 * ghost variant alike; a mouse keeps the compact control.
 * It drives Chrome's touch emulation through Vitest's CDP session, so it runs
 * as a test and stays out of the dev sidebar (there is no Vitest there).
 */
export const TouchTargets: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  render: () => (
    <html.div style={touchStyles.row}>
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Rename</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <Menu.Root>
        <Menu.Trigger variant="ghost" aria-label="Page actions">
          <Icon name="menu" size="sm" />
        </Menu.Trigger>
        <Menu.Popup align="end">
          <Menu.Item>Copy link</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <Menu.Root>
        <Menu.Trigger size="small">Sort</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Name</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    const triggers = () => [
      canvas.getByRole('button', {name: 'Actions'}),
      canvas.getByRole('button', {name: 'Page actions'}),
      canvas.getByRole('button', {name: 'Sort'}),
    ]
    await withFinePointer()
    const ghost = canvas.getByRole('button', {name: 'Page actions'}).getBoundingClientRect()
    await expect(ghost.height).toBeLessThan(SIZES_PX.touchTarget)
    await withCoarsePointer(async () => {
      for (const trigger of triggers()) {
        await waitFor(() => {
          const box = trigger.getBoundingClientRect()
          expect(box.height).toBeGreaterThanOrEqual(SIZES_PX.touchTarget)
          expect(box.width).toBeGreaterThanOrEqual(SIZES_PX.touchTarget)
        })
      }
    })
  },
}

const touchStyles = css.create({
  row: {display: 'flex', gap: spacing.md, alignItems: 'center'},
})
