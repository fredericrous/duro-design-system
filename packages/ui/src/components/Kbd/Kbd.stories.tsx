import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {Kbd} from './Kbd'
import {onThemeSurface} from '../../docs/themedSurface'

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  argTypes: {keys: {control: 'object'}},
}
export default meta
type Story = StoryObj<typeof Kbd>

export const Default: Story = {
  args: {keys: ['J']},
  play: async ({canvasElement}) => {
    const keys = canvasElement.querySelectorAll('kbd')
    await expect(keys).toHaveLength(1)
    await expect(keys[0]).toHaveTextContent('J')
  },
}

/** A chord: one <kbd> per key. */
export const Chord: Story = {
  args: {keys: ['Cmd', 'Shift', 'K']},
  play: async ({canvasElement}) => {
    const keys = Array.from(canvasElement.querySelectorAll('kbd'))
    await expect(keys.map((k) => k.textContent)).toEqual(['Cmd', 'Shift', 'K'])
  },
}
