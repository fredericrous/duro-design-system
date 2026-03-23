import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Groups related buttons together with consistent spacing and layout. Supports horizontal and vertical orientation with alignment control.',
  whenToUse: [
    'Dialog footers with Save/Cancel actions',
    'Toolbar-style groupings of related actions',
    'Form submission areas with multiple actions',
  ],
  whenNotToUse: [
    'Single button — just use Button directly',
    'Wrapping tags or badges — use Cluster instead',
    'Navigation items — use Inline or SideNav',
  ],
  relatedTo: [
    {
      component: 'Inline',
      relationship:
        'Inline is a general-purpose horizontal layout; ButtonGroup adds role="group" and disabled support',
    },
    {
      component: 'ActionBar',
      relationship:
        'ActionBar is a floating bulk-selection toolbar; ButtonGroup is a static grouping',
    },
  ],
  example: `<ButtonGroup align="end" gap="sm">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</ButtonGroup>`,
}
