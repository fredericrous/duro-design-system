import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {LiveRegion} from './LiveRegion'
import {Button} from '../Button/Button'
import {Stack} from '../Stack/Stack'
import {onThemeSurface} from '../../docs/themedSurface'

const meta: Meta = {
  title: 'Components/LiveRegion',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj

function CopyLink({visuallyHidden = false}: {visuallyHidden?: boolean}) {
  const [message, setMessage] = useState('')
  return (
    <Stack gap="sm">
      <Button variant="secondary" onClick={() => setMessage('Link copied')}>
        Copy link
      </Button>
      <Button variant="secondary" onClick={() => setMessage('')}>
        Clear
      </Button>
      <LiveRegion visuallyHidden={visuallyHidden}>{message}</LiveRegion>
    </Stack>
  )
}

/** Mounted empty from the start; a change of content is what gets announced. */
export const Polite: Story = {
  render: () => <CopyLink />,
  play: async ({canvas, userEvent}) => {
    const region = canvas.getByRole('status')
    await expect(region).toHaveAttribute('aria-live', 'polite')
    await expect(region).toHaveAttribute('aria-atomic', 'true')
    await expect(region).toBeEmptyDOMElement()

    await userEvent.click(canvas.getByRole('button', {name: 'Copy link'}))
    // the same element, now holding the message: a change, not a new region
    await expect(canvas.getByRole('status')).toBe(region)
    await expect(region).toHaveTextContent('Link copied')

    await userEvent.click(canvas.getByRole('button', {name: 'Clear'}))
    await expect(region).toBeInTheDocument()
    await expect(canvas.getByRole('status')).toBe(region)
    await expect(region).toBeEmptyDOMElement()
  },
}

export const Assertive: Story = {
  render: () => <LiveRegion politeness="assertive">Connection lost</LiveRegion>,
  play: async ({canvas}) => {
    const region = canvas.getByRole('alert')
    await expect(region).toHaveAttribute('aria-live', 'assertive')
    await expect(region).toHaveTextContent('Connection lost')
  },
}

/** Off screen, still in the accessibility tree. */
export const VisuallyHidden: Story = {
  render: () => <CopyLink visuallyHidden />,
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Copy link'}))
    const region = canvas.getByRole('status')
    await expect(region).toHaveTextContent('Link copied')
    const box = region.getBoundingClientRect()
    await expect(box.width).toBeLessThanOrEqual(1)
    await expect(box.height).toBeLessThanOrEqual(1)
  },
}
