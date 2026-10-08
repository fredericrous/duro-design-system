import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor} from 'storybook/test'
import {Profiler, useState, type ReactNode} from 'react'
import {css, html} from 'react-strict-dom'
import {
  DragDrop,
  type DragDropEvent,
  type DragDropItemData,
  type DragDropOverEvent,
} from './DragDrop'
import {Text} from '../Text/Text'
import {onThemeSurface} from '../../docs/themedSurface'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

/**
 * The board shapes DragDrop 5.x is for: columns that are labelled lists,
 * cards with a keyboard handle, a card zone nested in a column zone (attach),
 * a refusal with a reason, edge auto-scroll, and a 300-card board for the
 * render budget.
 */
interface Args {
  onDrop?: (e: DragDropEvent<Card>) => void
  onDragOver?: (e: DragDropOverEvent<Card>) => void
}

const meta: Meta<Args> = {
  title: 'Interaction/DragDropBoard',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}

export default meta
type Story = StoryObj<Args>

const s = css.create({
  board: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    width: sizes.gridColXs,
    flexShrink: 0,
  },
  // A grid stretches the zone to the column's height, so the empty space
  // under the cards is part of the zone.
  list: {
    display: 'grid',
    minHeight: sizes.dropZoneMinH,
    padding: spacing.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.bgCard,
  },
  scroller: {
    maxHeight: sizes.listMaxHSm,
    overflowY: 'auto',
  },
  card: {
    padding: spacing.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: typography.fontSizeSm,
  },
  activity: {
    borderStyle: 'dashed',
  },
  slot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.controlMd,
    borderWidth: borders.strong,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    borderRadius: radii.sm,
    backgroundColor: colors.infoBg,
    color: colors.infoText,
    fontSize: typography.fontSizeXs,
  },
})

interface Card {
  readonly id: string
  readonly title: string
  readonly kind: 'task' | 'activity'
}

type Columns = Record<string, Card[]>

const COLUMNS = [
  {id: 'next', name: 'Next'},
  {id: 'doing', name: 'In progress'},
  {id: 'done', name: 'Done'},
] as const

const placeholder = ({label}: {label: string}) => (
  <html.div style={s.slot}>
    <html.span>→ {label}</html.span>
  </html.div>
)

/** Move a card to (zone, index), index counted without the card itself. */
const moveCard = (cols: Columns, id: string, zone: string, index: number): Columns => {
  let card: Card | undefined
  const next: Columns = {}
  for (const [k, list] of Object.entries(cols)) {
    next[k] = list.filter((c) => (c.id === id ? ((card = c), false) : true))
  }
  if (!card) return cols
  const target = next[zone] ?? []
  next[zone] = [...target.slice(0, index), card, ...target.slice(index)]
  return next
}

function CardFace({card, children}: {card: Card; children?: ReactNode}) {
  return (
    <html.div style={[s.card, card.kind === 'activity' && s.activity]}>
      {card.title}
      {children}
    </html.div>
  )
}

function Column({
  id,
  name,
  cards,
  order,
  scroll = false,
  accepts,
  attach = false,
}: {
  id: string
  name: string
  cards: Card[]
  order?: number
  scroll?: boolean
  accepts?: (item: DragDropItemData<Card>) => boolean | {ok: false; reason: string}
  attach?: boolean
}) {
  return (
    <html.div style={s.column}>
      <Text variant="label">{name}</Text>
      <html.div style={[s.list, scroll && s.scroller]}>
        <DragDrop.Zone<Card>
          id={id}
          label={name}
          orientation="vertical"
          list
          order={order}
          accepts={accepts}
        >
          {cards.map((card) => (
            <DragDrop.Item key={card.id} id={card.id} zone={id} label={card.title} data={card}>
              <DragDrop.Handle>
                {attach && card.kind === 'task' ? (
                  <DragDrop.Zone<Card>
                    id={`attach:${card.id}`}
                    label={`Attach to ${card.title}`}
                    accepts={(item) => item.data.kind === 'activity'}
                  >
                    <CardFace card={card} />
                  </DragDrop.Zone>
                ) : (
                  <CardFace card={card} />
                )}
              </DragDrop.Handle>
            </DragDrop.Item>
          ))}
        </DragDrop.Zone>
      </html.div>
    </html.div>
  )
}

const tasks = (prefix: string, n: number, from = 1): Card[] =>
  Array.from({length: n}, (_, i) => ({
    id: `${prefix}${i + from}`,
    title: `${prefix.toUpperCase()}-${i + from}`,
    kind: 'task',
  }))

function Kanban({
  initial,
  onDrop,
  onDragOver,
  orders,
}: {
  initial: Columns
  onDrop?: (e: DragDropEvent<Card>) => void
  onDragOver?: (e: DragDropOverEvent<Card>) => void
  orders?: Record<string, number>
}) {
  const [cols, setCols] = useState(initial)
  return (
    <DragDrop.Root<Card>
      renderPlaceholder={placeholder}
      onDragOver={onDragOver}
      onDrop={(e) => {
        onDrop?.(e)
        setCols((c) => moveCard(c, e.item.id, e.target.zone, e.target.index))
      }}
    >
      <html.div style={s.board}>
        {COLUMNS.map((c) => (
          <Column
            key={c.id}
            id={c.id}
            name={c.name}
            cards={cols[c.id] ?? []}
            order={orders?.[c.id]}
          />
        ))}
      </html.div>
    </DragDrop.Root>
  )
}

const KANBAN: Columns = {
  next: [
    {id: 'a', title: 'Write spec', kind: 'task'},
    {id: 'b', title: 'Review copy', kind: 'task'},
    {id: 'c', title: 'Ship beta', kind: 'task'},
  ],
  doing: [
    {id: 'd', title: 'Fix login', kind: 'task'},
    {id: 'e', title: 'Tune cache', kind: 'task'},
  ],
  done: [],
}

const status = () => document.querySelector('[role="status"][aria-live="polite"]') as HTMLElement
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)))

const point = (el: Element, fx = 0.5, fy = 0.5) => {
  const r = el.getBoundingClientRect()
  return {x: r.left + r.width * fx, y: r.top + r.height * fy}
}

const pointerInit = (x: number, y: number, buttons = 1) => ({
  bubbles: true,
  cancelable: true,
  pointerId: 11,
  pointerType: 'mouse',
  isPrimary: true,
  button: 0,
  buttons,
  clientX: x,
  clientY: y,
})

/** Press on `from`, move through `path` a frame at a time, and leave the
 *  pointer down; returns a release function. */
const press = async (from: Element, path: {x: number; y: number}[], steps = 6) => {
  const start = point(from)
  from.dispatchEvent(new PointerEvent('pointerdown', pointerInit(start.x, start.y)))
  let at = start
  for (const to of path) {
    for (let i = 1; i <= steps; i++) {
      const x = at.x + ((to.x - at.x) * i) / steps
      const y = at.y + ((to.y - at.y) * i) / steps
      document.dispatchEvent(new PointerEvent('pointermove', pointerInit(x, y)))
      await nextFrame()
    }
    at = to
  }
  return {
    at: () => at,
    release: async () => {
      document.dispatchEvent(new PointerEvent('pointerup', pointerInit(at.x, at.y, 0)))
      await nextFrame()
    },
  }
}

const itemOf = (handle: Element) => handle.parentElement as Element

// ---------------------------------------------------------------------------

/** Three labelled list columns. Tab reaches one card per column; arrows walk
 *  the cards; Space picks a card up, arrows move it, Space drops, Escape
 *  cancels. Mouse drags show the same placeholder. */
export const Kanban3: Story = {
  name: 'Kanban (keyboard and pointer)',
  render: () => <Kanban initial={KANBAN} />,
}

/** Space, arrows, Space: the card moves; announcements are list-style and
 *  focus comes back to the card. */
export const KeyboardMove: Story = {
  args: {onDrop: fn()},
  render: (args) => <Kanban initial={KANBAN} onDrop={args.onDrop as never} />,
  play: async ({canvas, args, userEvent}) => {
    // Columns are labelled lists of list items.
    await expect(canvas.getByRole('list', {name: 'Next'})).toBeInTheDocument()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
    // One tab stop per column.
    const handles = canvas.getAllByRole('button')
    await expect(handles.filter((h) => h.tabIndex === 0)).toHaveLength(2)

    const spec = canvas.getByRole('button', {name: 'Write spec'})
    spec.focus()
    await userEvent.keyboard(' ')
    await expect(status()).toHaveTextContent('Picked up Write spec. Next, position 1 of 3.')
    await expect(canvas.getByText('→ Next')).toBeInTheDocument()

    await userEvent.keyboard('{ArrowDown}')
    await expect(status()).toHaveTextContent('Next, position 2 of 3')
    await userEvent.keyboard('{ArrowRight}')
    await expect(status()).toHaveTextContent('In progress, position 2 of 3')
    await expect(canvas.getByText('→ In progress')).toBeInTheDocument()
    await userEvent.keyboard(' ')

    await expect(args.onDrop).toHaveBeenCalledTimes(1)
    const call = (args.onDrop as unknown as ReturnType<typeof fn>).mock
      .calls[0][0] as DragDropEvent<Card>
    await expect(call.target).toEqual({zone: 'doing', index: 1})
    await expect(status()).toHaveTextContent('Dropped Write spec in In progress, position 2 of 3.')
    const doing = canvas.getByRole('list', {name: 'In progress'})
    await expect(doing.querySelectorAll('[role="listitem"]')).toHaveLength(3)
    // Focus followed the card into its new column.
    await waitFor(() =>
      expect(document.activeElement).toBe(canvas.getByRole('button', {name: 'Write spec'})),
    )
    await expect(canvas.queryByText('→ In progress')).toBeNull()
  },
}

/** Escape puts the card back, focused, and nothing is dropped. */
export const KeyboardCancel: Story = {
  args: {onDrop: fn()},
  render: (args) => <Kanban initial={KANBAN} onDrop={args.onDrop as never} />,
  play: async ({canvas, args, userEvent}) => {
    const review = canvas.getByRole('button', {name: 'Review copy'})
    review.focus()
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect(status()).toHaveTextContent('Done, position 1 of 1')
    await userEvent.keyboard('{Escape}')
    await expect(args.onDrop).not.toHaveBeenCalled()
    await expect(status()).toHaveTextContent('Cancelled moving Review copy.')
    await expect(document.activeElement).toBe(review)
    await expect(canvas.queryByText('→ Done')).toBeNull()
  },
}

/** Arrow keys walk the handles without picking: Up/Down in a column,
 *  Left/Right across columns. */
export const KeyboardRoving: Story = {
  render: () => <Kanban initial={KANBAN} />,
  play: async ({canvas, userEvent}) => {
    canvas.getByRole('button', {name: 'Write spec'}).focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(document.activeElement).toBe(canvas.getByRole('button', {name: 'Review copy'}))
    await userEvent.keyboard('{ArrowRight}')
    await expect(document.activeElement).toBe(canvas.getByRole('button', {name: 'Tune cache'}))
    // The focused card is now its column's tab stop.
    await expect(canvas.getByRole('button', {name: 'Tune cache'}).tabIndex).toBe(0)
    await expect(canvas.getByRole('button', {name: 'Fix login'}).tabIndex).toBe(-1)
  },
}

/** `order` decides Left/Right, not the DOM: here Done comes before In
 *  progress. */
export const ExplicitZoneOrder: Story = {
  render: () => <Kanban initial={KANBAN} orders={{next: 1, done: 2, doing: 3}} />,
  play: async ({canvas, userEvent}) => {
    canvas.getByRole('button', {name: 'Ship beta'}).focus()
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowRight}')
    await expect(status()).toHaveTextContent('Done, position 1 of 1')
    await userEvent.keyboard('{ArrowRight}')
    await expect(status()).toHaveTextContent('In progress, position 1 of 3')
    await userEvent.keyboard('{Escape}')
  },
}

/** A mouse drag shows the placeholder where the card would land, calls
 *  onDragOver as the target changes, and drops there. */
export const PointerReorder: Story = {
  args: {onDrop: fn(), onDragOver: fn()},
  render: (args) => (
    <Kanban initial={KANBAN} onDrop={args.onDrop as never} onDragOver={args.onDragOver as never} />
  ),
  play: async ({canvas, args}) => {
    const spec = canvas.getByRole('button', {name: 'Write spec'})
    const ship = canvas.getByRole('button', {name: 'Ship beta'})
    const drag = await press(itemOf(spec), [point(ship, 0.5, 0.9)])
    await waitFor(() => expect(canvas.getByText('→ Next')).toBeInTheDocument())
    await expect(args.onDragOver).toHaveBeenCalled()
    await drag.release()
    await expect(args.onDrop).toHaveBeenCalledTimes(1)
    const call = (args.onDrop as unknown as ReturnType<typeof fn>).mock
      .calls[0][0] as DragDropEvent<Card>
    await expect(call.target).toEqual({zone: 'next', index: 2})
    const next = canvas.getByRole('list', {name: 'Next'})
    await expect(next.lastElementChild).toHaveTextContent('Write spec')
  },
}

// ---------------------------------------------------------------------------
// Nested zones: attach an activity to a card inside a column
// ---------------------------------------------------------------------------

function AttachBoard({onDrop}: {onDrop?: (e: DragDropEvent<Card>) => void}) {
  const [cols, setCols] = useState<Columns>({
    inbox: [
      {id: 'x1', title: 'Session on feat/kb', kind: 'activity'},
      {id: 'x2', title: 'Commit 3f2a', kind: 'activity'},
    ],
    next: KANBAN.next,
    doing: KANBAN.doing,
  })
  const [attached, setAttached] = useState<string[]>([])
  const tasksOnly = (item: DragDropItemData<Card>) =>
    item.data.kind === 'task'
      ? true
      : {ok: false as const, reason: 'Drop an activity on a task to attach it'}
  return (
    <DragDrop.Root<Card>
      renderPlaceholder={placeholder}
      onDrop={(e) => {
        onDrop?.(e)
        if (e.target.zone.startsWith('attach:')) {
          setAttached((a) => [...a, `${e.item.data.title} → ${e.target.zone.slice(7)}`])
          setCols((c) => ({...c, inbox: c.inbox.filter((x) => x.id !== e.item.id)}))
        } else setCols((c) => moveCard(c, e.item.id, e.target.zone, e.target.index))
      }}
    >
      <html.div style={s.board}>
        <Column
          id="inbox"
          name="Inbox"
          cards={cols.inbox}
          accepts={(item) => item.data.kind === 'activity'}
        />
        <Column id="next" name="Next" cards={cols.next} accepts={tasksOnly} attach />
        <Column id="doing" name="In progress" cards={cols.doing} accepts={tasksOnly} attach />
      </html.div>
      <Text color="muted">
        {attached.length ? `Attached: ${attached.join(', ')}` : 'Nothing attached.'}
      </Text>
    </DragDrop.Root>
  )
}

/** An inbox of activities beside two columns of tasks. Drop an activity on a
 *  task card to attach it (the card's zone sits inside the column's); drop
 *  it on a column and the column refuses, with its reason. */
export const NestedZones: Story = {
  name: 'Nested zones (attach)',
  render: () => <AttachBoard />,
}

/** The card's own zone wins over its column (innermost zone): an activity
 *  dropped on a card attaches to it. */
export const NestedAttach: Story = {
  args: {onDrop: fn()},
  render: (args) => <AttachBoard onDrop={args.onDrop as never} />,
  play: async ({canvas, args}) => {
    const activity = canvas.getByRole('button', {name: 'Session on feat/kb'})
    const card = canvas.getByRole('button', {name: 'Fix login'})
    const drag = await press(itemOf(activity), [point(card)])
    await drag.release()
    await expect(args.onDrop).toHaveBeenCalledTimes(1)
    const call = (args.onDrop as unknown as ReturnType<typeof fn>).mock
      .calls[0][0] as DragDropEvent<Card>
    await expect(call.target.zone).toBe('attach:d')
    await expect(canvas.getByText('Attached: Session on feat/kb → d')).toBeInTheDocument()
  },
}

/** A task dragged over another task passes through the card's zone (it
 *  only takes activities) to the column, which reorders. */
export const NestedFallsThrough: Story = {
  args: {onDrop: fn()},
  render: (args) => <AttachBoard onDrop={args.onDrop as never} />,
  play: async ({canvas, args}) => {
    const spec = canvas.getByRole('button', {name: 'Write spec'})
    const tune = canvas.getByRole('button', {name: 'Tune cache'})
    const drag = await press(itemOf(spec), [point(tune, 0.5, 0.9)])
    await drag.release()
    const call = (args.onDrop as unknown as ReturnType<typeof fn>).mock
      .calls[0][0] as DragDropEvent<Card>
    await expect(call.target).toEqual({zone: 'doing', index: 2})
  },
}

/** A column refuses an activity with a reason: the ghost shows it, it is
 *  announced, and releasing there drops nothing. */
export const RefusalWithReason: Story = {
  args: {onDrop: fn()},
  render: (args) => <AttachBoard onDrop={args.onDrop as never} />,
  play: async ({canvas, args}) => {
    const activity = canvas.getByRole('button', {name: 'Commit 3f2a'})
    const doing = canvas.getByRole('list', {name: 'In progress'})
    const drag = await press(itemOf(activity), [point(doing, 0.5, 0.97)])
    await waitFor(() =>
      expect(status()).toHaveTextContent('In progress: Drop an activity on a task to attach it'),
    )
    await expect(
      [...document.querySelectorAll('[aria-hidden="true"]')].some((el) =>
        el.textContent?.includes('Drop an activity on a task to attach it'),
      ),
    ).toBe(true)
    await drag.release()
    await expect(args.onDrop).not.toHaveBeenCalled()
    await expect(status()).toHaveTextContent('Cancelled moving Commit 3f2a.')
  },
}

// ---------------------------------------------------------------------------
// Auto-scroll
// ---------------------------------------------------------------------------

function ScrollingColumns() {
  const [cols, setCols] = useState<Columns>({long: tasks('t', 30), other: tasks('u', 2)})
  return (
    <DragDrop.Root<Card>
      renderPlaceholder={placeholder}
      onDrop={(e) => setCols((c) => moveCard(c, e.item.id, e.target.zone, e.target.index))}
    >
      <html.div style={s.board}>
        <Column id="long" name="Backlog" cards={cols.long} scroll />
        <Column id="other" name="Later" cards={cols.other} />
      </html.div>
    </DragDrop.Root>
  )
}

/** A 30-card column that scrolls: hold a dragged card near its edge. */
export const ScrollingColumn: Story = {
  render: () => <ScrollingColumns />,
}

/** Holding a card near the bottom edge of a scrolling column scrolls it, and
 *  the drop lands among the cards scrolled into view. */
export const EdgeAutoScroll: Story = {
  render: () => <ScrollingColumns />,
  play: async ({canvas}) => {
    const list = canvas.getByRole('list', {name: 'Backlog'})
    const scroller = list.parentElement as HTMLElement
    await expect(scroller.scrollTop).toBe(0)
    const first = canvas.getByRole('button', {name: 'T-1'})
    const r = scroller.getBoundingClientRect()
    const edge = {x: r.left + r.width / 2, y: r.bottom - 4}
    const drag = await press(itemOf(first), [edge])
    for (let i = 0; i < 40; i++) await nextFrame()
    await expect(scroller.scrollTop).toBeGreaterThan(100)
    await drag.release()
    const items = [...list.querySelectorAll('[role="listitem"]')].map((el) => el.textContent)
    // T-1 left the top and landed further down.
    await expect(items[0]).toBe('T-2')
    await expect(items.indexOf('T-1')).toBeGreaterThan(5)
  },
}

// ---------------------------------------------------------------------------
// 300 cards: the render budget
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    __dragDropRenders?: number
  }
}

const countUpdate = (_id: string, phase: string) => {
  if (phase !== 'mount') window.__dragDropRenders = (window.__dragDropRenders ?? 0) + 1
}

function BigBoard() {
  const [cols, setCols] = useState<Columns>({
    next: tasks('n', 100),
    doing: tasks('d', 100),
    done: tasks('k', 100),
  })
  return (
    <DragDrop.Root<Card>
      renderPlaceholder={placeholder}
      onDrop={(e) => setCols((c) => moveCard(c, e.item.id, e.target.zone, e.target.index))}
    >
      <html.div style={s.board}>
        {COLUMNS.map((col) => (
          <html.div key={col.id} style={s.column}>
            <Text variant="label">{col.name}</Text>
            <Profiler id={col.id} onRender={countUpdate}>
              <DragDrop.Zone id={col.id} label={col.name} orientation="vertical" list>
                {(cols[col.id] ?? []).map((card) => (
                  <Profiler key={card.id} id={card.id} onRender={countUpdate}>
                    <DragDrop.Item id={card.id} zone={col.id} label={card.title} data={card}>
                      <DragDrop.Handle>
                        <CardFace card={card} />
                      </DragDrop.Handle>
                    </DragDrop.Item>
                  </Profiler>
                ))}
              </DragDrop.Zone>
            </Profiler>
          </html.div>
        ))}
      </html.div>
    </DragDrop.Root>
  )
}

/**
 * 300 cards. A pointer drag across a column re-renders at most a handful of
 * zones and items per frame (the two around the moving placeholder); the
 * ghost moves without rendering. The play function counts Profiler commits
 * per frame and asserts fewer than 5.
 */
export const Perf300: Story = {
  name: 'Perf: 300 cards',
  render: () => <BigBoard />,
  play: async ({canvas}) => {
    const first = canvas.getByRole('button', {name: 'N-1'})
    const tenth = canvas.getByRole('button', {name: 'N-12'})
    const start = point(first)
    itemOf(first).dispatchEvent(new PointerEvent('pointerdown', pointerInit(start.x, start.y)))
    // Pick up (all zones light up once), then measure only the moves.
    document.dispatchEvent(new PointerEvent('pointermove', pointerInit(start.x, start.y + 20)))
    await nextFrame()
    await nextFrame()
    // The drag really started: the placeholder is up. Without this, a drag that
    // never starts renders nothing and the budget below passes vacuously.
    await waitFor(() => expect(canvas.getByText('→ Next')).toBeInTheDocument())
    const end = point(tenth)
    const perFrame: number[] = []
    const frameMs: number[] = []
    const frames = 40
    for (let i = 1; i <= frames; i++) {
      window.__dragDropRenders = 0
      const y = start.y + 20 + ((end.y - start.y - 20) * i) / frames
      const t0 = performance.now()
      document.dispatchEvent(new PointerEvent('pointermove', pointerInit(start.x, y)))
      await nextFrame()
      frameMs.push(performance.now() - t0)
      perFrame.push(window.__dragDropRenders ?? 0)
    }
    document.dispatchEvent(new PointerEvent('pointerup', pointerInit(start.x, end.y, 0)))
    await nextFrame()
    const max = Math.max(...perFrame)
    ;(window as unknown as {__perf300?: unknown}).__perf300 = {perFrame, frameMs}
    await expect(perFrame.some((n) => n > 0)).toBe(true)
    await expect(max).toBeLessThan(5)
    // …and the drop landed: N-1 left the top of Next.
    const next = canvas.getByRole('list', {name: 'Next'})
    await waitFor(() =>
      expect(next.querySelector('[role="listitem"]')?.textContent).not.toBe('N-1'),
    )
  },
}
