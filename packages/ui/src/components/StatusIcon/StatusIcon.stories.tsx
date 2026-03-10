import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {StatusIcon} from './StatusIcon'

const meta: Meta<typeof StatusIcon> = {
  title: 'Components/StatusIcon',
  component: StatusIcon,
  argTypes: {
    name: {
      control: 'select',
      options: ['x-circle', 'check-circle', 'check-done', 'clock', 'forbidden'],
    },
    variant: {
      control: 'select',
      options: ['error', 'success', 'warning', 'muted'],
    },
    size: {control: 'number'},
  },
}

export default meta
type Story = StoryObj<typeof StatusIcon>

export const Error: Story = {
  args: {name: 'x-circle', variant: 'error'},
}

export const Success: Story = {
  args: {name: 'check-circle', variant: 'success'},
}

export const Warning: Story = {
  args: {name: 'clock', variant: 'warning'},
}

export const Muted: Story = {
  args: {name: 'forbidden', variant: 'muted'},
}

export const CheckDone: Story = {
  args: {name: 'check-done', variant: 'success'},
}

export const CustomSize: Story = {
  args: {name: 'check-circle', variant: 'success', size: 24},
}

const gridStyles = css.create({
  grid: {display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24},
  cell: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8},
  label: {fontSize: '0.875rem', color: '#888'},
})

export const AllIcons: Story = {
  render: () => (
    <html.div style={gridStyles.grid}>
      {(['x-circle', 'check-circle', 'check-done', 'clock', 'forbidden'] as const).map((name) => (
        <html.div key={name} style={gridStyles.cell}>
          <StatusIcon name={name} variant="muted" />
          <html.span style={gridStyles.label}>{name}</html.span>
        </html.div>
      ))}
    </html.div>
  ),
}

const rowStyles = css.create({
  row: {display: 'flex', gap: 24, alignItems: 'center'},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={rowStyles.row}>
      <StatusIcon name="x-circle" variant="error" />
      <StatusIcon name="check-circle" variant="success" />
      <StatusIcon name="clock" variant="warning" />
      <StatusIcon name="forbidden" variant="muted" />
    </html.div>
  ),
}
