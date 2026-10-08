import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Meter} from './Meter'
import {Text} from '../Text/Text'
import {onThemeSurface} from '../../docs/themedSurface'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const s = css.create({
  col: {display: 'flex', flexDirection: 'column', gap: spacing.md, maxWidth: sizes.gridColMd},
})

const meta: Meta<typeof Meter> = {
  title: 'Components/Meter',
  component: Meter,
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}
export default meta
type Story = StoryObj<typeof Meter>

export const Default: Story = {
  args: {label: 'Milestone done', value: 0.4},
  play: async ({canvas}) => {
    const meter = canvas.getByRole('meter', {name: 'Milestone done'})
    await expect(meter).toHaveAttribute('aria-valuenow', '0.4')
    await expect(meter).toHaveAttribute('aria-valuemin', '0')
    await expect(meter).toHaveAttribute('aria-valuemax', '1')
    await expect(meter).toHaveAttribute('aria-valuetext', '40%')
  },
}

/** Tones for a level against a limit: under, at, over. */
export const Tones: Story = {
  render: () => (
    <html.div style={s.col}>
      <Text variant="label">Next · 1 of 3</Text>
      <Meter label="Next WIP" value={1} max={3} valueText="1 of 3" />
      <Text variant="label">In progress · 3 of 3</Text>
      <Meter label="In progress WIP" value={3} max={3} valueText="3 of 3" tone="warning" />
      <Text variant="label">Review · 4 of 3</Text>
      <Meter label="Review WIP" value={4} max={3} valueText="4 of 3, over the limit" tone="error" />
      <Text variant="label">Milestone · 70% done</Text>
      <Meter label="Milestone done" value={0.7} tone="success" />
    </html.div>
  ),
}

/** Over the maximum, aria-valuenow stays in range and the text carries the
 *  true value; the bar fills, no further. */
export const OverTheLimit: Story = {
  args: {label: 'Review WIP', value: 4, max: 3, valueText: '4 of 3, over the limit', tone: 'error'},
  play: async ({canvas}) => {
    const meter = canvas.getByRole('meter', {name: 'Review WIP'})
    await expect(meter).toHaveAttribute('aria-valuenow', '3')
    await expect(meter).toHaveAttribute('aria-valuetext', '4 of 3, over the limit')
    const fill = meter.firstElementChild as HTMLElement
    await expect(fill.getBoundingClientRect().width).toBeCloseTo(
      meter.getBoundingClientRect().width,
      0,
    )
  },
}
