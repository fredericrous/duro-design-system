import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {ThemeProvider, type ColorOverrides, type ThemeName} from './ThemeProvider'
import {Button} from '../Button/Button'
import {Text} from '../Text/Text'

const meta: Meta = {
  title: 'Theme/ThemeProvider/Overrides',
}

export default meta

const styles = css.create({
  surface: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.bg,
  },
})

interface OverrideArgs {
  theme: ThemeName
  bg: string
  accent: string
}

/** Colours replaced by token key; the controls change them in place. */
export const Playground: StoryObj<OverrideArgs> = {
  args: {theme: 'dark', bg: '#1b2433', accent: '#ff5a1f'},
  argTypes: {
    theme: {control: 'inline-radio', options: ['dark', 'light', 'high-contrast']},
    bg: {control: 'color', description: 'overrides.bg'},
    accent: {control: 'color', description: 'overrides.accent'},
  },
  render: ({theme, bg, accent}) => (
    <ThemeProvider theme={theme} overrides={{bg, accent}}>
      <html.div style={styles.surface}>
        <Text>The page background and the primary fill come from overrides.</Text>
        <Button>Primary</Button>
      </html.div>
    </ThemeProvider>
  ),
}

const A: ColorOverrides = {bg: 'rgb(27, 36, 51)', accent: 'rgb(255, 90, 31)'}
const B: ColorOverrides = {bg: 'rgb(10, 60, 30)', accent: 'rgb(30, 144, 255)'}
const STEPS: readonly (ColorOverrides | undefined)[] = [A, B, A, undefined]

/** Steps through A, B, A and none, with a nested provider under each. */
function Stepper() {
  const [step, setStep] = useState(0)
  const overrides = STEPS[step]
  return (
    <ThemeProvider overrides={overrides}>
      <html.div data-testid="outer" style={styles.surface}>
        <Button onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}>Next</Button>
        <ThemeProvider>
          <html.div data-testid="inherits" style={styles.surface} />
        </ThemeProvider>
        <ThemeProvider overrides={{bg: 'rgb(60, 10, 60)', accent: 'red} body{background:red'}}>
          <html.div data-testid="inner" style={styles.surface} />
        </ThemeProvider>
      </html.div>
    </ThemeProvider>
  )
}

const bgOf = (el: Element) => getComputedStyle(el).backgroundColor
const aliasOf = (el: Element) => getComputedStyle(el).getPropertyValue('--duro-color-bg').trim()

export const OverridesUpdateInPlace: StoryObj = {
  render: () => <Stepper />,
  play: async ({canvas, userEvent}) => {
    const outer = canvas.getByTestId('outer')
    const inherits = canvas.getByTestId('inherits')
    const inner = canvas.getByTestId('inner')
    const next = canvas.getByRole('button', {name: 'Next'})

    // The outer provider's scope while it has overrides.
    const provider = outer.parentElement!
    await waitFor(() => expect(provider.getAttribute('data-duro-theme')).toBeTruthy())
    const scope = provider.getAttribute('data-duro-theme')!

    for (const step of [A, B, A]) {
      await waitFor(() => expect(bgOf(outer)).toBe(step.bg))
      // Button's fill eases between colours: wait for it to settle.
      await waitFor(() => expect(getComputedStyle(next).backgroundColor).toBe(step.accent))
      // The --duro-* alias follows the override.
      await expect(aliasOf(outer)).toBe(step.bg)
      // A nested provider with no overrides, same theme: the outer's colours.
      await expect(bgOf(inherits)).toBe(step.bg)
      await expect(aliasOf(inherits)).toBe(step.bg)
      // A nested provider with its own: its colours inside, the outer's outside.
      await expect(bgOf(inner)).toBe('rgb(60, 10, 60)')
      await userEvent.click(next)
    }

    // No overrides: the theme's own colours, and no outer rule left.
    await waitFor(() => expect(bgOf(outer)).toBe('rgb(15, 15, 15)'))
    const rules = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '')
    await expect(provider.hasAttribute('data-duro-theme')).toBe(false)
    await expect(rules.filter((r) => r.includes(`"${scope}"`))).toHaveLength(0)
    // The invalid value never reaches a rule, and nothing leaked onto body.
    await expect(rules.some((r) => r.includes('body{'))).toBe(false)
    await expect(getComputedStyle(document.body).backgroundColor).not.toBe('rgb(255, 0, 0)')
  },
}
