import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'
import {html} from 'react-strict-dom'
import {expect, fn, waitFor} from 'storybook/test'
import type {SizeToken} from '@duro-app/tokens/keys'
import {VirtualList} from './VirtualList'
import {Text} from '../Text/Text'

const meta: Meta = {
  title: 'Components/VirtualList',
}

export default meta
type Story = StoryObj

const ITEMS = Array.from({length: 10_000}, (_, i) => ({id: i, text: `Message ${i + 1}`}))

function Rows({anchor}: {anchor?: 'start' | 'end'}) {
  return (
    <VirtualList
      aria-label="Transcript"
      items={ITEMS}
      getKey={(m) => m.id}
      estimateSize="controlLg"
      anchor={anchor}
      maxHeight="previewMaxH"
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  )
}

interface PlaygroundArgs {
  count: number
  anchor: 'start' | 'end'
  overscan: number
  estimateSize: SizeToken
}

export const Playground: StoryObj<PlaygroundArgs> = {
  args: {count: 10_000, anchor: 'start', overscan: 5, estimateSize: 'controlLg'},
  argTypes: {
    count: {
      control: {type: 'number', min: 0, max: 10_000, step: 500},
      description: 'How many items',
    },
    anchor: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: "'end' opens at the last item and follows new ones",
    },
    overscan: {
      control: {type: 'number', min: 0, max: 50},
      description: 'Rows rendered past each edge',
    },
    estimateSize: {
      control: 'select',
      options: ['controlSm', 'controlLg', 'touchTarget', 'iconXl'],
      description: "Each row's starting height estimate (a size token)",
    },
  },
  render: ({count, anchor, overscan, estimateSize}) => (
    <VirtualList
      aria-label="Transcript"
      items={ITEMS.slice(0, count)}
      getKey={(m) => m.id}
      estimateSize={estimateSize}
      anchor={anchor}
      overscan={overscan}
      maxHeight="previewMaxH"
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  ),
}

export const TenThousand: Story = {
  render: () => <Rows />,
  play: async ({canvas}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0))
    const rows = canvas.getAllByRole('listitem')
    await expect(rows.length).toBeLessThan(50)
    await expect(rows[0]).toHaveAttribute('aria-setsize', '10000')
    await expect(rows[0]).toHaveAttribute('aria-posinset', '1')
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight * 100)
  },
}

export const AnchoredToTheEnd: Story = {
  render: () => <Rows anchor="end" />,
  play: async ({canvas}) => {
    await waitFor(() => expect(canvas.getByText('Message 10000')).toBeInTheDocument())
    const rows = canvas.getAllByRole('listitem')
    await expect(rows.length).toBeLessThan(50)
    const last = rows.find((r) => r.getAttribute('aria-posinset') === '10000')
    await expect(last).toBeDefined()
  },
}

function firstVisible(list: HTMLElement) {
  const top = list.getBoundingClientRect().top
  const row = Array.from(list.querySelectorAll<HTMLElement>('[role="listitem"]')).find(
    (r) => r.getBoundingClientRect().bottom > top,
  )
  if (!row) throw new Error('no visible row')
  return {text: row.textContent, offset: row.getBoundingClientRect().top - top}
}

const HISTORY = Array.from({length: 200}, (_, i) => ({id: i, text: `Message ${i + 1}`}))

function Pager({onStart}: {onStart: () => void}) {
  const [items, setItems] = useState(HISTORY.slice(100))
  return (
    <>
      <html.button
        type="button"
        onClick={() => setItems((prev) => [...HISTORY.slice(prev[0].id - 20, prev[0].id), ...prev])}
      >
        Load older
      </html.button>
      <VirtualList
        aria-label="Transcript"
        items={items}
        getKey={(m) => m.id}
        estimateSize="controlLg"
        maxHeight="previewMaxH"
        onStartReached={onStart}
        renderItem={(m) => <Text>{m.text}</Text>}
      />
    </>
  )
}

export const PrependKeepsPosition: Story = {
  render: () => <Pager onStart={() => {}} />,
  play: async ({canvas, userEvent}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0))
    list.scrollTop = 600
    await waitFor(() => expect(list.scrollTop).toBe(600))
    await new Promise((r) => setTimeout(r, 200))
    const before = firstVisible(list)
    await userEvent.click(canvas.getByRole('button', {name: 'Load older'}))
    await waitFor(() =>
      expect(canvas.getAllByRole('listitem')[0]).toHaveAttribute('aria-setsize', '120'),
    )
    await waitFor(() => {
      const after = firstVisible(list)
      expect(after.text).toBe(before.text)
      expect(Math.abs(after.offset - before.offset)).toBeLessThan(2)
    })
  },
}

export const StartReachedFiresOncePerApproach: Story = {
  render: () => {
    const onStart = fn()
    ;(globalThis as {__onStart?: unknown}).__onStart = onStart
    return <Pager onStart={onStart} />
  },
  play: async ({canvas}) => {
    const onStart = (globalThis as {__onStart?: ReturnType<typeof fn>}).__onStart!
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0))
    const scrollTo = async (top: number) => {
      list.scrollTop = top
      await new Promise((r) => setTimeout(r, 50))
    }
    await scrollTo(600)
    await expect(onStart).not.toHaveBeenCalled()
    await scrollTo(0)
    await waitFor(() => expect(onStart).toHaveBeenCalledTimes(1))
    await scrollTo(1)
    await expect(onStart).toHaveBeenCalledTimes(1)
    await scrollTo(600)
    await scrollTo(0)
    await waitFor(() => expect(onStart).toHaveBeenCalledTimes(2))
  },
}
