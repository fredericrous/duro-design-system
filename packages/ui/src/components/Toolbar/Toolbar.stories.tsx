import {useEffect, useRef, useState} from 'react'
import {hydrateRoot} from 'react-dom/client'
import {renderToString} from 'react-dom/server'
import type {Meta, StoryObj} from '@storybook/react'
import {html} from 'react-strict-dom'
import {expect, userEvent, waitFor, within} from 'storybook/test'
import {RADII_PX} from '@duro-app/tokens/keys'
import {Toolbar} from './Toolbar'
import {Button} from '../Button/Button'
import {ButtonGroup} from '../ButtonGroup/ButtonGroup'
import {Field} from '../Field/Field'
import {Input} from '../Input/Input'
import {Menu} from '../Menu/Menu'
import {Popover} from '../Popover/Popover'
import {Select} from '../Select/Select'
import {Stack} from '../Stack/Stack'
import {Toggle} from '../Toggle/Toggle'

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
}

export default meta
type Story = StoryObj<typeof Toolbar>

const page = () => within(document.body)
const R = `${RADII_PX.sm}px`

function TextStyle() {
  return (
    <ButtonGroup attached aria-label="Text style">
      <Select.Root defaultValue="normal">
        <Select.Trigger aria-label="Block type">
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          <Select.Item value="normal">Normal</Select.Item>
          <Select.Item value="h1">Heading 1</Select.Item>
        </Select.Popup>
      </Select.Root>
      <Select.Root defaultValue="arial">
        <Select.Trigger aria-label="Font">
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          <Select.Item value="arial">Arial</Select.Item>
          <Select.Item value="georgia">Georgia</Select.Item>
        </Select.Popup>
      </Select.Root>
      <Select.Root defaultValue="15">
        <Select.Trigger aria-label="Font size">
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          <Select.Item value="13">13px</Select.Item>
          <Select.Item value="15">15px</Select.Item>
        </Select.Popup>
      </Select.Root>
    </ButtonGroup>
  )
}

function LinkPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger aria-label="Link">↗</Popover.Trigger>
      <Popover.Popup label="Link">
        <Stack gap="sm">
          <Field.Root>
            <Field.Label>URL</Field.Label>
            <Input defaultValue="https://duro.app" />
          </Field.Root>
          <Button size="small">Apply</Button>
        </Stack>
      </Popover.Popup>
    </Popover.Root>
  )
}

function Format() {
  const [pressed, setPressed] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => (next: boolean) => setPressed((p) => ({...p, [key]: next}))
  return (
    <ButtonGroup attached aria-label="Format">
      <Toggle aria-label="Bold" pressed={!!pressed.b} onPressedChange={toggle('b')}>
        B
      </Toggle>
      <Toggle aria-label="Italic" pressed={!!pressed.i} onPressedChange={toggle('i')}>
        I
      </Toggle>
      <Toggle aria-label="Underline" pressed={!!pressed.u} onPressedChange={toggle('u')}>
        U
      </Toggle>
      <Toggle aria-label="Code" pressed={!!pressed.code} onPressedChange={toggle('code')}>
        {'<>'}
      </Toggle>
      <LinkPopover />
      <Button variant="secondary" aria-label="Clear formatting">
        T
      </Button>
      <Popover.Root>
        <Popover.Trigger aria-label="Highlight">H</Popover.Trigger>
        <Popover.Popup label="Highlight">
          <Button size="small">Purple</Button>
        </Popover.Popup>
      </Popover.Root>
    </ButtonGroup>
  )
}

function InsertMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger>Insert</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Table</Menu.Item>
        <Menu.Item>Image</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  )
}

function Editor() {
  return (
    <Toolbar aria-label="Formatting">
      <TextStyle />
      <Format />
      <InsertMenu />
    </Toolbar>
  )
}

/** Every focusable control of the toolbar, in order: 3 + 7 + 1. */
const CONTROLS = [
  'Block type',
  'Font',
  'Font size',
  'Bold',
  'Italic',
  'Underline',
  'Code',
  'Link',
  'Clear formatting',
  'Highlight',
  'Insert',
]

function control(name: string) {
  return page().getByRole(
    ['Block type', 'Font', 'Font size'].includes(name) ? 'combobox' : 'button',
    {name},
  )
}

/** [Normal | Arial | 15px] and [B | I | U | <> | link | T | highlight], then Insert. */
export const Default: Story = {
  render: () => <Editor />,
  play: async ({canvas}) => {
    await expect(canvas.getByRole('toolbar', {name: 'Formatting'})).toBeInTheDocument()
    // One tab stop.
    await waitFor(() =>
      expect(CONTROLS.map((name) => control(name).tabIndex)).toEqual(
        CONTROLS.map((_, i) => (i === 0 ? 0 : -1)),
      ),
    )
  },
}

/** Tab enters once; ArrowRight crosses the groups; End and Home reach the ends. */
export const ArrowKeys: Story = {
  render: () => (
    <Stack gap="sm">
      <Button variant="secondary">Before</Button>
      <Editor />
    </Stack>
  ),
  play: async ({canvas}) => {
    canvas.getByRole('button', {name: 'Before'}).focus()
    await userEvent.tab()
    await expect(control(CONTROLS[0])).toHaveFocus()
    for (let i = 1; i <= 8; i++) {
      await userEvent.keyboard('{ArrowRight}')
      await expect(control(CONTROLS[i])).toHaveFocus()
    }
    await userEvent.keyboard('{End}')
    await expect(control(CONTROLS[CONTROLS.length - 1])).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(control(CONTROLS[0])).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(control(CONTROLS[0])).toHaveFocus()
    // Tab leaves the toolbar in one press, and Shift+Tab comes back to the
    // control last focused.
    await userEvent.keyboard('{End}')
    await userEvent.tab()
    await expect(document.activeElement?.closest('[role="toolbar"]')).toBeNull()
    await userEvent.tab({shift: true})
    await expect(control('Insert')).toHaveFocus()
  },
}

/** A closed Select takes ArrowDown: it opens, and Escape closes it on its trigger. */
export const SelectArrowDown: Story = {
  render: () => <Editor />,
  play: async () => {
    const font = control('Font')
    font.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(font).toHaveAttribute('aria-expanded', 'true')
    await expect(font).toHaveFocus()
    await expect(page().getByRole('listbox')).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await expect(font).toHaveAttribute('aria-expanded', 'false')
    await expect(font).toHaveFocus()
  },
}

/** ArrowRight while a Select is open: focus stays on its trigger, the listbox stays open. */
export const SelectOpenKeepsArrows: Story = {
  render: () => <Editor />,
  play: async () => {
    const font = control('Font')
    font.focus()
    await userEvent.keyboard('{ArrowUp}')
    await expect(font).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{ArrowRight}')
    await expect(font).toHaveFocus()
    await expect(font).toHaveAttribute('aria-expanded', 'true')
    await expect(page().getByRole('listbox')).toBeVisible()
    await userEvent.keyboard('{Escape}')
  },
}

/** The link Popover's contents are outside the group and the toolbar: its
 *  Apply button is one Tab away and has all four corners round. */
export const PopoverInsideToolbar: Story = {
  render: () => <Editor />,
  play: async ({userEvent}) => {
    await userEvent.click(control('Link'))
    const url = await page().findByRole('textbox', {name: 'URL'})
    await waitFor(() => expect(url).toHaveFocus())
    await userEvent.tab()
    const apply = page().getByRole('button', {name: 'Apply'})
    await expect(apply).toHaveFocus()
    const cs = getComputedStyle(apply)
    await expect([
      cs.borderTopLeftRadius,
      cs.borderTopRightRadius,
      cs.borderBottomRightRadius,
      cs.borderBottomLeftRadius,
    ]).toEqual([R, R, R, R])
    await expect(apply).not.toHaveAttribute('tabindex', '-1')
  },
}

/** ArrowLeft typed in the Popover's input moves the caret, not toolbar focus. */
export const PopoverInputKeepsArrows: Story = {
  render: () => <Editor />,
  play: async ({userEvent}) => {
    await userEvent.click(control('Link'))
    const url = (await page().findByRole('textbox', {name: 'URL'})) as HTMLInputElement
    await waitFor(() => expect(url).toHaveFocus())
    url.setSelectionRange(url.value.length, url.value.length)
    const end = url.selectionStart ?? 0
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    await expect(url).toHaveFocus()
    await expect(url.selectionStart).toBe(end - 2)
  },
}

/** A control that handles ArrowRight itself (preventDefault) keeps it. */
function GreedyButton() {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') e.preventDefault()
    }
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [])
  return (
    <Button ref={ref} variant="secondary">
      Stepper
    </Button>
  )
}

export const ControlKeepsHandledKeys: Story = {
  render: () => (
    <Toolbar aria-label="Playback">
      <GreedyButton />
      <Button variant="secondary">Next</Button>
    </Toolbar>
  ),
  play: async ({canvas}) => {
    const stepper = canvas.getByRole('button', {name: 'Stepper'})
    stepper.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(stepper).toHaveFocus()
  },
}

/** Vertical: Up/Down move. */
export const Vertical: Story = {
  render: () => (
    <Toolbar aria-label="Tools" orientation="vertical">
      <ButtonGroup attached orientation="vertical" aria-label="Draw">
        <Button variant="secondary">Pen</Button>
        <Button variant="secondary">Eraser</Button>
      </ButtonGroup>
      <Button variant="secondary">Undo</Button>
    </Toolbar>
  ),
  play: async ({canvas}) => {
    const pen = canvas.getByRole('button', {name: 'Pen'})
    pen.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('button', {name: 'Eraser'})).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('button', {name: 'Undo'})).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect(canvas.getByRole('button', {name: 'Eraser'})).toHaveFocus()
  },
}

/**
 * Server render: no control has registered yet, so every control in an
 * attached group renders `middle` (square, joined) and every control is in
 * the tab order. Hydration matches that markup exactly, then the outer
 * corners round and the toolbar takes one tab stop.
 */
function SsrToolbar() {
  return (
    <Toolbar aria-label="Server">
      <ButtonGroup attached aria-label="Actions">
        <Button variant="secondary">One</Button>
        <Button variant="secondary">Two</Button>
        <Button variant="secondary">Three</Button>
      </ButtonGroup>
    </Toolbar>
  )
}

export const ServerRender: Story = {
  render: () => <html.div data-ssr-host="" />,
  play: async ({canvasElement}) => {
    const host = canvasElement.querySelector('[data-ssr-host]') as HTMLElement
    host.innerHTML = renderToString(<SsrToolbar />)
    const buttons = () => [...host.querySelectorAll('button')]
    const radii = (el: Element) => {
      const cs = getComputedStyle(el)
      return [
        cs.borderTopLeftRadius,
        cs.borderTopRightRadius,
        cs.borderBottomRightRadius,
        cs.borderBottomLeftRadius,
      ]
    }
    // Server markup: all middle, no roving tabindex yet.
    for (const b of buttons()) {
      await expect(radii(b)).toEqual(['0px', '0px', '0px', '0px'])
      await expect(b.hasAttribute('tabindex')).toBe(false)
    }
    const errors: unknown[] = []
    const consoleError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
      consoleError(...args)
    }
    const root = hydrateRoot(host, <SsrToolbar />, {
      onRecoverableError: (error) => errors.push(error),
    })
    try {
      await waitFor(() => expect(radii(buttons()[0])).toEqual([R, '0px', '0px', R]))
      await expect(radii(buttons()[1])).toEqual(['0px', '0px', '0px', '0px'])
      await expect(radii(buttons()[2])).toEqual(['0px', R, R, '0px'])
      await expect(buttons().map((b) => b.tabIndex)).toEqual([0, -1, -1])
      await expect(errors).toEqual([])
    } finally {
      console.error = consoleError
      root.unmount()
    }
  },
}
