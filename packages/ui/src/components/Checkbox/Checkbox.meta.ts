import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Checkbox input with optional visible label. Supports controlled and uncontrolled modes.',
  whenToUse: [
    'Boolean opt-in/opt-out (terms acceptance, feature toggle)',
    'Multi-select from a list (inside a Fieldset)',
  ],
  whenNotToUse: [
    'Binary toggle in settings — prefer Switch for on/off semantics',
    'Selecting one of several options — use Select or ToggleGroup',
  ],
  relatedTo: [
    {
      component: 'Switch',
      relationship: 'Switch for on/off settings; Checkbox for opt-in/selection',
    },
    {component: 'Toggle', relationship: 'Toggle for toolbar actions; Checkbox for form input'},
  ],
  example: `<Checkbox name="terms" onChange={(e) => console.log(e.target.checked)}>
  I agree to the terms and conditions
</Checkbox>`,
}
