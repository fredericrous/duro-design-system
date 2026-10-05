import {useState} from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, within} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {ActionBar} from './ActionBar'
import {Button} from '../Button/Button'
import {Checkbox} from '../Checkbox/Checkbox'
import {Table} from '../Table/Table'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

interface ActionBarStoryArgs {
  onClearSelection: () => void
  selectedItemCount?: number
  isEmphasized?: boolean
  bottomOffset?: number
}

const meta: Meta<ActionBarStoryArgs> = {
  title: 'Components/ActionBar',
  argTypes: {
    selectedItemCount: {
      control: 'number',
      description: 'Number of selected items displayed in the action bar',
    },
    isEmphasized: {
      control: 'boolean',
      description: 'Whether the action bar uses the emphasized (inverse) style',
    },
    bottomOffset: {
      control: 'number',
      description:
        'Distance in px from the bottom of the viewport, for hosts whose bottom edge already carries chrome the bar must clear',
    },
  },
}

export default meta
type Story = StoryObj<ActionBarStoryArgs>

const storyStyles = css.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
    padding: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    opacity: 0.6,
    marginBottom: spacing.sm,
  },
})

const users = [
  {id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin'},
  {id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'User'},
  {id: '3', name: 'Carol White', email: 'carol@example.com', role: 'User'},
  {id: '4', name: 'Dan Brown', email: 'dan@example.com', role: 'Editor'},
]

function SelectableTable({
  initialSelected = new Set<string>(),
  onClearSelection,
}: {
  initialSelected?: Set<string>
  onClearSelection?: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(initialSelected)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(users.map((u) => u.id)))
    }
  }

  const clearSelection = () => {
    setSelected(new Set())
    onClearSelection?.()
  }

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell aria-label="Select">
              <Checkbox
                checked={selected.size === users.length}
                onChange={toggleAll}
                aria-label="Select all rows"
              />
            </Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((u) => (
            <Table.Row key={u.id}>
              <Table.Cell>
                <Checkbox
                  checked={selected.has(u.id)}
                  onChange={() => toggle(u.id)}
                  aria-label={`Select ${u.name}`}
                />
              </Table.Cell>
              <Table.Cell>{u.name}</Table.Cell>
              <Table.Cell>{u.email}</Table.Cell>
              <Table.Cell>{u.role}</Table.Cell>
              <Table.Cell>
                <Button variant="secondary" size="small">
                  Edit
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <ActionBar selectedItemCount={selected.size} onClearSelection={clearSelection}>
        <Button variant="secondary" size="small">
          Export
        </Button>
        <Button variant="danger" size="small">
          Delete
        </Button>
      </ActionBar>
    </>
  )
}

export const Default: Story = {
  args: {
    onClearSelection: fn(),
  },
  render: (args) => (
    <SelectableTable
      initialSelected={new Set(['2'])}
      onClearSelection={args.onClearSelection as () => void}
    />
  ),
  play: async () => {
    // The ActionBar is portalled to document.body, so query from there
    const toolbar = document.querySelector('[role="toolbar"]')
    await expect(toolbar).toBeInTheDocument()
    await expect(toolbar).toHaveAccessibleName('1 selected')
  },
}

export const MultipleSelected: Story = {
  render: () => <SelectableTable initialSelected={new Set(['1', '3', '4'])} />,
}

export const Emphasized: Story = {
  render: () => {
    function Demo() {
      const [selected, setSelected] = useState(new Set(['2', '3']))
      const toggle = (id: string) => {
        setSelected((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }
      return (
        <>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell aria-label="Select">
                  <Checkbox
                    checked={selected.size === users.length}
                    aria-label="Select all rows"
                    onChange={() =>
                      setSelected(
                        selected.size === users.length
                          ? new Set()
                          : new Set(users.map((u) => u.id)),
                      )
                    }
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.map((u) => (
                <Table.Row key={u.id}>
                  <Table.Cell>
                    <Checkbox
                      checked={selected.has(u.id)}
                      onChange={() => toggle(u.id)}
                      aria-label={`Select ${u.name}`}
                    />
                  </Table.Cell>
                  <Table.Cell>{u.name}</Table.Cell>
                  <Table.Cell>{u.email}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <ActionBar
            selectedItemCount={selected.size}
            isEmphasized
            onClearSelection={() => setSelected(new Set())}
          >
            <Button variant="inverseSecondary" size="small">
              Archive
            </Button>
            <Button variant="inverseSecondary" size="small">
              Delete
            </Button>
          </ActionBar>
        </>
      )
    }
    return <Demo />
  },
}

export const CustomLabel: Story = {
  render: () => (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Traefik</Table.Cell>
            <Table.Cell>Running</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <ActionBar
        selectedItemCount={3}
        selectedLabel={(count) => `${count} users to revoke`}
        onClearSelection={() => {}}
      >
        <Button variant="danger" size="small">
          Confirm revoke
        </Button>
      </ActionBar>
    </>
  ),
}

export const Hidden: Story = {
  render: () => <SelectableTable initialSelected={new Set()} />,
}

export const BottomOffset: Story = {
  render: () => (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Hero section</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <ActionBar selectedItemCount={1} bottomOffset={72} onClearSelection={() => {}}>
        <Button variant="secondary" size="small">
          Resize
        </Button>
      </ActionBar>
    </>
  ),
  play: async () => {
    const toolbar = document.querySelector('[role="toolbar"]')
    await expect(toolbar).toBeInTheDocument()
    await expect(getComputedStyle(toolbar as Element).bottom).toBe('72px')
  },
}

export const AllVariants: Story = {
  render: () => (
    <html.div style={storyStyles.wrapper}>
      <html.div>
        <html.span style={storyStyles.label}>Default — check boxes to see the ActionBar</html.span>
        <SelectableTable initialSelected={new Set(['1'])} />
      </html.div>
    </html.div>
  ),
}

// A panel docked at the window's end edge, standing in for an open DetailPanel.
const docked = css.create({
  panel: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    insetInlineEnd: 0,
    width: 360,
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
  },
})

// Real buttons: they don't shrink below their labels, so together they are
// wider than the free area beside the panel.
const WIDE_ACTIONS = [
  'Duplicate',
  'Move to section',
  'Copy style',
  'Paste style',
  'Group',
  'Ungroup',
  'Bring forward',
  'Send backward',
  'Delete',
]

const barRect = () =>
  (document.querySelector('[role="toolbar"]') as Element).getBoundingClientRect()
const panelRect = () =>
  (document.querySelector('[data-testid="docked-panel"]') as Element).getBoundingClientRect()

export const NoInset: Story = {
  render: () => (
    <ActionBar selectedItemCount={2} onClearSelection={() => {}}>
      <Button variant="secondary" size="small">
        Delete
      </Button>
    </ActionBar>
  ),
  play: async () => {
    const bar = barRect()
    const centre = document.documentElement.clientWidth / 2
    // Today's placement: centred on the window.
    await expect(Math.abs(bar.left + bar.width / 2 - centre)).toBeLessThanOrEqual(1)
  },
}

export const DockedPanel: Story = {
  render: () => (
    <>
      <html.div style={docked.panel} data-testid="docked-panel" />
      <ActionBar selectedItemCount={2} insetInlineEnd={360} onClearSelection={() => {}}>
        <Button variant="secondary" size="small">
          Delete
        </Button>
      </ActionBar>
    </>
  ),
  play: async () => {
    const bar = barRect()
    const panel = panelRect()
    // Clear of the panel, and centred in what is left of the window.
    await expect(bar.right).toBeLessThanOrEqual(panel.left - 24)
    await expect(Math.abs(bar.left + bar.width / 2 - panel.left / 2)).toBeLessThanOrEqual(1)
  },
}

export const DockedPanelWideBar: Story = {
  render: () => (
    <>
      <html.div style={docked.panel} data-testid="docked-panel" />
      <ActionBar selectedItemCount={2} insetInlineEnd={360} onClearSelection={() => {}}>
        {WIDE_ACTIONS.map((a) => (
          <Button key={a} variant="secondary" size="small">
            {a}
          </Button>
        ))}
      </ActionBar>
    </>
  ),
  play: async () => {
    // A bar wider than the free area still keeps 24px clear of the panel,
    // and so does what it holds: the actions scroll, they don't spill.
    const limit = panelRect().left - 24
    await expect(barRect().right).toBeLessThanOrEqual(limit)
    const last = await within(document.body).findByRole('button', {name: 'Delete'})
    const actions = last.parentElement!
    await expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(limit)
    await expect(actions.scrollWidth).toBeGreaterThan(actions.clientWidth)
  },
}
