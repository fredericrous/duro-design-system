import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'SVG icon component. Renders stroke or filled icons from the design system icon set. Size scales with the size prop. Use inside buttons, badges, or standalone.',
  whenToUse: [
    'Button icons (inside Button children)',
    'Status indicators alongside text',
    'Navigation or action indicators',
  ],
  whenNotToUse: ['Decorative images — use img elements', 'Complex illustrations — use custom SVGs'],
  relatedTo: [
    {
      component: 'StatusIcon',
      relationship: 'StatusIcon wraps Icon with a colored background circle',
    },
  ],
  example: `<Inline gap="sm" align="center">
  <Icon name="check-circle" size="md" />
  <Icon name="alert-triangle" size="md" />
  <Icon name="shield-filled" size="md" />
</Inline>`,
}
