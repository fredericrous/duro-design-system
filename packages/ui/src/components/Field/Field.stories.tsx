import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Field} from './Field'
import {Input} from '../Input/Input'

const meta: Meta = {
  title: 'Components/Field',
  argTypes: {
    invalid: {
      control: 'boolean',
      description: 'Whether the field is in an invalid/error state',
    },
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Field.Root>
      <Field.Label>Username</Field.Label>
      <Input placeholder="Enter username" />
      <Field.Description>3-32 characters, letters and numbers only.</Field.Description>
    </Field.Root>
  ),
  play: async ({canvas}) => {
    // Label is associated with input via htmlFor/id
    const input = canvas.getByPlaceholderText('Enter username')
    await expect(input).toBeInTheDocument()

    const label = canvas.getByText('Username')
    await expect(label).toBeInTheDocument()
    await expect(label.tagName).toBe('LABEL')

    // Description text is present
    await expect(canvas.getByText('3-32 characters, letters and numbers only.')).toBeInTheDocument()

    // Input should reference description via aria-describedby
    await expect(input).toHaveAttribute('aria-describedby')
  },
}

export const WithError: Story = {
  render: () => (
    <Field.Root invalid>
      <Field.Label>Email</Field.Label>
      <Input variant="error" placeholder="Enter email" />
      <Field.Error>Please enter a valid email address.</Field.Error>
    </Field.Root>
  ),
  play: async ({canvas}) => {
    const input = canvas.getByPlaceholderText('Enter email')
    await expect(input).toHaveAttribute('aria-invalid', 'true')

    // Error message with alert role
    const error = canvas.getByRole('alert')
    await expect(error).toBeInTheDocument()
    await expect(error).toHaveTextContent('Please enter a valid email address.')
  },
}

const stackStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400},
  stackWide: {display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600},
})

export const FormExample: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Field.Root>
        <Field.Label>Username</Field.Label>
        <Input placeholder="johndoe" />
        <Field.Description>Must be unique.</Field.Description>
      </Field.Root>
      <Field.Root>
        <Field.Label>Password</Field.Label>
        <Input type="password" placeholder="At least 12 characters" />
        <Field.Description>Minimum 12 characters.</Field.Description>
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>Confirm Password</Field.Label>
        <Input type="password" variant="error" />
        <Field.Error>Passwords do not match.</Field.Error>
      </Field.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    // All labels rendered
    await expect(canvas.getByText('Username')).toBeInTheDocument()
    await expect(canvas.getByText('Password')).toBeInTheDocument()
    await expect(canvas.getByText('Confirm Password')).toBeInTheDocument()

    // Error field has alert
    const alert = canvas.getByRole('alert')
    await expect(alert).toHaveTextContent('Passwords do not match.')
  },
}

export const WithNecessityIcon: Story = {
  name: 'With necessity indicator (standalone)',
  render: () => (
    <html.div style={stackStyles.stack}>
      <Field.Root required>
        <Field.Label>Email</Field.Label>
        <Input placeholder="you@example.com" />
        <Field.Description>Required field with no Form context — indicator needs Form.</Field.Description>
      </Field.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    // Without Form context, no indicator shows (necessityIndicator comes from Form)
    const label = canvas.getByText('Email')
    await expect(label).toBeInTheDocument()
  },
}

export const LabelSide: Story = {
  name: 'Label position — side (standalone)',
  render: () => (
    <html.div style={stackStyles.stackWide}>
      <Field.Root labelPosition="side">
        <Field.Label>Username</Field.Label>
        <Input placeholder="Enter username" />
        <Field.Description>3-32 characters, letters and numbers only.</Field.Description>
      </Field.Root>

      <Field.Root labelPosition="side" invalid>
        <Field.Label>Email</Field.Label>
        <Input variant="error" placeholder="Enter email" />
        <Field.Error>Please enter a valid email address.</Field.Error>
      </Field.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByPlaceholderText('Enter username')).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('Enter email')).toBeInTheDocument()
    await expect(canvas.getByRole('alert')).toHaveTextContent('Please enter a valid email address.')
  },
}

export const Disabled: Story = {
  name: 'Disabled field (standalone)',
  render: () => (
    <html.div style={stackStyles.stack}>
      <Field.Root disabled>
        <Field.Label>Username</Field.Label>
        <Input placeholder="Enter username" />
        <Field.Description>This field is disabled.</Field.Description>
      </Field.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    const input = canvas.getByPlaceholderText('Enter username')
    await expect(input).toBeDisabled()
  },
}
