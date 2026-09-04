import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description: 'Horizontal flex layout with NO wrapping. Items stay on one line and may overflow.',
  whenToUse: [
    'Toolbar or button group that must stay on one row',
    'Horizontal alignment of a known, small number of items',
    'Icon + text pairs, breadcrumbs, action rows',
  ],
  whenNotToUse: [
    'Items that should wrap to the next line — use Cluster',
    'Vertical stacking — use Stack',
  ],
  relatedTo: [
    {
      component: 'Cluster',
      kind: 'contrast',
      relationship: 'Cluster wraps when items overflow; Inline stays on one row',
    },
    {
      component: 'Stack',
      kind: 'contrast',
      relationship: 'Stack stacks vertically; Inline lays out horizontally on one row',
    },
  ],
  example: `<Inline gap="sm" align="center">
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Inline>`,
}
