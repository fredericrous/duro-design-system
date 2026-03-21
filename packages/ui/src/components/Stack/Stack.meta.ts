import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Vertical flex layout. Stacks children top-to-bottom with consistent gap.',
  whenToUse: [
    'Vertically stacking form fields, cards, or sections',
    'Any column-direction layout with uniform spacing',
  ],
  whenNotToUse: [
    'Horizontal layouts — use Inline (no wrap) or Cluster (wraps)',
    'Grid layouts — use Grid',
  ],
  relatedTo: [
    {component: 'Inline', relationship: 'Horizontal equivalent (no wrap)'},
    {component: 'Cluster', relationship: 'Horizontal equivalent (wraps)'},
  ],
  example: `<Stack gap="md" align="stretch">
  <Card>First</Card>
  <Card>Second</Card>
</Stack>`,
}
