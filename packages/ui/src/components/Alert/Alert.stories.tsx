import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Alert} from './Alert'

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'success', 'warning', 'info'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Error: Story = {
  args: {variant: 'error', children: 'Something went wrong. Please try again.'},
  play: async ({canvas}) => {
    const alert = canvas.getByRole('alert')
    await expect(alert).toBeInTheDocument()
    await expect(alert).toHaveTextContent('Something went wrong. Please try again.')
  },
}

export const Success: Story = {
  args: {variant: 'success', children: 'Account created successfully!'},
  play: async ({canvas}) => {
    const alert = canvas.getByRole('alert')
    await expect(alert).toHaveTextContent('Account created successfully!')
  },
}

export const Warning: Story = {
  args: {variant: 'warning', children: 'Your session will expire in 5 minutes.'},
  play: async ({canvas}) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
  },
}

export const Info: Story = {
  args: {variant: 'info', children: 'A new version is available.'},
  play: async ({canvas}) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
  },
}

const stackStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: 12},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Alert variant="error">Error: Something went wrong.</Alert>
      <Alert variant="success">Success: Operation completed.</Alert>
      <Alert variant="warning">Warning: Check your input.</Alert>
      <Alert variant="info">Info: System update available.</Alert>
    </html.div>
  ),
  play: async ({canvas}) => {
    const alerts = canvas.getAllByRole('alert')
    await expect(alerts.length).toBe(4)
  },
}
