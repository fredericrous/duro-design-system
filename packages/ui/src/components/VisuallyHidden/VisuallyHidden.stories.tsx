import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {VisuallyHidden} from './VisuallyHidden'
import {Button} from '../Button/Button'
import {Icon} from '../Icon/Icon'

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
}

export default meta
type Story = StoryObj<typeof VisuallyHidden>

export const NamesAnIconButton: Story = {
  render: () => (
    <Button variant="secondary">
      <Icon name="search" size="sm" />
      <VisuallyHidden>Search</VisuallyHidden>
    </Button>
  ),
  play: async ({canvas}) => {
    const button = canvas.getByRole('button', {name: 'Search'})
    await expect(button).toBeInTheDocument()
    const text = canvas.getByText('Search')
    const box = text.getBoundingClientRect()
    await expect(box.width).toBeLessThanOrEqual(1)
    await expect(box.height).toBeLessThanOrEqual(1)
  },
}
