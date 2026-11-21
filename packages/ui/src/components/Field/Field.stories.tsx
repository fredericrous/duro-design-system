import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'
import {Schema} from 'effect'
import {expect, fn, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Field} from './Field'
import {Input} from '../Input/Input'
import {Button} from '../Button/Button'
import {Form} from '../Form/Form'
import {ToggleGroup} from '../ToggleGroup/ToggleGroup'
import {Toggle} from '../Toggle/Toggle'
import {CheckboxGroup} from '../CheckboxGroup/CheckboxGroup'
import {RadioGroup} from '../RadioGroup/RadioGroup'
import {Checkbox} from '../Checkbox/Checkbox'
import {Stack} from '../Stack/Stack'
import {Fieldset} from '../Fieldset/Fieldset'
import {spacing} from '@greenharness/greenrack-tokens/tokens/spacing.css'
import {sizes} from '@greenharness/greenrack-tokens/tokens/sizes.css'

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
  stack: {display: 'flex', flexDirection: 'column', gap: spacing.md, maxWidth: sizes.dialogSm},
  stackWide: {display: 'flex', flexDirection: 'column', gap: spacing.md, maxWidth: sizes.pageSm},
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
        <Field.Description>
          Required field with no Form context — indicator needs Form.
        </Field.Description>
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

export const GroupControls: Story = {
  name: 'Group controls named by the label',
  render: () => (
    <html.div style={stackStyles.stack}>
      {/* a direct ToggleGroup / CheckboxGroup / RadioGroup child is detected */}
      <Field.Root>
        <Field.Label>Type</Field.Label>
        <ToggleGroup defaultValue={['app']}>
          <Toggle value="app">Application</Toggle>
          <Toggle value="platform">Platform</Toggle>
        </ToggleGroup>
        <Field.Description>What the record describes.</Field.Description>
      </Field.Root>
      <Field.Root>
        <Field.Label>Channels</Field.Label>
        <CheckboxGroup.Root defaultValue={['mail']}>
          <CheckboxGroup.Item value="mail">Mail</CheckboxGroup.Item>
          <CheckboxGroup.Item value="sms">SMS</CheckboxGroup.Item>
        </CheckboxGroup.Root>
      </Field.Root>
      <Field.Root>
        <Field.Label>Plan</Field.Label>
        <RadioGroup.Root defaultValue="free">
          <RadioGroup.Item value="free">Free</RadioGroup.Item>
          <RadioGroup.Item value="pro">Pro</RadioGroup.Item>
        </RadioGroup.Root>
      </Field.Root>
      {/* a group that is not a direct child (here inside a Stack) says so */}
      <Field.Root group>
        <Field.Label>Technologies</Field.Label>
        <Stack gap="sm">
          <CheckboxGroup.Root orientation="horizontal">
            <CheckboxGroup.Item value="pg">PostgreSQL</CheckboxGroup.Item>
            <CheckboxGroup.Item value="kafka">Kafka</CheckboxGroup.Item>
          </CheckboxGroup.Root>
        </Stack>
      </Field.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    // each group control carries the Field.Label's text as its accessible name
    await expect(canvas.getByRole('toolbar', {name: 'Type'})).toBeInTheDocument()
    await expect(canvas.getByRole('group', {name: 'Channels'})).toBeInTheDocument()
    await expect(canvas.getByRole('radiogroup', {name: 'Plan'})).toBeInTheDocument()
    await expect(canvas.getByRole('group', {name: 'Technologies'})).toBeInTheDocument()
    // the description reaches the group too
    await expect(canvas.getByRole('toolbar', {name: 'Type'})).toHaveAccessibleDescription(
      'What the record describes.',
    )
    // a group's label is not a <label for> pointing at nothing
    for (const text of ['Type', 'Channels', 'Plan', 'Technologies']) {
      const label = canvas.getByText(text)
      await expect(label.tagName).not.toBe('LABEL')
      await expect(label.id).not.toBe('')
    }
  },
}

export const SingleControlStillLabelled: Story = {
  name: 'A single input keeps its <label for>',
  render: () => (
    <Field.Root>
      <Field.Label>Name</Field.Label>
      <Input placeholder="Name" />
    </Field.Root>
  ),
  play: async ({canvas}) => {
    const label = canvas.getByText('Name')
    await expect(label.tagName).toBe('LABEL')
    await expect(canvas.getByRole('textbox', {name: 'Name'})).toBeInTheDocument()
  },
}

export const FieldsetLegendNamesTheGroup: Story = {
  name: 'Fieldset legend names its group',
  render: () => (
    <Fieldset.Root>
      <Fieldset.Legend>Notifications</Fieldset.Legend>
      <Checkbox value="a">Weekly digest</Checkbox>
    </Fieldset.Root>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('group', {name: 'Notifications'})).toBeInTheDocument()
  },
}

export const NativeValidation: Story = {
  render: () => (
    <html.form>
      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input type="url" required placeholder="https://example.com" />
        <Field.Error />
      </Field.Root>
      <Button type="submit">Submit</Button>
    </html.form>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText('https://example.com') as HTMLInputElement
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}))
    const alert = await canvas.findByRole('alert')
    await expect(alert).toBeInTheDocument()
    await expect(alert.textContent).not.toBe('')
    await expect(alert.textContent).toBe(input.validationMessage)
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input.getAttribute('aria-describedby')).toContain(alert.id)

    await userEvent.type(input, 'https://example.com')
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument()
  },
}

const websitePlaceholder = 'https://example.com'

export const NativeValidationWithoutFieldError: Story = {
  render: () => (
    <html.form>
      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input type="url" required placeholder={websitePlaceholder} />
      </Field.Root>
      <Button type="submit">Submit</Button>
    </html.form>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText(websitePlaceholder) as HTMLInputElement
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}))
    const alert = await canvas.findByRole('alert')
    await expect(canvas.getAllByRole('alert')).toHaveLength(1)
    await expect(alert.textContent).toBe(input.validationMessage)
    await expect(input.getAttribute('aria-describedby')).toContain(alert.id)
  },
}

function ErrorMounts() {
  const [mounted, setMounted] = useState(false)
  return (
    <html.form>
      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input type="url" required placeholder={websitePlaceholder} />
        {mounted ? <Field.Error /> : null}
      </Field.Root>
      <Button type="submit">Submit</Button>
      <Button type="button" onClick={() => setMounted((previous) => !previous)}>
        Toggle error
      </Button>
    </html.form>
  )
}

export const NativeValidationErrorMounts: Story = {
  render: () => <ErrorMounts />,
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}))
    await canvas.findByRole('alert')
    await expect(canvas.getAllByRole('alert')).toHaveLength(1)
    await userEvent.click(canvas.getByRole('button', {name: 'Toggle error'}))
    await waitFor(() => expect(canvas.getAllByRole('alert')).toHaveLength(1))
    await userEvent.click(canvas.getByRole('button', {name: 'Toggle error'}))
    await waitFor(() => expect(canvas.getAllByRole('alert')).toHaveLength(1))
  },
}

function ProgrammaticClear() {
  const [text, setText] = useState('')
  return (
    <html.form>
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input
          type="url"
          placeholder="Name"
          value={text}
          onChange={(event: {currentTarget: {value: string}}) => setText(event.currentTarget.value)}
        />
        <Field.Error />
      </Field.Root>
      <Button type="submit">Submit</Button>
      <Button type="button" onClick={() => setText('')}>
        Clear value
      </Button>
    </html.form>
  )
}

export const NativeValidationProgrammaticClear: Story = {
  render: () => <ProgrammaticClear />,
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText('Name') as HTMLInputElement
    await userEvent.type(input, 'nope')
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}))
    await canvas.findByRole('alert')
    // The value changes to '' with no input event: the message must go.
    await userEvent.click(canvas.getByRole('button', {name: 'Clear value'}))
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument())
  },
}

export const NativeValidationFormReset: Story = {
  render: () => (
    <html.form>
      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input type="url" required placeholder={websitePlaceholder} />
      </Field.Root>
      <Button type="submit">Submit</Button>
    </html.form>
  ),
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText(websitePlaceholder) as HTMLInputElement
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}))
    await canvas.findByRole('alert')
    // react-strict-dom keeps no type="reset" on a button; reset the form itself.
    input.form?.reset()
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument())
    await expect(input).not.toHaveAttribute('aria-invalid')
  },
}

function ConstraintChange() {
  const [required, setRequired] = useState(true)
  return (
    <html.form>
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input required={required} placeholder="Name" />
      </Field.Root>
      <Button type="submit">Submit</Button>
      <Button type="button" onClick={() => setRequired(false)}>
        Not required
      </Button>
    </html.form>
  )
}

export const NativeValidationConstraintChange: Story = {
  render: () => <ConstraintChange />,
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText('Name')
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}))
    await canvas.findByRole('alert')
    await userEvent.click(canvas.getByRole('button', {name: 'Not required'}))
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument())
    await expect(input).not.toHaveAttribute('aria-invalid')
  },
}

export const NativeValidationDefaultValue: Story = {
  render: () => (
    <html.form>
      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input type="url" defaultValue="nope" placeholder={websitePlaceholder} />
      </Field.Root>
      <Button type="submit">Submit</Button>
    </html.form>
  ),
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}))
    await canvas.findByRole('alert')
    await new Promise((resolve) => setTimeout(resolve, 100))
    await expect(canvas.getAllByRole('alert')).toHaveLength(1)
  },
}

const nativeFormSchema = Schema.Struct({name: Schema.String})

export const NativeValidationInForm: Story = {
  render: () => {
    const onSubmit = fn()
    return (
      <Form schema={nativeFormSchema} defaultValues={{name: ''}} onSubmit={onSubmit}>
        {(methods) => (
          <>
            <Field.Root name="name">
              <Field.Label>Name</Field.Label>
              <Input required placeholder="Name" />
            </Field.Root>
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              onClick={() => methods.setError('name', {type: 'server', message: 'Taken'})}
            >
              Set error
            </Button>
            <Button type="button" onClick={() => methods.clearErrors('name')}>
              Clear errors
            </Button>
          </>
        )}
      </Form>
    )
  },
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText('Name') as HTMLInputElement
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}))
    const alert = await canvas.findByRole('alert')
    await expect(alert.textContent).toBe(input.validationMessage)
    // Blur first: the blur runs the resolver, which would clear a server error
    // set in the same click.
    await userEvent.tab()
    await userEvent.click(canvas.getByRole('button', {name: 'Set error'}))
    await waitFor(() => expect(canvas.getByRole('alert').textContent).toBe('Taken'))
    await expect(canvas.getAllByRole('alert')).toHaveLength(1)
    await userEvent.click(canvas.getByRole('button', {name: 'Clear errors'}))
    await waitFor(() => expect(canvas.getByRole('alert').textContent).toBe(input.validationMessage))
    await expect(canvas.getAllByRole('alert')).toHaveLength(1)
  },
}
