import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Checkbox group for multi-select from a list of options. Wraps the existing Checkbox component with shared state management.',
  whenToUse: [
    'Selecting multiple options from a small set',
    'Permission or feature toggles where several can be active',
  ],
  whenNotToUse: [
    'Single selection — use RadioGroup instead',
    'Binary on/off — use a single Checkbox or Switch',
    'Many options (10+) — consider a filterable list or Select with multi-select',
  ],
  relatedTo: [
    {
      component: 'RadioGroup',
      relationship: 'RadioGroup for single-select; CheckboxGroup for multi-select',
    },
    {component: 'Checkbox', relationship: 'CheckboxGroup.Item wraps Checkbox internally'},
    {component: 'ToggleGroup', relationship: 'ToggleGroup for toolbar-style multi-select'},
  ],
  example: `<CheckboxGroup.Root defaultValue={['email']} onValueChange={(v) => console.log(v)}>
  <CheckboxGroup.Item value="email">Email</CheckboxGroup.Item>
  <CheckboxGroup.Item value="sms">SMS</CheckboxGroup.Item>
  <CheckboxGroup.Item value="push">Push notification</CheckboxGroup.Item>
</CheckboxGroup.Root>`,
}
