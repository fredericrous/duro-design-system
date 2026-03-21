import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Dropdown select for choosing one value from a list. Compound component — Root is required (throws without it).',
  whenToUse: [
    'User must pick one option from a predefined list',
    'Form field for country, category, role selection',
  ],
  whenNotToUse: [
    'Triggering actions — use Menu',
    'Multiple selections — use ToggleGroup or Checkbox group',
    'Fewer than 3 options — consider Toggle or ToggleGroup',
  ],
  anatomy: {
    required: ['Root', 'Trigger', 'Popup', 'Item'],
    optional: ['Value', 'Icon', 'ItemText'],
  },
  relatedTo: [
    {component: 'Menu', relationship: 'Menu triggers actions; Select picks a value'},
    {component: 'ToggleGroup', relationship: 'For visible, small option sets'},
  ],
  example: `<Select.Root name="role" defaultValue="viewer">
  <Select.Trigger>
    <Select.Value placeholder="Select role" />
    <Select.Icon />
  </Select.Trigger>
  <Select.Popup>
    <Select.Item value="admin">Admin</Select.Item>
    <Select.Item value="editor">Editor</Select.Item>
    <Select.Item value="viewer">Viewer</Select.Item>
  </Select.Popup>
</Select.Root>`,
}
