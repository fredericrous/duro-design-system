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
    align: {
      control: 'inline-radio',
      options: ['center', 'start'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Callout>

// Long, multi-paragraph messages align the icon to the first line.
export const Info: Story = {
  args: {
    variant: 'info',
    align: 'start',
    children:
      'A new version of the application is available. Please save your work and refresh the page to get the latest features and security updates.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    align: 'start',
    children:
      "It looks like your certificate isn't installed yet. Install the .p12 file from your email, then click the button below. After installing the certificate, you may need to close and reopen your browser for it to be recognized.",
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    align: 'start',
    children:
      'Your account has been created and your certificate is installed. You can now access all resources assigned to your groups. Check your email for a welcome guide with next steps.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    align: 'start',
    children:
      'We could not verify your identity. This may happen if your invite link has expired or was already used. Please contact your administrator to request a new invitation.',
  },
}

// Short single-line message — the default `align="center"` vertically centres
// the icon against the text.
export const ShortCentered: Story = {
  args: {
    variant: 'success',
    children: "You're all caught up — no requests awaiting review.",
  },
  play: async ({canvas}) => {
    await expect(canvas.getByRole('note')).toBeInTheDocument()
    await expect(canvas.getByText(/all caught up/)).toBeInTheDocument()
    // Exactly one icon (svg) — the component's own, no duplicate.
    await expect(canvas.getByRole('note').querySelectorAll('svg')).toHaveLength(1)
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
      <Callout variant="error" align="start">
        We could not verify your identity. This may happen if your invite link has expired or was
        already used. Please contact your administrator.
      </Callout>
      <Callout variant="success" align="start">
        Your account has been created and your certificate is installed. You can now access all
        resources assigned to your groups.
      </Callout>
      <Callout variant="warning" align="start">
        It looks like your certificate is not installed yet. Install the .p12 file from your email,
        then click the button below.
      </Callout>
      <Callout variant="info">A new version is available.</Callout>
    </html.div>
  ),
  play: async ({canvas}) => {
    const callouts = canvas.getAllByRole('note')
    await expect(callouts.length).toBe(4)
  },
}
