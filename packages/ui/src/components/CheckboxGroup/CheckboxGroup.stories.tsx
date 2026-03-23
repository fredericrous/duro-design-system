import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {CheckboxGroup} from './CheckboxGroup'

const meta: Meta = {
  title: 'Components/CheckboxGroup',
  argTypes: {
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    disabled: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <CheckboxGroup.Root defaultValue={['email']}>
      <CheckboxGroup.Item value="email">Email notifications</CheckboxGroup.Item>
      <CheckboxGroup.Item value="sms">SMS notifications</CheckboxGroup.Item>
      <CheckboxGroup.Item value="push">Push notifications</CheckboxGroup.Item>
    </CheckboxGroup.Root>
  ),
  play: async ({canvas}) => {
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes.length).toBe(3)
    await expect(checkboxes[0]).toBeChecked()
    await expect(checkboxes[1]).not.toBeChecked()
    await expect(checkboxes[2]).not.toBeChecked()
  },
}

export const Horizontal: Story = {
  render: () => (
    <CheckboxGroup.Root defaultValue={['react']} orientation="horizontal">
      <CheckboxGroup.Item value="react">React</CheckboxGroup.Item>
      <CheckboxGroup.Item value="vue">Vue</CheckboxGroup.Item>
      <CheckboxGroup.Item value="angular">Angular</CheckboxGroup.Item>
    </CheckboxGroup.Root>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toHaveAttribute('aria-orientation', 'horizontal')
  },
}

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup.Root defaultValue={['a']} disabled>
      <CheckboxGroup.Item value="a">Option A</CheckboxGroup.Item>
      <CheckboxGroup.Item value="b">Option B</CheckboxGroup.Item>
    </CheckboxGroup.Root>
  ),
  play: async ({canvas}) => {
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes[0]).toBeDisabled()
    await expect(checkboxes[1]).toBeDisabled()
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(['read'])
    return (
      <html.div>
        <CheckboxGroup.Root value={value} onValueChange={setValue}>
          <CheckboxGroup.Item value="read">Read</CheckboxGroup.Item>
          <CheckboxGroup.Item value="write">Write</CheckboxGroup.Item>
          <CheckboxGroup.Item value="execute">Execute</CheckboxGroup.Item>
        </CheckboxGroup.Root>
      </html.div>
    )
  },
  play: async ({canvas, userEvent}) => {
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes[0]).toBeChecked()

    await userEvent.click(checkboxes[1])
    await expect(checkboxes[0]).toBeChecked()
    await expect(checkboxes[1]).toBeChecked()

    await userEvent.click(checkboxes[0])
    await expect(checkboxes[0]).not.toBeChecked()
    await expect(checkboxes[1]).toBeChecked()
  },
}
