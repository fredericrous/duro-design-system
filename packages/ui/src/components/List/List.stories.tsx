import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {List} from './List'
import {Badge} from '../Badge/Badge'
import {Button} from '../Button/Button'
import {Checkbox} from '../Checkbox/Checkbox'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const meta: Meta = {
  title: 'Components/List',
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple'],
    },
  },
}

export default meta
type Story = StoryObj

// --- Default ---

export const Default: Story = {
  render: () => (
    <List.Root aria-label="Services">
      <List.Item>
        <List.Content>
          <List.Text>Traefik</List.Text>
          <List.Description>Reverse proxy · Port 443</List.Description>
        </List.Content>
        <List.Actions>
          <Badge variant="success" size="sm">
            Running
          </Badge>
        </List.Actions>
      </List.Item>
      <List.Item>
        <List.Content>
          <List.Text>Nginx</List.Text>
          <List.Description>Web server · Port 80</List.Description>
        </List.Content>
        <List.Actions>
          <Badge variant="success" size="sm">
            Running
          </Badge>
        </List.Actions>
      </List.Item>
      <List.Item>
        <List.Content>
          <List.Text>Pi-hole</List.Text>
          <List.Description>DNS filter · Port 53</List.Description>
        </List.Content>
        <List.Actions>
          <Badge variant="default" size="sm">
            Stopped
          </Badge>
        </List.Actions>
      </List.Item>
    </List.Root>
  ),
  play: async ({canvas}) => {
    const list = canvas.getByRole('list')
    await expect(list).toBeInTheDocument()
    await expect(canvas.getAllByRole('listitem').length).toBe(3)
  },
}

// --- With Selection ---

const narrowContainer = css.create({
  box: {
    maxWidth: sizes.panelSm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
})

function SelectionDemo() {
  const certs = [
    {
      id: 'c1',
      serial: 'aa:bb:cc:dd:01',
      issued: 'Mar 21, 2026',
      expires: 'Jun 19, 2026',
      status: 'active' as const,
    },
    {
      id: 'c2',
      serial: 'aa:bb:cc:dd:02',
      issued: 'Mar 21, 2026',
      expires: 'Jun 19, 2026',
      status: 'active' as const,
    },
    {
      id: 'c3',
      serial: 'ee:ff:00:11:03',
      issued: 'Jan 10, 2025',
      expires: 'Jan 10, 2026',
      status: 'expired' as const,
    },
  ]

  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <html.div style={narrowContainer.box}>
      <List.Root selectionMode="multiple" aria-label="Certificates">
        {certs.map((cert) => (
          <List.Item
            key={cert.id}
            selected={selected.has(cert.id)}
            onClick={() => cert.status === 'active' && toggle(cert.id)}
            disabled={cert.status !== 'active'}
          >
            {cert.status === 'active' && (
              <Checkbox
                checked={selected.has(cert.id)}
                onChange={() => toggle(cert.id)}
                aria-label={cert.serial}
              />
            )}
            <List.Content>
              <List.Text>{cert.serial}</List.Text>
              <List.Description>
                Issued: {cert.issued} · Expires: {cert.expires}
              </List.Description>
            </List.Content>
            <List.Actions>
              <Badge variant={cert.status === 'active' ? 'success' : 'default'} size="sm">
                {cert.status}
              </Badge>
              {cert.status === 'active' && (
                <Button variant="danger" size="small">
                  Revoke
                </Button>
              )}
            </List.Actions>
          </List.Item>
        ))}
      </List.Root>
    </html.div>
  )
}

export const WithSelection: Story = {
  render: () => <SelectionDemo />,
  play: async ({canvas}) => {
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes.length).toBe(2)
  },
}

// --- Empty State ---

export const EmptyState: Story = {
  render: () => (
    <html.div style={narrowContainer.box}>
      <List.Root aria-label="Empty list">
        <List.Empty>No items found.</List.Empty>
      </List.Root>
    </html.div>
  ),
}

// --- In Detail Panel context (360px) ---

function DetailPanelDemo() {
  const users = [
    {id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active'},
    {id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active'},
    {id: '3', name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', status: 'Inactive'},
  ]

  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <html.div style={narrowContainer.box}>
      <List.Root selectionMode="single" aria-label="Users">
        {users.map((user) => (
          <List.Item
            key={user.id}
            selected={selectedId === user.id}
            onClick={() => setSelectedId(selectedId === user.id ? null : user.id)}
          >
            <List.Content>
              <List.Text>{user.name}</List.Text>
              <List.Description>
                {user.email} · {user.role}
              </List.Description>
            </List.Content>
            <List.Actions>
              <Badge variant={user.status === 'Active' ? 'success' : 'default'} size="sm">
                {user.status}
              </Badge>
            </List.Actions>
          </List.Item>
        ))}
      </List.Root>
    </html.div>
  )
}

export const SingleSelection: Story = {
  render: () => <DetailPanelDemo />,
}

// --- Clickable items ---

function ClickableDemo() {
  const [picked, setPicked] = useState<string[]>([])
  const turns = [
    {
      id: 't1',
      text: 'Fix the login bug where a stale token logs the user out mid-session',
      reply: 'Done',
    },
    {id: 't2', text: 'Add a test for it', reply: 'Added auth.test.ts'},
    {id: 't3', text: 'Still sending', reply: null},
  ]
  return (
    <html.div style={narrowContainer.box}>
      <List.Root aria-label="Turns">
        {turns.map((turn) => (
          <List.Item
            key={turn.id}
            disabled={turn.reply === null}
            onClick={() => setPicked((all) => [...all, turn.id])}
          >
            <List.Content>
              <List.Text>{turn.text}</List.Text>
              {turn.reply ? <List.Description>{turn.reply}</List.Description> : null}
            </List.Content>
            <List.Actions>
              <Badge size="sm">Turn</Badge>
            </List.Actions>
          </List.Item>
        ))}
      </List.Root>
      <html.p>Picked: {picked.join(', ')}</html.p>
    </html.div>
  )
}

export const ClickableItems: Story = {
  render: () => <ClickableDemo />,
  play: async ({canvas, userEvent}) => {
    const buttons = canvas.getAllByRole('button')
    await expect(buttons).toHaveLength(3)
    // The keyboard reaches the item and presses it, once.
    await userEvent.tab()
    await expect(buttons[0]).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByText('Picked: t1')).toBeInTheDocument()
    // A press on the row outside the text is one press too.
    await userEvent.click(canvas.getAllByText('Turn')[1])
    await expect(canvas.getByText('Picked: t1, t2')).toBeInTheDocument()
    await expect(buttons[2]).toBeDisabled()
  },
}
