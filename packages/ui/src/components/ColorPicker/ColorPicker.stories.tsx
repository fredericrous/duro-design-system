import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, fireEvent, userEvent as user} from 'storybook/test'
import {useState} from 'react'
import {html} from 'react-strict-dom'
import {ColorPicker} from './ColorPicker'

const meta: Meta<typeof ColorPicker> = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  args: {
    'aria-label': 'Accent',
    onChange: fn(),
    onChangeComplete: fn(),
  },
  argTypes: {
    disabled: {control: 'boolean'},
    allowTransparent: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof ColorPicker>

export const Default: Story = {
  args: {defaultValue: '#ff0000'},
  play: async ({canvas}) => {
    await expect(canvas.getByRole('group', {name: 'Accent'})).toBeInTheDocument()
    const area = canvas.getByRole('slider', {name: 'Saturation and brightness'})
    await expect(area).toHaveAttribute('aria-valuetext', 'Saturation 100%, Brightness 100%')
    await expect(canvas.getByRole('slider', {name: 'Hue'})).toHaveAttribute('aria-valuenow', '0')
    await expect(canvas.getByRole('slider', {name: 'Alpha'})).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
    await expect(canvas.getByRole('textbox', {name: 'Colour'})).toHaveValue('#ff0000')
  },
}

export const KeyboardArea: Story = {
  args: {defaultValue: '#ff0000'},
  play: async ({canvas, userEvent, args}) => {
    const area = canvas.getByRole('slider', {name: 'Saturation and brightness'})
    area.focus()
    await userEvent.keyboard('{ArrowLeft}{ArrowDown}')
    await expect(area).toHaveAttribute('aria-valuetext', 'Saturation 99%, Brightness 99%')
    await expect(args.onChange).toHaveBeenCalled()
    await expect(args.onChangeComplete).toHaveBeenCalled()
  },
}

export const HueAndAlpha: Story = {
  args: {defaultValue: '#ff0000', allowTransparent: true},
  play: async ({canvas, userEvent, args}) => {
    const hue = canvas.getByRole('slider', {name: 'Hue'})
    hue.focus()
    await userEvent.keyboard('{End}')
    await expect(hue).toHaveAttribute('aria-valuenow', '360')
    const alpha = canvas.getByRole('slider', {name: 'Alpha'})
    alpha.focus()
    await userEvent.keyboard('{Home}')
    await expect(args.onChange).toHaveBeenLastCalledWith('rgba(255, 0, 0, 0)')
    await expect(canvas.getByRole('textbox', {name: 'Colour'})).toHaveValue('rgba(255, 0, 0, 0)')
  },
}

export const PointerDragArea: Story = {
  args: {defaultValue: '#ff0000'},
  play: async ({canvas, args}) => {
    const area = canvas.getByRole('slider', {name: 'Saturation and brightness'})
    const hit = area.parentElement as HTMLElement
    const rect = hit.getBoundingClientRect()
    const at = (x: number, y: number) => ({
      clientX: rect.left + rect.width * x,
      clientY: rect.top + rect.height * y,
      pointerId: 1,
      button: 0,
    })
    await fireEvent.pointerDown(hit, at(0, 0))
    await expect(args.onChange).toHaveBeenLastCalledWith('#ffffff')
    await fireEvent.pointerMove(hit, at(1, 1))
    await expect(args.onChange).toHaveBeenLastCalledWith('#000000')
    await expect(args.onChangeComplete).not.toHaveBeenCalled()
    await fireEvent.pointerUp(hit, at(1, 1))
    await expect(args.onChangeComplete).toHaveBeenLastCalledWith('#000000')
  },
}

export const TextField: Story = {
  args: {defaultValue: '#ff0000', allowTransparent: true},
  play: async ({canvas, userEvent, args}) => {
    const field = canvas.getByRole('textbox', {name: 'Colour'})
    await userEvent.clear(field)
    await userEvent.type(field, 'nonsense')
    await userEvent.tab()
    await expect(args.onChange).not.toHaveBeenCalled()
    await expect(field).toHaveValue('nonsense')
    await userEvent.clear(field)
    await userEvent.type(field, 'rgba(0, 128, 0, 0.5){Enter}')
    await expect(args.onChange).toHaveBeenLastCalledWith('rgba(0, 128, 0, 0.5)')
    await expect(args.onChangeComplete).toHaveBeenLastCalledWith('rgba(0, 128, 0, 0.5)')
    await userEvent.clear(field)
    await userEvent.type(field, 'hsl(240, 100%, 50%)')
    await userEvent.tab()
    await expect(args.onChange).toHaveBeenLastCalledWith('#0000ff')
  },
}

export const SwatchesAndRecent: Story = {
  args: {
    defaultValue: '#ff0000',
    swatches: ['#00ff00', '#0000ff'],
    recentColors: ['#ffff00'],
    recentLabel: 'Recent colours',
  },
  play: async ({canvas, userEvent, args}) => {
    await userEvent.click(canvas.getByRole('button', {name: '#0000ff'}))
    await expect(args.onChangeComplete).toHaveBeenLastCalledWith('#0000ff')
    const recent = canvas.getByRole('group', {name: 'Recent colours'})
    await expect(recent).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', {name: '#ffff00'}))
    await expect(canvas.getByRole('textbox', {name: 'Colour'})).toHaveValue('#ffff00')
  },
}

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('#336699')
    return (
      <>
        <ColorPicker {...args} value={value} onChange={setValue} />
        <html.button type="button" onClick={() => setValue('#aa0000')}>
          Reset
        </html.button>
      </>
    )
  },
  play: async ({canvas}) => {
    await expect(canvas.getByRole('textbox', {name: 'Colour'})).toHaveValue('#336699')
    await user.click(canvas.getByRole('button', {name: 'Reset'}))
    await expect(canvas.getByRole('textbox', {name: 'Colour'})).toHaveValue('#aa0000')
  },
}

export const Disabled: Story = {
  args: {defaultValue: '#336699', disabled: true},
  play: async ({canvas, userEvent, args}) => {
    const area = canvas.getByRole('slider', {name: 'Saturation and brightness'})
    await expect(area).toHaveAttribute('aria-disabled', 'true')
    area.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onChange).not.toHaveBeenCalled()
    await expect(canvas.getByRole('textbox', {name: 'Colour'})).toBeDisabled()
  },
}
