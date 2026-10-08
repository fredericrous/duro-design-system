import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {LiveRegion, type LiveRegionPoliteness} from './LiveRegion'
import {Button} from '../Button/Button'
import {Inline} from '../Inline/Inline'
import {Stack} from '../Stack/Stack'
import {onThemeSurface} from '../../docs/themedSurface'

interface LiveRegionArgs {
  /** `polite` (role="status") waits for a pause; `assertive` (role="alert") interrupts. */
  politeness: LiveRegionPoliteness
  /** Off screen, still in the accessibility tree. */
  visuallyHidden: boolean
  /** What the region announces when the trigger button is pressed. */
  message: string
  /** The trigger button's label. */
  triggerLabel: string
  /** The button that empties the region. */
  clearLabel: string
  /** Called with the message the region now holds. */
  onAnnounce: (message: string) => void
}

/**
 * The region is mounted empty from the start; a button puts the message in
 * it, which is what assistive tech announces.
 */
function Announcer({
  politeness,
  visuallyHidden,
  message,
  triggerLabel,
  clearLabel,
  onAnnounce,
}: LiveRegionArgs) {
  const [content, setContent] = useState('')
  return (
    <Stack gap="sm">
      <Inline gap="sm">
        <Button
          variant="secondary"
          onClick={() => {
            setContent(message)
            onAnnounce(message)
          }}
        >
          {triggerLabel}
        </Button>
        <Button variant="secondary" onClick={() => setContent('')}>
          {clearLabel}
        </Button>
      </Inline>
      <LiveRegion politeness={politeness} visuallyHidden={visuallyHidden}>
        {content}
      </LiveRegion>
    </Stack>
  )
}

const meta = {
  title: 'Components/LiveRegion',
  args: {
    politeness: 'polite',
    visuallyHidden: false,
    message: 'Link copied',
    triggerLabel: 'Copy link',
    clearLabel: 'Clear',
    onAnnounce: fn(),
  },
  argTypes: {
    politeness: {control: 'radio', options: ['polite', 'assertive']},
    visuallyHidden: {control: 'boolean'},
    message: {control: 'text'},
    triggerLabel: {control: 'text'},
    clearLabel: {control: 'text'},
  },
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  render: (args) => <Announcer {...args} />,
} satisfies Meta<LiveRegionArgs>

export default meta
type Story = StoryObj<typeof meta>

const TEST_ONLY = ['!dev', '!autodocs']

/**
 * Press the trigger: the message appears in the region (unless
 * `visuallyHidden`) and the Actions panel logs `onAnnounce`. Switch
 * `politeness` to assertive for role="alert".
 */
export const Playground: Story = {
  play: async ({args, canvas}) => {
    const region = canvas.getByRole(args.politeness === 'assertive' ? 'alert' : 'status')
    await expect(region).toHaveAttribute('aria-live', args.politeness)
    await expect(region).toBeEmptyDOMElement()
  },
}

/** Mounted empty from the start; a change of content is what gets announced. */
export const Polite: Story = {
  tags: TEST_ONLY,
  play: async ({args, canvas, userEvent}) => {
    const region = canvas.getByRole('status')
    await expect(region).toHaveAttribute('aria-live', 'polite')
    await expect(region).toHaveAttribute('aria-atomic', 'true')
    await expect(region).toBeEmptyDOMElement()

    await userEvent.click(canvas.getByRole('button', {name: args.triggerLabel}))
    // the same element, now holding the message: a change, not a new region
    await expect(canvas.getByRole('status')).toBe(region)
    await expect(region).toHaveTextContent(args.message)
    await expect(args.onAnnounce).toHaveBeenCalledWith(args.message)

    await userEvent.click(canvas.getByRole('button', {name: args.clearLabel}))
    await expect(region).toBeInTheDocument()
    await expect(canvas.getByRole('status')).toBe(region)
    await expect(region).toBeEmptyDOMElement()
  },
}

export const Assertive: Story = {
  tags: TEST_ONLY,
  render: () => <LiveRegion politeness="assertive">Connection lost</LiveRegion>,
  play: async ({canvas}) => {
    const region = canvas.getByRole('alert')
    await expect(region).toHaveAttribute('aria-live', 'assertive')
    await expect(region).toHaveTextContent('Connection lost')
  },
}

/** Off screen, still in the accessibility tree. */
export const VisuallyHidden: Story = {
  tags: TEST_ONLY,
  args: {visuallyHidden: true},
  play: async ({args, canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: args.triggerLabel}))
    const region = canvas.getByRole('status')
    await expect(region).toHaveTextContent(args.message)
    const box = region.getBoundingClientRect()
    await expect(box.width).toBeLessThanOrEqual(1)
    await expect(box.height).toBeLessThanOrEqual(1)
  },
}
