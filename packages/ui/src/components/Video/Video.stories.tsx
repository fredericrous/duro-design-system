import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {Video} from './Video'

const meta: Meta<typeof Video> = {
  title: 'Components/Video',
  component: Video,
}
export default meta
type Story = StoryObj<typeof Video>

// A tiny inline WebM is not needed to check the element: the source and its type are what a test reads.
const SRC = 'https://example.invalid/clip.mp4'

/** A video file shown with the browser's own controls, named for assistive tech by `label`. */
export const Default: Story = {
  args: {src: SRC, type: 'video/mp4', label: 'Screen recording of the failing test'},
  play: async ({canvasElement}) => {
    const video = canvasElement.querySelector('video')
    await expect(video).not.toBeNull()
    await expect(video).toHaveAttribute('aria-label', 'Screen recording of the failing test')
    await expect(video).toHaveAttribute('controls')
    await expect(video).toHaveAttribute('preload', 'metadata')
    const source = video!.querySelector('source')
    await expect(source).toHaveAttribute('src', SRC)
    await expect(source).toHaveAttribute('type', 'video/mp4')
  },
}
