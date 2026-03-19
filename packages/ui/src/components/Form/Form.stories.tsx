import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, userEvent, within} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Schema} from 'effect'
import {Form} from './Form'
import {Field} from '../Field/Field'
import {Input} from '../Input/Input'
import {Textarea} from '../Textarea/Textarea'
import {Fieldset} from '../Fieldset/Fieldset'
import {Button} from '../Button/Button'

const meta: Meta = {
  title: 'Components/Form',
}

export default meta
type Story = StoryObj

// --- Schemas ---

const LoginSchema = Schema.Struct({
  username: Schema.String.pipe(
    Schema.minLength(3, {message: () => 'Username must be at least 3 characters'}),
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, {message: () => 'Password must be at least 8 characters'}),
  ),
})

const FeedbackSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {message: () => 'Enter a valid email address'}),
  ),
  message: Schema.String.pipe(
    Schema.minLength(10, {message: () => 'Message must be at least 10 characters'}),
  ),
})

const wrapStyles = css.create({
  wrap: {maxWidth: 400},
})

// --- Stories ---

export const Default: Story = {
  render: () => {
    const handleSubmit = fn()
    return (
      <html.div style={wrapStyles.wrap}>
        <Form
          schema={LoginSchema}
          defaultValues={{username: '', password: ''}}
          onSubmit={handleSubmit}
        >
          {({formState}) => (
            <Fieldset.Root gap="md">
              <Field.Root name="username">
                <Field.Label>Username</Field.Label>
                <Input placeholder="Enter username" />
                <Field.Description>3-32 characters</Field.Description>
                <Field.Error />
              </Field.Root>

              <Field.Root name="password">
                <Field.Label>Password</Field.Label>
                <Input type="password" placeholder="Enter password" />
                <Field.Error />
              </Field.Root>

              <Button type="submit" disabled={!formState.isValid}>
                Log in
              </Button>
            </Fieldset.Root>
          )}
        </Form>
      </html.div>
    )
  },
  play: async ({canvas}) => {
    // Submit button starts disabled (empty fields are invalid)
    const button = canvas.getByRole('button', {name: 'Log in'})
    await expect(button).toBeDisabled()

    // Labels and inputs rendered
    await expect(canvas.getByText('Username')).toBeInTheDocument()
    await expect(canvas.getByText('Password')).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('Enter username')).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('Enter password')).toBeInTheDocument()
  },
}

export const ValidationOnBlur: Story = {
  name: 'Validation — on blur',
  render: () => (
    <html.div style={wrapStyles.wrap}>
      <Form schema={LoginSchema} defaultValues={{username: '', password: ''}} onSubmit={fn()}>
        <Fieldset.Root gap="md">
          <Field.Root name="username">
            <Field.Label>Username</Field.Label>
            <Input placeholder="Enter username" />
            <Field.Error />
          </Field.Root>

          <Field.Root name="password">
            <Field.Label>Password</Field.Label>
            <Input type="password" placeholder="Enter password" />
            <Field.Error />
          </Field.Root>

          <Button type="submit">Log in</Button>
        </Fieldset.Root>
      </Form>
    </html.div>
  ),
  play: async ({canvas, step}) => {
    const usernameInput = canvas.getByPlaceholderText('Enter username')
    const passwordInput = canvas.getByPlaceholderText('Enter password')

    await step('No errors before interaction', async () => {
      expect(canvas.queryByRole('alert')).not.toBeInTheDocument()
    })

    await step('Type short username then blur — error appears', async () => {
      await userEvent.type(usernameInput, 'ab')
      await userEvent.tab() // blur
      const alert = await canvas.findByRole('alert')
      await expect(alert).toHaveTextContent('Username must be at least 3 characters')
    })

    await step(
      'Fix username by typing more — error clears (reValidateMode: onChange)',
      async () => {
        await userEvent.type(usernameInput, 'c') // now "abc"
        expect(canvas.queryByText('Username must be at least 3 characters')).not.toBeInTheDocument()
      },
    )

    await step('Blur empty password — error appears', async () => {
      await userEvent.click(passwordInput)
      await userEvent.tab()
      const alerts = canvas.getAllByRole('alert')
      const pwAlert = alerts.find((el) => el.textContent?.includes('Password'))
      await expect(pwAlert).toBeDefined()
    })
  },
}

export const WithTextarea: Story = {
  name: 'With Textarea',
  render: () => (
    <html.div style={wrapStyles.wrap}>
      <Form schema={FeedbackSchema} defaultValues={{email: '', message: ''}} onSubmit={fn()}>
        {({formState}) => (
          <Fieldset.Root gap="md">
            <Field.Root name="email">
              <Field.Label>Email</Field.Label>
              <Input type="email" placeholder="you@example.com" />
              <Field.Error />
            </Field.Root>

            <Field.Root name="message">
              <Field.Label>Message</Field.Label>
              <Textarea placeholder="Tell us what you think..." rows={4} />
              <Field.Description>At least 10 characters</Field.Description>
              <Field.Error />
            </Field.Root>

            <Button type="submit" disabled={!formState.isValid}>
              Send feedback
            </Button>
          </Fieldset.Root>
        )}
      </Form>
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('Tell us what you think...')).toBeInTheDocument()

    const button = canvas.getByRole('button', {name: 'Send feedback'})
    await expect(button).toBeDisabled()
  },
}

export const SuccessfulSubmit: Story = {
  name: 'Successful submit',
  render: () => {
    const onSubmit = fn()
    return (
      <html.div style={wrapStyles.wrap}>
        <Form schema={LoginSchema} defaultValues={{username: '', password: ''}} onSubmit={onSubmit}>
          <Fieldset.Root gap="md">
            <Field.Root name="username">
              <Field.Label>Username</Field.Label>
              <Input placeholder="Enter username" />
              <Field.Error />
            </Field.Root>

            <Field.Root name="password">
              <Field.Label>Password</Field.Label>
              <Input type="password" placeholder="Enter password" />
              <Field.Error />
            </Field.Root>

            <Button type="submit">Log in</Button>
          </Fieldset.Root>
        </Form>
      </html.div>
    )
  },
  play: async ({canvas}) => {
    const usernameInput = canvas.getByPlaceholderText('Enter username')
    const passwordInput = canvas.getByPlaceholderText('Enter password')

    // Fill valid values
    await userEvent.type(usernameInput, 'johndoe')
    await userEvent.type(passwordInput, 'supersecret1')

    // No errors should be present
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument()
  },
}

export const StandaloneFieldStillWorks: Story = {
  name: 'Standalone Field (no Form)',
  render: () => (
    <html.div style={wrapStyles.wrap}>
      <Field.Root invalid>
        <Field.Label>Email</Field.Label>
        <Input variant="error" placeholder="Enter email" />
        <Field.Error>Manual error — no Form wrapper needed.</Field.Error>
      </Field.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    // Standalone usage still works without Form context
    const input = canvas.getByPlaceholderText('Enter email')
    await expect(input).toHaveAttribute('aria-invalid', 'true')

    const alert = canvas.getByRole('alert')
    await expect(alert).toHaveTextContent('Manual error — no Form wrapper needed.')
  },
}
