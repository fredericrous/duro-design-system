import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Toggle button with pressed/unpressed state. Works standalone or within ToggleGroup for multi/single selection.',
  whenToUse: [
    'Toolbar buttons that toggle on/off (bold, italic, grid view)',
    'Within ToggleGroup for selecting from visible options',
  ],
  whenNotToUse: [
    'On/off settings — use Switch',
    'Form checkboxes — use Checkbox',
    'Submitting actions — use Button',
  ],
  relatedTo: [
    {component: 'ToggleGroup', relationship: 'Group of Toggles with single/multi select'},
    {component: 'Switch', relationship: 'Switch for settings; Toggle for toolbar actions'},
    {component: 'Button', relationship: 'Button for actions; Toggle for state'},
  ],
  example: `// Standalone
<Toggle pressed={isBold} onPressedChange={setIsBold} aria-label="Bold">
  <Icon name="key" size={16} />
</Toggle>

// In a group
<ToggleGroup value={['grid']} onValueChange={setView} multiple={false}>
  <Toggle value="list">List</Toggle>
  <Toggle value="grid">Grid</Toggle>
</ToggleGroup>`,
}
