import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ToggleGroup} from './ToggleGroup'
import {Toggle} from '../Toggle/Toggle'
import {Icon, type IconName} from '../Icon'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  args: {
    onValueChange: fn(),
  },
  argTypes: {
    multiple: {control: 'boolean'},
    disabled: {control: 'boolean'},
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    size: {control: 'select', options: ['default', 'small']},
  },
}

export default meta
type Story = StoryObj<typeof ToggleGroup>

export const Single: Story = {
  args: {defaultValue: ['center']},
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="left" aria-label="Align left">
        Left
      </Toggle>
      <Toggle value="center" aria-label="Align center">
        Center
      </Toggle>
      <Toggle value="right" aria-label="Align right">
        Right
      </Toggle>
    </ToggleGroup>
  ),
  play: async ({canvas, userEvent}) => {
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(3)

    // Center should be pressed by default
    await expect(buttons[1]).toHaveAttribute('aria-pressed', 'true')

    // Click left — should deselect center
    await userEvent.click(buttons[0])
    await expect(buttons[0]).toHaveAttribute('aria-pressed', 'true')
    await expect(buttons[1]).toHaveAttribute('aria-pressed', 'false')
  },
}

export const Multiple: Story = {
  args: {multiple: true, defaultValue: ['bold']},
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="bold" aria-label="Bold">
        B
      </Toggle>
      <Toggle value="italic" aria-label="Italic">
        I
      </Toggle>
      <Toggle value="underline" aria-label="Underline">
        U
      </Toggle>
    </ToggleGroup>
  ),
  play: async ({canvas, userEvent}) => {
    const buttons = canvas.getAllByRole('button')
    await expect(buttons[0]).toHaveAttribute('aria-pressed', 'true')

    // Click italic — both bold and italic should be pressed
    await userEvent.click(buttons[1])
    await expect(buttons[0]).toHaveAttribute('aria-pressed', 'true')
    await expect(buttons[1]).toHaveAttribute('aria-pressed', 'true')
  },
}

export const Disabled: Story = {
  args: {disabled: true, defaultValue: ['center']},
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="left">Left</Toggle>
      <Toggle value="center">Center</Toggle>
      <Toggle value="right">Right</Toggle>
    </ToggleGroup>
  ),
  play: async ({canvas, userEvent, args}) => {
    const buttons = canvas.getAllByRole('button')
    await expect(buttons[0]).toBeDisabled()
    await expect(buttons[1]).toBeDisabled()

    await userEvent.click(buttons[0])
    await expect(args.onValueChange).not.toHaveBeenCalled()
  },
}

export const Small: Story = {
  args: {size: 'small', defaultValue: ['b']},
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="b">B</Toggle>
      <Toggle value="i">I</Toggle>
      <Toggle value="u">U</Toggle>
    </ToggleGroup>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getAllByRole('button').length).toBe(3)
  },
}

export const Vertical: Story = {
  args: {orientation: 'vertical', defaultValue: ['top']},
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle value="top">Top</Toggle>
      <Toggle value="middle">Middle</Toggle>
      <Toggle value="bottom">Bottom</Toggle>
    </ToggleGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('toolbar')
    await expect(group).toHaveAttribute('aria-orientation', 'vertical')
  },
}

const stackStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: spacing.md},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <ToggleGroup defaultValue={['center']}>
        <Toggle value="left">Left</Toggle>
        <Toggle value="center">Center</Toggle>
        <Toggle value="right">Right</Toggle>
      </ToggleGroup>
      <ToggleGroup multiple defaultValue={['bold', 'italic']}>
        <Toggle value="bold">B</Toggle>
        <Toggle value="italic">I</Toggle>
        <Toggle value="underline">U</Toggle>
      </ToggleGroup>
      <ToggleGroup size="small" defaultValue={['a']}>
        <Toggle value="a">A</Toggle>
        <Toggle value="b">B</Toggle>
        <Toggle value="c">C</Toggle>
      </ToggleGroup>
      <ToggleGroup disabled defaultValue={['x']}>
        <Toggle value="x">X</Toggle>
        <Toggle value="y">Y</Toggle>
      </ToggleGroup>
    </html.div>
  ),
  play: async ({canvas}) => {
    const groups = canvas.getAllByRole('toolbar')
    await expect(groups.length).toBe(4)
  },
}

const ICON_NAMES: IconName[] = [
  'x-circle',
  'check-circle',
  'check-done',
  'clock',
  'forbidden',
  'info-circle',
  'alert-triangle',
  'shield',
  'lock',
  'key',
  'map',
  'layers',
  'repeat',
  'database',
  'shield-check',
  'route',
  'git-branch',
  'menu',
  'pin',
  'server',
  'hard-drive',
  'box',
  'image',
  'tag',
  'pie-chart',
  'users',
  'user-plus',
  'mail',
  'file-text',
  'plug',
  'search',
  'mic',
  'sun',
  'moon',
  'monitor',
  'contrast',
  'info-circle-filled',
  'alert-triangle-filled',
  'check-circle-filled',
  'x-circle-filled',
  'shield-filled',
  'lock-filled',
]

const iconStyles = css.create({
  frame: {width: sizes.panelSm},
})

function IconChoices({
  names,
  pressed,
  size = 'small',
}: {
  names: IconName[]
  pressed: string
  size?: 'small' | 'default'
}) {
  return (
    <html.div style={iconStyles.frame}>
      <ToggleGroup wrap maxRows={3} size={size} defaultValue={[pressed]} aria-label="Icon">
        {names.map((name) => (
          <Toggle key={name} value={name} aria-label={name}>
            <Icon name={name} size="sm" />
          </Toggle>
        ))}
      </ToggleGroup>
    </html.div>
  )
}

export const IconChoicesStory: Story = {
  name: 'Icon choices',
  render: () => <IconChoices names={ICON_NAMES} pressed={ICON_NAMES[39]} />,
  play: async ({canvas, canvasElement}) => {
    const scrollTopBefore = document.scrollingElement?.scrollTop
    await expect(ICON_NAMES.length).toBe(42)
    const viewport = canvasElement.querySelector<HTMLElement>('[data-duro-scroll]')!
    await expect(Math.abs(viewport.clientHeight - 118)).toBeLessThanOrEqual(2)

    const pressed = canvas.getByRole('button', {name: ICON_NAMES[39]})
    const other = canvas.getByRole('button', {name: ICON_NAMES[0]})
    await expect(pressed).toHaveAttribute('aria-pressed', 'true')
    for (const el of [pressed, other]) {
      const cs = getComputedStyle(el)
      await expect(cs.borderTopWidth).toBe('1px')
      await expect(cs.borderRightWidth).toBe('1px')
      await expect(cs.borderBottomWidth).toBe('1px')
      await expect(cs.borderLeftWidth).toBe('1px')
      // radii.sm
      await expect(cs.borderTopLeftRadius).toBe('8px')
    }

    // the pressed toggle is visible inside the viewport
    const v = viewport.getBoundingClientRect()
    const p = pressed.getBoundingClientRect()
    await expect(p.top).toBeGreaterThanOrEqual(v.top - 1)
    await expect(p.bottom).toBeLessThanOrEqual(v.bottom + 1)
    await expect(document.scrollingElement?.scrollTop).toBe(scrollTopBefore)
  },
}

export const FiveIcons: Story = {
  name: 'Five icons',
  render: () => <IconChoices names={ICON_NAMES.slice(0, 5)} pressed={ICON_NAMES[0]} />,
  play: async ({canvas}) => {
    const group = canvas.getByRole('toolbar')
    await expect(group.getBoundingClientRect().height).toBe(SIZES_PX.controlSm)
    // exact: Toggle's styles read the same size tokens, and a drift must fail here
    const toggle = canvas.getAllByRole('button')[0].getBoundingClientRect()
    await expect(Math.abs(toggle.height - SIZES_PX.controlSm)).toBeLessThanOrEqual(0.5)
  },
}

export const KeyboardRoving: Story = {
  render: () => <IconChoices names={ICON_NAMES} pressed={ICON_NAMES[3]} />,
  play: async ({canvas, userEvent}) => {
    const btn = (i: number) => canvas.getByRole('button', {name: ICON_NAMES[i]})
    await userEvent.tab()
    await expect(btn(3)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(btn(4)).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    await expect(btn(2)).toHaveFocus()
    // Down moves to the next row, Up back
    const top = btn(2).getBoundingClientRect().top
    await userEvent.keyboard('{ArrowDown}')
    const active = document.activeElement as HTMLElement
    await expect(active.getBoundingClientRect().top).toBeGreaterThan(top + 20)
    await userEvent.keyboard('{ArrowUp}')
    await expect(btn(2)).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(btn(41)).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(btn(0)).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(btn(0)).toHaveAttribute('aria-pressed', 'true')
    // a second tab leaves the group
    await userEvent.tab()
    await expect(canvas.getAllByRole('button')).not.toContain(document.activeElement)
  },
}

export const DefaultSizeRows: Story = {
  name: 'Default size rows',
  render: () => (
    <IconChoices names={ICON_NAMES.slice(0, 5)} pressed={ICON_NAMES[0]} size="default" />
  ),
  play: async ({canvas}) => {
    const toggle = canvas.getAllByRole('button')[0].getBoundingClientRect()
    await expect(Math.abs(toggle.height - SIZES_PX.controlMd)).toBeLessThanOrEqual(0.5)
  },
}
