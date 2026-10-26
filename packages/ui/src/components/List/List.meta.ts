import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Vertical list of interactive items. Ideal for narrow spaces (detail panels, sidebars) where Table would truncate. Supports selection, descriptions, and action slots. An Item with onClick is pressable anywhere on its row, and its Content becomes a button: focusable, pressed with Enter or Space, announced with its text, disabled with the Item; the Actions stay beside it, so a Button there never nests in it. An Item with href (and onNavigate for client-side routing, ADR-0002) makes its Content a real link instead: a settings-style row that goes somewhere; a disabled link Item is plain text. List.Leading holds an icon or an Avatar before the Content (decorative unless given an aria-label). List.Root takes a title, which names the list, and a footer of muted text under it.',
  whenToUse: [
    'Displaying items in a narrow container (< 480px)',
    'Detail panels, drawers, and sidebars',
    'Lists needing selection (single or multiple) with compact layout',
  ],
  whenNotToUse: [
    'Tabular data with many columns — use Table',
    "An app's main navigation — use SideNav or AppShell (a List of link Items is for rows that each open a page, like a settings index)",
    'Simple text lists without interaction — use Stack with Text',
  ],
  anatomy: {
    required: ['Root', 'Item', 'Content', 'Text'],
    optional: ['Leading', 'Description', 'Actions', 'Empty'],
  },
  relatedTo: [
    {
      component: 'Table',
      kind: 'contrast',
      relationship: 'Table for wide multi-column data; List for narrow compact items',
    },
    {
      component: 'DetailPanel',
      kind: 'composition',
      relationship: 'List fits naturally inside DetailPanel.Body',
    },
    {
      component: 'Menu',
      kind: 'contrast',
      relationship: 'Menu for action menus; List for data display with selection',
    },
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
