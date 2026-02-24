import type { Meta, StoryObj } from "@storybook/react-vite";
import { css, html } from "react-strict-dom";
import { ThemeProvider } from "./ThemeProvider";
import { colors } from "../../tokens/colors.css";
import { radii } from "../../tokens/spacing.css";
import { shadows } from "../../tokens/shadows.css";
import { typography } from "../../tokens/typography.css";

const meta: Meta<typeof ThemeProvider> = {
  title: "Theme/ThemeProvider",
  component: ThemeProvider,
};

export default meta;
type Story = StoryObj<typeof ThemeProvider>;

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
});

function SampleContent() {
  return (
    <html.div style={sampleStyles.container}>
      <html.div style={sampleStyles.card}>
        <html.div style={sampleStyles.title}>Sample Card</html.div>
        <html.span style={sampleStyles.muted}>
          This is a muted description.
        </html.span>
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
  );
}

export const Dark: Story = {
  args: { theme: "dark" },
  render: (args) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
};

export const Light: Story = {
  args: { theme: "light" },
  render: (args) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
};

export const HighContrast: Story = {
  args: { theme: "high-contrast" },
  render: (args) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
};

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
});

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
};
