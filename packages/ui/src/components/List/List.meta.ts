import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Vertical list of interactive items. Ideal for narrow spaces (detail panels, sidebars) where Table would truncate. Supports selection, descriptions, and action slots.',
  whenToUse: [
    'Displaying items in a narrow container (< 480px)',
    'Detail panels, drawers, and sidebars',
    'Lists needing selection (single or multiple) with compact layout',
  ],
  whenNotToUse: [
    'Tabular data with many columns — use Table',
    'Navigation menus — use SideNav or Menu',
    'Simple text lists without interaction — use Stack with Text',
  ],
  anatomy: {
    required: ['Root', 'Item', 'Content', 'Text'],
    optional: ['Description', 'Actions', 'Empty'],
  },
  relatedTo: [
    {component: 'Table', relationship: 'Table for wide multi-column data; List for narrow compact items'},
    {component: 'DetailPanel', relationship: 'List fits naturally inside DetailPanel.Body'},
    {component: 'Menu', relationship: 'Menu for action menus; List for data display with selection'},
  ],
  example: `<List.Root selectionMode="multiple" aria-label="Certificates">
  <List.Item selected onClick={toggle}>
    <Checkbox checked />
    <List.Content>
      <List.Text>web-server-prod-2024.pem</List.Text>
      <List.Description>Issued: Jan 15, 2024 · Expires: Jan 15, 2025</List.Description>
    </List.Content>
    <List.Actions>
      <Badge variant="success">Active</Badge>
      <Button variant="danger" size="small">Revoke</Button>
    </List.Actions>
  </List.Item>
  <List.Empty>No certificates found.</List.Empty>
</List.Root>`,
}
