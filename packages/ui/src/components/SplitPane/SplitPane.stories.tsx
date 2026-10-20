import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, userEvent, waitFor} from 'storybook/test'
import {useState, type ReactNode} from 'react'
import {css, html} from 'react-strict-dom'
import {SIZES_PX, SPACING_PX, type SizeToken} from '@duro-app/tokens/keys'
import type {Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'
import {SplitPane} from './SplitPane'
import {setViewport} from '../Drawer/touchInput'
import {List} from '../List/List'
import {Panel} from '../Panel/Panel'
import {Heading} from '../Heading/Heading'
import {Text} from '../Text/Text'
import {Input} from '../Input/Input'
import {Button} from '../Button/Button'
import {Icon} from '../Icon/Icon'
import {VirtualList} from '../VirtualList/VirtualList'

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
  onSizeCommit?: (px: number) => void
  collapsed?: boolean
  collapsedContent?: ReactNode
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
  const {
    defaultSize,
    minSize,
    maxSize,
    collapseBelow,
    onSizeChange,
    onSizeCommit,
    collapsed,
    collapsedContent,
  } = {
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
        onSizeCommit={onSizeCommit}
        collapsed={collapsed}
        collapsedContent={collapsedContent}
      >
        <SplitPane.Pane>
          <Button variant="secondary">Filter sessions</Button>
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

// A drag reports every width while it moves and the final one once, on release;
// a keyboard step is its own commit. An app persists the width on commit.
export const ResizeCommitsOnceWhenItEnds: StoryObj<SplitArgs> = {
  args: {onSizeChange: fn(), onSizeCommit: fn()},
  render: (args) => <Split {...args} />,
  beforeEach: async () => {
    await setViewport(1200, 800)
  },
  play: async ({args}) => {
    await waitFor(() => expect(separator()).not.toBeNull())
    const handle = separator()!
    const box = handle.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    await userEvent.pointer([
      {keys: '[MouseLeft>]', target: handle, coords: {clientX: x, clientY: y}},
      {target: handle, coords: {clientX: x + 20, clientY: y}},
      {target: handle, coords: {clientX: x + 40, clientY: y}},
      {keys: '[/MouseLeft]', target: handle, coords: {clientX: x + 40, clientY: y}},
    ])
    // two widths while it moved, one commit when it was released
    await expect(args.onSizeChange).toHaveBeenCalledTimes(2)
    await expect(args.onSizeCommit).toHaveBeenCalledTimes(1)
    await expect(args.onSizeCommit).toHaveBeenLastCalledWith(SIZES_PX.sidebarW + 40)

    handle.focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(args.onSizeCommit).toHaveBeenCalledTimes(2)
    await expect(args.onSizeCommit).toHaveBeenLastCalledWith(SIZES_PX.sidebarW + 40 - SPACING_PX.md)
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
      <Button variant="secondary" onClick={() => setCollapsed((c) => !c)}>
        Toggle sessions
      </Button>
      <Split
        collapsed={collapsed}
        collapsedContent={
          // As in the Focus artboard: an icon button that fits the strip.
          <Button
            variant="secondary"
            size="small"
            aria-label="Expand sessions"
            onClick={() => setCollapsed(false)}
          >
            <Icon name="menu" size="sm" />
          </Button>
        }
      />
    </>
  )
}

/**
 * `collapsed`: the first pane shrinks to a strip holding `collapsedContent`, the
 * handle goes away, and expanding restores the width it had.
 */
export const Collapsed: Story = {
  render: () => <Collapsible />,
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

    // widen the pane, then collapse
    handle.focus()
    await userEvent.keyboard('{ArrowRight}')
    const widened = SIZES_PX.sidebarW + SPACING_PX.md
    await waitFor(() => expect(primary.getBoundingClientRect().width).toBeCloseTo(widened, 0))

    await userEvent.click(toggle)
    await waitFor(() =>
      expect(primary.getBoundingClientRect().width).toBeCloseTo(SIZES_PX.iconButton, 0),
    )
    // the handle is not rendered; the pane's own children are inert and out of the a11y tree
    await expect(separator()).toBeNull()
    await expect(canvas.queryByRole('separator')).toBeNull()
    await expect(canvas.queryByRole('button', {name: 'Filter sessions'})).toBeNull()

    // Tab from the toggle never reaches a control inside the collapsed children,
    // but the strip's own button is reachable
    toggle.focus()
    const reached = new Set<Element>()
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      if (document.activeElement) reached.add(document.activeElement)
    }
    const filter = document.evaluate(
      "//button[contains(., 'Filter sessions')]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue
    await expect(filter).not.toBeNull()
    await expect(reached.has(filter as Element)).toBe(false)
    await expect(reached.has(canvas.getByRole('button', {name: 'Expand sessions'}))).toBe(true)

    // expanded again: the prior size returns and the handle is back
    await userEvent.click(toggle)
    await waitFor(() => expect(primary.getBoundingClientRect().width).toBeCloseTo(widened, 0))
    await expect(separator()).toHaveAttribute('aria-valuenow', String(widened))
    await expect(canvas.getByRole('button', {name: 'Filter sessions'})).toBeVisible()

    // the re-mounted handle resizes by keyboard again
    const again = separator()!
    again.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(primary.getBoundingClientRect().width).toBeCloseTo(widened + SPACING_PX.md, 0),
    )
  },
}

function KeepsState() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setCollapsed((c) => !c)}>
        Toggle sessions
      </Button>
      <html.div style={frame.fill}>
        <SplitPane.Root
          aria-label="Resize the session list"
          collapsed={collapsed}
          collapsedContent={
            <Button variant="secondary" size="small" aria-label="Expand sessions">
              <Icon name="menu" size="sm" />
            </Button>
          }
        >
          <SplitPane.Pane>
            <Input aria-label="Search sessions" />
          </SplitPane.Pane>
          <SplitPane.Handle />
          <SplitPane.Pane>
            <Text>Detail</Text>
          </SplitPane.Pane>
        </SplitPane.Root>
      </html.div>
    </>
  )
}

export const CollapseKeepsChildState: Story = {
  render: () => <KeepsState />,
  beforeEach: async () => {
    await setViewport(1200, 800)
  },
  play: async ({canvas}) => {
    const field = await canvas.findByRole('textbox', {name: 'Search sessions'})
    await userEvent.type(field, 'auth')
    await expect(field).toHaveValue('auth')

    const toggle = canvas.getByRole('button', {name: 'Toggle sessions'})
    await userEvent.click(toggle)
    await waitFor(() => expect(separator()).toBeNull())
    await userEvent.click(toggle)
    await waitFor(() => expect(separator()).not.toBeNull())

    const after = await canvas.findByRole('textbox', {name: 'Search sessions'})
    await expect(after).toBe(field)
    await expect(after).toHaveValue('auth')
  },
}

const ROWS = Array.from({length: 500}, (_, i) => ({id: i, text: `Row ${i + 1}`}))

const list = (name: string) => (
  <VirtualList
    aria-label={name}
    items={ROWS}
    getKey={(r) => r.id}
    estimateSize="controlLg"
    renderItem={(r) => <Text>{r.text}</Text>}
  />
)

function ListsInEachPane() {
  return (
    <html.div style={frame.fill}>
      <SplitPane.Root aria-label="Resize the lists">
        <SplitPane.Pane>{list('Left')}</SplitPane.Pane>
        <SplitPane.Handle />
        <SplitPane.Pane>{list('Right')}</SplitPane.Pane>
      </SplitPane.Root>
    </html.div>
  )
}

export const VirtualListsFillTheirPanes: Story = {
  render: () => <ListsInEachPane />,
  beforeEach: async () => {
    await setViewport(1200, 800)
  },
  play: async ({canvas}) => {
    // Each list sits in a pane that is a direct child of the split's root.
    const root = (await canvas.findByRole('separator')).parentElement!
    for (const name of ['Left', 'Right']) {
      const list = await canvas.findByRole('list', {name})
      let pane: HTMLElement = list
      while (pane.parentElement !== root) pane = pane.parentElement!
      await waitFor(() => expect(list.clientHeight).toBeGreaterThan(0))
      await waitFor(() => expect(list.clientHeight).toBe(pane.clientHeight))
      await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight)
    }
  },
}
