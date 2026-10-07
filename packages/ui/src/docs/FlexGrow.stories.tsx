import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

// The premise of `duro/no-flex-grow-web` was that react-strict-dom's web
// runtime forces `flex-grow: 0`, so a growing child collapses. These stories
// hold RSD on web to what it actually does, so the rule follows the evidence.
const meta: Meta = {
  title: 'Foundations/flexGrow on web',
}

export default meta
type Story = StoryObj

const styles = css.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: sizes.panelLg,
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    height: sizes.panelSm,
    width: sizes.panelSm,
    backgroundColor: colors.bgCard,
  },
  fixed: {
    width: sizes.iconXxl,
    height: sizes.iconXxl,
    flexShrink: 0,
    backgroundColor: colors.border,
  },
  grow: {
    flexGrow: 1,
    backgroundColor: colors.accent,
  },
  growFromZero: {
    flexGrow: 1,
    flexBasis: 0,
    backgroundColor: colors.accent,
  },
})

export const GrowInRow: Story = {
  render: () => (
    <html.div style={styles.row} role="group" aria-label="row">
      <html.div style={styles.fixed} />
      <html.div style={styles.grow} role="group" aria-label="grow" />
      <html.div style={styles.growFromZero} role="group" aria-label="grow from zero" />
    </html.div>
  ),
  play: async ({canvas}) => {
    const row = canvas.getByRole('group', {name: 'row'}).getBoundingClientRect().width
    const grow = canvas.getByRole('group', {name: 'grow'})
    const zero = canvas.getByRole('group', {name: 'grow from zero'})
    await expect(getComputedStyle(grow).flexGrow).toBe('1')
    await expect(getComputedStyle(zero).flexGrow).toBe('1')
    // The two growing children share what the fixed one leaves.
    await expect(grow.getBoundingClientRect().width).toBeGreaterThan(row / 3)
    await expect(zero.getBoundingClientRect().width).toBeGreaterThan(row / 3)
  },
}

export const GrowInColumn: Story = {
  render: () => (
    <html.div style={styles.column} role="group" aria-label="column">
      <html.div style={styles.fixed} />
      <html.div style={styles.growFromZero} role="group" aria-label="grow" />
    </html.div>
  ),
  play: async ({canvas}) => {
    const column = canvas.getByRole('group', {name: 'column'}).getBoundingClientRect().height
    const grow = canvas.getByRole('group', {name: 'grow'})
    await expect(getComputedStyle(grow).flexGrow).toBe('1')
    await expect(grow.getBoundingClientRect().height).toBeGreaterThan(column / 2)
  },
}
