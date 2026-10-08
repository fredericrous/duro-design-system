import {useState} from 'react'
import {html} from 'react-strict-dom'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {Tree} from './Tree'
import {clickLink} from '../../docs/clickLink'
import {onThemeSurface} from '../../docs/themedSurface'
import type {OnNavigate} from '../../shared/navigate'

const meta: Meta = {
  title: 'Components/Tree',
}

export default meta
type Story = StoryObj

function Landscape(props: {
  defaultExpanded?: string[]
  onValueChange?: (v: string) => void
  value?: string | null
}) {
  return (
    <Tree.Root
      aria-label="Blocs"
      defaultExpanded={props.defaultExpanded}
      onValueChange={props.onValueChange}
      value={props.value}
    >
      <Tree.Item value="energy" label="Core business — Energy" meta="3 zones">
        <Tree.Item value="generation" label="Generation" meta="4 apps" />
        <Tree.Item value="network" label="Network operations">
          <Tree.Item value="scada" label="SCADA supervision" />
          <Tree.Item value="outage" label="Outage management" />
        </Tree.Item>
        <Tree.Item value="metering" label="Metering & data" />
      </Tree.Item>
      <Tree.Item value="market" label="Market & field">
        <Tree.Item value="trading" label="Trading" />
      </Tree.Item>
      <Tree.Item value="finance" label="Finance & steering" />
    </Tree.Root>
  )
}

export const Default: Story = {
  render: () => <Landscape defaultExpanded={['energy']} />,
  play: async ({canvas, userEvent}) => {
    const tree = canvas.getByRole('tree', {name: 'Blocs'})
    await expect(tree).toBeInTheDocument()

    const energy = canvas.getByRole('treeitem', {name: /Core business/})
    await expect(energy).toHaveAttribute('aria-expanded', 'true')
    await expect(energy).toHaveAttribute('aria-level', '1')
    const generation = canvas.getByRole('treeitem', {name: /Generation/})
    await expect(generation).toHaveAttribute('aria-level', '2')
    // a leaf has no expanded state at all
    await expect(generation).not.toHaveAttribute('aria-expanded')
    // a closed branch renders no children
    await expect(canvas.queryByRole('treeitem', {name: /SCADA/})).toBeNull()

    // one tab stop: the first item
    await expect(energy).toHaveAttribute('tabindex', '0')
    await expect(generation).toHaveAttribute('tabindex', '-1')

    // a click selects the row
    await userEvent.click(canvas.getByText('Generation'))
    await expect(generation).toHaveAttribute('aria-selected', 'true')
    await expect(energy).toHaveAttribute('aria-selected', 'false')
  },
}

export const KeyboardNavigation: Story = {
  render: () => <Landscape />,
  play: async ({canvas, userEvent}) => {
    const item = (name: RegExp) => canvas.getByRole('treeitem', {name})
    await userEvent.tab()
    await expect(item(/Core business/)).toHaveFocus()

    // → opens the branch, → again goes to its first child
    await userEvent.keyboard('{ArrowRight}')
    await expect(item(/Core business/)).toHaveAttribute('aria-expanded', 'true')
    await expect(item(/Core business/)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(item(/Generation/)).toHaveFocus()

    // ↓ walks the visible items; ↓ onto a closed branch, → opens it
    await userEvent.keyboard('{ArrowDown}')
    await expect(item(/Network operations/)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}')
    await expect(item(/SCADA/)).toHaveFocus()
    await expect(item(/SCADA/)).toHaveAttribute('aria-level', '3')

    // ← on a leaf goes to the parent; ← on an open branch closes it
    await userEvent.keyboard('{ArrowLeft}')
    await expect(item(/Network operations/)).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(item(/Network operations/)).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByRole('treeitem', {name: /SCADA/})).toBeNull()

    // Home / End
    await userEvent.keyboard('{End}')
    await expect(item(/Finance/)).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(item(/Core business/)).toHaveFocus()

    // Enter selects; the tab stop follows focus
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect(item(/Generation/)).toHaveAttribute('aria-selected', 'true')
    await expect(item(/Generation/)).toHaveAttribute('tabindex', '0')
    await expect(item(/Core business/)).toHaveAttribute('tabindex', '-1')
  },
}

export const Typeahead: Story = {
  render: () => <Landscape defaultExpanded={['energy']} />,
  play: async ({canvas, userEvent}) => {
    const item = (name: RegExp) => canvas.getByRole('treeitem', {name})
    await userEvent.tab()
    // a letter jumps to the next visible item starting with it
    await userEvent.keyboard('m')
    await expect(item(/Metering/)).toHaveFocus()
    // the same letter again cycles to the next match
    await userEvent.keyboard('m')
    await expect(item(/Market/)).toHaveFocus()
    // a pause starts a new search; a prefix typed in one go narrows
    await new Promise((r) => setTimeout(r, 600))
    await userEvent.keyboard('fi')
    await expect(item(/Finance/)).toHaveFocus()
  },
}

function ControlledTree() {
  const [value, setValue] = useState<string | null>('trading')
  return (
    <>
      <Landscape defaultExpanded={['market']} value={value} onValueChange={setValue} />
      <html.span role="status" aria-label="Selected">
        {value}
      </html.span>
    </>
  )
}

export const Controlled: Story = {
  render: () => <ControlledTree />,
  play: async ({canvas, userEvent}) => {
    const trading = canvas.getByRole('treeitem', {name: /Trading/})
    await expect(trading).toHaveAttribute('aria-selected', 'true')
    // the selection holds the tab stop
    await expect(trading).toHaveAttribute('tabindex', '0')
    await userEvent.click(canvas.getByText('Finance & steering'))
    await expect(canvas.getByLabelText('Selected')).toHaveTextContent('finance')
  },
}

function DocsTree(props: {onNavigate?: OnNavigate; defaultValue?: string}) {
  const {onNavigate} = props
  return (
    <Tree.Root
      aria-label="Docs"
      defaultExpanded={['architecture', 'operations']}
      defaultValue={props.defaultValue}
    >
      <Tree.Item value="start" label="Start here" href="#start" onNavigate={onNavigate} />
      <Tree.Item value="architecture" label="Architecture" meta="4">
        <Tree.Item
          value="clusters"
          label="Clusters and bootstrap"
          href="#clusters"
          onNavigate={onNavigate}
        />
        <Tree.Item value="ai-ops" label="AI-ops platform" href="#ai-ops" onNavigate={onNavigate} />
        <Tree.Item
          value="secrets"
          label="Secrets and Vault"
          href="#secrets"
          onNavigate={onNavigate}
        />
      </Tree.Item>
      <Tree.Item value="operations" label="Operations" meta="31">
        <Tree.Item value="runbooks" label="Runbooks" href="#runbooks" onNavigate={onNavigate} />
      </Tree.Item>
    </Tree.Root>
  )
}

/**
 * Items with `href`: each row is a real link (cmd-click opens a tab, "Copy
 * link" works) that stays out of the tab order, so the tree keeps one tab stop
 * and its keyboard. Enter follows the link through `onNavigate`.
 */
export const WithLinks: StoryObj<{onNavigate: OnNavigate}> = {
  parameters: {
    a11y: {
      test: 'error',
      // holds-until: https://github.com/fredericrous/duro-design-system/issues/79
      // — the selected row's accent on bgCardHover is 6.76:1, under AAA's
      // 7:1 (AA passes). Re-enable this rule when that pair reaches 7:1.
      options: {rules: {'color-contrast-enhanced': {enabled: false}}},
    },
  },
  decorators: [onThemeSurface],
  args: {onNavigate: fn()},
  render: (args) => <DocsTree onNavigate={args.onNavigate} defaultValue="ai-ops" />,
  play: async ({args, canvas, userEvent}) => {
    const onNavigate = args.onNavigate as unknown as ReturnType<typeof fn>
    onNavigate.mockImplementation((_href: string, event: {preventDefault(): void}) =>
      event.preventDefault(),
    )
    const item = (name: RegExp) => canvas.getByRole('treeitem', {name})

    // a real link, outside the tab order
    const link = canvas.getByRole('link', {name: /Clusters and bootstrap/})
    await expect(link).toHaveAttribute('href', '#clusters')
    await expect(link).toHaveAttribute('tabindex', '-1')

    // one tab stop (the selection), and the arrow keys still move focus
    await userEvent.tab()
    await expect(item(/AI-ops platform/)).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect(item(/Clusters and bootstrap/)).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(item(/Secrets and Vault/)).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(item(/Start here/)).toHaveFocus()

    // Enter follows the link: onNavigate, then the item is selected
    await userEvent.keyboard('{End}{ArrowUp}{ArrowUp}{Enter}')
    await expect(onNavigate).toHaveBeenCalledTimes(1)
    await expect(onNavigate.mock.calls[0][0]).toBe('#secrets')
    await expect(item(/Secrets and Vault/)).toHaveAttribute('aria-selected', 'true')

    // a plain click goes to the router; a meta-click keeps the browser
    // default and does not select
    await expect(clickLink(link).defaultPrevented).toBe(true)
    await expect(onNavigate).toHaveBeenCalledTimes(2)
    await expect(onNavigate.mock.calls[1][0]).toBe('#clusters')
    const runbooks = canvas.getByRole('link', {name: /Runbooks/})
    await expect(clickLink(runbooks, {metaKey: true}).defaultPrevented).toBe(false)
    await expect(onNavigate).toHaveBeenCalledTimes(2)
    await expect(item(/Runbooks/)).toHaveAttribute('aria-selected', 'false')
  },
}
