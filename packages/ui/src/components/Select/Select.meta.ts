import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Dropdown select for choosing one value from a list. Compound component — Root is required (throws without it). Select.Trigger takes size="small" to match small Toggles and Buttons in a toolbar. Select.Popup takes label (the list\'s accessible name) and empty (shown in place of the list when it has no items). On the web the list opens below the trigger, or above it when it would overflow the viewport below and fits above. On React Native the trigger opens a bottom sheet (a Drawer at the medium and large detents) titled by label, with a Cancel text button (cancelLabel); the chosen option is filled with a trailing check, and a press picks an option and closes the sheet. Native has no arrow keys: each option is its own screen-reader stop. An Item can be disabled (shown, skipped by the keys, inert to a press, announced as disabled), and onOpenChange on Root reports the list opening and closing, so work such as checking which options are available starts only once someone is choosing. Root takes disabled for the whole control: the trigger is a disabled button (announced so, on native too) and does not open.',
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
    {
      component: 'Popover',
      kind: 'composition',
      relationship:
        'Inside Popover.Popup a Select keeps the popover open while you choose; its backdrop press and Escape close only the list',
    },
    {
      component: 'Menu',
      kind: 'contrast',
      relationship: 'Menu triggers actions; Select picks a value',
    },
    {
      component: 'ToggleGroup',
      kind: 'contrast',
      relationship: 'Select hides options behind a dropdown; ToggleGroup keeps a small set visible',
    },
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
