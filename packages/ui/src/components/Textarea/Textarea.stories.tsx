import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Textarea} from './Textarea'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    onChange: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error'],
    },
    disabled: {control: 'boolean'},
    rows: {control: 'number'},
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {placeholder: 'Enter your message...'},
  play: async ({canvas, userEvent, args}) => {
    const textarea = canvas.getByPlaceholderText('Enter your message...')
    await expect(textarea).toBeInTheDocument()
    await expect(textarea).toBeEnabled()

    await userEvent.type(textarea, 'Hello world')
    await expect(textarea).toHaveValue('Hello world')
    await expect(args.onChange).toHaveBeenCalled()
  },
}

export const KeyboardEvents: Story = {
  args: {placeholder: 'Edit note', onFocus: fn(), onKeyDown: fn(), onKeyUp: fn()},
  play: async ({args, canvas, userEvent}) => {
    const textarea = canvas.getByPlaceholderText('Edit note')
    await userEvent.click(textarea)
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
  args: {variant: 'error', placeholder: 'Invalid content'},
  play: async ({canvas}) => {
    const textarea = canvas.getByPlaceholderText('Invalid content')
    await expect(textarea).toHaveAttribute('aria-invalid', 'true')
  },
}

export const Disabled: Story = {
  args: {placeholder: 'Disabled', disabled: true},
  play: async ({canvas}) => {
    await expect(canvas.getByPlaceholderText('Disabled')).toBeDisabled()
  },
}

export const CustomRows: Story = {
  args: {placeholder: 'Large textarea', rows: 8},
  play: async ({canvas}) => {
    const textarea = canvas.getByPlaceholderText('Large textarea')
    await expect(textarea).toHaveAttribute('rows', '8')
  },
}

const stackStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: spacing.ms, maxWidth: sizes.panelSm},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Textarea placeholder="Default textarea" />
      <Textarea variant="error" placeholder="Error textarea" />
      <Textarea placeholder="Disabled" disabled />
    </html.div>
  ),
  play: async ({canvas}) => {
    const textareas = canvas.getAllByRole('textbox')
    await expect(textareas.length).toBe(3)

    const disabled = canvas.getByPlaceholderText('Disabled')
    await expect(disabled).toBeDisabled()
  },
}
