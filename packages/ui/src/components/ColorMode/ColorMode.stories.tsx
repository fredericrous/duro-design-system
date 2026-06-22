import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ColorModeProvider, ColorModeToggle, useColorMode} from './ColorMode'

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
  row: {display: 'flex', alignItems: 'center', gap: 12},
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
