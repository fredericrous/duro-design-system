import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn } from "storybook/test"
import { css, html } from "react-strict-dom"
import { Input } from "./Input"

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  args: {
    onChange: fn(),
  },
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
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText("Enter text...")
    await expect(input).toBeInTheDocument()
    await expect(input).toBeEnabled()

    await userEvent.type(input, "Hello world")
    await expect(input).toHaveValue("Hello world")
    await expect(args.onChange).toHaveBeenCalled()
  },
}

export const Error: Story = {
  args: { variant: "error", placeholder: "Invalid input" },
  play: async ({ canvas }) => {
    const input = canvas.getByPlaceholderText("Invalid input")
    await expect(input).toHaveAttribute("aria-invalid", "true")
  },
}

export const Password: Story = {
  args: { type: "password", placeholder: "Enter password" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText("Enter password")
    await expect(input).toHaveAttribute("type", "password")

    await userEvent.type(input, "secret123")
    await expect(input).toHaveValue("secret123")
  },
}

export const Disabled: Story = {
  args: { placeholder: "Disabled", disabled: true },
  play: async ({ canvas }) => {
    const input = canvas.getByPlaceholderText("Disabled")
    await expect(input).toBeDisabled()
  },
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
  play: async ({ canvas }) => {
    const inputs = canvas.getAllByRole("textbox")
    // password type is not role=textbox, so we expect 3
    await expect(inputs.length).toBe(3)

    const disabled = canvas.getByPlaceholderText("Disabled")
    await expect(disabled).toBeDisabled()
  },
}
