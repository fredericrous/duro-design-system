import type { Meta, StoryObj } from "@storybook/react"
import { expect } from "storybook/test"
import { Tabs } from "./Tabs"

const meta: Meta = {
  title: "Components/Tabs",
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
        <Tabs.Tab value="network">Network</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview panel content</Tabs.Panel>
      <Tabs.Panel value="security">Security panel content</Tabs.Panel>
      <Tabs.Panel value="network">Network panel content</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const tablist = canvas.getByRole("tablist")
    await expect(tablist).toBeInTheDocument()
    await expect(tablist).toHaveAttribute("aria-orientation", "horizontal")

    const tabs = canvas.getAllByRole("tab")
    await expect(tabs.length).toBe(3)

    // Initial state: first tab selected
    await expect(tabs[0]).toHaveAttribute("aria-selected", "true")
    await expect(tabs[1]).toHaveAttribute("aria-selected", "false")
    await expect(tabs[2]).toHaveAttribute("aria-selected", "false")
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Overview panel content")

    // Click second tab
    await userEvent.click(tabs[1])
    await expect(tabs[0]).toHaveAttribute("aria-selected", "false")
    await expect(tabs[1]).toHaveAttribute("aria-selected", "true")
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Security panel content")

    // Click third tab
    await userEvent.click(tabs[2])
    await expect(tabs[2]).toHaveAttribute("aria-selected", "true")
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Network panel content")
  },
}

export const KeyboardNavigation: Story = {
  render: () => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
        <Tabs.Tab value="network">Network</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview content</Tabs.Panel>
      <Tabs.Panel value="security">Security content</Tabs.Panel>
      <Tabs.Panel value="network">Network content</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const tabs = canvas.getAllByRole("tab")

    // Focus first tab then navigate with ArrowRight
    await userEvent.click(tabs[0])
    await expect(tabs[0]).toHaveAttribute("aria-selected", "true")

    await userEvent.keyboard("{ArrowRight}")
    await expect(tabs[1]).toHaveFocus()

    await userEvent.keyboard("{ArrowRight}")
    await expect(tabs[2]).toHaveFocus()

    // Wrap around
    await userEvent.keyboard("{ArrowRight}")
    await expect(tabs[0]).toHaveFocus()

    // Home and End
    await userEvent.keyboard("{End}")
    await expect(tabs[2]).toHaveFocus()

    await userEvent.keyboard("{Home}")
    await expect(tabs[0]).toHaveFocus()
  },
}

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
        <Tabs.Tab value="settings" disabled>
          Settings
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview content</Tabs.Panel>
      <Tabs.Panel value="security">Security content</Tabs.Panel>
      <Tabs.Panel value="settings">Settings content</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvas }) => {
    const tabs = canvas.getAllByRole("tab")
    await expect(tabs[2]).toHaveAttribute("aria-disabled", "true")
    await expect(tabs[2]).toHaveAttribute("aria-selected", "false")
  },
}

export const Vertical: Story = {
  render: () => (
    <Tabs.Root defaultValue="general" orientation="vertical">
      <Tabs.List>
        <Tabs.Tab value="general">General</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
        <Tabs.Tab value="network">Network</Tabs.Tab>
        <Tabs.Tab value="advanced">Advanced</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="general">General settings content</Tabs.Panel>
      <Tabs.Panel value="security">Security settings content</Tabs.Panel>
      <Tabs.Panel value="network">Network settings content</Tabs.Panel>
      <Tabs.Panel value="advanced">Advanced settings content</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const tablist = canvas.getByRole("tablist")
    await expect(tablist).toHaveAttribute("aria-orientation", "vertical")

    const tabs = canvas.getAllByRole("tab")

    // Vertical tabs use ArrowDown/ArrowUp
    await userEvent.click(tabs[0])
    await userEvent.keyboard("{ArrowDown}")
    await expect(tabs[1]).toHaveFocus()

    await userEvent.keyboard("{ArrowUp}")
    await expect(tabs[0]).toHaveFocus()
  },
}
