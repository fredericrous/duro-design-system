import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, userEvent, waitFor} from 'storybook/test'
import {useState} from 'react'
import {css, html} from 'react-strict-dom'
import {SIZES_PX, SPACING_PX, type SizeToken} from '@duro-app/tokens/keys'
import type {Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'
import {SplitPane} from './SplitPane'
import {setViewport} from '../Drawer/touchInput'
import {List} from '../List/List'
import {Panel} from '../Panel/Panel'
import {Heading} from '../Heading/Heading'
import {Text} from '../Text/Text'
import {Button} from '../Button/Button'

const meta: Meta = {
  title: 'Components/SplitPane',
  parameters: {layout: 'fullscreen'},
}

export default meta
type Story = StoryObj

const SESSIONS = ['Refactor auth', 'Flaky e2e', 'Release notes', 'Docs pass', 'Perf trace']

// A SplitPane fills its parent: the story gives it the viewport's height.
const frame = css.create({fill: {height: '100vh'}})

interface SplitArgs {
  defaultSize: SizeToken
  minSize: SizeToken
  maxSize: SizeToken
  collapseBelow: Breakpoint
  onSizeChange?: (px: number) => void
  collapsed?: boolean
}

const DEFAULT_ARGS: SplitArgs = {
  defaultSize: 'sidebarW',
  minSize: 'sidebarW',
  maxSize: 'panelLg',
  collapseBelow: 'sm',
}

// Width tokens that make sense for a pane, smallest first.
const PANE_SIZES: SizeToken[] = ['sidebarW', 'panelSm', 'panelMd', 'panelLg']

/** The picked B0 direction (docs/mockups/split-pane/Hairline.dc.html). */
function Split(props: Partial<SplitArgs>) {
  const {defaultSize, minSize, maxSize, collapseBelow, onSizeChange, collapsed} = {
    ...DEFAULT_ARGS,
    ...props,
  }
  return (
    <html.div style={frame.fill}>
      <SplitPane.Root
        aria-label="Resize the session list"
        defaultSize={defaultSize}
        minSize={minSize}
        maxSize={maxSize}
        collapseBelow={collapseBelow}
        onSizeChange={onSizeChange}
        collapsed={collapsed}
      >
        <SplitPane.Pane>
          <List.Root aria-label="Sessions">
            {SESSIONS.map((s) => (
              <List.Item key={s}>
                <List.Text>{s}</List.Text>
              </List.Item>
            ))}
          </List.Root>
        </SplitPane.Pane>
        <SplitPane.Handle />
        <SplitPane.Pane>
          <Panel.Root>
            <Panel.Header>
              <Heading level={2}>Refactor auth</Heading>
            </Panel.Header>
            <Panel.Body>
              <Text>The transcript of the selected session.</Text>
            </Panel.Body>
          </Panel.Root>
        </SplitPane.Pane>
      </SplitPane.Root>
    </html.div>
  )
}

export const Default: StoryObj<SplitArgs> = {
  args: {...DEFAULT_ARGS, onSizeChange: fn()},
  argTypes: {
    defaultSize: {
      control: 'select',
      options: PANE_SIZES,
      description: 'Starting width of the first pane',
    },
    minSize: {control: 'select', options: PANE_SIZES, description: 'Narrowest the first pane goes'},
    maxSize: {control: 'select', options: PANE_SIZES, description: 'Widest the first pane goes'},
    collapseBelow: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: "Below this breakpoint (the split's own width) the panes stack",
    },
  },
  // Keyed by the starting width: it seeds state on mount, so a change remounts the split.
  render: (args) => <Split key={args.defaultSize} {...args} />,
}

const separator = () => document.querySelector<HTMLElement>('[role="separator"]')

export const KeyboardMovesTheSeparator: Story = {
  render: () => <Split />,
  beforeEach: async () => {
    await setViewport(1200, 800)
  },
  play: async () => {
    await waitFor(() => expect(separator()).not.toBeNull())
    const handle = separator()!
    const primary = document.getElementById(handle.getAttribute('aria-controls')!)!
    await expect(handle).toHaveAttribute('aria-valuenow', String(SIZES_PX.sidebarW))
    await expect(handle).toHaveAttribute('aria-valuemin', String(SIZES_PX.sidebarW))
    await expect(handle).toHaveAttribute('aria-valuemax', String(SIZES_PX.panelLg))

    handle.focus()
    await userEvent.keyboard('{ArrowRight}')
    const after = SIZES_PX.sidebarW + SPACING_PX.md
    await expect(handle).toHaveAttribute('aria-valuenow', String(after))
    await waitFor(() => expect(primary.getBoundingClientRect().width).toBeCloseTo(after, 0))

    await userEvent.keyboard('{End}')
    await expect(handle).toHaveAttribute('aria-valuenow', String(SIZES_PX.panelLg))
    // the bound holds
    await userEvent.keyboard('{ArrowRight}')
    await expect(handle).toHaveAttribute('aria-valuenow', String(SIZES_PX.panelLg))

    await userEvent.keyboard('{Home}')
    await expect(handle).toHaveAttribute('aria-valuenow', String(SIZES_PX.sidebarW))
  },
}

export const NarrowStacksInOneColumn: Story = {
  render: () => <Split />,
  beforeEach: async () => {
    await setViewport(390, 844)
  },
  play: async ({canvas}) => {
    await waitFor(() => expect(separator()).toBeNull())
    const list = canvas.getByRole('list', {name: 'Sessions'})
    const heading = canvas.getByRole('heading', {name: 'Refactor auth'})
    // one column: the detail sits below the list
    await expect(heading.getBoundingClientRect().top).toBeGreaterThan(
      list.getBoundingClientRect().bottom - 1,
    )
  },
}

function Collapsible() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <>
      <Button onClick={() => setCollapsed((c) => !c)}>Toggle sessions</Button>
      <Split collapsed={collapsed} />
    </>
  )
}

export const CollapsedShowsTheStrip: Story = {
  render: () => <Collapsible />,
  beforeEach: async () => {
    await setViewport(1200, 800)
  },
  play: async ({canvas}) => {
    await waitFor(() => expect(separator()).not.toBeNull())
    const handle = separator()!
    const primary = document.getElementById(handle.getAttribute('aria-controls')!)!
    const toggle = canvas.getByRole('button', {name: 'Toggle sessions'})
    await waitFor(() =>
      expect(primary.getBoundingClientRect().width).toBeCloseTo(SIZES_PX.sidebarW, 0),
    )

    // widen the pane, then collapse: a strip, the handle out of tab order and out of the a11y tree
    handle.focus()
    await userEvent.keyboard('{ArrowRight}')
    const widened = SIZES_PX.sidebarW + SPACING_PX.md
    await waitFor(() => expect(primary.getBoundingClientRect().width).toBeCloseTo(widened, 0))

    await userEvent.click(toggle)
    await waitFor(() =>
      expect(primary.getBoundingClientRect().width).toBeCloseTo(SIZES_PX.iconButton, 0),
    )
    await expect(handle).toHaveAttribute('tabindex', '-1')
    await expect(handle).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas.queryByRole('separator')).toBeNull()

    // Tab from the toggle skips the handle
    toggle.focus()
    await userEvent.tab()
    await expect(handle).not.toHaveFocus()

    // expanded again: the prior size returns and the handle is back
    await userEvent.click(toggle)
    await waitFor(() => expect(primary.getBoundingClientRect().width).toBeCloseTo(widened, 0))
    await expect(handle).toHaveAttribute('tabindex', '0')
    await expect(handle).not.toHaveAttribute('aria-hidden')
    await expect(handle).toHaveAttribute('aria-valuenow', String(widened))
  },
}
