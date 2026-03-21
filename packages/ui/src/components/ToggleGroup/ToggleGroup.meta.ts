import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Container for Toggle buttons enabling single or multi selection. Provides context to child Toggles.',
  whenToUse: [
    'Visible option set where user picks one or more (view mode, filter categories)',
    'Segmented control pattern',
  ],
  whenNotToUse: [
    'Dropdown selection — use Select',
    'Many options (5+) — use Select for space efficiency',
    'Form checkboxes — use Checkbox group in Fieldset',
  ],
  relatedTo: [
    {component: 'Toggle', relationship: 'Toggle children get group context'},
    {component: 'Select', relationship: 'Select for larger option sets'},
  ],
  example: `<ToggleGroup
  value={selected}
  onValueChange={setSelected}
  multiple={false}
  orientation="horizontal"
  size="default"
>
  <Toggle value="list">List view</Toggle>
  <Toggle value="grid">Grid view</Toggle>
  <Toggle value="board">Board view</Toggle>
</ToggleGroup>`,
}
