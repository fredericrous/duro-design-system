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

import {flexRender, createColumnHelper, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, type SortingState, type ColumnFiltersState, type PaginationState} from '@tanstack/react-table'
import {useDataTable} from './useDataTable'
import {Combobox} from '../Combobox/Combobox'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

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

// --- Sorting: demonstrates click-to-sort with hover indicators ---

type Service = {name: string; role: string; port: number; uptime: string}

const sortingData: Service[] = [
  {name: 'Traefik', role: 'Reverse Proxy', port: 443, uptime: '14d 3h'},
  {name: 'Pi-hole', role: 'DNS Filter', port: 80, uptime: '14d 3h'},
  {name: 'Grafana', role: 'Monitoring', port: 3000, uptime: '7d 12h'},
  {name: 'Portainer', role: 'Container Mgmt', port: 9000, uptime: '2d 5h'},
  {name: 'Nginx', role: 'Web Server', port: 8080, uptime: '30d 1h'},
]

const sortingCols = [
  createColumnHelper<Service>().accessor('name', {header: 'Name', enableSorting: true}),
  createColumnHelper<Service>().accessor('role', {header: 'Role', enableSorting: true}),
  createColumnHelper<Service>().accessor('port', {header: 'Port', enableSorting: true}),
  createColumnHelper<Service>().accessor('uptime', {header: 'Uptime', enableSorting: true}),
]

function SortingDemo() {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: sortingData,
    columns: sortingCols,
    state: {sorting},
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((hg) => (
          <Table.Row key={hg.id}>
            {hg.headers.map((header) => (
              <Table.HeaderCell key={header.id}>
                <html.span
                  style={fullFeaturedStyles.headerContent}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <Table.SortIndicator column={header.column} />
                </html.span>
              </Table.HeaderCell>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export const Sorting: Story = {
  render: () => <SortingDemo />,
  play: async ({canvas}) => {
    await expect(canvas.getByRole('table')).toBeInTheDocument()
    await expect(canvas.getAllByRole('columnheader').length).toBe(4)
  },
}

// --- Shared data helpers for interactive demos ---

interface User {
  name: string
  role: string
  status: string
  email: string
}

const firstNames = [
  'Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank',
  'Iris', 'Jack', 'Karen', 'Leo', 'Mona', 'Nick', 'Olivia', 'Paul',
  'Quinn', 'Rita', 'Sam', 'Tina', 'Uma', 'Vince', 'Wendy', 'Xander',
  'Yara', 'Zach',
]
const lastNames = [
  'Adams', 'Brown', 'Clark', 'Davis', 'Evans', 'Foster', 'Garcia',
  'Hill', 'Ito', 'Jones', 'Kim', 'Lee', 'Moore', 'Nash', 'Owen',
  'Patel', 'Quinn', 'Reed', 'Smith', 'Tran', 'Ueda', 'Voss', 'Wang',
  'Xu', 'Yang', 'Zhang',
]
const roles = ['Admin', 'Editor', 'Viewer', 'Moderator', 'Analyst']
const statuses = ['Active', 'Inactive', 'Pending', 'Suspended']

function generateUsers(count: number): User[] {
  return Array.from({length: count}, (_, i) => {
    const first = firstNames[i % firstNames.length]
    const last = lastNames[(i * 7) % lastNames.length]
    return {
      name: `${first} ${last}`,
      role: roles[i % roles.length],
      status: statuses[i % statuses.length],
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    }
  })
}

// --- Pagination: demonstrates page navigation ---

const paginationData = generateUsers(35)

const paginationCols = [
  createColumnHelper<User>().accessor('name', {header: 'Name'}),
  createColumnHelper<User>().accessor('role', {header: 'Role'}),
  createColumnHelper<User>().accessor('email', {header: 'Email'}),
]

function PaginationDemo() {
  const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10})

  const table = useReactTable({
    data: paginationData,
    columns: paginationCols,
    state: {pagination},
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <html.div style={fullFeaturedStyles.wrapper}>
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((hg) => (
            <Table.Row key={hg.id}>
              {hg.headers.map((header) => (
                <Table.HeaderCell key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Table.Pagination table={table} />
    </html.div>
  )
}

export const WithPagination: Story = {
  render: () => <PaginationDemo />,
  play: async ({canvas}) => {
    await expect(canvas.getByText('1 / 4')).toBeInTheDocument()
    await expect(canvas.getByText('Next')).toBeInTheDocument()
  },
}

// --- Filtering: demonstrates column filter inputs ---

const filteringData = generateUsers(20)

const filteringCols = [
  createColumnHelper<User>().accessor('name', {header: 'Name', enableColumnFilter: true}),
  createColumnHelper<User>().accessor('role', {header: 'Role', enableColumnFilter: false}),
  createColumnHelper<User>().accessor('status', {header: 'Status', enableColumnFilter: false}),
  createColumnHelper<User>().accessor('email', {header: 'Email', enableColumnFilter: true}),
]

function FilteringDemo() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data: filteringData,
    columns: filteringCols,
    state: {columnFilters},
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((hg) => (
          <Table.Row key={hg.id}>
            {hg.headers.map((header) => (
              <Table.HeaderCell key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanFilter() && (
                  <Table.ColumnFilter
                    column={header.column}
                    placeholder={`Filter ${header.column.id}...`}
                  />
                )}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export const WithFiltering: Story = {
  render: () => <FilteringDemo />,
  play: async ({canvas}) => {
    await expect(canvas.getByRole('table')).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('Filter name...')).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('Filter email...')).toBeInTheDocument()
  },
}

// --- FullFeatured: useDataTable with pagination, sorting, and filtering ---

const fakeUsers = generateUsers(50)

const columnHelper = createColumnHelper<User>()

const fullFeaturedColumns = [
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    enableSorting: true,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    enableSorting: true,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    enableSorting: true,
    enableColumnFilter: false,
  }),
]

const fullFeaturedStyles = css.create({
  wrapper: {display: 'flex', flexDirection: 'column', gap: 0},
  filterBar: {
    display: 'flex',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
  },
})

const uniqueRoles = [...new Set(fakeUsers.map((u) => u.role))].sort()
const uniqueStatuses = [...new Set(fakeUsers.map((u) => u.status))].sort()

function FullFeaturedDemo() {
  const table = useDataTable(fakeUsers, fullFeaturedColumns, {
    pagination: {pageSize: 10},
    enableSorting: true,
    enableFiltering: true,
  })

  return (
    <html.div style={fullFeaturedStyles.wrapper}>
      <html.div style={fullFeaturedStyles.filterBar}>
        <Combobox.Root
          value={table.getColumn('role')?.getFilterValue() as string ?? ''}
          onValueChange={(v) => table.getColumn('role')?.setFilterValue(v || undefined)}
          onInputChange={(v) => table.getColumn('role')?.setFilterValue(v || undefined)}
        >
          <Combobox.Input placeholder="Filter role...">
            <Combobox.Trigger />
          </Combobox.Input>
          <Combobox.Popup>
            <Combobox.Item value="">
              <Combobox.ItemText>All Roles</Combobox.ItemText>
            </Combobox.Item>
            {uniqueRoles.map((role) => (
              <Combobox.Item key={role} value={role}>
                <Combobox.ItemText>{role}</Combobox.ItemText>
              </Combobox.Item>
            ))}
            <Combobox.Empty>No roles found</Combobox.Empty>
          </Combobox.Popup>
        </Combobox.Root>
        <Combobox.Root
          value={table.getColumn('status')?.getFilterValue() as string ?? ''}
          onValueChange={(v) => table.getColumn('status')?.setFilterValue(v || undefined)}
          onInputChange={(v) => table.getColumn('status')?.setFilterValue(v || undefined)}
        >
          <Combobox.Input placeholder="Filter status...">
            <Combobox.Trigger />
          </Combobox.Input>
          <Combobox.Popup>
            <Combobox.Item value="">
              <Combobox.ItemText>All Statuses</Combobox.ItemText>
            </Combobox.Item>
            {uniqueStatuses.map((status) => (
              <Combobox.Item key={status} value={status}>
                <Combobox.ItemText>{status}</Combobox.ItemText>
              </Combobox.Item>
            ))}
            <Combobox.Empty>No statuses found</Combobox.Empty>
          </Combobox.Popup>
        </Combobox.Root>
      </html.div>
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.HeaderCell key={header.id}>
                  <html.div
                    style={fullFeaturedStyles.headerContent}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <Table.SortIndicator column={header.column} />
                  </html.div>
                </Table.HeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Table.Pagination table={table} />
    </html.div>
  )
}

export const FullFeatured: Story = {
  render: () => <FullFeaturedDemo />,
  play: async ({canvas}) => {
    await expect(canvas.getByRole('table')).toBeInTheDocument()

    // Should render 10 body rows (pageSize) + 1 header row
    const rows = canvas.getAllByRole('row')
    await expect(rows.length).toBe(11)

    // All 4 column headers present
    const columnHeaders = canvas.getAllByRole('columnheader')
    await expect(columnHeaders.length).toBe(4)

    // Pagination is visible (50 rows / 10 per page = 5 pages)
    await expect(canvas.getByText('1 / 5')).toBeInTheDocument()
    await expect(canvas.getByText('Next')).toBeInTheDocument()
    await expect(canvas.getByText('Previous')).toBeInTheDocument()
  },
}
