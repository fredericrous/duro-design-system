import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {LinkButton} from './LinkButton'

const meta: Meta<typeof LinkButton> = {
  title: 'Components/LinkButton',
  component: LinkButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
    },
    fullWidth: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof LinkButton>

export const Primary: Story = {
  args: {href: '#', variant: 'primary', children: 'Get started'},
  play: async ({canvas}) => {
    const link = canvas.getByRole('link', {name: 'Get started'})
    await expect(link).toBeInTheDocument()
    await expect(link).toHaveAttribute('href', '#')
  },
}

export const Secondary: Story = {
  args: {href: '#', variant: 'secondary', children: 'Learn more'},
  play: async ({canvas}) => {
    await expect(canvas.getByRole('link', {name: 'Learn more'})).toBeInTheDocument()
  },
}

export const Small: Story = {
  args: {href: '#', size: 'small', children: 'Small link'},
}

export const FullWidth: Story = {
  args: {href: '#', fullWidth: true, children: 'Full width link'},
}

export const ExternalLink: Story = {
  args: {href: 'https://example.com', target: '_blank', rel: 'noopener noreferrer', children: 'External'},
  play: async ({canvas}) => {
    const link = canvas.getByRole('link', {name: 'External'})
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

const rowStyles = css.create({
  row: {display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'},
  stack: {display: 'flex', flexDirection: 'column', gap: 16},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={rowStyles.stack}>
      <html.div style={rowStyles.row}>
        <LinkButton href="#">Primary</LinkButton>
        <LinkButton href="#" variant="secondary">Secondary</LinkButton>
      </html.div>
      <html.div style={rowStyles.row}>
        <LinkButton href="#" size="small">Small Primary</LinkButton>
        <LinkButton href="#" variant="secondary" size="small">Small Secondary</LinkButton>
      </html.div>
    </html.div>
  ),
  play: async ({canvas}) => {
    const links = canvas.getAllByRole('link')
    await expect(links.length).toBe(4)
  },
}
