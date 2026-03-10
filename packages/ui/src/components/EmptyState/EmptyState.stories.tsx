import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {EmptyState} from './EmptyState'
import {Button} from '../Button/Button'
import {StatusIcon} from '../StatusIcon/StatusIcon'

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {message: 'No items found'},
  play: async ({canvas}) => {
    await expect(canvas.getByText('No items found')).toBeInTheDocument()
  },
}

export const WithIcon: Story = {
  args: {
    message: 'Nothing to show here',
    icon: <StatusIcon name="forbidden" variant="muted" size={48} />,
  },
  play: async ({canvas}) => {
    await expect(canvas.getByText('Nothing to show here')).toBeInTheDocument()
  },
}

export const WithAction: Story = {
  args: {
    message: 'No results match your search',
    action: <Button variant="secondary">Clear filters</Button>,
  },
  play: async ({canvas}) => {
    await expect(canvas.getByText('No results match your search')).toBeInTheDocument()
    await expect(canvas.getByRole('button', {name: 'Clear filters'})).toBeInTheDocument()
  },
}

export const WithIconAndAction: Story = {
  args: {
    message: 'Your inbox is empty',
    icon: <StatusIcon name="check-done" variant="success" size={48} />,
    action: <Button variant="primary">Refresh</Button>,
  },
  play: async ({canvas}) => {
    await expect(canvas.getByText('Your inbox is empty')).toBeInTheDocument()
    await expect(canvas.getByRole('button', {name: 'Refresh'})).toBeInTheDocument()
  },
}
