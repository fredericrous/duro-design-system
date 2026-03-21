import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Data table with CSS grid layout. Supports striped, bordered variants. Compound component — Root is required (throws without it). Requires `columns` prop on Root.',
  whenToUse: [
    'Displaying tabular data with rows and columns',
    'Data lists with sortable/filterable columns',
  ],
  whenNotToUse: [
    'Simple key-value pairs — use Stack with Text',
    'Card-based layouts — use Grid with Card',
  ],
  anatomy: {
    required: ['Root', 'Header', 'Body', 'Row', 'HeaderCell', 'Cell'],
  },
  relatedTo: [
    {component: 'ScrollArea', relationship: 'Wrap Table in ScrollArea for horizontal overflow'},
  ],
  example: `<Table.Root variant="striped" size="md" columns={3}>
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Role</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Alice</Table.Cell>
      <Table.Cell>Admin</Table.Cell>
      <Table.Cell>Active</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>`,
}
