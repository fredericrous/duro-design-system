import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ColorModeProvider, ColorModeToggle, useColorMode} from './ColorMode'
import {spacing} from '@greenharness/greenrack-tokens/tokens/spacing.css'

const meta: Meta<typeof ColorModeToggle> = {
  title: 'Components/ColorMode',
  component: ColorModeToggle,
}

export default meta
type Story = StoryObj<typeof ColorModeToggle>

/** Default cycle: light ⇄ dark. Starts on `system`. */
export const Default: Story = {
  render: (args) => (
    // storageKey null keeps stories isolated (no cross-test localStorage leak).
    <ColorModeProvider storageKey={null} onPreferenceChange={fn()}>
      <ColorModeToggle {...args} />
    </ColorModeProvider>
  ),
  play: async ({canvas, userEvent}) => {
    const btn = canvas.getByRole('button')
    await expect(btn.getAttribute('aria-label')).toContain('Color mode: system')

    await userEvent.click(btn)
    await expect(btn.getAttribute('aria-label')).toContain('Color mode: light')

    await userEvent.click(btn)
    await expect(btn.getAttribute('aria-label')).toContain('Color mode: dark')

    // Wraps back to the first mode.
    await userEvent.click(btn)
    await expect(btn.getAttribute('aria-label')).toContain('Color mode: light')
  },
}

/** A four-way cycle including `system` and `high-contrast`. */
export const AllModes: Story = {
  render: () => (
    <ColorModeProvider
      storageKey={null}
      defaultPreference="system"
      modes={['system', 'light', 'dark', 'high-contrast']}
    >
      <ColorModeToggle />
    </ColorModeProvider>
  ),
  play: async ({canvas, userEvent}) => {
    const btn = canvas.getByRole('button')
    await expect(btn.getAttribute('aria-label')).toContain('Switch to light')
    await userEvent.click(btn)
    await expect(btn.getAttribute('aria-label')).toContain('Color mode: light')
    await userEvent.click(btn)
    await userEvent.click(btn)
    await expect(btn.getAttribute('aria-label')).toContain('high contrast')
  },
}

const readout = css.create({
  row: {display: 'flex', alignItems: 'center', gap: spacing.ms},
})

function Readout() {
  const {preference, theme} = useColorMode()
  return (
    <html.div style={readout.row}>
      <ColorModeToggle />
      <html.span>
        preference: {preference} → theme: {theme}
      </html.span>
    </html.div>
  )
}

/**
 * A choice saved by the old design system name survives the rename: with the
 * default key, `duro-color-mode` is read once after mount and moved to
 * `greenrack-color-mode`.
 */
export const MigratesTheOldKey: Story = {
  beforeEach: () => {
    window.localStorage.removeItem('greenrack-color-mode')
    window.localStorage.setItem('duro-color-mode', 'dark')
    return () => {
      window.localStorage.removeItem('greenrack-color-mode')
      window.localStorage.removeItem('duro-color-mode')
    }
  },
  render: (args) => (
    <ColorModeProvider>
      <ColorModeToggle {...args} />
    </ColorModeProvider>
  ),
  play: async ({canvas}) => {
    await expect(await canvas.findByRole('button', {name: /Color mode: dark/})).toBeInTheDocument()
    await expect(window.localStorage.getItem('greenrack-color-mode')).toBe('dark')
    await expect(window.localStorage.getItem('duro-color-mode')).toBeNull()
  },
}

/** A custom `storageKey` never reads the old key. */
export const CustomKeyIgnoresTheOldKey: Story = {
  beforeEach: () => {
    window.localStorage.setItem('duro-color-mode', 'dark')
    return () => {
      window.localStorage.removeItem('duro-color-mode')
      window.localStorage.removeItem('app-color-mode')
    }
  },
  render: (args) => (
    <ColorModeProvider storageKey="app-color-mode">
      <ColorModeToggle {...args} />
    </ColorModeProvider>
  ),
  play: async ({canvas}) => {
    // The mount effect has run once the provider stored nothing under its own key.
    await waitFor(() => expect(window.localStorage.getItem('app-color-mode')).toBeNull())
    await expect(canvas.getByRole('button', {name: /Color mode: system/})).toBeInTheDocument()
    await expect(window.localStorage.getItem('duro-color-mode')).toBe('dark')
  },
}

/** `storageKey={null}` persists nothing and never reads the old key. */
export const NullKeyIgnoresTheOldKey: Story = {
  beforeEach: () => {
    window.localStorage.removeItem('greenrack-color-mode')
    window.localStorage.setItem('duro-color-mode', 'dark')
    return () => {
      window.localStorage.removeItem('duro-color-mode')
    }
  },
  render: (args) => (
    <ColorModeProvider storageKey={null}>
      <ColorModeToggle {...args} />
    </ColorModeProvider>
  ),
  play: async ({canvas}) => {
    await waitFor(() => expect(window.localStorage.getItem('greenrack-color-mode')).toBeNull())
    await expect(canvas.getByRole('button', {name: /Color mode: system/})).toBeInTheDocument()
    await expect(window.localStorage.getItem('duro-color-mode')).toBe('dark')
  },
}

/** Reading the resolved theme via `useColorMode()`. */
export const WithReadout: Story = {
  render: () => (
    <ColorModeProvider storageKey={null} defaultPreference="light">
      <Readout />
    </ColorModeProvider>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText(/preference: light/)).toBeInTheDocument()
    await expect(canvas.getByText(/theme: light/)).toBeInTheDocument()
  },
}
