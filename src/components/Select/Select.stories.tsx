import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn } from "storybook/test"
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
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("combobox")

    // Initial state: shows selected value
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await expect(trigger).toHaveAttribute("aria-haspopup", "listbox")
    await expect(trigger).toHaveTextContent("English")

    // Open
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    await expect(canvas.getByRole("listbox")).toBeInTheDocument()

    // Options present with correct roles
    const options = canvas.getAllByRole("option")
    await expect(options.length).toBe(3)
    await expect(options[0]).toHaveAttribute("aria-selected", "true")
    await expect(options[1]).toHaveAttribute("aria-selected", "false")

    // Select a different option
    await userEvent.click(options[1])
    await expect(trigger).toHaveTextContent("Francais")
    await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument()
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
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("combobox")

    // Shows placeholder when nothing selected
    await expect(trigger).toHaveTextContent("Choose a language...")

    // Open and select
    await userEvent.click(trigger)
    const options = canvas.getAllByRole("option")
    await expect(options.length).toBe(4)

    // None selected initially
    for (const opt of options) {
      await expect(opt).toHaveAttribute("aria-selected", "false")
    }

    await userEvent.click(canvas.getByText("Vue"))
    await expect(trigger).toHaveTextContent("Vue")
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
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("combobox")

    // Open with click
    await userEvent.click(trigger)
    const listbox = canvas.getByRole("listbox")
    const options = canvas.getAllByRole("option")

    // First option highlighted on open
    await expect(trigger).toHaveAttribute("aria-activedescendant", options[0].id)

    // Arrow down to second
    await userEvent.keyboard("{ArrowDown}")
    await expect(trigger).toHaveAttribute("aria-activedescendant", options[1].id)

    // Arrow down to third
    await userEvent.keyboard("{ArrowDown}")
    await expect(trigger).toHaveAttribute("aria-activedescendant", options[2].id)

    // Enter to select
    await userEvent.keyboard("{Enter}")
    await expect(trigger).toHaveTextContent("Charlie")
    await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument()
  },
}
