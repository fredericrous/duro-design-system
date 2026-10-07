import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Groups related buttons together with consistent spacing and layout. Supports horizontal and vertical orientation with alignment control. With `attached`, the group renders one joined control (shared borders, square inner corners) from any mix of Button, Toggle and Select/Menu/Popover triggers.',
  whenToUse: [
    'Dialog footers with Save/Cancel actions',
    'Toolbar-style groupings of related actions',
    'Form submission areas with multiple actions',
    '`attached`: a segmented control of mixed controls — [Normal | Arial | 15px] as three Selects, [B | I | U | link] as Toggles and a Popover trigger',
  ],
  whenNotToUse: [
    'Single button — just use Button directly',
    'Wrapping tags or badges — use Cluster instead',
    'Navigation items — use Inline or SideNav',
  ],
  relatedTo: [
    {
      component: 'Toolbar',
      kind: 'composition',
      relationship:
        'Put attached groups in a Toolbar for one tab stop and arrow keys across them; a ButtonGroup alone leaves every control its own tab stop',
    },
    {
      component: 'ToggleGroup',
      kind: 'contrast',
      relationship:
        'ToggleGroup owns a selection (single or multiple) across Toggles; ButtonGroup attached only joins controls visually, each keeps its own state',
    },
    {
      component: 'Inline',
      kind: 'contrast',
      relationship:
        'Inline is a general-purpose horizontal layout; ButtonGroup adds role="group" and disabled support',
    },
    {
      component: 'ActionBar',
      kind: 'contrast',
      relationship:
        'ActionBar is a floating bulk-selection toolbar; ButtonGroup is a static grouping',
    },
  ],
  example: `<ButtonGroup align="end" gap="sm">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</ButtonGroup>`,
}
