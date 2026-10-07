import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Input} from './Input'
import {Field} from '../Field/Field'
import {Stack} from '../Stack/Stack'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: {
    onChange: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'ghost'],
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number'],
    },
    disabled: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {placeholder: 'Enter text...'},
  play: async ({args, canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText('Enter text...')
    await expect(input).toBeInTheDocument()
    await expect(input).toBeEnabled()

    await userEvent.type(input, 'Hello world')
    await expect(input).toHaveValue('Hello world')
    await expect(args.onChange).toHaveBeenCalled()
  },
}

export const KeyboardEvents: Story = {
  args: {placeholder: 'Search commands', onFocus: fn(), onKeyDown: fn(), onKeyUp: fn()},
  play: async ({args, canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText('Search commands')
    await userEvent.click(input)
    await expect(args.onFocus).toHaveBeenCalledTimes(1)

    await userEvent.keyboard('{ArrowDown}{Enter}{Escape}')
    const keys = (args.onKeyDown as ReturnType<typeof fn>).mock.calls.map(
      ([e]) => (e as React.KeyboardEvent).key,
    )
    await expect(keys).toEqual(['ArrowDown', 'Enter', 'Escape'])
    await expect(args.onKeyUp).toHaveBeenCalledTimes(3)
  },
}

export const Error: Story = {
  args: {variant: 'error', placeholder: 'Invalid input'},
  play: async ({canvas}) => {
    const input = canvas.getByPlaceholderText('Invalid input')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  },
}

export const Password: Story = {
  args: {type: 'password', placeholder: 'Enter password'},
  play: async ({canvas, userEvent}) => {
    const input = canvas.getByPlaceholderText('Enter password')
    await expect(input).toHaveAttribute('type', 'password')

    await userEvent.type(input, 'secret123')
    await expect(input).toHaveValue('secret123')
  },
}

export const Disabled: Story = {
  args: {placeholder: 'Disabled', disabled: true},
  play: async ({canvas}) => {
    const input = canvas.getByPlaceholderText('Disabled')
    await expect(input).toBeDisabled()
  },
}

const stackStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: spacing.ms, maxWidth: sizes.panelSm},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Input placeholder="Default input" />
      <Input variant="error" placeholder="Error input" />
      <Input type="password" placeholder="Password input" />
      <Input placeholder="Disabled" disabled />
    </html.div>
  ),
  play: async ({canvas}) => {
    const inputs = canvas.getAllByRole('textbox')
    // password type is not role=textbox, so we expect 3
    await expect(inputs.length).toBe(3)

    const disabled = canvas.getByPlaceholderText('Disabled')
    await expect(disabled).toBeDisabled()
  },
}

// --- Ghost (5.2, direction OutlineOnHover) ---

export const GhostInlineEdit: Story = {
  render: () => (
    <html.div style={layoutStyles.narrow}>
      <Stack gap="md">
        <Field.Root>
          <Field.Label>Title</Field.Label>
          <Input variant="ghost" defaultValue="Printer on floor 3 is jammed" />
        </Field.Root>
        <Field.Root invalid>
          <Field.Label>Assignee</Field.Label>
          <Input variant="ghost" defaultValue="" />
          <Field.Error>Assignee is required</Field.Error>
        </Field.Root>
        <Field.Root disabled>
          <Field.Label>Due</Field.Label>
          <Input variant="ghost" defaultValue="Friday" />
        </Field.Root>
      </Stack>
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    const title = canvas.getByRole('textbox', {name: 'Title'})
    // Reads as text at rest: no border colour, no fill.
    await expect(getComputedStyle(title).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.click(title)
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Tab}')
    await expect(title).toHaveFocus()
    await expect(getComputedStyle(title).outlineStyle).toBe('solid')
    // The border colour transitions in (duration.fast).
    await waitFor(() => expect(getComputedStyle(title).borderTopColor).not.toBe('rgba(0, 0, 0, 0)'))

    const assignee = canvas.getByRole('textbox', {name: 'Assignee'})
    await expect(assignee).toHaveAttribute('aria-invalid', 'true')
    await expect(getComputedStyle(assignee).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')

    await expect(canvas.getByRole('textbox', {name: 'Due'})).toBeDisabled()
  },
}

const layoutStyles = css.create({
  narrow: {
    maxWidth: sizes.panelSm,
    padding: spacing.md,
  },
})
