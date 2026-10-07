import type React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ThemeProvider, type ThemeName} from './ThemeProvider'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const meta: Meta<typeof ThemeProvider> = {
  title: 'Theme/ThemeProvider',
  component: ThemeProvider,
}

export default meta
type Story = StoryObj<typeof ThemeProvider>

const sampleStyles = css.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: radii.md,
    fontFamily: typography.fontFamily,
  },
  card: {
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    boxShadow: shadows.md,
    marginBottom: spacing.ms,
  },
  title: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    marginBottom: spacing.sm,
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
    display: 'flex',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  swatch: {
    width: sizes.iconXxl,
    height: sizes.iconXxl,
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  errorSwatch: {backgroundColor: colors.error},
  successSwatch: {backgroundColor: colors.success},
  warningSwatch: {backgroundColor: colors.warning},
  accentSwatch: {backgroundColor: colors.accent},
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
  args: {theme: 'dark'},
  render: (args: {theme?: ThemeName; children?: React.ReactNode}) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText('Sample Card')).toBeInTheDocument()
    await expect(canvas.getByText('Accent colored text')).toBeInTheDocument()
  },
}

export const Light: Story = {
  args: {theme: 'light'},
  render: (args: {theme?: ThemeName; children?: React.ReactNode}) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText('Sample Card')).toBeInTheDocument()
  },
}

export const HighContrast: Story = {
  args: {theme: 'high-contrast'},
  render: (args: {theme?: ThemeName; children?: React.ReactNode}) => (
    <ThemeProvider {...args}>
      <SampleContent />
    </ThemeProvider>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText('Sample Card')).toBeInTheDocument()
  },
}

const sideBySideStyles = css.create({
  wrapper: {
    display: 'flex',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: sizes.gridColMd,
  },
  label: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    marginBottom: spacing.sm,
    color: colors.textMuted,
  },
})

export const AllThemes: Story = {
  render: () => (
    <html.div style={sideBySideStyles.wrapper}>
      {(['dark', 'light', 'high-contrast'] as const).map((theme) => (
        <html.div key={theme} style={sideBySideStyles.column}>
          <html.div style={sideBySideStyles.label}>{theme}</html.div>
          <ThemeProvider theme={theme}>
            <SampleContent />
          </ThemeProvider>
        </html.div>
      ))}
    </html.div>
  ),
  play: async ({canvas}) => {
    // All three theme labels rendered
    await expect(canvas.getByText('dark')).toBeInTheDocument()
    await expect(canvas.getByText('light')).toBeInTheDocument()
    await expect(canvas.getByText('high-contrast')).toBeInTheDocument()
  },
}

const contrastStyles = css.create({
  surface: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.contrastSurface,
    color: colors.onContrastSurface,
  },
})

/** Parse a computed `rgb(r, g, b)` / `rgba(r, g, b, a)` colour. */
function rgbOf(value: string): [number, number, number] {
  const parts = value.match(/\d+(\.\d+)?/g)?.map(Number) ?? []
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

/** WCAG 2.x relative luminance contrast ratio. */
function contrastRatio(a: string, b: string): number {
  const lum = (rgb: [number, number, number]) => {
    const [r, g, bl] = rgb.map((c) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }) as [number, number, number]
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [hi, lo] = [lum(rgbOf(a)), lum(rgbOf(b))].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

// contrastSurface takes the opposite tone of the theme; its text must still
// read at 4.5:1 or better in each one.
export const ContrastSurfaceInEveryTheme: Story = {
  render: () => (
    <html.div style={sideBySideStyles.wrapper}>
      {(['dark', 'light', 'high-contrast'] as const).map((theme) => (
        <ThemeProvider key={theme} theme={theme}>
          <html.div style={contrastStyles.surface}>{`Contrast surface (${theme})`}</html.div>
        </ThemeProvider>
      ))}
    </html.div>
  ),
  play: async ({canvas}) => {
    for (const theme of ['dark', 'light', 'high-contrast']) {
      const el = canvas.getByText(`Contrast surface (${theme})`)
      const style = getComputedStyle(el)
      const ratio = contrastRatio(style.color, style.backgroundColor)
      await expect(ratio).toBeGreaterThanOrEqual(4.5)
    }
  },
}
