import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A windowed list on @tanstack/react-virtual: only the rows in view (plus overscan) are mounted, and rows are measured so they may differ in height. role="list" with listitem rows carrying aria-setsize and aria-posinset. anchor="end" opens at the last item and stays pinned to the bottom while new items arrive and the reader is at the bottom (a transcript, a log). It fills its parent, or stops at maxHeight. onStartReached fires once each time the reader scrolls to the start (load older history), and prepending items keeps the first visible row in place. On native it is a FlatList with the same props (role list; rows carry no listitem role, which React Native lacks) (maintainVisibleContentPosition for prepend). The scroll region is a tab stop with a focus ring, so the keyboard can scroll rows that hold no control. onEndReached mirrors onStartReached at the end (load newer items in a window opened on an older point); scrollToKey centres one item each time it changes to a key in the list (a link to one message), and anchor="end" stops following the end while it applies. onAtEndChange(atEnd) is called once each time the reader comes within 44px of the end or leaves it, so a host can record whether the reader follows the live tail; scrollToEndKey scrolls to the end and resumes anchor="end" following each time it changes to a new non-null value (the host\'s own send), even when the reader had scrolled up.',
  whenToUse: [
    'Hundreds to tens of thousands of rows: sessions, a chat transcript, log lines',
    'A list that grows at the bottom while the reader follows it (anchor="end")',
    'A transcript that pages older history in at the top (onStartReached, then prepend items)',
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
