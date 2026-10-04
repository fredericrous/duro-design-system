import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Dropdown action menu. Triggers actions (not value selection). Compound component — Root is required (throws without it). Menu.Trigger renders the button itself: give it the label (text, an Icon), never a Button.',
  whenToUse: [
    'Context menu or "more actions" dropdown',
    'Navigation links in a dropdown',
    'Overflow menu for toolbar actions',
  ],
  whenNotToUse: [
    'Picking a value — use Select',
    'Primary navigation — use SideNav or Tabs',
    'A small form tied to the trigger — use Popover',
  ],
  anatomy: {
    required: ['Root', 'Trigger', 'Popup', 'Item'],
    optional: ['LinkItem', 'Separator'],
  },
  relatedTo: [
    {
      component: 'Select',
      kind: 'contrast',
      relationship: 'Select picks values; Menu triggers actions',
    },
    {
      component: 'Button',
      kind: 'contrast',
      relationship:
        'Button runs one action; Menu opens a list of them. Menu.Trigger is already a button — never put a Button inside it',
    },
  ],
  example: `<Menu.Root>
  <Menu.Trigger>Actions</Menu.Trigger>
  <Menu.Popup>
    <Menu.Item onClick={() => console.log('edit')}>Edit</Menu.Item>
    <Menu.Item onClick={() => console.log('duplicate')}>Duplicate</Menu.Item>
    <Menu.Separator />
    <Menu.LinkItem href="/settings">Settings</Menu.LinkItem>
  </Menu.Popup>
</Menu.Root>`,
}
