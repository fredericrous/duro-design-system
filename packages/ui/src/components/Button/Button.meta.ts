import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Standard interactive button. For navigation (links styled as buttons), use LinkButton instead.',
  whenToUse: [
    'Triggering actions: submit, save, delete, open dialog',
    'Primary and secondary actions in forms and toolbars',
  ],
  whenNotToUse: [
    'Navigating to a URL — use LinkButton (renders <a>)',
    'Toggling state — use Toggle',
  ],
  relatedTo: [
    {component: 'LinkButton', relationship: 'LinkButton for navigation; Button for actions'},
    {component: 'Toggle', relationship: 'Toggle for pressed/unpressed state'},
  ],
  example: `<Inline gap="sm">
  <Button variant="primary" type="submit">Save</Button>
  <Button variant="secondary">Cancel</Button>
  <Button variant="danger">Delete</Button>
</Inline>`,
}
