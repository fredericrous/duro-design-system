import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'
import {css, html} from 'react-strict-dom'
import {DetailPanel} from './DetailPanel'
import {Button} from '../Button/Button'
import {Text} from '../Text/Text'
import {Heading} from '../Heading/Heading'
import {Stack} from '../Stack/Stack'
import {Inline} from '../Inline/Inline'
import {Badge} from '../Badge/Badge'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

const meta: Meta = {
  title: 'Components/DetailPanel',
}

export default meta
type Story = StoryObj

const layoutStyles = css.create({
  container: {
    display: 'flex',
    height: 400,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  main: {
    flex: 1,
    padding: spacing.lg,
    overflowY: 'auto',
  },
})

// --- Default ---

function DefaultDemo() {
  const [open, setOpen] = useState(false)

  return (
    <html.div style={layoutStyles.container}>
      <html.div style={layoutStyles.main}>
        <Stack gap="md">
          <Heading level={3}>Main Content</Heading>
          <Text>Click the button to open the detail panel.</Text>
          <Button onClick={() => setOpen(true)}>Open Detail Panel</Button>
        </Stack>
      </html.div>

      <DetailPanel.Root open={open} onOpenChange={setOpen}>
        <DetailPanel.Content label="Details">
          <DetailPanel.Header>
            <DetailPanel.Title>Details</DetailPanel.Title>
            <DetailPanel.Close />
          </DetailPanel.Header>
          <DetailPanel.Body>
            <Text>
              This is a non-modal detail panel. The content behind it
              remains interactive — you can still click, scroll, and
              interact with the main area.
            </Text>
          </DetailPanel.Body>
          <DetailPanel.Footer>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DetailPanel.Footer>
        </DetailPanel.Content>
      </DetailPanel.Root>
    </html.div>
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

// --- Table Selection ---

interface User {
  id: number
  name: string
  role: string
  status: string
  email: string
}

const users: User[] = [
  {id: 1, name: 'Alice Johnson', role: 'Admin', status: 'Active', email: 'alice@example.com'},
  {id: 2, name: 'Bob Smith', role: 'Editor', status: 'Inactive', email: 'bob@example.com'},
  {id: 3, name: 'Carol Davis', role: 'Viewer', status: 'Active', email: 'carol@example.com'},
  {id: 4, name: 'Dan Wilson', role: 'Editor', status: 'Active', email: 'dan@example.com'},
]

const tableStyles = css.create({
  row: {
    display: 'flex',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
  },
  rowSelected: {
    backgroundColor: colors.bgCardHover,
  },
  headerRow: {
    display: 'flex',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  cellText: {
    flex: 1,
  },
})

function TableSelectionDemo() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selectedUser = users.find((u) => u.id === selectedId)

  return (
    <html.div style={layoutStyles.container}>
      <html.div style={layoutStyles.main}>
        <Stack gap="md">
          <Heading level={3}>Users</Heading>
          <html.div>
            <html.div style={tableStyles.headerRow}>
              <html.span style={tableStyles.cellText}><Text variant="label">Name</Text></html.span>
              <html.span style={tableStyles.cellText}><Text variant="label">Role</Text></html.span>
              <html.span style={tableStyles.cellText}><Text variant="label">Status</Text></html.span>
            </html.div>
            {users.map((user) => (
              <html.div
                key={user.id}
                style={[tableStyles.row, selectedId === user.id && tableStyles.rowSelected]}
                onClick={() => setSelectedId(selectedId === user.id ? null : user.id)}
              >
                <html.span style={tableStyles.cellText}><Text>{user.name}</Text></html.span>
                <html.span style={tableStyles.cellText}><Text>{user.role}</Text></html.span>
                <html.span style={tableStyles.cellText}><Text>{user.status}</Text></html.span>
              </html.div>
            ))}
          </html.div>
        </Stack>
      </html.div>

      <DetailPanel.Root
        open={selectedId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <DetailPanel.Content size="sm" label="User details">
          <DetailPanel.Header>
            <DetailPanel.Title>{selectedUser?.name}</DetailPanel.Title>
            <DetailPanel.Close />
          </DetailPanel.Header>
          <DetailPanel.Body>
            {selectedUser && (
              <Stack gap="md">
                <Stack gap="xs">
                  <Text variant="label">Email</Text>
                  <Text variant="bodySm">{selectedUser.email}</Text>
                </Stack>
                <Stack gap="xs">
                  <Text variant="label">Role</Text>
                  <Text variant="bodySm">{selectedUser.role}</Text>
                </Stack>
                <Stack gap="xs">
                  <Text variant="label">Status</Text>
                  <Inline gap="sm">
                    <Badge variant={selectedUser.status === 'Active' ? 'success' : 'default'}>
                      {selectedUser.status}
                    </Badge>
                  </Inline>
                </Stack>
              </Stack>
            )}
          </DetailPanel.Body>
          <DetailPanel.Footer>
            <Button variant="danger">Revoke Access</Button>
          </DetailPanel.Footer>
        </DetailPanel.Content>
      </DetailPanel.Root>
    </html.div>
  )
}

export const TableSelection: Story = {
  render: () => <TableSelectionDemo />,
}

// --- Medium Size ---

function MediumSizeDemo() {
  const [open, setOpen] = useState(false)

  return (
    <html.div style={layoutStyles.container}>
      <html.div style={layoutStyles.main}>
        <Stack gap="md">
          <Heading level={3}>Main Content</Heading>
          <Text>This demo uses the medium (480px) panel width.</Text>
          <Button onClick={() => setOpen(true)}>Open Medium Panel</Button>
        </Stack>
      </html.div>

      <DetailPanel.Root open={open} onOpenChange={setOpen}>
        <DetailPanel.Content size="md" label="Medium detail panel">
          <DetailPanel.Header>
            <DetailPanel.Title>Medium Panel</DetailPanel.Title>
            <DetailPanel.Close />
          </DetailPanel.Header>
          <DetailPanel.Body>
            <Text>
              This panel is 480px wide, providing more room for complex
              content like forms or detailed information.
            </Text>
          </DetailPanel.Body>
        </DetailPanel.Content>
      </DetailPanel.Root>
    </html.div>
  )
}

export const MediumSize: Story = {
  render: () => <MediumSizeDemo />,
}

// --- Uncontrolled ---

function UncontrolledDemo() {
  return (
    <html.div style={layoutStyles.container}>
      <html.div style={layoutStyles.main}>
        <Stack gap="md">
          <Heading level={3}>Uncontrolled Mode</Heading>
          <Text>This panel manages its own open state internally.</Text>
          <DetailPanel.Root defaultOpen>
            <DetailPanel.Content label="Uncontrolled panel">
              <DetailPanel.Header>
                <DetailPanel.Title>Uncontrolled</DetailPanel.Title>
                <DetailPanel.Close />
              </DetailPanel.Header>
              <DetailPanel.Body>
                <Text>This panel started open and manages its own state.</Text>
              </DetailPanel.Body>
            </DetailPanel.Content>
          </DetailPanel.Root>
        </Stack>
      </html.div>
    </html.div>
  )
}

export const Uncontrolled: Story = {
  render: () => <UncontrolledDemo />,
}
