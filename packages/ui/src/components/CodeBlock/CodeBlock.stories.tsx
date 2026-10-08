import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, spyOn, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {CodeBlock} from './CodeBlock'
import {onThemeSurface} from '../../docs/themedSurface'
import {withCoarsePointer, withFinePointer} from '../../docs/coarsePointer'
import {SIZES_PX} from '@duro-app/tokens/keys'

interface CodeBlockArgs {
  /** The code shown (and copied). */
  code: string
  copyLabel: string
  copiedLabel: string
  /** How long the copied label stays, in ms. */
  copiedDuration: number
  /** A refused clipboard (permission denied, an insecure page). */
  onCopyError: (error: unknown) => void
}

const COMMAND =
  'flux bootstrap git --url=ssh://git@forge/homelab --branch=main --path=clusters/homelab'

const meta = {
  title: 'Components/CodeBlock',
  args: {
    code: COMMAND,
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
    copiedDuration: 2000,
    onCopyError: fn(),
  },
  argTypes: {
    code: {control: 'text'},
    copyLabel: {control: 'text'},
    copiedLabel: {control: 'text'},
    copiedDuration: {control: {type: 'number', min: 0, step: 100}},
  },
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
  render: ({code, ...args}) => (
    <CodeBlock {...args}>
      <html.code>{code}</html.code>
    </CodeBlock>
  ),
} satisfies Meta<CodeBlockArgs>

export default meta
type Story = StoryObj<typeof meta>

const TEST_ONLY = ['!dev', '!autodocs']

const styles = css.create({
  half: {maxWidth: '50%'},
})

/**
 * Press the copy button: the label changes to `copiedLabel` for
 * `copiedDuration` ms and a polite region announces it. A refused clipboard
 * shows up in Actions as `onCopyError`.
 */
export const Playground: Story = {}

/** Playground's checks, kept off the visible story so a Control change cannot fail them. */
export const PlaygroundChecks: Story = {
  ...Playground,
  tags: TEST_ONLY,
  play: async ({args, canvas}) => {
    await expect(canvas.getByRole('button', {name: args.copyLabel})).toBeVisible()
    await expect(canvas.getByText(args.code)).toBeInTheDocument()
  },
}

/** A long line scrolls inside the block instead of widening the page. */
export const LongLineScrolls: Story = {
  args: {code: COMMAND.repeat(3)},
  render: ({code, ...args}) => (
    <html.div style={styles.half}>
      <CodeBlock {...args}>
        <html.code>{code}</html.code>
      </CodeBlock>
    </html.div>
  ),
}

/** LongLineScrolls's checks, kept off the visible story so a Control change cannot fail them. */
export const LongLineScrollsChecks: Story = {
  ...LongLineScrolls,
  tags: TEST_ONLY,
  play: async ({canvasElement}) => {
    const pre = canvasElement.querySelector('pre') as HTMLElement
    await expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth)
    await expect(getComputedStyle(pre).overflowX).toBe('auto')
    // and a keyboard can reach it to scroll it
    await waitFor(() => expect(pre).toHaveAttribute('tabindex', '0'))
  },
}

/**
 * The copy button never covers the code — a long first line included, and
 * on a touch screen where the button grows to the 44px target (seen on a
 * phone in kb-vision: it sat over `kubectl ... get`).
 */
export const CopyButtonClearsTheCode: Story = {
  ...LongLineScrolls,
  tags: TEST_ONLY,
  play: async ({canvas, canvasElement}) => {
    const pre = canvasElement.querySelector('pre') as HTMLElement
    const button = () => canvas.getByRole('button', {name: 'Copy'})
    const clear = () =>
      expect(button().getBoundingClientRect().bottom).toBeLessThanOrEqual(
        pre.getBoundingClientRect().top,
      )
    await withFinePointer()
    await clear()
    await withCoarsePointer(async () => {
      await waitFor(() =>
        expect(button().getBoundingClientRect().height).toBeGreaterThanOrEqual(
          SIZES_PX.touchTarget,
        ),
      )
      await clear()
    })
  },
}

/** Copies the text, confirms on the button and announces it, then resets. */
export const CopiesAndAnnounces: Story = {
  tags: TEST_ONLY,
  args: {copiedDuration: 300},
  play: async ({args, canvas, userEvent}) => {
    const write = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    try {
      const status = canvas.getByRole('status')
      await expect(status).toBeEmptyDOMElement()
      await userEvent.click(canvas.getByRole('button', {name: args.copyLabel}))
      await expect(write).toHaveBeenCalledWith(args.code)
      await waitFor(() =>
        expect(canvas.getByRole('button', {name: args.copiedLabel})).toBeVisible(),
      )
      await expect(status).toHaveTextContent(args.copiedLabel)
      // back to the label after copiedDuration; the region stays mounted
      await waitFor(() => expect(canvas.getByRole('button', {name: args.copyLabel})).toBeVisible())
      await expect(canvas.getByRole('status')).toBe(status)
      await expect(status).toBeEmptyDOMElement()
    } finally {
      write.mockRestore()
    }
  },
}

/** A refused clipboard confirms nothing and reports the error. */
export const CopyRefused: Story = {
  tags: TEST_ONLY,
  play: async ({args, canvas, userEvent}) => {
    const write = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new DOMException('Denied', 'NotAllowedError'),
    )
    try {
      await userEvent.click(canvas.getByRole('button', {name: args.copyLabel}))
      await waitFor(() => expect(args.onCopyError).toHaveBeenCalledTimes(1))
      await expect(canvas.getByRole('button', {name: args.copyLabel})).toBeInTheDocument()
      await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
    } finally {
      write.mockRestore()
    }
  },
}

/** Without onCopyError, a refused clipboard still reaches the console. */
export const CopyRefusedWithoutHandler: Story = {
  tags: TEST_ONLY,
  render: ({code, onCopyError: _onCopyError, ...args}) => (
    <CodeBlock {...args}>
      <html.code>{code}</html.code>
    </CodeBlock>
  ),
  play: async ({args, canvas, userEvent}) => {
    const write = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new DOMException('Denied', 'NotAllowedError'),
    )
    const logged = spyOn(console, 'error').mockImplementation(() => {})
    try {
      await userEvent.click(canvas.getByRole('button', {name: args.copyLabel}))
      await waitFor(() => expect(logged).toHaveBeenCalledTimes(1))
      await expect(String(logged.mock.calls[0]?.[0])).toContain('CodeBlock')
      await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
    } finally {
      logged.mockRestore()
      write.mockRestore()
    }
  },
}
