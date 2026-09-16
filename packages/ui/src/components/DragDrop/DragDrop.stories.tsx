import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn} from 'storybook/test'
import {useState} from 'react'
import {css, html} from 'react-strict-dom'
import {DragDrop, type DragDropEvent} from './DragDrop'
import {Button} from '../Button/Button'
import {Cluster} from '../Cluster/Cluster'
import {Inline} from '../Inline/Inline'
import {Stack} from '../Stack/Stack'
import {Tag} from '../Tag/Tag'
import {Text} from '../Text/Text'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'

const meta: Meta<typeof DragDrop.Root> = {
  title: 'Interaction/DragDrop',
  component: DragDrop.Root,
}

export default meta
type Story = StoryObj<typeof DragDrop.Root>

const localStyles = css.create({
  zone: {
    padding: spacing.md,
    minHeight: spacing.xxl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
})

interface Person {
  id: string
  name: string
}

const ALL: Person[] = [
  {id: 'p1', name: 'Marie'},
  {id: 'p2', name: 'Léo'},
  {id: 'p3', name: 'Noor'},
]

/**
 * The gate-board shape: a roster of people and a row of gates. Drag a person
 * onto the gates row to slot them (or tap them — the button is the non-drag
 * path), drag a gate back to the roster to unslot (or use its remove button).
 */
function Board({onDrop}: {onDrop?: (e: DragDropEvent<Person>) => void}) {
  const [gates, setGates] = useState<Person[]>([])
  const roster = ALL.filter((p) => !gates.some((g) => g.id === p.id))

  const slot = (p: Person, index = gates.length) =>
    setGates((prev) => {
      const without = prev.filter((g) => g.id !== p.id)
      return [...without.slice(0, index), p, ...without.slice(index)]
    })
  const unslot = (p: Person) => setGates((prev) => prev.filter((g) => g.id !== p.id))

  return (
    <DragDrop.Root<Person>
      onDrop={(e) => {
        onDrop?.(e)
        if (e.target.zone === 'gates') slot(e.item.data, e.target.index)
        else unslot(e.item.data)
      }}
    >
      <Stack gap="md">
        <Text variant="label">Roster</Text>
        <DragDrop.Zone id="roster" label="Roster">
          <html.div style={localStyles.zone}>
            <Cluster gap="sm">
              {roster.map((p) => (
                <DragDrop.Item key={p.id} id={p.id} zone="roster" label={p.name} data={p}>
                  <Button variant="secondary" size="small" onClick={() => slot(p)}>
                    {p.name}
                  </Button>
                </DragDrop.Item>
              ))}
              {roster.length === 0 && <Text color="muted">Everyone is at a gate.</Text>}
            </Cluster>
          </html.div>
        </DragDrop.Zone>

        <Text variant="label">Gates</Text>
        <DragDrop.Zone id="gates" label="Gates" orientation="horizontal">
          <html.div style={localStyles.zone}>
            <Inline gap="sm">
              {gates.map((g) => (
                <DragDrop.Item key={g.id} id={g.id} zone="gates" label={g.name} data={g}>
                  <Tag variant="info" removable onRemove={() => unslot(g)}>
                    {g.name}
                  </Tag>
                </DragDrop.Item>
              ))}
              {gates.length === 0 && <Text color="muted">Drop a person here.</Text>}
            </Inline>
          </html.div>
        </DragDrop.Zone>
      </Stack>
    </DragDrop.Root>
  )
}

export const RosterToGates: Story = {
  render: () => <Board />,
}

const pointerDrag = async (
  from: Element,
  to: Element,
  opts: {pointerType?: 'mouse' | 'touch'; hold?: number} = {},
) => {
  const {pointerType = 'mouse', hold = 0} = opts
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  const start = {x: a.left + a.width / 2, y: a.top + a.height / 2}
  const end = {x: b.left + b.width / 2, y: b.top + b.height / 2}
  const init = (x: number, y: number) => ({
    bubbles: true,
    cancelable: true,
    pointerId: 7,
    pointerType,
    isPrimary: true,
    button: 0,
    buttons: 1,
    clientX: x,
    clientY: y,
  })
  from.dispatchEvent(new PointerEvent('pointerdown', init(start.x, start.y)))
  if (hold) await new Promise((r) => setTimeout(r, hold))
  const steps = 8
  for (let i = 1; i <= steps; i++) {
    const x = start.x + ((end.x - start.x) * i) / steps
    const y = start.y + ((end.y - start.y) * i) / steps
    document.dispatchEvent(new PointerEvent('pointermove', init(x, y)))
    await new Promise((r) => requestAnimationFrame(() => r(null)))
  }
  document.dispatchEvent(new PointerEvent('pointerup', {...init(end.x, end.y), buttons: 0}))
}

/** A mouse drag from the roster into the gates row slots the person. */
export const MouseDrag: Story = {
  args: {onDrop: fn()},
  render: (args) => <Board onDrop={args.onDrop as never} />,
  play: async ({canvas, args}) => {
    const marie = await canvas.findByRole('button', {name: 'Marie'})
    const gatesZone = canvas.getByText('Drop a person here.')
    await pointerDrag(marie.parentElement as Element, gatesZone)
    await expect(args.onDrop).toHaveBeenCalledTimes(1)
    const call = (args.onDrop as ReturnType<typeof fn>).mock.calls[0][0] as DragDropEvent<Person>
    await expect(call.item.id).toBe('p1')
    await expect(call.target).toEqual({zone: 'gates', index: 0})
    // Marie left the roster and became a gate.
    await expect(canvas.queryByRole('button', {name: 'Marie'})).toBeNull()
    await expect(canvas.getByText('Marie')).toBeInTheDocument()
    await expect(canvas.getByRole('status')).toHaveTextContent('Dropped Marie in Gates.')
  },
}

/** A touch that moves right away is a scroll: no drag, no drop. A touch that
 *  holds first becomes a drag. */
export const TouchHoldThenDrag: Story = {
  args: {onDrop: fn()},
  render: (args) => <Board onDrop={args.onDrop as never} />,
  play: async ({canvas, args}) => {
    const leo = await canvas.findByRole('button', {name: 'Léo'})
    const gatesZone = canvas.getByText('Drop a person here.')
    await pointerDrag(leo.parentElement as Element, gatesZone, {pointerType: 'touch', hold: 0})
    await expect(args.onDrop).not.toHaveBeenCalled()
    await pointerDrag(leo.parentElement as Element, gatesZone, {pointerType: 'touch', hold: 250})
    await expect(args.onDrop).toHaveBeenCalledTimes(1)
    await expect(canvas.queryByRole('button', {name: 'Léo'})).toBeNull()
  },
}

/**
 * iOS Safari under load: the hold timer never fires while the finger is down
 * and every pointermove arrives in one burst just before pointerup. The hold
 * is judged by event timestamps, so the drag still activates and drops.
 */
export const TouchBurstAfterHold: Story = {
  args: {onDrop: fn()},
  render: (args) => <Board onDrop={args.onDrop as never} />,
  play: async ({canvas, args}) => {
    const noor = await canvas.findByRole('button', {name: 'Noor'})
    const gatesZone = canvas.getByText('Drop a person here.')
    // Swallow the component's hold timer for the duration of the gesture.
    const original = window.setTimeout.bind(window)
    window.setTimeout = ((fn: TimerHandler, ms?: number, ...rest: unknown[]) =>
      ms === 180 ? 0 : original(fn, ms, ...rest)) as typeof window.setTimeout
    try {
      const a = (noor.parentElement as Element).getBoundingClientRect()
      const b = gatesZone.getBoundingClientRect()
      const init = (x: number, y: number, buttons = 1) => ({
        bubbles: true,
        cancelable: true,
        pointerId: 8,
        pointerType: 'touch',
        isPrimary: true,
        button: 0,
        buttons,
        clientX: x,
        clientY: y,
      })
      ;(noor.parentElement as Element).dispatchEvent(
        new PointerEvent('pointerdown', init(a.left + a.width / 2, a.top + a.height / 2)),
      )
      await new Promise((r) => original(r, 300))
      // The whole move stream lands at once, then the release.
      const ex = b.left + b.width / 2
      const ey = b.top + b.height / 2
      for (let i = 1; i <= 4; i++) {
        document.dispatchEvent(
          new PointerEvent(
            'pointermove',
            init(a.left + ((ex - a.left) * i) / 4, a.top + ((ey - a.top) * i) / 4),
          ),
        )
      }
      await new Promise((r) => requestAnimationFrame(() => r(null)))
      // Checkpoint: the burst alone must have activated the drag.
      await expect(canvas.getByRole('status')).toHaveTextContent('Picked up Noor.')
      document.dispatchEvent(new PointerEvent('pointerup', init(ex, ey, 0)))
    } finally {
      window.setTimeout = original
    }
    // The release came from a native event; React flushes it asynchronously.
    await new Promise((r) => setTimeout(r, 50))
    await expect(canvas.getByRole('status')).toHaveTextContent('Dropped Noor in Gates.')
    await expect(args.onDrop).toHaveBeenCalledTimes(1)
    await expect(canvas.queryByRole('button', {name: 'Noor'})).toBeNull()
  },
}

/** A plain click on an item still reaches the button inside: no drag starts
 *  under the movement threshold. */
export const TapStaysAClick: Story = {
  args: {onDrop: fn()},
  render: (args) => <Board onDrop={args.onDrop as never} />,
  play: async ({canvas, args, userEvent}) => {
    const noor = await canvas.findByRole('button', {name: 'Noor'})
    await userEvent.click(noor)
    await expect(args.onDrop).not.toHaveBeenCalled()
    await expect(canvas.queryByRole('button', {name: 'Noor'})).toBeNull()
    await expect(canvas.getByText('Noor')).toBeInTheDocument()
  },
}
