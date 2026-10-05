import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Floating toolbar that appears at the bottom of the viewport when items are selected. Shows selection count and bulk actions. Animates in/out. Use with Table checkboxes for bulk operations.',
  whenToUse: [
    'Bulk actions on table selections (delete, revoke, export)',
    'Multi-select workflows where actions apply to all selected items',
    'Selection-scoped verbs on a canvas/editor surface (set `bottomOffset` to clear any bottom chrome such as zoom controls)',
    'A docked side panel (DetailPanel) is open: pass its width as `insetInlineEnd` so the bar centres beside it, not under it (follows the writing direction: the left edge in right-to-left)',
  ],
  whenNotToUse: [
    'Single-item actions that have an inline home — use inline buttons or a Menu',
    'Persistent toolbars — use Inline with buttons',
  ],
  relatedTo: [
    {
      component: 'Table',
      kind: 'composition',
      relationship: 'Common pattern: Table checkboxes + ActionBar for bulk ops',
    },
    {
      component: 'DetailPanel',
      kind: 'composition',
      relationship:
        "With a DetailPanel docked at the end edge, pass the panel's width as insetInlineEnd",
    },
  ],
  example: `<ActionBar selectedItemCount={selected.size} onClearSelection={() => setSelected(new Set())}>
  <Button variant="danger" size="small" onClick={handleDelete}>Delete</Button>
</ActionBar>`,
}
