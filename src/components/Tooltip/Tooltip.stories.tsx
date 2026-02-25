import type { Meta, StoryObj } from "@storybook/react"
import { expect } from "storybook/test"
import { css, html } from "react-strict-dom"
import { Tooltip } from "./Tooltip"
import { Badge } from "../Badge/Badge"

const meta: Meta = {
  title: "Components/Tooltip",
}

export default meta
type Story = StoryObj

const centerStyles = css.create({
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 80,
    gap: 24,
  },
})

export const Default: Story = {
  render: () => (
    <html.div style={centerStyles.center}>
      <Tooltip.Root content="This is a tooltip" delay={0}>
        <Tooltip.Trigger>
          <html.span>Hover me</html.span>
        </Tooltip.Trigger>
      </Tooltip.Root>
    </html.div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByText("Hover me")

    // Tooltip not visible initially
    await expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument()

    // Hover to show
    await userEvent.hover(trigger)
    const tooltip = canvas.getByRole("tooltip")
    await expect(tooltip).toBeInTheDocument()
    await expect(tooltip).toHaveTextContent("This is a tooltip")

    // Unhover to hide
    await userEvent.unhover(trigger)
    await expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument()
  },
}

export const Placements: Story = {
  render: () => (
    <html.div style={centerStyles.center}>
      <Tooltip.Root content="Top tooltip" placement="top">
        <Tooltip.Trigger>
          <Badge>Top</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
      <Tooltip.Root content="Bottom tooltip" placement="bottom">
        <Tooltip.Trigger>
          <Badge>Bottom</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
      <Tooltip.Root content="Left tooltip" placement="left">
        <Tooltip.Trigger>
          <Badge>Left</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
      <Tooltip.Root content="Right tooltip" placement="right">
        <Tooltip.Trigger>
          <Badge>Right</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
    </html.div>
  ),
}

export const WithBadge: Story = {
  render: () => (
    <html.div style={centerStyles.center}>
      <Tooltip.Root content="Security score: A+" delay={0}>
        <Tooltip.Trigger>
          <Badge variant="success">Secure</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
      <Tooltip.Root content="Certificate expires in 3 days" delay={0}>
        <Tooltip.Trigger>
          <Badge variant="warning">Expiring</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
      <Tooltip.Root content="Certificate has expired" delay={0}>
        <Tooltip.Trigger>
          <Badge variant="error">Expired</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
    </html.div>
  ),
  play: async ({ canvas, userEvent }) => {
    // Hover first badge
    await userEvent.hover(canvas.getByText("Secure"))
    await expect(canvas.getByRole("tooltip")).toHaveTextContent("Security score: A+")
    await userEvent.unhover(canvas.getByText("Secure"))

    // Hover second badge
    await userEvent.hover(canvas.getByText("Expiring"))
    await expect(canvas.getByRole("tooltip")).toHaveTextContent("Certificate expires in 3 days")
    await userEvent.unhover(canvas.getByText("Expiring"))
  },
}

export const CustomDelay: Story = {
  render: () => (
    <html.div style={centerStyles.center}>
      <Tooltip.Root content="Instant tooltip" delay={0}>
        <Tooltip.Trigger>
          <Badge variant="info">No delay</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
      <Tooltip.Root content="Slow tooltip" delay={800}>
        <Tooltip.Trigger>
          <Badge variant="info">800ms delay</Badge>
        </Tooltip.Trigger>
      </Tooltip.Root>
    </html.div>
  ),
}
