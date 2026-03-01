import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn } from "storybook/test"
import { css, html } from "react-strict-dom"
import { Button } from "./Button"

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "link", "danger"],
    },
    size: {
      control: "select",
      options: ["default", "small"],
    },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { variant: "primary", children: "Primary Button" },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Primary Button" })
    await expect(button).toBeInTheDocument()
    await expect(button).toBeEnabled()

    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary Button" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Secondary Button" })
    await expect(button).toBeInTheDocument()
    await expect(button).toBeEnabled()
  },
}

export const Link: Story = {
  args: { variant: "link", children: "Link Button" },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Link Button" })
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalled()
  },
}

export const Danger: Story = {
  args: { variant: "danger", children: "Delete" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Delete" })).toBeInTheDocument()
  },
}

export const Small: Story = {
  args: { variant: "primary", size: "small", children: "Small" },
}

export const FullWidth: Story = {
  args: { variant: "primary", fullWidth: true, children: "Full Width" },
}

export const Disabled: Story = {
  args: { variant: "primary", disabled: true, children: "Disabled" },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Disabled" })
    await expect(button).toBeDisabled()

    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

const rowStyles = css.create({
  row: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  stack: { display: "flex", flexDirection: "column", gap: 16 },
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={rowStyles.stack}>
      <html.div style={rowStyles.row}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="link">Link</Button>
        <Button variant="danger">Danger</Button>
      </html.div>
      <html.div style={rowStyles.row}>
        <Button variant="primary" size="small">
          Small Primary
        </Button>
        <Button variant="secondary" size="small">
          Small Secondary
        </Button>
        <Button variant="danger" size="small">
          Small Danger
        </Button>
      </html.div>
      <html.div style={rowStyles.row}>
        <Button variant="primary" disabled>
          Disabled Primary
        </Button>
        <Button variant="secondary" disabled>
          Disabled Secondary
        </Button>
        <Button variant="danger" disabled>
          Disabled Danger
        </Button>
      </html.div>
    </html.div>
  ),
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole("button")
    await expect(buttons.length).toBe(10)

    const disabledButtons = buttons.filter((b: HTMLElement) => (b as HTMLButtonElement).disabled)
    await expect(disabledButtons.length).toBe(3)
  },
}
