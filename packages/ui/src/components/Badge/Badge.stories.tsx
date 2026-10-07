import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Badge} from './Badge'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {ThemeProvider, type ThemeName} from '../ThemeProvider/ThemeProvider'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info', 'highlight'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {children: 'Badge'},
  play: async ({canvas}) => {
    await expect(canvas.getByText('Badge')).toBeInTheDocument()
  },
}

export const Success: Story = {
  args: {variant: 'success', children: 'Active'},
  play: async ({canvas}) => {
    await expect(canvas.getByText('Active')).toBeInTheDocument()
  },
}

export const Warning: Story = {
  args: {variant: 'warning', children: 'Expiring'},
}

export const Error: Story = {
  args: {variant: 'error', children: 'Expired'},
}

export const Info: Story = {
  args: {variant: 'info', children: 'Updated'},
}

export const Highlight: Story = {
  args: {variant: 'highlight', children: 'Problem'},
}

const THEMES: ReadonlyArray<ThemeName> = ['dark', 'light', 'high-contrast']

/** The value a token's custom property holds at `el`: its theme's literal. */
function tokenValue(el: Element, token: string): string {
  const name = /var\((--[^),]+)/.exec(token)?.[1] ?? ''
  return getComputedStyle(el).getPropertyValue(name).trim()
}

/** Colours compared without whitespace (`rgba(1,2,3,0.1)` = `rgba(1, 2, 3, 0.1)`). */
const squash = (value: string) => value.replace(/\s+/g, '')

/** A `#rrggbb` or `rgb()` colour as `r,g,b`. */
function rgbOf(value: string): string {
  if (value.startsWith('#')) {
    return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)).join(',')
  }
  return (value.match(/\d+/g) ?? []).slice(0, 3).join(',')
}

/** The highlight badge under each theme: tint and text come from that theme's palette. */
export const HighlightThemes: Story = {
  render: () => (
    <html.div style={stackStyles.row}>
      {THEMES.map((theme) => (
        <ThemeProvider key={theme} theme={theme}>
          <html.div style={stackStyles.swatch}>
            <Badge variant="highlight">{`Problem ${theme}`}</Badge>
          </html.div>
        </ThemeProvider>
      ))}
    </html.div>
  ),
  play: async ({canvas}) => {
    const tints = new Set<string>()
    for (const theme of THEMES) {
      const badge = canvas.getByText(`Problem ${theme}`)
      const style = getComputedStyle(badge)
      const bg = tokenValue(badge, colors.highlightBg)
      const text = tokenValue(badge, colors.highlightText)
      await expect(bg).not.toBe('')
      await expect(squash(style.backgroundColor)).toBe(squash(bg))
      await expect(rgbOf(style.color)).toBe(rgbOf(text))
      tints.add(bg)
    }
    // Three themes, three tints: the badge follows each palette.
    await expect(tints.size).toBe(3)
  },
}

export const Small: Story = {
  args: {variant: 'success', size: 'sm', children: 'sm'},
}

const stackStyles = css.create({
  row: {display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap'},
  stack: {display: 'flex', flexDirection: 'column', gap: spacing.md},
  swatch: {padding: spacing.sm},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <html.div style={stackStyles.row}>
        <Badge>Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="highlight">Highlight</Badge>
      </html.div>
      <html.div style={stackStyles.row}>
        <Badge size="sm">Default</Badge>
        <Badge variant="success" size="sm">
          Success
        </Badge>
        <Badge variant="warning" size="sm">
          Warning
        </Badge>
        <Badge variant="error" size="sm">
          Error
        </Badge>
        <Badge variant="info" size="sm">
          Info
        </Badge>
        <Badge variant="highlight" size="sm">
          Highlight
        </Badge>
      </html.div>
    </html.div>
  ),
  play: async ({canvas}) => {
    // Each variant appears twice: once in md row, once in sm row
    await expect(canvas.getAllByText('Default').length).toBe(2)
    await expect(canvas.getAllByText('Success').length).toBe(2)
    await expect(canvas.getAllByText('Warning').length).toBe(2)
    await expect(canvas.getAllByText('Error').length).toBe(2)
    await expect(canvas.getAllByText('Info').length).toBe(2)
    await expect(canvas.getAllByText('Highlight').length).toBe(2)
  },
}
