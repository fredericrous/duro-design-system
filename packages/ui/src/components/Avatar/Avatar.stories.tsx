import type {Meta, StoryObj} from '@storybook/react'
import {expect, waitFor} from 'storybook/test'
import {Avatar} from './Avatar'
import {Inline} from '../Inline/Inline'
import {onThemeSurface} from '../../docs/themedSurface'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  decorators: [onThemeSurface],
  argTypes: {
    size: {control: 'select', options: ['sm', 'md', 'lg']},
    shape: {control: 'select', options: ['circle', 'square']},
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

// A 1x1 transparent GIF: a real image that needs no network.
const PICTURE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export const Default: Story = {
  args: {alt: 'Grace Hopper', initials: 'GH'},
}

/** The image when there is a src; else the initials; else a neutral placeholder. */
export const ImageInitialsPlaceholder: Story = {
  render: () => (
    <Inline gap="md" align="center">
      <Avatar src={PICTURE} alt="Ada Lovelace" />
      <Avatar alt="Grace Hopper" initials="GH" />
      <Avatar alt="Unassigned" />
    </Inline>
  ),
  play: async ({canvas}) => {
    const image = canvas.getByRole('img', {name: 'Ada Lovelace'})
    await expect(image.tagName).toBe('IMG')
    await expect(image).toHaveAttribute('src', PICTURE)

    const initials = canvas.getByRole('img', {name: 'Grace Hopper'})
    await expect(initials.tagName).not.toBe('IMG')
    await expect(initials).toHaveTextContent('GH')

    const placeholder = canvas.getByRole('img', {name: 'Unassigned'})
    await expect(placeholder).toBeEmptyDOMElement()
  },
}

export const Sizes: Story = {
  render: () => (
    <Inline gap="md" align="center">
      <Avatar alt="Small" initials="S" size="sm" />
      <Avatar alt="Medium" initials="M" size="md" />
      <Avatar alt="Large" initials="L" size="lg" />
    </Inline>
  ),
}

export const Shapes: Story = {
  render: () => (
    <Inline gap="md" align="center">
      <Avatar alt="Circle" initials="C" shape="circle" />
      <Avatar alt="Square" initials="S" shape="square" />
    </Inline>
  ),
}

/** An image that cannot load falls back to the initials. */
export const BrokenImage: Story = {
  args: {src: 'data:image/png;base64,not-an-image', alt: 'Alan Turing', initials: 'AT'},
  play: async ({canvas}) => {
    await waitFor(async () => {
      const avatar = canvas.getByRole('img', {name: 'Alan Turing'})
      await expect(avatar.tagName).not.toBe('IMG')
      await expect(avatar).toHaveTextContent('AT')
    })
  },
}
