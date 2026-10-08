import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor} from 'storybook/test'
import {useState} from 'react'
import {css, html} from 'react-strict-dom'
import {Timeline, type TimelineDate} from './Timeline'
import {DragDrop, type DragDropEvent} from '../DragDrop/DragDrop'
import {Text} from '../Text/Text'
import {onThemeSurface} from '../../docs/themedSurface'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

interface Args {
  onDrop?: (e: DragDropEvent<Task>) => void
  onSelect?: (id: string) => void
}

const meta: Meta<Args> = {
  title: 'Components/Timeline',
  parameters: {a11y: {test: 'error'}},
  decorators: [onThemeSurface],
}
export default meta
type Story = StoryObj<Args>

const s = css.create({
  stack: {display: 'flex', flexDirection: 'column', gap: spacing.lg},
  card: {
    padding: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.bgCard,
    fontSize: typography.fontSizeSm,
  },
})

interface Milestone {
  id: string
  title: string
  start: TimelineDate
  end: TimelineDate
  done: number
  total: number
}

const MILESTONES: Milestone[] = [
  {id: 'alpha', title: 'Alpha', start: '2026-09-21', end: '2026-10-04', done: 7, total: 7},
  {id: 'beta', title: 'Beta', start: '2026-10-01', end: '2026-10-20', done: 4, total: 9},
  {id: 'ga', title: 'GA', start: '2026-10-19', end: '2026-11-08', done: 0, total: 5},
]

interface Task {
  id: string
  title: string
}

function Milestones({
  onDrop,
  onSelect,
  droppable = false,
}: {
  onDrop?: (e: DragDropEvent<Task>) => void
  onSelect?: (id: string) => void
  droppable?: boolean
}) {
  const [items, setItems] = useState(MILESTONES)
  const [selected, setSelected] = useState<string | null>(null)
  const [tray, setTray] = useState<Task[]>([
    {id: 't1', title: 'Write release notes'},
    {id: 't2', title: 'Load test'},
  ])
  const patch = (id: string, change: Partial<Milestone>) =>
    setItems((list) => list.map((m) => (m.id === id ? {...m, ...change} : m)))

  const timeline = (
    <Timeline.Root
      aria-label="Milestones"
      heading="Milestones"
      start="2026-09-21"
      end="2026-11-08"
      today="2026-10-08"
      locale="en-GB"
    >
      {items.map((m) => (
        <Timeline.Row key={m.id} label={m.title} description={`${m.done} of ${m.total} done`}>
          <Timeline.Bar<Task>
            label={m.title}
            start={m.start}
            end={m.end}
            progress={m.total ? m.done / m.total : 0}
            tone={m.done === m.total ? 'done' : m.done === 0 ? 'planned' : 'default'}
            selected={selected === m.id}
            onSelect={() => {
              onSelect?.(m.id)
              setSelected((cur) => (cur === m.id ? null : m.id))
            }}
            onStartChange={(start) => patch(m.id, {start})}
            onEndChange={(end) => patch(m.id, {end})}
            dropZone={droppable ? {id: `ms:${m.id}`, label: m.title} : undefined}
          >
            {m.done}/{m.total}
          </Timeline.Bar>
        </Timeline.Row>
      ))}
    </Timeline.Root>
  )

  if (!droppable) return timeline
  return (
    <DragDrop.Root<Task>
      onDrop={(e) => {
        onDrop?.(e)
        if (e.target.zone.startsWith('ms:')) {
          const ms = e.target.zone.slice(3)
          setTray((t) => t.filter((x) => x.id !== e.item.id))
          setItems((list) => list.map((m) => (m.id === ms ? {...m, total: m.total + 1} : m)))
        }
      }}
    >
      <html.div style={s.stack}>
        <Text variant="label">Unscheduled</Text>
        <DragDrop.Zone id="tray" label="Unscheduled" list order={0}>
          {tray.map((t) => (
            <DragDrop.Item key={t.id} id={t.id} zone="tray" label={t.title} data={t}>
              <DragDrop.Handle>
                <html.div style={s.card}>{t.title}</html.div>
              </DragDrop.Handle>
            </DragDrop.Item>
          ))}
        </DragDrop.Zone>
        {timeline}
      </html.div>
    </DragDrop.Root>
  )
}

/** Three milestones over seven weeks, with progress fills, today, a
 *  selectable bar and keyboard edge sliders. */
export const Default: Story = {
  render: (args) => <Milestones onSelect={args.onSelect} />,
  args: {onSelect: fn()},
  play: async ({canvas, args, userEvent}) => {
    await expect(canvas.getByRole('group', {name: 'Milestones'})).toBeInTheDocument()
    await expect(canvas.getByText('Today')).toBeInTheDocument()
    const beta = canvas.getByRole('button', {name: 'Beta'})
    await expect(beta).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(beta)
    await expect(args.onSelect).toHaveBeenCalledWith('beta')
    await expect(beta).toHaveAttribute('aria-pressed', 'true')
  },
}

/** Bar edges are sliders whose value is a date: arrows move a day, Page
 *  keys a week, Home/End to the limit. */
export const KeyboardEdges: Story = {
  render: () => <Milestones />,
  play: async ({canvas, userEvent}) => {
    const end = canvas.getByRole('slider', {name: 'Beta, end'})
    await expect(end).toHaveAttribute('aria-valuetext', '20 Oct')
    end.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(end).toHaveAttribute('aria-valuetext', '21 Oct'))
    await userEvent.keyboard('{PageUp}')
    await waitFor(() => expect(end).toHaveAttribute('aria-valuetext', '28 Oct'))
    await userEvent.keyboard('{End}')
    await waitFor(() => expect(end).toHaveAttribute('aria-valuetext', '8 Nov'))
    const start = canvas.getByRole('slider', {name: 'Beta, start'})
    start.focus()
    await userEvent.keyboard('{Home}')
    await waitFor(() => expect(start).toHaveAttribute('aria-valuetext', '21 Sept'))
    // The start cannot pass the end.
    await expect(start).toHaveAttribute('aria-valuemax', end.getAttribute('aria-valuenow'))
  },
}

/** Drag an unscheduled task onto a milestone bar (or pick it with Space and
 *  move it with the arrow keys). */
export const Droppable: Story = {
  render: () => <Milestones droppable />,
}

/** Bars are DragDrop zones: drop a task on a milestone bar, by pointer or
 *  by keyboard. */
export const DropOnBar: Story = {
  args: {onDrop: fn()},
  render: (args) => <Milestones droppable onDrop={args.onDrop} />,
  play: async ({canvas, args, userEvent}) => {
    // Keyboard: pick, move right into the next zone in order (Alpha), on to
    // Beta, drop.
    canvas.getByRole('button', {name: 'Load test'}).focus()
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await userEvent.keyboard(' ')
    await expect(args.onDrop).toHaveBeenCalledTimes(1)
    const call = (args.onDrop as unknown as ReturnType<typeof fn>).mock
      .calls[0][0] as DragDropEvent<Task>
    await expect(call.target.zone).toBe('ms:beta')
    await expect(canvas.getByText('4/10')).toBeInTheDocument()

    // Pointer: drag the other task onto GA.
    const notes = canvas.getByRole('button', {name: 'Write release notes'})
    const ga = canvas.getByRole('button', {name: 'GA'})
    const a = notes.getBoundingClientRect()
    const b = ga.getBoundingClientRect()
    const init = (x: number, y: number, buttons = 1) => ({
      bubbles: true,
      pointerId: 21,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons,
      clientX: x,
      clientY: y,
    })
    const from = {x: a.left + a.width / 2, y: a.top + a.height / 2}
    const to = {x: b.left + b.width / 2, y: b.top + b.height / 2}
    notes.parentElement!.dispatchEvent(new PointerEvent('pointerdown', init(from.x, from.y)))
    for (let i = 1; i <= 8; i++) {
      document.dispatchEvent(
        new PointerEvent(
          'pointermove',
          init(from.x + ((to.x - from.x) * i) / 8, from.y + ((to.y - from.y) * i) / 8),
        ),
      )
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    }
    document.dispatchEvent(new PointerEvent('pointerup', init(to.x, to.y, 0)))
    await expect(args.onDrop).toHaveBeenCalledTimes(2)
    const second = (args.onDrop as unknown as ReturnType<typeof fn>).mock
      .calls[1][0] as DragDropEvent<Task>
    await expect(second.target.zone).toBe('ms:ga')
  },
}
