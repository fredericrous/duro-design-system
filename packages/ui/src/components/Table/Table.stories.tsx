import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {useState} from 'react'
import {Table} from './Table'
import {Badge} from '../Badge/Badge'
import {Checkbox} from '../Checkbox/Checkbox'
import {Button} from '../Button/Button'
import {ActionBar} from '../ActionBar/ActionBar'
import {colors} from '@duro-app/tokens/tokens/colors.css'

const meta: Meta = {
  title: 'Components/Table',
  argTypes: {
    columns: {
      control: 'number',
      description: 'Number of columns in the table grid',
    },
    variant: {
      control: 'select',
      options: ['default', 'striped', 'bordered'],
      description: 'Visual style variant of the table',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Density/size of table rows',
    },
  },
}

export default meta
type Story = StoryObj

const services = [
  {name: 'Traefik', status: 'Running', port: '443', uptime: '14d 3h'},
  {name: 'Pi-hole', status: 'Running', port: '80', uptime: '14d 3h'},
  {name: 'Portainer', status: 'Stopped', port: '9000', uptime: '\u2014'},
  {name: 'Grafana', status: 'Running', port: '3000', uptime: '7d 12h'},
  {name: 'Prometheus', status: 'Warning', port: '9090', uptime: '7d 12h'},
]

function statusVariant(status: string) {
  switch (status) {
    case 'Running':
      return 'success' as const
    case 'Stopped':
      return 'error' as const
    case 'Warning':
      return 'warning' as const
    default:
      return 'default' as const
  }
}

export const Default: Story = {
  render: () => (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Port</Table.HeaderCell>
          <Table.HeaderCell>Uptime</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {services.map((s) => (
          <Table.Row key={s.name}>
            <Table.Cell>{s.name}</Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant(s.status)} size="sm">
                {s.status}
              </Badge>
            </Table.Cell>
            <Table.Cell>{s.port}</Table.Cell>
            <Table.Cell>{s.uptime}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ),
  play: async ({canvas}) => {
    // ARIA table structure
    await expect(canvas.getByRole('table')).toBeInTheDocument()

    const rowgroups = canvas.getAllByRole('rowgroup')
    await expect(rowgroups.length).toBe(2) // header + body

    // Header cells
    const columnHeaders = canvas.getAllByRole('columnheader')
    await expect(columnHeaders.length).toBe(4)
    await expect(columnHeaders[0]).toHaveTextContent('Service')
    await expect(columnHeaders[1]).toHaveTextContent('Status')
    await expect(columnHeaders[2]).toHaveTextContent('Port')
    await expect(columnHeaders[3]).toHaveTextContent('Uptime')

    // Rows (1 header + 5 body)
    const rows = canvas.getAllByRole('row')
    await expect(rows.length).toBe(6)

    // Body cells
    const cells = canvas.getAllByRole('cell')
    await expect(cells.length).toBe(20) // 5 rows * 4 columns
    await expect(cells[0]).toHaveTextContent('Traefik')
  },
}

export const Striped: Story = {
  render: () => (
    <Table.Root variant="striped">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Port</Table.HeaderCell>
          <Table.HeaderCell>Uptime</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {services.map((s) => (
          <Table.Row key={s.name}>
            <Table.Cell>{s.name}</Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant(s.status)} size="sm">
                {s.status}
              </Badge>
            </Table.Cell>
            <Table.Cell>{s.port}</Table.Cell>
            <Table.Cell>{s.uptime}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('table')).toBeInTheDocument()
    await expect(canvas.getAllByRole('row').length).toBe(6)
  },
}

export const Bordered: Story = {
  render: () => (
    <Table.Root variant="bordered">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Port</Table.HeaderCell>
          <Table.HeaderCell>Uptime</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {services.map((s) => (
          <Table.Row key={s.name}>
            <Table.Cell>{s.name}</Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant(s.status)} size="sm">
                {s.status}
              </Badge>
            </Table.Cell>
            <Table.Cell>{s.port}</Table.Cell>
            <Table.Cell>{s.uptime}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('table')).toBeInTheDocument()
    await expect(canvas.getAllByRole('columnheader').length).toBe(4)
    await expect(canvas.getAllByRole('cell').length).toBe(20)
  },
}

export const Compact: Story = {
  render: () => (
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Port</Table.HeaderCell>
          <Table.HeaderCell>Uptime</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {services.map((s) => (
          <Table.Row key={s.name}>
            <Table.Cell>{s.name}</Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant(s.status)} size="sm">
                {s.status}
              </Badge>
            </Table.Cell>
            <Table.Cell>{s.port}</Table.Cell>
            <Table.Cell>{s.uptime}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('table')).toBeInTheDocument()
    await expect(canvas.getByText('Traefik')).toBeInTheDocument()
  },
}

// --- WithCheckboxes: demonstrates parent/child cascading selection ---

interface ServiceData {
  id: string
  name: string
  status: string
  port: string
  uptime: string
}

function CheckboxTableDemo() {
  const items: ServiceData[] = [
    {id: 's1', name: 'Traefik', status: 'Running', port: '443', uptime: '14d 3h'},
    {id: 's2', name: 'Pi-hole', status: 'Running', port: '80', uptime: '14d 3h'},
    {id: 's3', name: 'Portainer', status: 'Stopped', port: '9000', uptime: '\u2014'},
    {id: 's4', name: 'Grafana', status: 'Running', port: '3000', uptime: '7d 12h'},
  ]

  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id))
  const someSelected = items.some((i) => selected.has(i.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  const toggleOne = (id: string) => {
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
            <Table.HeaderCell aria-label="Select all">
              <Checkbox
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all services"
              />
            </Table.HeaderCell>
            <Table.HeaderCell>Service</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Port</Table.HeaderCell>
            <Table.HeaderCell>Uptime</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((s) => (
            <Table.Row key={s.id}>
              <Table.Cell>
                <Checkbox
                  checked={selected.has(s.id)}
                  onChange={() => toggleOne(s.id)}
                  aria-label={s.name}
                />
              </Table.Cell>
              <Table.Cell>{s.name}</Table.Cell>
              <Table.Cell>
                <Badge variant={statusVariant(s.status)} size="sm">
                  {s.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>{s.port}</Table.Cell>
              <Table.Cell>{s.uptime}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <ActionBar selectedItemCount={selected.size} onClearSelection={() => setSelected(new Set())}>
        <Button variant="danger" size="small">
          Delete
        </Button>
      </ActionBar>
    </>
  )
}

export const WithCheckboxes: Story = {
  render: () => <CheckboxTableDemo />,
  play: async ({canvas}) => {
    await expect(canvas.getByRole('table')).toBeInTheDocument()
    const checkboxes = canvas.getAllByRole('checkbox')
    await expect(checkboxes.length).toBe(5) // 1 select-all + 4 rows
    await expect(canvas.getByLabelText('Select all services')).toBeInTheDocument()
  },
}

const storyStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: 24},
  label: {color: colors.textMuted, fontSize: '0.875rem', fontWeight: 600},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={storyStyles.stack}>
      <html.div>
        <html.span style={storyStyles.label}>Default</html.span>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Traefik</Table.Cell>
              <Table.Cell>Reverse Proxy</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Pi-hole</Table.Cell>
              <Table.Cell>DNS</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </html.div>

      <html.div>
        <html.span style={storyStyles.label}>Striped</html.span>
        <Table.Root variant="striped">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Traefik</Table.Cell>
              <Table.Cell>Reverse Proxy</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Pi-hole</Table.Cell>
              <Table.Cell>DNS</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Grafana</Table.Cell>
              <Table.Cell>Monitoring</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </html.div>

      <html.div>
        <html.span style={storyStyles.label}>Bordered</html.span>
        <Table.Root variant="bordered">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Traefik</Table.Cell>
              <Table.Cell>Reverse Proxy</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Pi-hole</Table.Cell>
              <Table.Cell>DNS</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </html.div>

      <html.div>
        <html.span style={storyStyles.label}>Compact (sm)</html.span>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Traefik</Table.Cell>
              <Table.Cell>Reverse Proxy</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Pi-hole</Table.Cell>
              <Table.Cell>DNS</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </html.div>
    </html.div>
  ),
  play: async ({canvas}) => {
    // All four tables render
    const tables = canvas.getAllByRole('table')
    await expect(tables.length).toBe(4)
  },
}
