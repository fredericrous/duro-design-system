import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'CSS grid layout. Supports fixed column count (1-6) or responsive auto-fit via minColumnWidth.',
  whenToUse: [
    'Card grids, dashboard layouts, multi-column forms',
    'Responsive layouts that should auto-adjust column count',
  ],
  whenNotToUse: [
    'Single-column vertical layout — use Stack',
    'Simple horizontal row — use Inline or Cluster',
  ],
  relatedTo: [
    {component: 'Stack', relationship: 'Single-column vertical layout'},
  ],
  example: `// Responsive: columns auto-fit based on min width
<Grid minColumnWidth="280px" gap="md">
  <Card>A</Card>
  <Card>B</Card>
  <Card>C</Card>
</Grid>

// Fixed: always 3 columns
<Grid columns={3} gap="md">
  <Card>A</Card>
  <Card>B</Card>
  <Card>C</Card>
</Grid>`,
}
