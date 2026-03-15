import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Switch} from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: {control: 'boolean'},
    disabled: {control: 'boolean'},
    defaultChecked: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: {children: 'Enable notifications'},
  play: async ({canvas, userEvent, args}) => {
    const switchEl = canvas.getByRole('switch')
    await expect(switchEl).toBeInTheDocument()
    await expect(switchEl).not.toBeChecked()

    await userEvent.click(switchEl)
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
  },
}

export const Checked: Story = {
  args: {defaultChecked: true, children: 'Already enabled'},
  play: async ({canvas}) => {
    const switchEl = canvas.getByRole('switch')
    await expect(switchEl).toBeChecked()
  },
}

export const Disabled: Story = {
  args: {disabled: true, children: 'Cannot toggle'},
  play: async ({canvas, userEvent, args}) => {
    const switchEl = canvas.getByRole('switch')
    await expect(switchEl).toBeDisabled()

    await userEvent.click(switchEl)
    await expect(args.onCheckedChange).not.toHaveBeenCalled()
  },
}

export const DisabledChecked: Story = {
  args: {disabled: true, defaultChecked: true, children: 'Locked on'},
  play: async ({canvas}) => {
    const switchEl = canvas.getByRole('switch')
    await expect(switchEl).toBeDisabled()
    await expect(switchEl).toBeChecked()
  },
}

export const WithoutLabel: Story = {
  args: {name: 'darkMode'},
  play: async ({canvas}) => {
    await expect(canvas.getByRole('switch')).toBeInTheDocument()
  },
}

const stackStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: 12},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Switch>Unchecked</Switch>
      <Switch defaultChecked>Checked</Switch>
      <Switch disabled>Disabled</Switch>
      <Switch disabled defaultChecked>
        Disabled checked
      </Switch>
    </html.div>
  ),
  play: async ({canvas}) => {
    const switches = canvas.getAllByRole('switch')
    await expect(switches.length).toBe(4)
  },
}
