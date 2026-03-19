import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ToggleGroup} from './ToggleGroup'
import {Toggle} from '../Toggle/Toggle'

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
  stack: {display: 'flex', flexDirection: 'column', gap: 16},
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
