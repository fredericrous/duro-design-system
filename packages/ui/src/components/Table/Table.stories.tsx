import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {css, html} from 'react-strict-dom'
import {Table} from './Table'
import {Badge} from '../Badge/Badge'
import {colors} from '@duro/tokens'

const meta: Meta = {
  title: 'Components/Table',
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
    <Table.Root columns={4}>
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
    <Table.Root variant="striped" columns={4}>
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
    <Table.Root variant="bordered" columns={4}>
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
    <Table.Root size="sm" columns={4}>
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

const storyStyles = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: 24},
  label: {color: colors.textMuted, fontSize: '0.875rem', fontWeight: 600},
})

export const AllVariants: Story = {
  render: () => (
    <html.div style={storyStyles.stack}>
      <html.div>
        <html.span style={storyStyles.label}>Default</html.span>
        <Table.Root columns={3}>
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
        <Table.Root variant="striped" columns={3}>
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
        <Table.Root variant="bordered" columns={3}>
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
        <Table.Root size="sm" columns={3}>
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
