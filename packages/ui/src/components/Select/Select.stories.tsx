import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {Select} from './Select'

const meta: Meta = {
  title: 'Components/Select',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Select.Root defaultValue="en">
      <Select.Trigger>
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value="en">
          <Select.ItemText>English</Select.ItemText>
        </Select.Item>
        <Select.Item value="fr">
          <Select.ItemText>Francais</Select.ItemText>
        </Select.Item>
        <Select.Item value="es">
          <Select.ItemText>Espanol</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({canvas}) => {
    const trigger = canvas.getByRole('combobox')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    await expect(trigger).toHaveTextContent(/English/)
  },
}

export const OpenAndSelect: Story = {
  render: () => (
    <Select.Root defaultValue="en">
      <Select.Trigger>
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value="en">
          <Select.ItemText>English</Select.ItemText>
        </Select.Item>
        <Select.Item value="fr">
          <Select.ItemText>Francais</Select.ItemText>
        </Select.Item>
        <Select.Item value="es">
          <Select.ItemText>Espanol</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('combobox')

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const options = canvas.getAllByRole('option')
    await expect(options.length).toBe(3)
    await expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await userEvent.click(options[1])
    await expect(trigger).toHaveTextContent(/Francais/)
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
  },
}

export const WithPlaceholder: Story = {
  render: () => (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Choose a language..." />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value="react">
          <Select.ItemText>React</Select.ItemText>
        </Select.Item>
        <Select.Item value="vue">
          <Select.ItemText>Vue</Select.ItemText>
        </Select.Item>
        <Select.Item value="svelte">
          <Select.ItemText>Svelte</Select.ItemText>
        </Select.Item>
        <Select.Item value="angular">
          <Select.ItemText>Angular</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('combobox')

    // Shows placeholder when nothing selected
    await expect(trigger).toHaveTextContent(/Choose a language\.\.\./)

    // Open and select
    await userEvent.click(trigger)
    const options = canvas.getAllByRole('option')
    await expect(options.length).toBe(4)

    // None selected initially
    for (const opt of options) {
      await expect(opt).toHaveAttribute('aria-selected', 'false')
    }

    await userEvent.click(canvas.getByText('Vue'))
    await expect(trigger).toHaveTextContent(/Vue/)
  },
}

export const KeyboardNavigation: Story = {
  render: () => (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Select..." />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value="a">
          <Select.ItemText>Alpha</Select.ItemText>
        </Select.Item>
        <Select.Item value="b">
          <Select.ItemText>Bravo</Select.ItemText>
        </Select.Item>
        <Select.Item value="c">
          <Select.ItemText>Charlie</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({canvas, userEvent}) => {
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    await expect(canvas.getByRole('listbox')).toBeInTheDocument()
  },
}
