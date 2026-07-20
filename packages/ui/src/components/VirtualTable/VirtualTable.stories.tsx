import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor} from 'storybook/test'
import {createColumnHelper} from '@tanstack/react-table'
import {VirtualTable} from './VirtualTable'

interface Item {
  id: string
  name: string
  value: number
}

const col = createColumnHelper<Item>()
const columns = [
  col.accessor('name', {header: 'Name', enableSorting: true}),
  col.accessor('value', {header: 'Value', enableSorting: true}),
]

const makeData = (n: number): Item[] =>
  Array.from({length: n}, (_, i) => ({id: `r${i}`, name: `Row ${i}`, value: i}))

const meta: Meta<typeof VirtualTable<Item>> = {
  title: 'Components/VirtualTable',
  component: VirtualTable,
  args: {columns, getRowId: (r: Item) => r.id},
}
export default meta
type Story = StoryObj<typeof VirtualTable<Item>>

// Below the threshold: every row rendered, one scroll, no windowing/indicator.
export const SmallList: Story = {
  args: {data: makeData(10)},
  play: async ({canvas}) => {
    // 1 header row + 10 body rows.
    await waitFor(() => expect(canvas.getAllByRole('row')).toHaveLength(11))
    await expect(canvas.getByText('Row 0')).toBeInTheDocument()
    await expect(canvas.getByText('Row 9')).toBeInTheDocument()
    // No floating position indicator at this size.
    await expect(canvas.queryByText(/\/ 10$/)).toBeNull()
  },
}

// Above the threshold: only a window of rows hits the DOM + the indicator shows.
export const Virtualized: Story = {
  args: {
    data: makeData(500),
    maxHeight: 300,
    rangeLabel: ({from, to, total}) => `${from}-${to} of ${total}`,
    onVisiblePageChange: fn(),
  },
  play: async ({canvas}) => {
    // Windowed: far fewer than 500 body rows are in the DOM.
    await waitFor(() => {
      const rows = canvas.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(1) // header + some
      expect(rows.length).toBeLessThan(80) // NOT 501 — proof of windowing
    })
    // The floating position indicator is present, starting at row 1.
    await expect(canvas.getByText(/^1-\d+ of 500$/)).toBeInTheDocument()
  },
}

// Scrolling reports a new page (for URL sync) once past a page boundary.
export const ScrollReportsPage: Story = {
  args: {
    data: makeData(500),
    maxHeight: 300,
    pageSize: 50,
    rangeLabel: ({page, pages}) => `page ${page}/${pages}`,
    onVisiblePageChange: fn(),
  },
  play: async ({canvas, args}) => {
    const scroller = canvas.getByRole('table')
    await waitFor(() => expect(canvas.getByText('page 1/10')).toBeInTheDocument())
    // Wait past the 300ms mount suppress-write window (which stops the restore
    // scroll from clobbering the URL) before scrolling for real.
    await new Promise((r) => setTimeout(r, 400))
    // Scroll well past the first 50-row page (row height ~44 → page ≈ 2200px).
    scroller.scrollTo({top: 6000})
    scroller.dispatchEvent(new Event('scroll'))
    // The indicator reflects the new page (proves curPage recomputed on scroll)…
    await waitFor(() => expect(canvas.queryByText('page 1/10')).toBeNull(), {timeout: 3000})
    await expect(canvas.getByText(/^page \d+\/10$/).textContent).not.toBe('page 1/10')
    // …and the visible-page callback fired so a caller could sync the URL.
    await waitFor(() => expect(args.onVisiblePageChange).toHaveBeenCalled(), {timeout: 4000})
    const calls = (args.onVisiblePageChange as ReturnType<typeof fn>).mock.calls
    const maxPage = Math.max(...calls.map((c) => (c[0] as {page: number}).page))
    await expect(maxPage).toBeGreaterThan(1)
  },
}
