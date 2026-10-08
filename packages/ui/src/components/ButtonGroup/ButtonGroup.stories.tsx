import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, waitFor, within} from 'storybook/test'
import {
  BORDERS_PX,
  FONT_SIZE_REM,
  LAYERS,
  RADII_PX,
  SIZES_PX,
  SPACING_PX,
} from '@duro-app/tokens/keys'
import {withCoarsePointer, withFinePointer} from '../../docs/coarsePointer'
import {ButtonGroup} from './ButtonGroup'
import type {ControlSize} from '../../shared/types'
import {Button} from '../Button/Button'
import {Icon} from '../Icon/Icon'
import {Inline} from '../Inline/Inline'
import {Menu} from '../Menu/Menu'
import {Popover} from '../Popover/Popover'
import {Select} from '../Select/Select'
import {Stack} from '../Stack/Stack'
import {Text} from '../Text/Text'
import {ThemeProvider, type ThemeName} from '../ThemeProvider/ThemeProvider'
import {Toggle} from '../Toggle/Toggle'

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    align: {control: 'select', options: ['start', 'end', 'center']},
    gap: {control: 'select', options: ['xs', 'sm', 'md']},
    disabled: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof ButtonGroup>

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </ButtonGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toBeInTheDocument()
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(3)
  },
}

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </ButtonGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toBeInTheDocument()
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(3)
  },
}

export const EndAligned: Story = {
  render: () => (
    <ButtonGroup align="end">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </ButtonGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toBeInTheDocument()
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(2)
  },
}

export const Disabled: Story = {
  render: () => (
    <ButtonGroup disabled>
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </ButtonGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toBeInTheDocument()
    await expect(group).toHaveStyle({opacity: '0.5', pointerEvents: 'none'})
  },
}

export const WithGaps: Story = {
  render: () => (
    <Stack gap="lg">
      <ButtonGroup gap="xs">
        <Button variant="primary">XS Gap</Button>
        <Button variant="secondary">XS Gap</Button>
      </ButtonGroup>
      <ButtonGroup gap="sm">
        <Button variant="primary">SM Gap</Button>
        <Button variant="secondary">SM Gap</Button>
      </ButtonGroup>
      <ButtonGroup gap="md">
        <Button variant="primary">MD Gap</Button>
        <Button variant="secondary">MD Gap</Button>
      </ButtonGroup>
    </Stack>
  ),
  play: async ({canvas}) => {
    const groups = canvas.getAllByRole('group')
    await expect(groups.length).toBe(3)
  },
}

// --- Attached (5.3) ---

const R = `${RADII_PX.sm}px`

/** The four computed corner radii, clockwise from top-left. */
function corners(el: Element) {
  const cs = getComputedStyle(el)
  return [
    cs.borderTopLeftRadius,
    cs.borderTopRightRadius,
    cs.borderBottomRightRadius,
    cs.borderBottomLeftRadius,
  ]
}

const EXPECTED_CORNERS = {
  first: [R, '0px', '0px', R],
  middle: ['0px', '0px', '0px', '0px'],
  last: ['0px', R, R, '0px'],
}

/** Each control's corners match its place: outer radii.sm, inner 0. */
async function expectJoined(controls: Element[]) {
  await expect(controls.length).toBeGreaterThan(1)
  for (const [i, el] of controls.entries()) {
    const place = i === 0 ? 'first' : i === controls.length - 1 ? 'last' : 'middle'
    await expect(corners(el)).toEqual(EXPECTED_CORNERS[place])
  }
  // No gaps: each control's left border sits on its neighbour's right one.
  for (let i = 1; i < controls.length; i++) {
    const before = controls[i - 1].getBoundingClientRect()
    const after = controls[i].getBoundingClientRect()
    await expect(Math.round(before.right - after.left)).toBe(BORDERS_PX.hairline)
  }
}

function TextStyleSelects({named = false, size}: {named?: boolean; size?: ControlSize}) {
  return (
    <ButtonGroup attached aria-label="Text style">
      <Select.Root name={named ? 'block' : undefined} defaultValue="normal">
        <Select.Trigger aria-label="Block type" size={size}>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          <Select.Item value="normal">Normal</Select.Item>
          <Select.Item value="h1">Heading 1</Select.Item>
        </Select.Popup>
      </Select.Root>
      <Select.Root name={named ? 'font' : undefined} defaultValue="arial">
        <Select.Trigger aria-label="Font" size={size}>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          <Select.Item value="arial">Arial</Select.Item>
          <Select.Item value="georgia">Georgia</Select.Item>
        </Select.Popup>
      </Select.Root>
      <Select.Root name={named ? 'size' : undefined} defaultValue="15">
        <Select.Trigger aria-label="Font size" size={size}>
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

/** [Normal | Arial | 15px]: three Selects joined into one control. */
export const AttachedSelects: Story = {
  render: () => <TextStyleSelects />,
  play: async ({canvas}) => {
    await expectJoined(canvas.getAllByRole('combobox'))
  },
}

/** Named Selects render a hidden input before each trigger; position comes
 *  from DOM order, so the trigger buttons still join. */
export const AttachedNamedSelects: Story = {
  render: () => <TextStyleSelects named />,
  play: async ({canvas, canvasElement}) => {
    await expect(canvasElement.querySelectorAll('input[type="hidden"]').length).toBe(3)
    await expectJoined(canvas.getAllByRole('combobox'))
  },
}

const THEMES: ThemeName[] = ['dark', 'light', 'high-contrast']

export const AttachedSelectsThemes: Story = {
  render: () => (
    <Stack gap="md">
      {THEMES.map((theme) => (
        <ThemeProvider key={theme} theme={theme}>
          <Stack gap="xs">
            <Text variant="label">{theme}</Text>
            <TextStyleSelects />
          </Stack>
        </ThemeProvider>
      ))}
    </Stack>
  ),
  play: async ({canvas}) => {
    const groups = canvas.getAllByRole('group', {name: 'Text style'})
    await expect(groups.length).toBe(3)
    for (const group of groups) await expectJoined(within(group).getAllByRole('combobox'))
  },
}

/** Keyboard focus on the middle Select: it rises above both neighbours. */
export const AttachedFocusMiddle: Story = {
  render: () => <TextStyleSelects />,
  play: async ({canvas}) => {
    const [first, middle, last] = canvas.getAllByRole('combobox')
    first.focus()
    await userEvent.tab()
    await expect(middle).toHaveFocus()
    await expect(getComputedStyle(middle).zIndex).toBe(String(LAYERS.raised))
    await expect(getComputedStyle(first).zIndex).toBe('auto')
    await expect(getComputedStyle(last).zIndex).toBe('auto')
    // The shared edges are drawn by the focused trigger, not its neighbours.
    const r = middle.getBoundingClientRect()
    const y = r.top + r.height / 2
    await expect(middle.contains(document.elementFromPoint(r.left + 0.5, y))).toBe(true)
    await expect(middle.contains(document.elementFromPoint(r.right - 0.5, y))).toBe(true)
  },
}

function FormatGroup({size}: {size?: ControlSize}) {
  const [pressed, setPressed] = useState<Record<string, boolean>>({u: true})
  const toggle = (key: string) => (next: boolean) => setPressed((p) => ({...p, [key]: next}))
  return (
    <ButtonGroup attached aria-label="Format">
      <Toggle aria-label="Bold" size={size} pressed={!!pressed.b} onPressedChange={toggle('b')}>
        B
      </Toggle>
      <Toggle aria-label="Italic" size={size} pressed={!!pressed.i} onPressedChange={toggle('i')}>
        I
      </Toggle>
      <Toggle
        aria-label="Underline"
        size={size}
        pressed={!!pressed.u}
        onPressedChange={toggle('u')}
      >
        U
      </Toggle>
      <Toggle
        aria-label="Code"
        size={size}
        pressed={!!pressed.code}
        onPressedChange={toggle('code')}
      >
        {'<>'}
      </Toggle>
      <Popover.Root>
        <Popover.Trigger aria-label="Link" size={size}>
          ↗
        </Popover.Trigger>
        <Popover.Popup label="Link">
          <Stack gap="sm">
            <Text>Paste a URL.</Text>
            <Button size="small">Apply</Button>
          </Stack>
        </Popover.Popup>
      </Popover.Root>
      <Button variant="secondary" size={size} aria-label="Clear formatting">
        T
      </Button>
      <Button variant="secondary" size={size} aria-label="Highlight">
        H
      </Button>
    </ButtonGroup>
  )
}

/** [B | I | U | <> | link | T | highlight]: four Toggles, a Popover trigger
 *  and two icon Buttons, joined. */
export const AttachedMixed: Story = {
  render: () => <FormatGroup />,
  play: async ({canvas}) => {
    const group = canvas.getByRole('group', {name: 'Format'})
    await expectJoined(within(group).getAllByRole('button'))
  },
}

/** A pressed Toggle in an attached group keeps aria-pressed, its pressed
 *  fill and its joined corners. */
export const AttachedPressedToggle: Story = {
  render: () => <FormatGroup />,
  play: async ({canvas}) => {
    const underline = canvas.getByRole('button', {name: 'Underline'})
    await expect(underline).toHaveAttribute('aria-pressed', 'true')
    await expect(corners(underline)).toEqual(EXPECTED_CORNERS.middle)
    const bold = canvas.getByRole('button', {name: 'Bold'})
    await expect(getComputedStyle(underline).backgroundColor).not.toBe(
      getComputedStyle(bold).backgroundColor,
    )
  },
}

/** True when `el` is what is drawn at (x, y). */
const drawnAt = (el: Element, x: number, y: number) => el.contains(document.elementFromPoint(x, y))

/** The centre of the first whole pixel inside the border on each side: where
 *  the inset accent ring is drawn, after pixel snapping. */
function ringPixels(r: DOMRect) {
  const h = BORDERS_PX.hairline
  return {
    left: Math.ceil(r.left + h) + 0.5,
    right: Math.floor(r.right - h) - 0.5,
    top: Math.ceil(r.top + h) + 0.5,
    bottom: Math.floor(r.bottom - h) - 0.5,
  }
}

/** U pressed between I and <>: its accent edge shows on all four sides. */
export const PressedBetweenNeighbours: Story = {
  render: () => <FormatGroup />,
  play: async ({canvas}) => {
    const underline = canvas.getByRole('button', {name: 'Underline'})
    await expect(getComputedStyle(underline).boxShadow).toMatch(/inset/)
    const r = underline.getBoundingClientRect()
    const ring = ringPixels(r)
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    // Top and bottom: nothing overlaps, so a hit test inside the border lands on U.
    await expect(drawnAt(underline, cx, ring.top)).toBe(true)
    await expect(drawnAt(underline, cx, ring.bottom)).toBe(true)
    await expect(drawnAt(underline, cx, cy)).toBe(true)
    // Left and right: the neighbours' negative margins cover U's border and no
    // more, so the inset ring (inside the border) stays clear on both sides.
    // Measured, not hit-tested: a 1px band does not survive pixel snapping in
    // a scaled test frame.
    const h = BORDERS_PX.hairline
    const left = canvas.getByRole('button', {name: 'Italic'}).getBoundingClientRect()
    const right = canvas.getByRole('button', {name: 'Code'}).getBoundingClientRect()
    await expect(left.right).toBeLessThanOrEqual(r.left + h + 0.01)
    await expect(right.left).toBeGreaterThanOrEqual(r.right - h - 0.01)
    await expect(getComputedStyle(underline).boxShadow).toContain(`${h}px inset`)
  },
}

/** B and I both pressed, then I focused: both accent edges show, and I is
 *  drawn over the shared border, so its focus ring is not covered. */
export const BothPressedFocusSecond: Story = {
  render: () => <FormatGroup />,
  play: async ({canvas}) => {
    const bold = canvas.getByRole('button', {name: 'Bold'})
    const italic = canvas.getByRole('button', {name: 'Italic'})
    await userEvent.click(bold)
    await userEvent.click(italic)
    await expect(bold).toHaveAttribute('aria-pressed', 'true')
    await expect(italic).toHaveAttribute('aria-pressed', 'true')
    bold.focus()
    await userEvent.tab()
    await expect(italic).toHaveFocus()
    await expect(getComputedStyle(italic).zIndex).toBe(String(LAYERS.raised))
    const b = bold.getBoundingClientRect()
    const i = italic.getBoundingClientRect()
    // Sampled down the shared edge: I is on top all along it.
    for (const t of [0.25, 0.5, 0.75]) {
      const y = i.top + i.height * t
      await expect(drawnAt(italic, i.left + 0.5, y)).toBe(true)
    }
    for (const el of [bold, italic]) await expect(getComputedStyle(el).boxShadow).toMatch(/inset/)
    await expect(drawnAt(bold, b.left + b.width / 2, ringPixels(b).top)).toBe(true)
    await expect(drawnAt(bold, b.left + b.width / 2, ringPixels(b).bottom)).toBe(true)
  },
}

// --- Small triggers (5.5) ---

/** fontSizeXs in px, from the root font size. */
const smallFontPx = () =>
  `${parseFloat(getComputedStyle(document.documentElement).fontSize) * FONT_SIZE_REM.fontSizeXs}px`

/** [Normal | Arial | 15px] at size="small": joined like the default size. */
export const AttachedSelectsSmall: Story = {
  render: () => <TextStyleSelects size="small" />,
  play: async ({canvas}) => {
    const triggers = canvas.getAllByRole('combobox')
    await expectJoined(triggers)
    for (const el of triggers) {
      await expect(getComputedStyle(el).fontSize).toBe(smallFontPx())
    }
  },
}

/** The mixed format group at size="small": Toggles, the Popover trigger and
 *  the Buttons stay joined. */
export const AttachedMixedSmall: Story = {
  render: () => <FormatGroup size="small" />,
  play: async ({canvas}) => {
    const group = canvas.getByRole('group', {name: 'Format'})
    await expectJoined(within(group).getAllByRole('button'))
  },
}

function SmallControlsRow() {
  return (
    <Inline gap="sm" align="center">
      <Toggle size="small" aria-label="Bold">
        B
      </Toggle>
      <Toggle size="small" aria-label="Search">
        <Icon name="search" size="md" />
      </Toggle>
      <Button size="small" variant="secondary">
        Clear
      </Button>
      <Select.Root defaultValue="normal">
        <Select.Trigger size="small" aria-label="Block type">
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          <Select.Item value="normal">Normal</Select.Item>
          <Select.Item value="h1">Heading 1</Select.Item>
        </Select.Popup>
      </Select.Root>
      <Menu.Root>
        <Menu.Trigger size="small">Insert</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onClick={() => undefined}>Image</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <Popover.Root>
        <Popover.Trigger size="small" aria-label="Text colour">
          A
        </Popover.Trigger>
        <Popover.Popup label="Text colour">
          <Text>Pick a colour.</Text>
        </Popover.Popup>
      </Popover.Root>
      <Menu.Root>
        <Menu.Trigger size="small" variant="ghost" aria-label="More">
          <Icon name="menu" size="sm" />
        </Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onClick={() => undefined}>Settings</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </Inline>
  )
}

/** Small Toggles (text and an 18px icon), a small Button and small Select,
 *  Menu and Popover triggers in a plain Inline (no attached group to stretch
 *  them): every one is controlSm tall whatever it holds, with Toggle's
 *  padding and font. The ghost Menu trigger is the small icon-button size. */
export const SmallTriggersRow: Story = {
  render: () => <SmallControlsRow />,
  play: async ({canvas}) => {
    await withFinePointer()
    const controls = [
      canvas.getByRole('button', {name: 'Bold'}),
      canvas.getByRole('button', {name: 'Search'}),
      canvas.getByRole('button', {name: 'Clear'}),
    ]
    const triggers = [
      canvas.getByRole('combobox', {name: 'Block type'}),
      canvas.getByRole('button', {name: 'Insert'}),
      canvas.getByRole('button', {name: 'Text colour'}),
    ]
    for (const el of [...controls, ...triggers]) {
      await expect(el.offsetHeight).toBe(SIZES_PX.controlSm)
    }
    for (const el of triggers) {
      const cs = getComputedStyle(el)
      await expect(cs.paddingTop).toBe(`${SPACING_PX.xs}px`)
      await expect(cs.paddingLeft).toBe(`${SPACING_PX.sm}px`)
      await expect(cs.fontSize).toBe(smallFontPx())
    }
    const ghost = canvas.getByRole('button', {name: 'More'})
    await expect(ghost.offsetHeight).toBe(SIZES_PX.iconButtonSm)
    await expect(ghost.offsetWidth).toBe(SIZES_PX.iconButtonSm)
    await expect(getComputedStyle(ghost).fontSize).toBe(smallFontPx())
  },
}

/** The same row under a coarse pointer: Toggle and the three triggers reach
 *  touchTarget. Button has no touch size at any size, so the small Button stays
 *  controlSm (the 5.5 plan's addendum). */
export const SmallTriggersRowCoarsePointer: Story = {
  render: () => <SmallControlsRow />,
  play: async ({canvas}) => {
    const touch = [
      canvas.getByRole('button', {name: 'Bold'}),
      canvas.getByRole('button', {name: 'Search'}),
      canvas.getByRole('combobox', {name: 'Block type'}),
      canvas.getByRole('button', {name: 'Insert'}),
      canvas.getByRole('button', {name: 'Text colour'}),
    ]
    const button = canvas.getByRole('button', {name: 'Clear'})
    await withCoarsePointer(async () => {
      for (const el of touch) {
        await waitFor(() => expect(el.offsetHeight).toBe(SIZES_PX.touchTarget))
      }
      await expect(button.offsetHeight).toBe(SIZES_PX.controlSm)
    })
  },
}
