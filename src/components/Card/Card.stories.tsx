import type { Meta, StoryObj } from "@storybook/react";
import { css, html } from "react-strict-dom";
import { Card } from "./Card";
import { colors } from "../../tokens/colors.css";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "outlined", "filled", "interactive"],
    },
    size: {
      control: "select",
      options: ["default", "compact", "full"],
    },
    header: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Elevated: Story = {
  args: {
    variant: "elevated",
    header: "Elevated Card",
    children: "This card has a shadow and larger radius, like a page-level container.",
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    header: "Outlined Card",
    children: "A bordered card section with a title.",
  },
};

export const Filled: Story = {
  args: {
    variant: "filled",
    children: "A subtle filled card without border or shadow.",
  },
};

export const Interactive: Story = {
  args: {
    variant: "interactive",
    children: "Hover me! I translate up and show an accent border.",
  },
};

export const Compact: Story = {
  args: {
    variant: "outlined",
    size: "compact",
    header: "Compact",
    children: "Less padding for tighter layouts.",
  },
};

export const Full: Story = {
  args: {
    variant: "elevated",
    size: "full",
    header: "Full Padding",
    children: "Extra padding for page-level card containers.",
  },
};

const gridStyles = css.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
  stack: { display: "flex", flexDirection: "column", gap: 16 },
  muted: { color: colors.textMuted, fontSize: "0.875rem" },
});

export const AllVariants: Story = {
  render: () => (
    <html.div style={gridStyles.stack}>
      <html.div style={gridStyles.grid}>
        <Card variant="elevated" header="Elevated">
          <html.span style={gridStyles.muted}>Shadow + border</html.span>
        </Card>
        <Card variant="outlined" header="Outlined">
          <html.span style={gridStyles.muted}>Border only</html.span>
        </Card>
        <Card variant="filled">
          <html.span style={gridStyles.muted}>Background only</html.span>
        </Card>
        <Card variant="interactive">
          <html.span style={gridStyles.muted}>Hover to interact</html.span>
        </Card>
      </html.div>
    </html.div>
  ),
};
