import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {FileTrigger} from './FileTrigger'

const meta: Meta<typeof FileTrigger> = {
  title: 'Components/FileTrigger',
  component: FileTrigger,
  args: {onSelect: fn()},
  argTypes: {
    variant: {control: 'select', options: ['primary', 'secondary', 'link', 'danger']},
    size: {control: 'select', options: ['default', 'small']},
    multiple: {control: 'boolean'},
    disabled: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof FileTrigger>

export const Default: Story = {
  args: {children: 'Choose file', variant: 'secondary'},
  play: async ({args, canvas, userEvent, canvasElement}) => {
    await expect(canvas.getByRole('button', {name: 'Choose file'})).toBeEnabled()
    const input = canvasElement.querySelector<HTMLInputElement>('input[type=file]')!
    await userEvent.upload(input, new File(['hi'], 'hi.txt', {type: 'text/plain'}))
    await expect(args.onSelect).toHaveBeenCalledTimes(1)
  },
}

export const Images: Story = {
  args: {children: 'Choose images', accept: 'image/*', multiple: true},
}

export const Disabled: Story = {
  args: {children: 'Choose file', disabled: true},
}
