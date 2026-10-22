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

function Pager({onStart}: {onStart?: () => void}) {
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
  render: () => <Pager />,
  play: async ({canvas, userEvent}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0))
    list.scrollTop = 600
    // scrolled and re-rendered: the first visible row is no longer the first item
    await waitFor(() => {
      expect(list.scrollTop).toBe(600)
      expect(firstVisible(list).text).not.toBe('Message 101')
    })
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

export const StartReachedFiresOncePerApproach: StoryObj<{onStartReached: () => void}> = {
  args: {onStartReached: fn()},
  render: (args) => <Pager onStart={args.onStartReached} />,
  play: async ({canvas, args}) => {
    const onStart = args.onStartReached
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0))
    const scrollTo = async (top: number) => {
      list.scrollTop = top
      await waitFor(() => expect(list.scrollTop).toBe(top))
      // The scroll listener reads rows once per animation frame, so two scrollTop
      // writes in one frame would lose the first offset: wait two frames.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
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

/** A list too short to scroll asks for older history at once, since no scroll can reach its start. */
export const ShortListAsksForMore: StoryObj<{onStartReached: () => void}> = {
  tags: ['!dev', '!autodocs'],
  args: {onStartReached: fn()},
  render: (args) => (
    <VirtualList
      aria-label="Transcript"
      items={HISTORY.slice(0, 2)}
      getKey={(m) => m.id}
      estimateSize="controlLg"
      maxHeight="previewMaxH"
      onStartReached={args.onStartReached}
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  ),
  play: async ({canvas, args}) => {
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBe(2))
    await waitFor(() => expect(args.onStartReached).toHaveBeenCalledTimes(1))
  },
}

function ShortPager({onStart}: {onStart: () => void}) {
  const [from, setFrom] = useState(198)
  return (
    <VirtualList
      aria-label="Transcript"
      items={HISTORY.slice(from)}
      getKey={(m) => m.id}
      estimateSize="controlLg"
      maxHeight="previewMaxH"
      onStartReached={() => {
        onStart()
        setFrom((f) => Math.max(f - 1, 196))
      }}
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  )
}

/** A prepend that leaves the list short asks again; when no more comes, it stops. */
export const ShortListKeepsAskingUntilNoMore: StoryObj<{onStartReached: () => void}> = {
  tags: ['!dev', '!autodocs'],
  args: {onStartReached: fn()},
  render: (args) => <ShortPager onStart={args.onStartReached} />,
  play: async ({canvas, args}) => {
    // 2 items, then 3, then 4 (the last prepend): one call for each, then no more
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBe(4))
    await waitFor(() => expect(args.onStartReached).toHaveBeenCalledTimes(3))
    await new Promise((resolve) => setTimeout(resolve, 200))
    await expect(args.onStartReached).toHaveBeenCalledTimes(3)
  },
}

function FreshArray({onStart}: {onStart: () => void}) {
  const [calls, setCalls] = useState(0)
  return (
    <VirtualList
      aria-label={`Transcript ${calls}`}
      // a new array on every render, with the same content
      items={HISTORY.slice(0, 2)}
      getKey={(m) => m.id}
      estimateSize="controlLg"
      maxHeight="previewMaxH"
      onStartReached={() => {
        onStart()
        setCalls((c) => c + 1)
      }}
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  )
}

/** A new array with the same content does not ask again, even when the call re-renders. */
export const ShortListDoesNotLoopOnFreshArrays: StoryObj<{onStartReached: () => void}> = {
  tags: ['!dev', '!autodocs'],
  args: {onStartReached: fn()},
  render: (args) => <FreshArray onStart={args.onStartReached} />,
  play: async ({canvas, args}) => {
    await waitFor(() => expect(canvas.getByRole('list', {name: 'Transcript 1'})).toBeVisible())
    await new Promise((resolve) => setTimeout(resolve, 200))
    await expect(args.onStartReached).toHaveBeenCalledTimes(1)
  },
}

/** A link to one message: the list opens anchored to the end, then centres that message. */
function JumpTo({target}: {target: number | null}) {
  return (
    <VirtualList
      aria-label="Transcript"
      items={ITEMS}
      getKey={(m) => m.id}
      estimateSize="controlLg"
      anchor="end"
      scrollToKey={target}
      maxHeight="previewMaxH"
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  )
}

export const ScrollToKeyCentresTheItem: Story = {
  render: () => <JumpTo target={4_200} />,
  play: async ({canvas}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    const row = await waitFor(() => canvas.getByText('Message 4201'))
    const listBox = list.getBoundingClientRect()
    const rowBox = row.getBoundingClientRect()
    await expect(rowBox.top).toBeGreaterThanOrEqual(listBox.top)
    await expect(rowBox.bottom).toBeLessThanOrEqual(listBox.bottom)
    // It stays there: anchor="end" does not pull it back to the last message.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    await expect(canvas.queryByText('Message 10000')).toBeNull()
  },
}

export const EndReachedFiresOncePerApproach: StoryObj<{onEndReached: () => void}> = {
  args: {onEndReached: fn()},
  render: (args) => (
    <VirtualList
      aria-label="Transcript"
      items={ITEMS.slice(0, 200)}
      getKey={(m) => m.id}
      estimateSize="controlLg"
      onEndReached={args.onEndReached}
      maxHeight="previewMaxH"
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  ),
  play: async ({canvas, args}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0))
    const scrollTo = async (top: number) => {
      list.scrollTop = top
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    }
    await expect(args.onEndReached).not.toHaveBeenCalled()
    await scrollTo(list.scrollHeight)
    await waitFor(() => expect(args.onEndReached).toHaveBeenCalledTimes(1))
    await scrollTo(list.scrollHeight)
    await expect(args.onEndReached).toHaveBeenCalledTimes(1)
    await scrollTo(0)
    await scrollTo(list.scrollHeight)
    await waitFor(() => expect(args.onEndReached).toHaveBeenCalledTimes(2))
  },
}

function Tail({
  onAtEndChange,
  endKey,
}: {
  onAtEndChange?: (atEnd: boolean) => void
  endKey?: number | null
}) {
  return (
    <VirtualList
      aria-label="Transcript"
      items={ITEMS.slice(0, 200)}
      getKey={(m) => m.id}
      estimateSize="controlLg"
      anchor="end"
      onAtEndChange={onAtEndChange}
      scrollToEndKey={endKey}
      maxHeight="previewMaxH"
      renderItem={(m) => <Text>{m.text}</Text>}
    />
  )
}

const frames = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

export const AtEndChangeFiresOncePerChange: StoryObj<{onAtEndChange: (atEnd: boolean) => void}> = {
  args: {onAtEndChange: fn()},
  render: (args) => <Tail onAtEndChange={args.onAtEndChange} />,
  play: async ({canvas, args}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getByText('Message 200')).toBeInTheDocument())
    await frames()
    await expect(args.onAtEndChange).not.toHaveBeenCalled()
    list.scrollTop = 0
    await waitFor(() => expect(args.onAtEndChange).toHaveBeenCalledTimes(1))
    await expect(args.onAtEndChange).toHaveBeenLastCalledWith(false)
    list.scrollTop = 20
    await frames()
    await expect(args.onAtEndChange).toHaveBeenCalledTimes(1)
    list.scrollTop = list.scrollHeight
    await waitFor(() => expect(args.onAtEndChange).toHaveBeenCalledTimes(2))
    await expect(args.onAtEndChange).toHaveBeenLastCalledWith(true)
  },
}

function EndKeyHost() {
  const [key, setKey] = useState(0)
  const [, setTick] = useState(0)
  return (
    <>
      <html.button type="button" onClick={() => setKey((k) => k + 1)}>
        Send
      </html.button>
      <html.button type="button" onClick={() => setTick((t) => t + 1)}>
        Rerender
      </html.button>
      <Tail endKey={key} />
    </>
  )
}

export const ScrollToEndKeyScrollsToTheEnd: Story = {
  render: () => <EndKeyHost />,
  play: async ({canvas, userEvent}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getByText('Message 200')).toBeInTheDocument())
    list.scrollTop = 0
    await waitFor(() => expect(canvas.queryByText('Message 200')).toBeNull())
    await userEvent.click(canvas.getByRole('button', {name: 'Send'}))
    await waitFor(() => expect(canvas.getByText('Message 200')).toBeInTheDocument())
  },
}

export const ScrollToEndKeyUnchangedDoesNotScroll: Story = {
  render: () => <EndKeyHost />,
  play: async ({canvas, userEvent}) => {
    const list = canvas.getByRole('list', {name: 'Transcript'})
    await waitFor(() => expect(canvas.getByText('Message 200')).toBeInTheDocument())
    list.scrollTop = 0
    await waitFor(() => expect(canvas.queryByText('Message 200')).toBeNull())
    await userEvent.click(canvas.getByRole('button', {name: 'Rerender'}))
    await frames()
    await expect(canvas.queryByText('Message 200')).toBeNull()
    await expect(list.scrollTop).toBeLessThan(list.scrollHeight / 2)
  },
}
