import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A windowed list on @tanstack/react-virtual: only the rows in view (plus overscan) are mounted, and rows are measured so they may differ in height. role="list" with listitem rows carrying aria-setsize and aria-posinset. anchor="end" opens at the last item and stays pinned to the bottom while new items arrive and the reader is at the bottom (a transcript, a log). It fills its parent, or stops at maxHeight. Web only: on native, host FlashList or Legend List behind your own .native.tsx leaf.',
  whenToUse: [
    'Hundreds to tens of thousands of rows: sessions, a chat transcript, log lines',
    'A list that grows at the bottom while the reader follows it (anchor="end")',
  ],
  whenNotToUse: [
    'Tabular data with columns and sorting — use VirtualTable',
    'A few dozen rows — use List; windowing only adds cost there',
    'Selectable options in a picker — use Listbox',
  ],
  anatomy: {
    required: [],
    optional: [],
  },
  relatedTo: [
    {
      component: 'VirtualTable',
      kind: 'contrast',
      relationship: 'VirtualTable windows table rows with columns; VirtualList windows any row',
    },
    {
      component: 'List',
      kind: 'composition',
      relationship: 'Render a List.Item-like row in renderItem for the list look',
    },
  ],
  example: `<VirtualList
  aria-label="Transcript"
  items={messages}
  getKey={(m) => m.id}
  estimateSize="controlLg"
  anchor="end"
  renderItem={(m) => <Text>{m.text}</Text>}
/>`,
}
