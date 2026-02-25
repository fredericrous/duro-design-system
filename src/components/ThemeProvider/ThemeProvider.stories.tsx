import type React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect } from "storybook/test"
import { css, html } from "react-strict-dom"
import { ThemeProvider, type ThemeName } from "./ThemeProvider"
import { colors } from "../../tokens/colors.css"
import { radii } from "../../tokens/spacing.css"
import { shadows } from "../../tokens/shadows.css"
import { typography } from "../../tokens/typography.css"

const meta: Meta<typeof ThemeProvider> = {
  title: "Theme/ThemeProvider",
  component: ThemeProvider,
}

export default meta
type Story = StoryObj<typeof ThemeProvider>

const sampleStyles = css.create({
  container: {
    padding: 24,
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: radii.md,
    fontFamily: typography.fontFamily,
  },
  card: {
    padding: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radii.md,
    boxShadow: shadows.md,
    marginBottom: 12,
  },
  title: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    marginBottom: 8,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.fontSizeSm,
  },
  accent: {
    color: colors.accent,
    fontWeight: typography.fontWeightMedium,
  },
  row: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
  },
  errorSwatch: { backgroundColor: colors.error },
  successSwatch: { backgroundColor: colors.success },
  warningSwatch: { backgroundColor: colors.warning },
  accentSwatch: { backgroundColor: colors.accent },
})

function SampleContent() {
  return (
    <html.div style={sampleStyles.container}>
      <html.div style={sampleStyles.card}>
        <html.div style={sampleStyles.title}>Sample Card</html.div>
        <html.span style={sampleStyles.muted}>This is a muted description.</html.span>
      </html.div>
      <html.div style={sampleStyles.card}>
        <html.span style={sampleStyles.accent}>Accent colored text</html.span>
      </html.div>
      <html.div style={sampleStyles.row}>
        <html.div style={[sampleStyles.swatch, sampleStyles.errorSwatch]} />
        <html.div style={[sampleStyles.swatch, sampleStyles.successSwatch]} />
        <html.div style={[sampleStyles.swatch, sampleStyles.warningSwatch]} />
        <html.div style={[sampleStyles.swatch, sampleStyles.accentSwatch]} />
      </html.div>
    </html.div>
  )
}

export const Dark: Story = {
  args: { theme: "dark" },
  render: (args: { theme?: ThemeName; children?: React.ReactNode }) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sample Card")).toBeInTheDocument()
    await expect(canvas.getByText("Accent colored text")).toBeInTheDocument()
  },
}

export const Light: Story = {
  args: { theme: "light" },
  render: (args: { theme?: ThemeName; children?: React.ReactNode }) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sample Card")).toBeInTheDocument()
  },
}

export const HighContrast: Story = {
  args: { theme: "high-contrast" },
  render: (args: { theme?: ThemeName; children?: React.ReactNode }) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sample Card")).toBeInTheDocument()
  },
}

const sideBySideStyles = css.create({
  wrapper: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
  },
  column: {
    flex: 1,
    minWidth: 280,
  },
  label: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    marginBottom: 8,
    color: "#888",
  },
})

export const AllThemes: Story = {
  render: () => (
    <html.div style={sideBySideStyles.wrapper}>
      {(["dark", "light", "high-contrast"] as const).map((theme) => (
        <html.div key={theme} style={sideBySideStyles.column}>
          <html.div style={sideBySideStyles.label}>{theme}</html.div>
          <ThemeProvider theme={theme}>
            <SampleContent />
          </ThemeProvider>
        </html.div>
      ))}
    </html.div>
  ),
  play: async ({ canvas }) => {
    // All three theme labels rendered
    await expect(canvas.getByText("dark")).toBeInTheDocument()
    await expect(canvas.getByText("light")).toBeInTheDocument()
    await expect(canvas.getByText("high-contrast")).toBeInTheDocument()
  },
}
