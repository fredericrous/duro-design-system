import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Input} from './Input'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: {
    onChange: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error'],
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

/** `accept` narrows a file picker to the listed types (image upload here). */
export const FileAccept: Story = {
  args: {type: 'file', accept: 'image/png,image/jpeg,.webp', 'aria-label': 'Upload image'},
  play: async ({canvas}) => {
    const input = canvas.getByLabelText('Upload image')
    await expect(input).toHaveAttribute('type', 'file')
    await expect(input).toHaveAttribute('accept', 'image/png,image/jpeg,.webp')
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
  stack: {display: 'flex', flexDirection: 'column', gap: spacing.ms, maxWidth: 320},
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
