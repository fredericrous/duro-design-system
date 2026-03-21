import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Toggle switch for on/off settings. Renders a hidden checkbox for form submission + a styled switch button.',
  whenToUse: [
    'On/off toggles in settings (notifications, dark mode, feature flags)',
    'Immediate-effect toggles where the change applies instantly',
  ],
  whenNotToUse: [
    'Form opt-in checkboxes — use Checkbox',
    'Selecting between multiple options — use Select or ToggleGroup',
  ],
  relatedTo: [
    {component: 'Checkbox', relationship: 'Checkbox for selection/opt-in; Switch for on/off settings'},
    {component: 'Toggle', relationship: 'Toggle for toolbar pressed state; Switch for settings'},
  ],
  example: `<Switch
  name="notifications"
  defaultChecked={true}
  onCheckedChange={(checked) => console.log(checked)}
>
  Enable notifications
</Switch>`,
}
