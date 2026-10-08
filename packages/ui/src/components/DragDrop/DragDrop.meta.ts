import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Move items between zones by pointer (mouse, pen and touch through one pointer-event path; touch holds briefly, then drags) or by keyboard (a Handle per item: Space picks up, arrows move, Space drops, Escape cancels). The innermost accepting zone wins, so a zone nested in an Item (a card in a column) takes its own drops; a zone can refuse with a reason that is shown and announced. Placeholders, edge auto-scroll and list-style announcements (through `announce`, for catalog strings) come with it.',
  anatomy: {required: ['Root', 'Zone', 'Item'], optional: ['Handle']},
  whenToUse: [
    'Slotting things into places — people into approval gates, cards into columns, files into folders',
    'Reordering a short row or list when the order is visible and meaningful',
    'A board: columns as labelled lists (`list`), cards with a Handle, an attach zone nested in each card',
  ],
  whenNotToUse: [
    'As the ONLY way to do something — WCAG 2.5.7 asks for a single-pointer alternative to dragging (a button or menu that moves the item); a Handle adds the keyboard path, not a click one',
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
  example: `<DragDrop.Root
  onDrop={({item, target}) => move(item.id, target.zone, target.index)}
  renderPlaceholder={({label}) => <Text variant="caption">→ {label}</Text>}
  announce={(e) => t(\`board.drag.\${e.kind}\`, e)}
>
  {columns.map((col) => (
    <DragDrop.Zone key={col.id} id={col.id} label={col.name} orientation="vertical" list
      accepts={(item) => item.data.kind === 'task' || {ok: false, reason: t('board.attachOnCard')}}>
      {col.cards.map((card) => (
        <DragDrop.Item key={card.id} id={card.id} zone={col.id} label={card.title} data={card}>
          <DragDrop.Handle>
            <DragDrop.Zone id={\`attach:\${card.id}\`} label={card.title}
              accepts={(item) => item.data.kind === 'activity'}>
              <Card>{card.title}</Card>
            </DragDrop.Zone>
          </DragDrop.Handle>
        </DragDrop.Item>
      ))}
    </DragDrop.Zone>
  ))}
</DragDrop.Root>`,
}
