import {Table} from '../../../packages/ui/src/components/Table/Table'
import {Badge} from '../../../packages/ui/src/components/Badge/Badge'
import type {ComponentMeta} from '../types'

const users = [
  {id: 1, name: 'Alice Johnson', role: 'Admin', status: 'Active'},
  {id: 2, name: 'Bob Smith', role: 'Editor', status: 'Inactive'},
  {id: 3, name: 'Carol Williams', role: 'Viewer', status: 'Active'},
  {id: 4, name: 'Dan Brown', role: 'Editor', status: 'Active'},
]

function statusVariant(status: string) {
  return status === 'Active' ? ('success' as const) : ('default' as const)
}

export function DataTableRecipe() {
  return (
    <Table.Root variant="striped" size="md" columns={4}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Role</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell aria-label="Actions" />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>{user.role}</Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant(user.status)}>{user.status}</Badge>
            </Table.Cell>
            <Table.Cell>Edit</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export const recipeMeta: ComponentMeta = {
  description: 'Striped data table with badge status column.',
  whenToUse: ['User lists', 'Admin dashboards', 'Any tabular data display'],
  whenNotToUse: ['Card-based layouts — use Grid + Card instead'],
  example: '<DataTableRecipe />',
}
