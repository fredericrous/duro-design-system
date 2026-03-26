import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Tag} from './Tag'

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    removable: {control: 'boolean'},
    disabled: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof Tag>

export const Default: Story = {
  args: {children: 'Tag'},
  play: async ({canvas}) => {
    await expect(canvas.getByText('Tag')).toBeInTheDocument()
  },
}

export const Removable: Story = {
  args: {children: 'user@example.com', removable: true, onRemove: fn()},
  play: async ({canvas}) => {
    await expect(canvas.getByText('user@example.com')).toBeInTheDocument()
    await expect(canvas.getByRole('button', {name: /remove/i})).toBeInTheDocument()
  },
}

export const Disabled: Story = {
  args: {children: 'Disabled', removable: true, disabled: true},
}

export const Small: Story = {
  args: {children: 'Small', size: 'sm', removable: true, onRemove: fn()},
}

const layoutStyles = css.create({
  row: {display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  stack: {display: 'flex', flexDirection: 'column', gap: 16},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={layoutStyles.stack}>
      <html.div style={layoutStyles.row}>
        <Tag>Default</Tag>
        <Tag variant="success">Success</Tag>
        <Tag variant="warning">Warning</Tag>
        <Tag variant="error">Error</Tag>
        <Tag variant="info">Info</Tag>
      </html.div>
      <html.div style={layoutStyles.row}>
        <Tag removable onRemove={() => {}}>
          Default
        </Tag>
        <Tag variant="success" removable onRemove={() => {}}>
          Success
        </Tag>
        <Tag variant="warning" removable onRemove={() => {}}>
          Warning
        </Tag>
        <Tag variant="error" removable onRemove={() => {}}>
          Error
        </Tag>
        <Tag variant="info" removable onRemove={() => {}}>
          Info
        </Tag>
      </html.div>
      <html.div style={layoutStyles.row}>
        <Tag size="sm">Small</Tag>
        <Tag size="sm" removable onRemove={() => {}}>
          Removable Small
        </Tag>
      </html.div>
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getAllByText('Default').length).toBe(2)
  },
}
