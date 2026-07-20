import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Sortable data table that windows its rows above a threshold (default 150) with @tanstack/react-virtual, shows a floating position indicator, and reports the visible page so the caller can mirror it in the URL. Below the threshold it renders every row in one scroll (no pagination). URL-decoupled: pass initialPage + onVisiblePageChange. Web-only.',
  whenToUse: [
    'Long lists/tables (hundreds to tens of thousands of rows) held client-side',
    'When you want a scroll position reflected in the URL + a "rows X–Y of Z" indicator',
    'Admin tables that may grow — small today renders all rows, large windows automatically',
  ],
  whenNotToUse: [
    'Small static tables where semantic markup matters — use Table / Table.FromTanstack',
    'Server-paginated data (this windows an already-loaded array, it does not fetch on scroll)',
  ],
  anatomy: {
    required: ['data', 'columns'],
    optional: [
      'sorting',
      'onSortingChange',
      'initialPage',
      'onVisiblePageChange',
      'rangeLabel',
      'onRowClick',
    ],
  },
  relatedTo: [
    {
      component: 'Table',
      relationship: 'Table is semantic + paginated; VirtualTable windows large lists',
    },
  ],
  example: `<VirtualTable
  data={rows}
  columns={columns}
  sorting={sorting}
  onSortingChange={setSorting}
  initialPage={Number(params.get('page')) || 1}
  onVisiblePageChange={({page}) =>
    setParams((p) => { const n = new URLSearchParams(p); page > 1 ? n.set('page', String(page)) : n.delete('page'); return n }, {replace: true, preventScrollReset: true})}
  rangeLabel={({from, to, total}) => t('table.range', {from, to, total})}
  onRowClick={(row) => navigate(\`/things/\${row.id}\`)}
/>`,
}
