import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, spyOn, waitFor} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {CodeBlock} from './CodeBlock'
import type {DiffLineInfo} from './diffRoles'
import {Card} from '../Card/Card'
import {Text} from '../Text/Text'
import {onThemeSurface} from '../../docs/themedSurface'
import {withCoarsePointer, withFinePointer} from '../../docs/coarsePointer'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {colors} from '@duro-app/tokens/tokens/colors.css'

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
  // Probes: the token colours a diff line should resolve to, set independently of CodeBlock.
  successProbe: {backgroundColor: colors.successBg},
  errorProbe: {backgroundColor: colors.errorBg},
  infoProbe: {backgroundColor: colors.infoBg},
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

const DIFF = '@@ -1,3 +1,3 @@\n context\n-old line\n+new line\n'

/** `language="diff"`: added, removed and hunk lines are tinted from the status tokens. */
export const Diff: Story = {
  args: {code: DIFF},
  render: ({code, ...args}) => (
    <CodeBlock {...args} language="diff">
      <html.code>{code}</html.code>
    </CodeBlock>
  ),
}

/** Diff's checks: each line carries its role, the language is exposed, copy keeps the raw text. */
export const DiffChecks: Story = {
  ...Diff,
  tags: TEST_ONLY,
  render: ({code, ...args}) => (
    <>
      <CodeBlock {...args} language="diff">
        <html.code>{code}</html.code>
      </CodeBlock>
      <html.div data-testid="success-probe" style={styles.successProbe} />
      <html.div data-testid="error-probe" style={styles.errorProbe} />
      <html.div data-testid="info-probe" style={styles.infoProbe} />
    </>
  ),
  play: async ({args, canvasElement, canvas, userEvent}) => {
    const role = (name: string) => canvasElement.querySelector(`[data-diff-line="${name}"]`)
    await expect(canvasElement.querySelector('pre')).toHaveAttribute('data-language', 'diff')
    await expect(role('hunk')).toHaveTextContent('@@ -1,3 +1,3 @@')
    await expect(role('removed')).toHaveTextContent('-old line')
    await expect(role('added')).toHaveTextContent('+new line')
    const probe = (testId: string) =>
      getComputedStyle(canvasElement.querySelector(`[data-testid="${testId}"]`)!).backgroundColor
    const tint = (name: string) => getComputedStyle(role(name)!).backgroundColor
    await expect(tint('added')).toBe(probe('success-probe'))
    await expect(tint('removed')).toBe(probe('error-probe'))
    await expect(tint('hunk')).toBe(probe('info-probe'))
    await expect(tint('added')).not.toBe(tint('removed'))
    const write = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    try {
      await userEvent.click(canvas.getByRole('button', {name: args.copyLabel}))
      await expect(write).toHaveBeenCalledWith(args.code)
    } finally {
      write.mockRestore()
    }
  },
}

const REVIEW_DIFF = `@@ -10,3 +10,4 @@
 export function guard(req, res) {
-  const token = req.headers.authorization
+  const token = readBearer(req.headers.authorization)
+  if (!token) return unauthorized(res, 'missing_token')
`

// A removed line exists only in the old file: its name says so, so no two buttons share one.
const commentOn = (line: DiffLineInfo) =>
  line.role === 'removed'
    ? `Comment on old line ${line.oldLine}`
    : `Comment on line ${line.newLine}`

/**
 * `lineAction` puts a button beside each line inside a hunk (a review
 * comment, say), and `renderAfterLine` shows content under a line, full
 * width. The gutter is one tab stop: Up and Down move between its buttons.
 */
export const DiffLineActions: Story = {
  args: {code: REVIEW_DIFF},
  render: ({code, ...args}) => (
    <CodeBlock
      {...args}
      language="diff"
      lineAction={{label: commentOn, onAction: fn()}}
      renderAfterLine={(line) =>
        line.newLine === 11 ? (
          <Card variant="outlined" size="compact">
            <Text variant="bodySm">Keep the 401 status text: clients read it.</Text>
          </Card>
        ) : null
      }
    >
      <html.code>{code}</html.code>
    </CodeBlock>
  ),
}

/** DiffLineActions' checks: one tab stop, arrows move, the line handed over is numbered, copy keeps the diff. */
export const DiffLineActionsChecks: Story = {
  ...DiffLineActions,
  tags: TEST_ONLY,
  args: {code: REVIEW_DIFF, onCopyError: fn()},
  render: ({code, ...args}) => {
    const onAction = onLineAction
    return (
      <CodeBlock
        {...args}
        language="diff"
        lineAction={{label: commentOn, onAction}}
        renderAfterLine={(line) =>
          line.newLine === 11 ? <Text variant="bodySm">Saved comment</Text> : null
        }
      >
        <html.code>{code}</html.code>
      </CodeBlock>
    )
  },
  play: async ({args, canvas, canvasElement, userEvent}) => {
    onLineAction.mockClear()
    const lineButtons = canvas.getAllByRole('button', {name: /^Comment on/})
    // The hunk header has no line number, so no button: four lines, four buttons.
    await expect(lineButtons).toHaveLength(4)
    await expect(lineButtons.filter((button) => button.tabIndex === 0)).toHaveLength(1)

    lineButtons[0].focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('button', {name: 'Comment on old line 11'})).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(onLineAction).toHaveBeenCalledWith(
      expect.objectContaining({role: 'removed', oldLine: 11, newLine: null}),
    )

    await userEvent.click(canvas.getByRole('button', {name: 'Comment on line 12'}))
    await expect(onLineAction).toHaveBeenLastCalledWith(
      expect.objectContaining({role: 'added', oldLine: null, newLine: 12}),
    )

    // Content under a line comes right after that line's row.
    const saved = canvas.getByText('Saved comment')
    const row = canvasElement.querySelector('[data-diff-line="added"]')!
    await expect(row.compareDocumentPosition(saved) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const write = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    try {
      await userEvent.click(canvas.getByRole('button', {name: args.copyLabel}))
      await expect(write).toHaveBeenCalledWith(args.code)
    } finally {
      write.mockRestore()
    }
  },
}

const onLineAction = fn()
