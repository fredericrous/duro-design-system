import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Container for Toggle buttons enabling single or multi selection. Provides context to child Toggles.',
  whenToUse: [
    'Visible option set where user picks one or more (view mode, filter categories)',
    'Segmented control pattern',
    'A visible grid of icon choices: wrap + maxRows (rows scroll past maxRows, one tab stop with arrow keys, 44px touch targets)',
  ],
  whenNotToUse: [
    'Dropdown selection — use Select',
    'Many text options (5+) — use Select for space efficiency; does not apply to icon-only choices, which keep options visible and open no layer',
    'Form checkboxes — use Checkbox group in Fieldset',
  ],
  relatedTo: [
    {component: 'Toggle', kind: 'composition', relationship: 'Toggle children get group context'},
    {
      component: 'Select',
      kind: 'contrast',
      relationship: 'Select hides options behind a dropdown; ToggleGroup keeps a small set visible',
    },
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
</ToggleGroup>

// Icon choices: wraps onto rows, scrolls past three, one tab stop
<ToggleGroup wrap maxRows={3} size="small" value={[icon]} onValueChange={(v) => v[0] && setIcon(v[0])} aria-label="Icon">
  {names.map((name) => (
    <Toggle key={name} value={name} aria-label={name}>
      <Icon name={name} size="sm" />
    </Toggle>
  ))}
</ToggleGroup>`,
}
