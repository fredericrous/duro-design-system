import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, within} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {TagGroup} from './TagGroup'
import {Tag} from '../Tag/Tag'
import {Field} from '../Field/Field'
import {Stack} from '../Stack/Stack'

const meta: Meta = {
  title: 'Components/TagGroup',
}

export default meta
type Story = StoryObj

// ---------------------------------------------------------------------------
// Static display (no input)
// ---------------------------------------------------------------------------

export const StaticDisplay: Story = {
  render: () => (
    <TagGroup.Root>
      <TagGroup.List aria-label="Technologies">
        <Tag value="react">React</Tag>
        <Tag value="ts">TypeScript</Tag>
        <Tag value="node">Node.js</Tag>
      </TagGroup.List>
    </TagGroup.Root>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText('React')).toBeInTheDocument()
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument()
    await expect(canvas.getByText('Node.js')).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Editable with input
// ---------------------------------------------------------------------------

function EditableExample() {
  const [tags, setTags] = useState(['react', 'typescript'])

  return (
    <TagGroup.Root value={tags} onValueChange={setTags}>
      <TagGroup.Input placeholder="Add tag..." />
      <TagGroup.List aria-label="Tags">
        {tags.map((t) => (
          <Tag key={t} value={t}>
            {t}
          </Tag>
        ))}
      </TagGroup.List>
    </TagGroup.Root>
  )
}

export const Editable: Story = {
  render: () => <EditableExample />,
  play: async ({canvas}) => {
    await expect(canvas.getByText('react')).toBeInTheDocument()
    await expect(canvas.getByText('typescript')).toBeInTheDocument()
    // Input should be present
    await expect(canvas.getByRole('textbox')).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// With default value (uncontrolled)
// ---------------------------------------------------------------------------

export const WithDefaultValue: Story = {
  render: () => {
    function Uncontrolled() {
      const [tags, setTags] = useState(['one', 'two'])
      return (
        <TagGroup.Root defaultValue={['one', 'two']} onValueChange={setTags}>
          <TagGroup.Input placeholder="Add..." />
          <TagGroup.List aria-label="Items">
            {tags.map((t) => (
              <Tag key={t} value={t}>
                {t}
              </Tag>
            ))}
          </TagGroup.List>
        </TagGroup.Root>
      )
    }
    return <Uncontrolled />
  },
}

// ---------------------------------------------------------------------------
// Email input with validation
// ---------------------------------------------------------------------------

function EmailExample() {
  const [emails, setEmails] = useState<string[]>([])

  return (
    <Stack gap="md">
      <Field.Root required>
        <Field.Label>Invite emails</Field.Label>
        <Field.Description>Press Enter or comma to add each email</Field.Description>
        <TagGroup.Root
          name="emails"
          value={emails}
          onValueChange={setEmails}
          onValidate={(v) => (v.includes('@') ? true : 'Invalid email')}
        >
          <TagGroup.Input placeholder="Add email..." />
          <TagGroup.List aria-label="Emails">
            {emails.map((e) => (
              <Tag key={e} value={e}>
                {e}
              </Tag>
            ))}
          </TagGroup.List>
        </TagGroup.Root>
      </Field.Root>
    </Stack>
  )
}

export const EmailInput: Story = {
  render: () => <EmailExample />,
  play: async ({canvas}) => {
    const input = canvas.getByRole('textbox')
    await expect(input).toBeInTheDocument()
    // Type an email and press Enter
    await userEvent.type(input, 'alice@example.com{Enter}')
    await expect(canvas.getByText('alice@example.com')).toBeInTheDocument()
    // Type another
    await userEvent.type(input, 'bob@test.com,')
    await expect(canvas.getByText('bob@test.com')).toBeInTheDocument()
    // Invalid email should not create a tag
    await userEvent.type(input, 'notanemail{Enter}')
    expect(canvas.queryByText('notanemail')).not.toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

function DisabledExample() {
  const tags = ['react', 'vue', 'svelte']
  return (
    <TagGroup.Root value={tags} disabled>
      <TagGroup.Input placeholder="Disabled..." />
      <TagGroup.List aria-label="Frameworks">
        {tags.map((t) => (
          <Tag key={t} value={t}>
            {t}
          </Tag>
        ))}
      </TagGroup.List>
    </TagGroup.Root>
  )
}

export const Disabled: Story = {
  render: () => <DisabledExample />,
  play: async ({canvas}) => {
    await expect(canvas.getByRole('textbox')).toBeDisabled()
  },
}

// ---------------------------------------------------------------------------
// Tag variants inside TagGroup
// ---------------------------------------------------------------------------

export const WithVariants: Story = {
  render: () => (
    <TagGroup.Root>
      <TagGroup.List aria-label="Status">
        <Tag value="active" variant="success">
          Active
        </Tag>
        <Tag value="pending" variant="warning">
          Pending
        </Tag>
        <Tag value="expired" variant="error">
          Expired
        </Tag>
        <Tag value="info" variant="info">
          Updated
        </Tag>
      </TagGroup.List>
    </TagGroup.Root>
  ),
}
