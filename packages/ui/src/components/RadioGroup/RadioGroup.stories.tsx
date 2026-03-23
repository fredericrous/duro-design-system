import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {RadioGroup} from './RadioGroup'

const meta: Meta = {
  title: 'Components/RadioGroup',
  argTypes: {
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    disabled: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <RadioGroup.Root defaultValue="apple">
      <RadioGroup.Item value="apple">Apple</RadioGroup.Item>
      <RadioGroup.Item value="banana">Banana</RadioGroup.Item>
      <RadioGroup.Item value="cherry">Cherry</RadioGroup.Item>
    </RadioGroup.Root>
  ),
  play: async ({canvas}) => {
    const radios = canvas.getAllByRole('radio')
    await expect(radios.length).toBe(3)
    await expect(radios[0]).toBeChecked()
    await expect(radios[1]).not.toBeChecked()
  },
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup.Root defaultValue="sm" orientation="horizontal">
      <RadioGroup.Item value="sm">Small</RadioGroup.Item>
      <RadioGroup.Item value="md">Medium</RadioGroup.Item>
      <RadioGroup.Item value="lg">Large</RadioGroup.Item>
    </RadioGroup.Root>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('radiogroup')
    await expect(group).toHaveAttribute('aria-orientation', 'horizontal')
  },
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup.Root defaultValue="on" disabled>
      <RadioGroup.Item value="on">On</RadioGroup.Item>
      <RadioGroup.Item value="off">Off</RadioGroup.Item>
    </RadioGroup.Root>
  ),
  play: async ({canvas}) => {
    const radios = canvas.getAllByRole('radio')
    await expect(radios[0]).toBeDisabled()
    await expect(radios[1]).toBeDisabled()
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('red')
    return (
      <html.div>
        <RadioGroup.Root value={value} onValueChange={setValue}>
          <RadioGroup.Item value="red">Red</RadioGroup.Item>
          <RadioGroup.Item value="green">Green</RadioGroup.Item>
          <RadioGroup.Item value="blue">Blue</RadioGroup.Item>
        </RadioGroup.Root>
      </html.div>
    )
  },
  play: async ({canvas, userEvent}) => {
    const radios = canvas.getAllByRole('radio')
    await expect(radios[0]).toBeChecked()

    await userEvent.click(radios[2])
    await expect(radios[2]).toBeChecked()
    await expect(radios[0]).not.toBeChecked()
  },
}
