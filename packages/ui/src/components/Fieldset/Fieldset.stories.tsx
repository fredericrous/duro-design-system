import type {Meta, StoryObj} from '@storybook/react'
import {Fieldset} from './Fieldset'
import {Field} from '../Field/Field'
import {Input} from '../Input/Input'
import {Button} from '../Button/Button'

const meta: Meta<typeof Fieldset.Root> = {
  title: 'Components/Fieldset',
  component: Fieldset.Root,
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'ms', 'md', 'lg', 'xl'],
    },
    disabled: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof Fieldset.Root>

export const Default: Story = {
  args: {gap: 'md'},
  render: (args) => (
    <Fieldset.Root {...args}>
      <Fieldset.Legend>Account Information</Fieldset.Legend>
      <Field.Root>
        <Field.Label>Username</Field.Label>
        <Input placeholder="Enter username" />
        <Field.Description>3-32 characters: letters, numbers, hyphens</Field.Description>
      </Field.Root>
      <Field.Root>
        <Field.Label>Password</Field.Label>
        <Input type="password" placeholder="Enter password" />
        <Field.Description>At least 12 characters</Field.Description>
      </Field.Root>
      <Field.Root>
        <Field.Label>Confirm Password</Field.Label>
        <Input type="password" placeholder="Confirm password" />
      </Field.Root>
      <Button variant="primary" fullWidth>
        Create Account
      </Button>
    </Fieldset.Root>
  ),
}

export const Disabled: Story = {
  args: {gap: 'md', disabled: true},
  render: (args) => (
    <Fieldset.Root {...args}>
      <Fieldset.Legend>Account Information</Fieldset.Legend>
      <Field.Root>
        <Field.Label>Username</Field.Label>
        <Input placeholder="Enter username" />
      </Field.Root>
      <Field.Root>
        <Field.Label>Password</Field.Label>
        <Input type="password" placeholder="Enter password" />
      </Field.Root>
      <Button variant="primary" fullWidth>
        Submit
      </Button>
    </Fieldset.Root>
  ),
}

export const CompactGap: Story = {
  args: {gap: 'sm'},
  render: (args) => (
    <Fieldset.Root {...args}>
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="you@example.com" />
      </Field.Root>
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input placeholder="Your name" />
      </Field.Root>
      <Button variant="primary" fullWidth>
        Save
      </Button>
    </Fieldset.Root>
  ),
}
