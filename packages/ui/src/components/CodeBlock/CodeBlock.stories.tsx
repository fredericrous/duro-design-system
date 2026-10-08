import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, spyOn, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {CodeBlock} from './CodeBlock'
import {onThemeSurface} from '../../docs/themedSurface'

const meta: Meta = {
  title: 'Components/CodeBlock',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj

const styles = css.create({
  half: {maxWidth: '50%'},
})

const COMMAND =
  'flux bootstrap git --url=ssh://git@forge/homelab --branch=main --path=clusters/homelab'

export const Default: Story = {
  render: () => (
    <CodeBlock copyLabel="Copy" copiedLabel="Copied">
      <html.code>{COMMAND}</html.code>
    </CodeBlock>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('button', {name: 'Copy'})).toBeVisible()
    await expect(canvas.getByText(COMMAND)).toBeInTheDocument()
  },
}

/** Copies the text, confirms on the button and announces it, then resets. */
export const CopiesAndAnnounces: Story = {
  render: () => (
    <CodeBlock copyLabel="Copy" copiedLabel="Copied" copiedDuration={300}>
      <html.code>{COMMAND}</html.code>
    </CodeBlock>
  ),
  play: async ({canvas, userEvent}) => {
    const write = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    try {
      const status = canvas.getByRole('status')
      await expect(status).toBeEmptyDOMElement()
      await userEvent.click(canvas.getByRole('button', {name: 'Copy'}))
      await expect(write).toHaveBeenCalledWith(COMMAND)
      await waitFor(() => expect(canvas.getByRole('button', {name: 'Copied'})).toBeVisible())
      await expect(status).toHaveTextContent('Copied')
      // back to the label after copiedDuration; the region stays mounted
      await waitFor(() => expect(canvas.getByRole('button', {name: 'Copy'})).toBeVisible())
      await expect(canvas.getByRole('status')).toBe(status)
      await expect(status).toBeEmptyDOMElement()
    } finally {
      write.mockRestore()
    }
  },
}

/** A refused clipboard confirms nothing and reports the error. */
export const CopyRefused: StoryObj<{onCopyError: (error: unknown) => void}> = {
  args: {onCopyError: fn()},
  render: (args) => (
    <CodeBlock copyLabel="Copy" copiedLabel="Copied" onCopyError={args.onCopyError}>
      <html.code>{COMMAND}</html.code>
    </CodeBlock>
  ),
  play: async ({args, canvas, userEvent}) => {
    const write = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new DOMException('Denied', 'NotAllowedError'),
    )
    try {
      await userEvent.click(canvas.getByRole('button', {name: 'Copy'}))
      await waitFor(() => expect(args.onCopyError).toHaveBeenCalledTimes(1))
      await expect(canvas.getByRole('button', {name: 'Copy'})).toBeInTheDocument()
      await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
    } finally {
      write.mockRestore()
    }
  },
}

/** A long line scrolls inside the block instead of widening the page. */
export const LongLineScrolls: Story = {
  render: () => (
    <html.div style={styles.half}>
      <CodeBlock copyLabel="Copy" copiedLabel="Copied">
        <html.code>{COMMAND.repeat(3)}</html.code>
      </CodeBlock>
    </html.div>
  ),
  play: async ({canvasElement}) => {
    const pre = canvasElement.querySelector('pre') as HTMLElement
    await expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth)
    await expect(getComputedStyle(pre).overflowX).toBe('auto')
    // and a keyboard can reach it to scroll it
    await waitFor(() => expect(pre).toHaveAttribute('tabindex', '0'))
  },
}
