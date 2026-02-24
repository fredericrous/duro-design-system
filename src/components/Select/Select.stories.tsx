import type { Meta, StoryObj } from "@storybook/react"
import { Select } from "./Select"

const meta: Meta = {
  title: "Components/Select",
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
}
