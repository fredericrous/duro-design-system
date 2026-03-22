import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Icon with a colored background circle. Combines an Icon with a status-colored container for visual emphasis. Use for status indicators in dashboards or lists.',
  whenToUse: [
    'Dashboard status indicators',
    'List item status icons with colored backgrounds',
    'Feature or capability indicators',
  ],
  whenNotToUse: ['Inline icons without background — use Icon', 'Status text labels — use Badge'],
  relatedTo: [
    {component: 'Icon', relationship: 'StatusIcon wraps Icon with background; Icon is bare SVG'},
    {component: 'Badge', relationship: 'Badge for text status; StatusIcon for icon status'},
  ],
  example: `<Inline gap="md">
  <StatusIcon name="check-circle" variant="success" size="md" />
  <StatusIcon name="alert-triangle" variant="warning" size="md" />
  <StatusIcon name="x-circle" variant="error" size="md" />
</Inline>`,
}
