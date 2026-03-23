import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Radio button group for single-select from a list of options. Compound component with Root container and Item children.',
  whenToUse: [
    'Selecting exactly one option from a small set (2-5 items)',
    'Options need to be visible at all times (not hidden in a dropdown)',
  ],
  whenNotToUse: [
    'Many options (5+) — use Select for space efficiency',
    'Multi-select — use CheckboxGroup instead',
    'Binary on/off — use Switch',
  ],
  relatedTo: [
    {component: 'CheckboxGroup', relationship: 'CheckboxGroup for multi-select; RadioGroup for single-select'},
    {component: 'Select', relationship: 'Select for larger option sets or when space is limited'},
    {component: 'ToggleGroup', relationship: 'ToggleGroup for toolbar-style selection'},
  ],
  example: `<RadioGroup.Root defaultValue="email" onValueChange={(v) => console.log(v)}>
  <RadioGroup.Item value="email">Email</RadioGroup.Item>
  <RadioGroup.Item value="sms">SMS</RadioGroup.Item>
  <RadioGroup.Item value="push">Push notification</RadioGroup.Item>
</RadioGroup.Root>`,
}
