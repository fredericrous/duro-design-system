import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Dropdown action menu. Triggers actions (not value selection). Compound component — Root is required (throws without it).',
  whenToUse: [
    'Context menu or "more actions" dropdown',
    'Navigation links in a dropdown',
    'Overflow menu for toolbar actions',
  ],
  whenNotToUse: [
    'Picking a value — use Select',
    'Primary navigation — use SideNav or Tabs',
  ],
  anatomy: {
    required: ['Root', 'Trigger', 'Popup', 'Item'],
    optional: ['LinkItem'],
  },
  relatedTo: [
    {component: 'Select', relationship: 'Select picks values; Menu triggers actions'},
    {component: 'Button', relationship: 'Often used as Menu.Trigger content'},
  ],
  example: `<Menu.Root>
  <Menu.Trigger>
    <Button variant="secondary">Actions</Button>
  </Menu.Trigger>
  <Menu.Popup>
    <Menu.Item onClick={() => console.log('edit')}>Edit</Menu.Item>
    <Menu.Item onClick={() => console.log('duplicate')}>Duplicate</Menu.Item>
    <Menu.LinkItem href="/settings">Settings</Menu.LinkItem>
  </Menu.Popup>
</Menu.Root>`,
}
