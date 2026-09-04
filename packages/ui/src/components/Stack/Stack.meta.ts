import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description: 'Vertical flex layout. Stacks children top-to-bottom with consistent gap.',
  whenToUse: [
    'Vertically stacking form fields, cards, or sections',
    'Any column-direction layout with uniform spacing',
  ],
  whenNotToUse: [
    'Horizontal layouts — use Inline (no wrap) or Cluster (wraps)',
    'Grid layouts — use Grid',
  ],
  relatedTo: [
    {
      component: 'Inline',
      kind: 'contrast',
      relationship: 'Stack stacks vertically; Inline lays out horizontally on one row',
    },
    {
      component: 'Cluster',
      kind: 'contrast',
      relationship: 'Stack stacks vertically; Cluster lays out horizontally and wraps',
    },
  ],
  example: `<Stack gap="md" align="stretch">
  <Card>First</Card>
  <Card>Second</Card>
</Stack>`,
}
