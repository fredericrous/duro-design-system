import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Badge} from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
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

export const Small: Story = {
  args: {variant: 'success', size: 'sm', children: 'sm'},
}

const stackStyles = css.create({
  row: {display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  stack: {display: 'flex', flexDirection: 'column', gap: 16},
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
  },
}
