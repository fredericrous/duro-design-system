import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Spinner} from './Spinner'

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  play: async ({canvas}) => {
    const status = canvas.getByRole('status')
    await expect(status).toBeInTheDocument()
    await expect(status).toHaveTextContent('Loading')
  },
}

export const Small: Story = {
  args: {size: 'sm'},
}

export const Large: Story = {
  args: {size: 'lg'},
}

export const CustomLabel: Story = {
  args: {label: 'Saving...'},
  play: async ({canvas}) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Saving...')
  },
}

const rowStyles = css.create({
  row: {display: 'flex', gap: 24, alignItems: 'center'},
})

export const AllSizes: Story = {
  render: () => (
    <html.div style={rowStyles.row}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </html.div>
  ),
  play: async ({canvas}) => {
    const spinners = canvas.getAllByRole('status')
    await expect(spinners.length).toBe(3)
  },
}
