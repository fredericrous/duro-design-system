import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {ButtonGroup} from './ButtonGroup'
import {Button} from '../Button/Button'

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    align: {control: 'select', options: ['start', 'end', 'center']},
    gap: {control: 'select', options: ['xs', 'sm', 'md']},
    disabled: {control: 'boolean'},
  },
}

export default meta
type Story = StoryObj<typeof ButtonGroup>

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </ButtonGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toBeInTheDocument()
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(3)
  },
}

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </ButtonGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toBeInTheDocument()
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(3)
  },
}

export const EndAligned: Story = {
  render: () => (
    <ButtonGroup align="end">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </ButtonGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toBeInTheDocument()
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(2)
  },
}

export const Disabled: Story = {
  render: () => (
    <ButtonGroup disabled>
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </ButtonGroup>
  ),
  play: async ({canvas}) => {
    const group = canvas.getByRole('group')
    await expect(group).toBeInTheDocument()
    await expect(group).toHaveStyle({opacity: '0.5', pointerEvents: 'none'})
  },
}

export const WithGaps: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <ButtonGroup gap="xs">
        <Button variant="primary">XS Gap</Button>
        <Button variant="secondary">XS Gap</Button>
      </ButtonGroup>
      <ButtonGroup gap="sm">
        <Button variant="primary">SM Gap</Button>
        <Button variant="secondary">SM Gap</Button>
      </ButtonGroup>
      <ButtonGroup gap="md">
        <Button variant="primary">MD Gap</Button>
        <Button variant="secondary">MD Gap</Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({canvas}) => {
    const groups = canvas.getAllByRole('group')
    await expect(groups.length).toBe(3)
  },
}
