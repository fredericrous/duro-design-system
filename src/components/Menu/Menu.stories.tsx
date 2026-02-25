import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn } from "storybook/test"
import { Menu } from "./Menu"

const meta: Meta = {
  title: "Components/Menu",
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const handleSettings = fn()
    const handleProfile = fn()
    return (
      <Menu.Root>
        <Menu.Trigger>Options &#9662;</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onClick={handleSettings}>Settings</Menu.Item>
          <Menu.Item onClick={handleProfile}>Profile</Menu.Item>
          <Menu.Item>Logout</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    )
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /Options/ })

    // Closed state
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu")
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument()

    // Open
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    await expect(canvas.getByRole("menu")).toBeInTheDocument()

    // Menu items present with correct role
    const items = canvas.getAllByRole("menuitem")
    await expect(items.length).toBe(3)
    await expect(items[0]).toHaveTextContent("Settings")
    await expect(items[1]).toHaveTextContent("Profile")
    await expect(items[2]).toHaveTextContent("Logout")

    // Close with Escape
    await userEvent.keyboard("{Escape}")
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
  },
}

export const KeyboardNavigation: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>Navigate &#9662;</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>First</Menu.Item>
        <Menu.Item>Second</Menu.Item>
        <Menu.Item>Third</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /Navigate/ })

    // Open menu
    await userEvent.click(trigger)
    const menu = canvas.getByRole("menu")
    await expect(menu).toBeInTheDocument()

    // First item is highlighted on open (via aria-activedescendant)
    const items = canvas.getAllByRole("menuitem")
    await expect(menu).toHaveAttribute("aria-activedescendant", items[0].id)

    // Arrow down
    await userEvent.keyboard("{ArrowDown}")
    await expect(menu).toHaveAttribute("aria-activedescendant", items[1].id)

    // Arrow down again
    await userEvent.keyboard("{ArrowDown}")
    await expect(menu).toHaveAttribute("aria-activedescendant", items[2].id)

    // Wrap around
    await userEvent.keyboard("{ArrowDown}")
    await expect(menu).toHaveAttribute("aria-activedescendant", items[0].id)

    // Home goes to first
    await userEvent.keyboard("{End}")
    await expect(menu).toHaveAttribute("aria-activedescendant", items[2].id)

    await userEvent.keyboard("{Home}")
    await expect(menu).toHaveAttribute("aria-activedescendant", items[0].id)

    // Escape closes
    await userEvent.keyboard("{Escape}")
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument()
  },
}

export const WithLinks: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>Account &#9662;</Menu.Trigger>
      <Menu.Popup>
        <Menu.LinkItem href="#admin">Admin</Menu.LinkItem>
        <Menu.LinkItem href="#settings">Settings</Menu.LinkItem>
        <Menu.LinkItem href="#logout">Logout</Menu.LinkItem>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Account/ }))

    const items = canvas.getAllByRole("menuitem")
    await expect(items.length).toBe(3)

    // Link items should be anchor elements with href
    await expect(items[0].tagName).toBe("A")
    await expect(items[0]).toHaveAttribute("href", "#admin")
  },
}
