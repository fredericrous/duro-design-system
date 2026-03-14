import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Callout} from './Callout'

const meta: Meta<typeof Callout> = {
  title: 'Components/Callout',
  component: Callout,
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'success', 'warning', 'info'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Callout>

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'A new version of the application is available. Please save your work and refresh the page to get the latest features and security updates.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children:
      "It looks like your certificate isn't installed yet. Install the .p12 file from your email, then click the button below. After installing the certificate, you may need to close and reopen your browser for it to be recognized.",
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children:
      'Your account has been created and your certificate is installed. You can now access all resources assigned to your groups. Check your email for a welcome guide with next steps.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    children:
      'We could not verify your identity. This may happen if your invite link has expired or was already used. Please contact your administrator to request a new invitation.',
  },
}

export const ShortText: Story = {
  name: 'Short text (still wraps)',
  args: {
    variant: 'info',
    children: 'System update available.',
  },
}

export const NoIcon: Story = {
  args: {
    variant: 'warning',
    icon: false,
    children: 'This callout has no icon — behaves like a simple box.',
  },
}

const stackStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: 12},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Callout variant="error">
        We could not verify your identity. This may happen if your invite link has expired or was already used. Please contact your administrator.
      </Callout>
      <Callout variant="success">
        Your account has been created and your certificate is installed. You can now access all resources assigned to your groups.
      </Callout>
      <Callout variant="warning">
        It looks like your certificate is not installed yet. Install the .p12 file from your email, then click the button below.
      </Callout>
      <Callout variant="info">
        A new version of the application is available. Please save your work and refresh the page to get the latest features.
      </Callout>
    </html.div>
  ),
  play: async ({canvas}) => {
    const callouts = canvas.getAllByRole('note')
    await expect(callouts.length).toBe(4)
  },
}
