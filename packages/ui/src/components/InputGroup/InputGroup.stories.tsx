import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {InputGroup} from './InputGroup'
import {Input} from '../Input/Input'

const meta: Meta = {
  title: 'Components/InputGroup',
}

export default meta
type Story = StoryObj

const onCopy = fn()

export const EndAddon: Story = {
  render: () => (
    <html.div style={layoutStyles.container}>
      <InputGroup.Root>
        <Input placeholder="Certificate password" />
        <InputGroup.Addon onClick={onCopy}>Copy</InputGroup.Addon>
      </InputGroup.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    const input = canvas.getByPlaceholderText('Certificate password')
    await expect(input).toBeInTheDocument()

    const button = canvas.getByRole('button', {name: 'Copy'})
    await expect(button).toBeInTheDocument()
  },
}

export const StartAddon: Story = {
  render: () => (
    <html.div style={layoutStyles.container}>
      <InputGroup.Root>
        <InputGroup.Addon position="start">https://</InputGroup.Addon>
        <Input placeholder="example.com" />
      </InputGroup.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText('https://')).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('example.com')).toBeInTheDocument()
  },
}

export const BothSides: Story = {
  render: () => (
    <html.div style={layoutStyles.container}>
      <InputGroup.Root>
        <InputGroup.Addon position="start">https://</InputGroup.Addon>
        <Input placeholder="example.com" />
        <InputGroup.Addon onClick={() => {}}>Go</InputGroup.Addon>
      </InputGroup.Root>
    </html.div>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText('https://')).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('example.com')).toBeInTheDocument()
    await expect(canvas.getByRole('button', {name: 'Go'})).toBeInTheDocument()
  },
}

export const ClickableAddon: Story = {
  render: () => (
    <html.div style={layoutStyles.container}>
      <InputGroup.Root>
        <Input placeholder="Click the addon" />
        <InputGroup.Addon onClick={onCopy}>Copy</InputGroup.Addon>
      </InputGroup.Root>
    </html.div>
  ),
  play: async ({canvas, userEvent}) => {
    const button = canvas.getByRole('button', {name: 'Copy'})
    await userEvent.click(button)
    await expect(onCopy).toHaveBeenCalled()
  },
}

export const StandaloneInput: Story = {
  name: 'Standalone Input (unchanged)',
  render: () => (
    <html.div style={layoutStyles.container}>
      <Input placeholder="Regular input, no group" />
    </html.div>
  ),
  play: async ({canvas}) => {
    const input = canvas.getByPlaceholderText('Regular input, no group')
    await expect(input).toBeInTheDocument()
  },
}

const layoutStyles = css.create({
  container: {maxWidth: 400},
  stack: {display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={layoutStyles.stack}>
      <InputGroup.Root>
        <Input placeholder="End addon" />
        <InputGroup.Addon onClick={() => {}}>Copy</InputGroup.Addon>
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Addon position="start">@</InputGroup.Addon>
        <Input placeholder="Start addon" />
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Addon position="start">https://</InputGroup.Addon>
        <Input placeholder="Both sides" />
        <InputGroup.Addon onClick={() => {}}>Go</InputGroup.Addon>
      </InputGroup.Root>
      <Input placeholder="Standalone (no group)" />
    </html.div>
  ),
}
