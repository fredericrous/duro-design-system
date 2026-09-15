import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Grid layout. Columns are a count (1-6), a list of weights ([1, 2] for one-third / two-thirds), responsive auto-fit via minColumnWidth, or a named split layout (list/detail, nav/content) that collapses below the md breakpoint. Weights rather than CSS template strings, so the same props render as CSS grid on web and as a wrapping flex row on native.',
  whenToUse: [
    'Card grids, dashboard layouts, multi-column forms',
    'Responsive layouts that should auto-adjust column count',
    'A list/detail or nav/content screen — layout="split" | "split-wide", never a hand-rolled gridTemplateColumns with its own @media',
  ],
  whenNotToUse: [
    'Single-column vertical layout — use Stack',
    'Simple horizontal row — use Inline or Cluster',
  ],
  relatedTo: [
    {
      component: 'Stack',
      kind: 'contrast',
      relationship: 'Grid for multi-column layouts; Stack for a single vertical column',
    },
    {
      component: 'split-pane',
      kind: 'composition',
      relationship: 'Grid layout="split" with a List and a Panel is the split-pane recipe',
    },
  ],
  example: `// Split: list ≥ 240px beside a detail pane, one column below md
<Grid layout="split" gap="lg">
  <List.Root>…</List.Root>
  <Panel.Root>…</Panel.Root>
</Grid>

// Responsive: columns auto-fit based on min width
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
</Grid>

// Weighted: a one-third / two-thirds split (works on native too)
<Grid columns={[1, 2]} gap="md">
  <Card>Sidebar</Card>
  <Card>Content</Card>
</Grid>`,
}
