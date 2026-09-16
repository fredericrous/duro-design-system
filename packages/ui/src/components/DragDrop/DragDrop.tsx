import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {isNative} from '../../platform'

// ---------------------------------------------------------------------------
// DragDrop — move items between zones with one pointer, on mouse, pen and
// touch alike.
//
// Pointer events are the single input path: a press arms a drag, movement
// past a small threshold (or, on touch, a short hold) starts it, pointer
// capture keeps the stream on the item, and release resolves the zone under
// the pointer. The dragged item stays in the DOM (faded) while a ghost copy
// follows the pointer, so layout never shifts mid-drag and a cancelled drag
// costs nothing.
//
// Dragging is a pointer gesture only. Every consumer MUST keep a non-drag way
// to do the same thing (a button that adds, a remove affordance) — that is
// the keyboard and assistive path, and WCAG 2.5.7 requires it. The Root's
// live region announces picks and drops so screen readers follow along.
//
// Native: react-strict-dom does not route pointer capture on React Native,
// so Item renders its children without drag behaviour there and the consumer's
// non-drag path is the only path. Not exported from the native barrel.
// ---------------------------------------------------------------------------

export interface DragDropItemData<T = unknown> {
  readonly id: string
  readonly zone: string
  readonly data: T
}

export interface DragDropTarget {
  readonly zone: string
  /** Insertion index among the target zone's items, from the pointer's
   *  position along the zone's axis. Excludes the dragged item itself. */
  readonly index: number
}

export interface DragDropEvent<T = unknown> {
  readonly item: DragDropItemData<T>
  readonly target: DragDropTarget
}

interface ZoneRecord {
  readonly el: HTMLElement
  readonly orientation: 'horizontal' | 'vertical'
  readonly accepts?: (item: DragDropItemData) => boolean
  readonly label: string
}

interface ItemRecord {
  readonly el: HTMLElement
  readonly zone: string
  readonly data: unknown
  readonly label: string
  readonly preview: ReactNode
}

interface DragSession {
  readonly id: string
  readonly pointerId: number
  /** Event time of the press, for judging the touch hold by timestamps. */
  readonly downAt: number
  readonly startX: number
  readonly startY: number
  readonly offsetX: number
  readonly offsetY: number
  readonly width: number
  readonly height: number
  readonly source: HTMLElement
  active: boolean
  holdTimer: ReturnType<typeof setTimeout> | null
}

interface DragState {
  readonly id: string
  readonly preview: ReactNode
  readonly width: number
  readonly height: number
  readonly x: number
  readonly y: number
  readonly over: DragDropTarget | null
}

interface RootContextValue {
  registerZone: (id: string, record: ZoneRecord) => () => void
  registerItem: (id: string, record: ItemRecord) => () => void
  begin: (id: string, e: React.PointerEvent) => void
  drag: DragState | null
}

const RootContext = createContext<RootContextValue | null>(null)

const useRoot = (part: string): RootContextValue => {
  const ctx = useContext(RootContext)
  if (!ctx) throw new Error(`DragDrop.${part} must be used within DragDrop.Root`)
  return ctx
}

/** How far the pointer moves before a press becomes a drag (mouse/pen), so a
 *  click stays a click. */
const MOVE_THRESHOLD_PX = 6
/** How long a touch holds still before it becomes a drag. Below this a touch
 *  that moves is a scroll, and the browser gets it back via pointercancel. */
const TOUCH_HOLD_MS = 180

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface DragDropRootProps<T = unknown> {
  /** Called when an item is released over a zone that accepts it. Reordering
   *  inside the item's own zone arrives here too, with the new index. */
  onDrop: (event: DragDropEvent<T>) => void
  /** Overrides the default screen-reader announcements. */
  announce?: (event: {kind: 'pick' | 'drop' | 'cancel'; item: string; zone?: string}) => string
  children: ReactNode
}

function Root<T = unknown>({onDrop, announce, children}: DragDropRootProps<T>) {
  const zones = useRef(new Map<string, ZoneRecord>())
  const items = useRef(new Map<string, ItemRecord>())
  const session = useRef<DragSession | null>(null)
  const frame = useRef<number | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const say = useCallback(
    (kind: 'pick' | 'drop' | 'cancel', itemId: string, zoneId?: string) => {
      const item = items.current.get(itemId)?.label ?? itemId
      const zone = zoneId ? (zones.current.get(zoneId)?.label ?? zoneId) : undefined
      const text = announce
        ? announce({kind, item, zone})
        : kind === 'pick'
          ? `Picked up ${item}.`
          : kind === 'drop'
            ? `Dropped ${item} in ${zone ?? 'place'}.`
            : `Cancelled moving ${item}.`
      setAnnouncement(text)
    },
    [announce],
  )

  const registerZone = useCallback((id: string, record: ZoneRecord) => {
    zones.current.set(id, record)
    return () => {
      zones.current.delete(id)
    }
  }, [])

  const registerItem = useCallback((id: string, record: ItemRecord) => {
    items.current.set(id, record)
    return () => {
      items.current.delete(id)
    }
  }, [])

  /** The zone under the pointer that accepts the dragged item, and where in
   *  it the item would land. */
  const locate = useCallback((itemId: string, x: number, y: number): DragDropTarget | null => {
    const item = items.current.get(itemId)
    if (!item) return null
    const payload: DragDropItemData = {id: itemId, zone: item.zone, data: item.data}
    for (const [zoneId, zone] of zones.current) {
      const r = zone.el.getBoundingClientRect()
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue
      if (zone.accepts && !zone.accepts(payload)) return null
      const horizontal = zone.orientation === 'horizontal'
      let index = 0
      for (const [otherId, other] of items.current) {
        if (otherId === itemId || other.zone !== zoneId) continue
        const or = other.el.getBoundingClientRect()
        const mid = horizontal ? (or.left + or.right) / 2 : (or.top + or.bottom) / 2
        if ((horizontal ? x : y) > mid) index += 1
      }
      return {zone: zoneId, index}
    }
    return null
  }, [])

  const finish = useCallback(
    (dropped: boolean) => {
      const s = session.current
      if (!s) return
      if (s.holdTimer) clearTimeout(s.holdTimer)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
      session.current = null
      try {
        if (s.source.hasPointerCapture(s.pointerId)) s.source.releasePointerCapture(s.pointerId)
      } catch {
        // already released
      }
      if (!s.active) return
      setDrag((current) => {
        const target = current?.over ?? null
        const item = items.current.get(s.id)
        if (dropped && target && item) {
          onDrop({item: {id: s.id, zone: item.zone, data: item.data as T}, target})
          say('drop', s.id, target.zone)
        } else {
          say('cancel', s.id)
        }
        return null
      })
    },
    [onDrop, say],
  )

  const activate = useCallback(
    (s: DragSession, x: number, y: number) => {
      s.active = true
      const item = items.current.get(s.id)
      setDrag({
        id: s.id,
        preview: item?.preview ?? null,
        width: s.width,
        height: s.height,
        x: x - s.offsetX,
        y: y - s.offsetY,
        over: locate(s.id, x, y),
      })
      say('pick', s.id)
    },
    [locate, say],
  )

  const begin = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (session.current || e.button !== 0) return
      const source = e.currentTarget as HTMLElement
      const rect = source.getBoundingClientRect()
      const s: DragSession = {
        id,
        pointerId: e.pointerId,
        downAt: e.timeStamp,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        source,
        active: false,
        holdTimer: null,
      }
      session.current = s
      // Capture keeps the stream on the item if the pointer leaves the window;
      // the document listeners below carry the drag either way, so a browser
      // (or a synthetic event) without an active pointer is not an error.
      try {
        source.setPointerCapture(e.pointerId)
      } catch {
        // no active pointer to capture
      }
      if (e.pointerType === 'touch') {
        s.holdTimer = setTimeout(() => {
          s.holdTimer = null
          if (session.current === s && !s.active) activate(s, s.startX, s.startY)
        }, TOUCH_HOLD_MS)
      }
    },
    [activate],
  )

  // Move/up/cancel listen on the document: pointer capture keeps the events
  // flowing to the source element, but a single document listener survives
  // the item re-rendering under the pointer.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = session.current
      if (!s || e.pointerId !== s.pointerId) return
      if (!s.active) {
        const moved = Math.hypot(e.clientX - s.startX, e.clientY - s.startY)
        if (e.pointerType === 'touch') {
          // The hold is judged by event time, not by the timer having fired:
          // a busy main thread (seen on iOS Safari) can withhold the timer
          // AND every pointermove until the finger lifts, then deliver them
          // in one burst. Since touch-action:none keeps the browser from
          // panning on the item, a move stream that arrives at all is ours;
          // the hold only separates a drag from a quick flick.
          if (e.timeStamp - s.downAt >= TOUCH_HOLD_MS) {
            if (s.holdTimer) clearTimeout(s.holdTimer)
            s.holdTimer = null
            activate(s, s.startX, s.startY)
          } else {
            // Moved before the hold elapsed: a flick, not a drag.
            if (moved > MOVE_THRESHOLD_PX) finish(false)
            return
          }
        } else {
          if (moved < MOVE_THRESHOLD_PX) return
          activate(s, e.clientX, e.clientY)
        }
      }
      if (frame.current !== null) return
      frame.current = requestAnimationFrame(() => {
        frame.current = null
        const x = e.clientX
        const y = e.clientY
        setDrag((current) =>
          current
            ? {...current, x: x - s.offsetX, y: y - s.offsetY, over: locate(s.id, x, y)}
            : current,
        )
      })
    }
    const onUp = (e: PointerEvent) => {
      const s = session.current
      if (!s || e.pointerId !== s.pointerId) return
      // Resolve the target from the release point, not the last frame.
      if (s.active) {
        const over = locate(s.id, e.clientX, e.clientY)
        setDrag((current) => (current ? {...current, over} : current))
      }
      finish(true)
    }
    const onCancel = (e: PointerEvent) => {
      const s = session.current
      if (!s || e.pointerId !== s.pointerId) return
      finish(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && session.current) finish(false)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onCancel)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onCancel)
      document.removeEventListener('keydown', onKey)
    }
  }, [activate, finish, locate])

  const value = useMemo<RootContextValue>(
    () => ({registerZone, registerItem, begin, drag}),
    [registerZone, registerItem, begin, drag],
  )

  return (
    <RootContext.Provider value={value}>
      {children}
      {drag && (
        <html.div
          aria-hidden
          style={[styles.ghost, styles.ghostAt(drag.x, drag.y, drag.width, drag.height)]}
        >
          {drag.preview}
        </html.div>
      )}
      <html.div role="status" aria-live="polite" aria-atomic style={styles.liveRegion}>
        {announcement}
      </html.div>
    </RootContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Zone
// ---------------------------------------------------------------------------

export interface DragDropZoneProps<T = unknown> {
  id: string
  /** Read to screen readers when an item is dropped here. */
  label: string
  /** Which axis items flow along; decides how the insertion index is read
   *  from the pointer. */
  orientation?: 'horizontal' | 'vertical'
  /** Refuse an item; the zone then never lights up for it. */
  accepts?: (item: DragDropItemData<T>) => boolean
  children: ReactNode
}

function Zone<T = unknown>({
  id,
  label,
  orientation = 'horizontal',
  accepts,
  children,
}: DragDropZoneProps<T>) {
  const {registerZone, drag} = useRoot('Zone')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || isNative) return
    return registerZone(id, {
      el,
      orientation,
      label,
      accepts: accepts as ZoneRecord['accepts'],
    })
  }, [id, label, orientation, accepts, registerZone])

  const over = drag?.over?.zone === id
  const dragging = drag !== null

  return (
    <html.div
      ref={ref}
      style={[styles.zone, dragging && styles.zoneReady, over && styles.zoneOver]}
    >
      {children}
    </html.div>
  )
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export interface DragDropItemProps<T = unknown> {
  id: string
  /** The zone this item currently lives in. */
  zone: string
  /** Read to screen readers when picked up or dropped. */
  label: string
  /** Carried to onDrop untouched. */
  data?: T
  /** What follows the pointer; defaults to the children. */
  preview?: ReactNode
  disabled?: boolean
  children: ReactNode
}

function Item<T = unknown>({
  id,
  zone,
  label,
  data,
  preview,
  disabled = false,
  children,
}: DragDropItemProps<T>) {
  const {registerItem, begin, drag} = useRoot('Item')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || isNative) return
    return registerItem(id, {el, zone, data, label, preview: preview ?? children})
  }, [id, zone, data, label, preview, children, registerItem])

  // WebKit only honours the prefixed user-select, and a touch held on
  // selectable text becomes iOS's selection gesture (loupe and handles)
  // before our hold can turn it into a drag; the callout is the same race
  // for links and images. StyleX emits neither prefixed property and
  // react-strict-dom's types have no vendor keys, so they are set on the
  // element directly. Both inherit into the item's children.
  useEffect(() => {
    const el = ref.current
    if (!el || isNative) return
    const style = el.style as CSSStyleDeclaration & {webkitTouchCallout?: string}
    style.webkitUserSelect = 'none'
    style.webkitTouchCallout = 'none'
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return
      begin(id, e)
    },
    [begin, disabled, id],
  )

  if (isNative) return <>{children}</>

  const lifted = drag?.id === id
  return (
    <html.div
      ref={ref}
      onPointerDown={onPointerDown}
      style={[styles.item, disabled && styles.itemDisabled, lifted && styles.itemLifted]}
    >
      {children}
    </html.div>
  )
}

/** Current drag, for consumers that render their own placeholder or ghost. */
export function useDragDrop(): {
  readonly dragging: string | null
  readonly over: DragDropTarget | null
} {
  const ctx = useContext(RootContext)
  return {dragging: ctx?.drag?.id ?? null, over: ctx?.drag?.over ?? null}
}

export const DragDrop = {Root, Zone, Item}
