import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Move items between zones with one pointer — mouse, pen and touch through the same pointer-event path (touch holds briefly, then drags; a moving touch stays a scroll). A ghost follows the pointer, the zone under it lights up, and the Root announces picks and drops to screen readers. Dragging is pointer-only by design: keep a button or remove affordance that does the same thing.',
  anatomy: {required: ['Root', 'Zone', 'Item']},
  whenToUse: [
    'Slotting things into places — people into approval gates, cards into columns, files into folders',
    'Reordering a short row or list when the order is visible and meaningful',
  ],
  whenNotToUse: [
    'As the ONLY way to do something — every drag needs a tap/click equivalent (WCAG 2.5.7); this component does not provide one',
    'Long lists that scroll while dragging — the ghost follows the pointer but zones do not auto-scroll',
    'Sorting tabular data — sort the Table instead',
    'React Native — Item renders its children without drag behaviour there',
  ],
  relatedTo: [
    {
      component: 'Tag',
      kind: 'composition',
      relationship: 'A removable Tag inside an Item gives the drop target its non-drag remove path',
    },
    {
      component: 'ScrollArea',
      kind: 'contrast',
      relationship: 'ScrollArea drags a thumb along one axis; DragDrop moves items between zones',
    },
  ],
  example: `<DragDrop.Root onDrop={({item, target}) => move(item.id, target.zone, target.index)}>
  <DragDrop.Zone id="roster" label="Roster">
    <Cluster gap="sm">
      {people.map((p) => (
        <DragDrop.Item key={p.id} id={p.id} zone="roster" label={p.name} data={p}>
          <Button variant="secondary" size="small" onClick={() => slot(p)}>{p.name}</Button>
        </DragDrop.Item>
      ))}
    </Cluster>
  </DragDrop.Zone>
  <DragDrop.Zone id="gates" label="Gates" orientation="horizontal">
    <Inline gap="sm">
      {gates.map((g) => (
        <DragDrop.Item key={g.id} id={g.id} zone="gates" label={g.name} data={g}>
          <Tag removable onRemove={() => unslot(g)}>{g.name}</Tag>
        </DragDrop.Item>
      ))}
    </Inline>
  </DragDrop.Zone>
</DragDrop.Root>`,
}
