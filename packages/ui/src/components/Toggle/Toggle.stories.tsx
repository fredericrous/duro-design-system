import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Toggle} from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  args: {
    onPressedChange: fn(),
  },
  argTypes: {
    pressed: {control: 'boolean'},
    disabled: {control: 'boolean'},
    defaultPressed: {control: 'boolean'},
    size: {control: 'select', options: ['default', 'small']},
  },
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {
  args: {children: 'Bold'},
  play: async ({canvas, userEvent, args}) => {
    const toggle = canvas.getByRole('button')
    await expect(toggle).toBeInTheDocument()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(toggle)
    await expect(args.onPressedChange).toHaveBeenCalledWith(true)
  },
}

export const Pressed: Story = {
  args: {defaultPressed: true, children: 'Bold'},
  play: async ({canvas}) => {
    const toggle = canvas.getByRole('button')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  },
}

export const Disabled: Story = {
  args: {disabled: true, children: 'Bold'},
  play: async ({canvas, userEvent, args}) => {
    const toggle = canvas.getByRole('button')
    await expect(toggle).toBeDisabled()

    await userEvent.click(toggle)
    await expect(args.onPressedChange).not.toHaveBeenCalled()
  },
}

export const Small: Story = {
  args: {size: 'small', children: 'B'},
  play: async ({canvas}) => {
    await expect(canvas.getByRole('button')).toBeInTheDocument()
  },
}

const stackStyles = css.create({
  stack: {display: 'flex', gap: 8},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Toggle>Off</Toggle>
      <Toggle defaultPressed>On</Toggle>
      <Toggle disabled>Disabled</Toggle>
      <Toggle disabled defaultPressed>
        Disabled On
      </Toggle>
      <Toggle size="small">Sm</Toggle>
      <Toggle size="small" defaultPressed>
        Sm On
      </Toggle>
    </html.div>
  ),
  play: async ({canvas}) => {
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(6)
  },
}
