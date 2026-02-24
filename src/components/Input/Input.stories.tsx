import type { Meta, StoryObj } from "@storybook/react"
import { css, html } from "react-strict-dom"
import { Input } from "./Input"

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "error"],
    },
    type: {
      control: "select",
      options: ["text", "password", "email", "number"],
    },
    disabled: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { placeholder: "Enter text..." },
}

export const Error: Story = {
  args: { variant: "error", placeholder: "Invalid input" },
}

export const Password: Story = {
  args: { type: "password", placeholder: "Enter password" },
}

export const Disabled: Story = {
  args: { placeholder: "Disabled", disabled: true },
}

const stackStyles = css.create({
  stack: { display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 },
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Input placeholder="Default input" />
      <Input variant="error" placeholder="Error input" />
      <Input type="password" placeholder="Password input" />
      <Input placeholder="Disabled" disabled />
    </html.div>
  ),
}
