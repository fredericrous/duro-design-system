import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {BarChart, type BarChartDatum, type BarChartSeries} from './BarChart'
import {onThemeSurface} from '../../docs/themedSurface'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const s = css.create({
  wrap: {maxWidth: sizes.pageSm},
})

const series: BarChartSeries[] = [
  {key: 'resolved', label: 'Resolved', tone: 'success'},
  {key: 'escalated', label: 'Escalated', tone: 'error'},
]

// kb-vision, 25 Sep - 8 Oct: [resolved, escalated] per day.
const pairs: Array<[number, number]> = [
  [145, 152],
  [68, 182],
  [31, 85],
  [10, 42],
  [10, 12],
  [33, 58],
  [12, 3],
  [8, 7],
  [8, 3],
  [11, 14],
  [22, 61],
  [31, 11],
  [55, 13],
  [32, 3],
]
const labels = [
  '25 Sep',
  '26 Sep',
  '27 Sep',
  '28 Sep',
  '29 Sep',
  '30 Sep',
  '1 Oct',
  '2 Oct',
  '3 Oct',
  '4 Oct',
  '5 Oct',
  '6 Oct',
  '7 Oct',
  '8 Oct',
]
const days: BarChartDatum[] = pairs.map(([resolved, escalated], i) => ({
  label: labels[i],
  values: {resolved, escalated},
}))

const meta: Meta<typeof BarChart> = {
  title: 'Components/BarChart',
  component: BarChart,
  parameters: {a11y: {test: 'error'}},
  decorators: [
    onThemeSurface,
    (Story) => (
      <html.div style={s.wrap}>
        <Story />
      </html.div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof BarChart>

export const Vertical: Story = {
  args: {
    'aria-label': 'Resolved and escalated per day, 25 Sep to 8 Oct',
    categoryLabel: 'Day',
    series,
    data: days,
    labelEvery: 2,
    emphasis: 'last',
  },
  play: async ({canvas}) => {
    const img = canvas.getByRole('img', {name: /Resolved and escalated per day/})
    await expect(canvas.getAllByText('Resolved').length).toBeGreaterThan(0)
    await expect(canvas.getAllByText('Escalated').length).toBeGreaterThan(0)
    const table = canvas.getByRole('table')
    // The table sits beside the img, never inside it.
    await expect(img.contains(table)).toBe(false)
    await expect(canvas.getAllByRole('row')).toHaveLength(15)
    await expect(canvas.getByText('32 / 3')).toBeVisible()
  },
}

export const Row: Story = {
  args: {
    'aria-label': 'Resolved and escalated by queue',
    categoryLabel: 'Queue',
    orientation: 'row',
    series,
    data: [
      {label: 'Billing', values: {resolved: 40, escalated: 12}},
      {label: 'Access', values: {resolved: 22, escalated: 30}},
      {label: 'Other', values: {resolved: 5, escalated: 1}},
    ],
    emphasis: 'last',
  },
  play: async ({canvas}) => {
    const img = canvas.getByRole('img', {name: 'Resolved and escalated by queue'})
    await expect(img.contains(canvas.getByRole('table'))).toBe(false)
  },
}

export const MissingDay: Story = {
  args: {
    'aria-label': 'Resolved and escalated per day with a missing report',
    categoryLabel: 'Day',
    series,
    data: days.map((d, i) => (i === 4 ? {label: d.label, values: {}, missing: true} : d)),
    labelEvery: 2,
  },
  play: async ({canvas}) => {
    await expect(canvas.getAllByText('no report').length).toBeGreaterThan(0)
  },
}
