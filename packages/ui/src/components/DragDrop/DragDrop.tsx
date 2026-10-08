import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import type {SpacingToken} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {isNative} from '../../platform'
import {visuallyHidden} from '../../styles/visually-hidden.css'

// ---------------------------------------------------------------------------
// DragDrop — move items between zones, by pointer (mouse, pen and touch
// through one pointer-event path) or by keyboard.
//
// Pointer: a press arms a drag, movement past a small threshold (or, on
// touch, a short hold) starts it, and release resolves the zone under the
// pointer. The innermost zone that accepts the item wins
// (document.elementsFromPoint), so a zone nested in another (a card inside a
// column) receives its own drops. The dragged item stays in the DOM (faded)
// while a ghost follows the pointer. Item rects are measured once at pick-up
// and shifted by how far their scrolling ancestors have scrolled since, so an
// optional placeholder (renderPlaceholder) never feeds back into the index,
// and a small hysteresis keeps the index from flickering at a midpoint.
// Near the edge of a scrolling ancestor (or the window) the drag scrolls it.
//
// Keyboard: put a DragDrop.Handle in an Item. Handles are one roving tab
// stop per zone; Up/Down and Left/Right move focus between them. Space picks
// the item up, Up/Down move it within its zone, Left/Right move it across
// zones (in `order`, else DOM order), Space or Enter drops, Escape (or Tab)
// cancels, and focus returns to the item's handle either way.
//
// State lives in an external store read with useSyncExternalStore and
// per-part selectors: a drag re-renders only the parts whose answer changed
// (the two items around a moving placeholder, the zones on pick-up and drop),
// and the ghost is moved by writing its transform, not by rendering.
//
// Every announcement (pick, move, drop, cancel, refuse) goes through the
// Root's live region and the optional `announce` prop, so an app can supply
// its own catalog strings. A zone can refuse with a reason
// (`accepts` → `{ok: false, reason}`): the ghost shows it and it is announced.
//
// WCAG 2.5.7 still applies to pointer-only consumers: an Item without a
// Handle has no keyboard path, so keep a button that does the same thing.
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

/** What a zone's `accepts` answers: `true` takes the item, `false` lets it
 *  pass silently (an outer zone may take it), and `{ok: false, reason}`
 *  refuses it out loud — the reason is shown on the ghost and announced. */
export type DragDropVerdict = boolean | {readonly ok: false; readonly reason: string}

export interface DragDropRefusal {
  readonly zone: string
  readonly reason: string
}

export interface DragDropOverEvent<T = unknown> {
  readonly item: DragDropItemData<T>
  /** Where the item would land now; null over nothing that accepts it. */
  readonly target: DragDropTarget | null
  /** The innermost zone that refused with a reason, when nothing accepted. */
  readonly refused: DragDropRefusal | null
  readonly keyboard: boolean
}

export interface DragDropAnnouncement {
  readonly kind: 'pick' | 'move' | 'drop' | 'cancel' | 'refuse'
  /** The item's label. */
  readonly item: string
  /** The zone's label (pick, move, drop, refuse). */
  readonly zone?: string
  /** 1-based position in the zone, counting the item itself. */
  readonly position?: number
  /** How many items the zone holds with the item in it. */
  readonly count?: number
  /** The zone's refusal (refuse). */
  readonly reason?: string
  /** Whether the drag is a keyboard one. */
  readonly keyboard: boolean
}

export interface DragDropPlaceholderInfo {
  readonly zone: string
  readonly index: number
  /** The zone's label, e.g. for "→ In progress". */
  readonly label: string
}

export type DragDropRenderPlaceholder = (info: DragDropPlaceholderInfo) => ReactNode

interface ZoneRecord {
  el: HTMLElement | null
  orientation: 'horizontal' | 'vertical'
  label: string
  accepts?: (item: DragDropItemData) => DragDropVerdict
  order?: number
  renderPlaceholder?: DragDropRenderPlaceholder
}

interface ItemRecord {
  el: HTMLElement | null
  zone: string
  label: string
  data: unknown
  preview: ReactNode
  disabled: boolean
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

/** The drag as the parts see it. Replaced (never mutated) on every change, so
 *  selectors can compare by reference. */
interface DragView {
  readonly id: string
  readonly keyboard: boolean
  readonly over: DragDropTarget | null
  readonly refused: DragDropRefusal | null
  /** Each zone's items in DOM order at pick-up, without the dragged one. */
  readonly order: ReadonlyMap<string, readonly string[]>
}

interface GhostView {
  readonly preview: ReactNode
  readonly width: number
  readonly height: number
}

interface Rect {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

interface Geometry {
  readonly rect: Rect
  readonly scrollers: readonly Element[]
}

/** The parts of a keydown the keyboard path reads. */
interface KeyLike {
  readonly key: string
  preventDefault(): void
  stopPropagation(): void
}

interface LatestProps {
  onDrop: (event: DragDropEvent<unknown>) => void
  onDragOver?: (event: DragDropOverEvent<unknown>) => void
  announce?: (event: DragDropAnnouncement) => string
  renderPlaceholder?: DragDropRenderPlaceholder
}

/** How far the pointer moves before a press becomes a drag (mouse/pen), so a
 *  click stays a click. */
const MOVE_THRESHOLD_PX = 6
/** How long a touch holds still before it becomes a drag. Below this a touch
 *  that moves is a scroll, and the browser gets it back via pointercancel. */
const TOUCH_HOLD_MS = 180
/** How far past an item's midpoint the pointer must go before the insertion
 *  index changes, so it does not flicker on the line. */
const HYSTERESIS_PX = 8
/** Auto-scroll: the band along a scroller's edge that scrolls it, and the
 *  largest step per frame (reached at the very edge). */
const EDGE_PX = 48
const MAX_STEP_PX = 16

const domOrder = (a: Element, b: Element) =>
  a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1

const verdictOf = (v: DragDropVerdict | undefined): {ok: boolean; reason?: string} =>
  v === undefined || v === true
    ? {ok: true}
    : v === false
      ? {ok: false}
      : {ok: false, reason: v.reason}

const sameTarget = (a: DragDropTarget | null, b: DragDropTarget | null) =>
  a === b || (a !== null && b !== null && a.zone === b.zone && a.index === b.index)

const sameRefusal = (a: DragDropRefusal | null, b: DragDropRefusal | null) =>
  a === b || (a !== null && b !== null && a.zone === b.zone && a.reason === b.reason)

function defaultAnnouncement(e: DragDropAnnouncement): string {
  const where = e.position !== undefined ? `${e.zone}, position ${e.position} of ${e.count}` : ''
  switch (e.kind) {
    case 'pick':
      return e.keyboard
        ? `Picked up ${e.item}. ${where}. Arrow keys move, Space drops, Escape cancels.`
        : `Picked up ${e.item}.`
    case 'move':
      return where
    case 'drop':
      return e.keyboard
        ? `Dropped ${e.item} in ${where}.`
        : `Dropped ${e.item} in ${e.zone ?? 'place'}.`
    case 'cancel':
      return `Cancelled moving ${e.item}.`
    case 'refuse':
      return `${e.zone}: ${e.reason}`
  }
}

// ---------------------------------------------------------------------------
// Engine: the registry (stable), the drag store (subscribed to), and the
// pointer/keyboard state machine. One per Root, created once.
// ---------------------------------------------------------------------------

/** setPointerCapture / releasePointerCapture throw these when there is no
 *  active pointer to capture (a synthetic event, a pointer already gone) or
 *  the capture is already released. Anything else is a real error. */
const isPointerCaptureMiss = (err: unknown): boolean =>
  err instanceof DOMException && (err.name === 'NotFoundError' || err.name === 'InvalidStateError')

class Engine {
  props: LatestProps = {onDrop: () => {}}
  readonly zones = new Map<string, ZoneRecord>()
  readonly items = new Map<string, ItemRecord>()
  readonly handles = new Map<string, HTMLElement>()

  drag: DragView | null = null
  ghost: GhostView | null = null
  ghostEl: HTMLElement | null = null
  refusalText: string | null = null
  announcement = ''
  focusRequest: string | null = null

  /** Roving tab stop per zone: the handle last focused there. */
  private readonly stops = new Map<string, string>()
  /** The first handle of each zone in DOM order, the stop until one is focused. */
  private firstStops = new Map<string, string>()
  private stopsDirty = false

  private session: DragSession | null = null
  private frame: number | null = null
  private pointer = {x: 0, y: 0}
  private geometry = new Map<string, Geometry>()
  private baseline = new Map<Element, {left: number; top: number}>()
  private scrollable = new Map<Element, boolean>()
  private readonly listeners = new Set<() => void>()

  // -- store ----------------------------------------------------------------

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit() {
    for (const l of this.listeners) l()
  }

  tabStop(zone: string): string | undefined {
    const explicit = this.stops.get(zone)
    if (explicit && this.handles.has(explicit) && this.items.get(explicit)?.zone === zone) {
      return explicit
    }
    return this.firstStops.get(zone)
  }

  // -- registry -------------------------------------------------------------

  registerZone(id: string, record: ZoneRecord) {
    this.zones.set(id, record)
    return () => {
      if (this.zones.get(id) === record) this.zones.delete(id)
    }
  }

  registerItem(id: string, record: ItemRecord) {
    this.items.set(id, record)
    return () => {
      if (this.items.get(id) === record) this.items.delete(id)
    }
  }

  registerHandle(id: string, el: HTMLElement) {
    this.handles.set(id, el)
    this.recomputeStops()
    return () => {
      if (this.handles.get(id) === el) this.handles.delete(id)
      this.recomputeStops()
    }
  }

  /** Batched: a board mounting 300 handles recomputes once. */
  private recomputeStops() {
    if (this.stopsDirty) return
    this.stopsDirty = true
    queueMicrotask(() => {
      this.stopsDirty = false
      const next = new Map<string, string>()
      const firstEl = new Map<string, HTMLElement>()
      for (const [id, el] of this.handles) {
        const zone = this.items.get(id)?.zone
        if (zone === undefined) continue
        const cur = firstEl.get(zone)
        if (!cur || domOrder(el, cur) < 0) {
          firstEl.set(zone, el)
          next.set(zone, id)
        }
      }
      this.firstStops = next
      this.emit()
    })
  }

  private handlesIn(zone: string): string[] {
    const ids: string[] = []
    for (const [id] of this.handles) if (this.items.get(id)?.zone === zone) ids.push(id)
    return ids.sort((a, b) => domOrder(this.handles.get(a)!, this.handles.get(b)!))
  }

  /** Zones in keyboard order: by `order`, then DOM order. */
  private zoneSequence(): string[] {
    const list = [...this.zones].filter(([, z]) => z.el)
    list.sort(
      ([, a], [, b]) =>
        (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY) ||
        domOrder(a.el!, b.el!),
    )
    return list.map(([id]) => id)
  }

  // -- announcements ----------------------------------------------------------

  private say(event: DragDropAnnouncement) {
    const announce = this.props.announce
    this.announcement = announce ? announce(event) : defaultAnnouncement(event)
    this.emit()
  }

  private labelOf(itemId: string) {
    return this.items.get(itemId)?.label ?? itemId
  }

  private zoneLabel(zone: string) {
    return this.zones.get(zone)?.label ?? zone
  }

  private placeAt(target: DragDropTarget) {
    const others = this.drag?.order.get(target.zone)?.length ?? 0
    return {zone: this.zoneLabel(target.zone), position: target.index + 1, count: others + 1}
  }

  private payload(itemId: string): DragDropItemData | null {
    const item = this.items.get(itemId)
    return item ? {id: itemId, zone: item.zone, data: item.data} : null
  }

  // -- measuring ------------------------------------------------------------

  private captureOrder(exclude: string): Map<string, string[]> {
    const byZone = new Map<string, string[]>()
    for (const [id, item] of this.items) {
      if (id === exclude || !item.el) continue
      const list = byZone.get(item.zone)
      if (list) list.push(id)
      else byZone.set(item.zone, [id])
    }
    for (const list of byZone.values()) {
      list.sort((a, b) => domOrder(this.items.get(a)!.el!, this.items.get(b)!.el!))
    }
    return byZone
  }

  private isScroller(el: Element): boolean {
    const known = this.scrollable.get(el)
    if (known !== undefined) return known
    const s = getComputedStyle(el)
    const scrolls = (o: string) => o === 'auto' || o === 'scroll' || o === 'overlay'
    const yes =
      (scrolls(s.overflowY) && el.scrollHeight > el.clientHeight) ||
      (scrolls(s.overflowX) && el.scrollWidth > el.clientWidth)
    this.scrollable.set(el, yes)
    return yes
  }

  /** Every item's rect, once, with the scrollers it moves with. Later reads
   *  shift the rect by how far those have scrolled since, so a placeholder
   *  inserted mid-drag never moves the geometry the index is read from. */
  private captureGeometry() {
    this.geometry = new Map()
    this.baseline = new Map()
    this.scrollable = new Map()
    const root = document.scrollingElement
    const chains = new Map<Element, Element[]>()
    const chain = (el: Element | null): Element[] => {
      if (!el || el === document.body || el === document.documentElement) return root ? [root] : []
      const known = chains.get(el)
      if (known) return known
      const up = chain(el.parentElement)
      const own = this.isScroller(el) ? [el, ...up] : up
      chains.set(el, own)
      return own
    }
    for (const [id, item] of this.items) {
      if (!item.el) continue
      const r = item.el.getBoundingClientRect()
      const scrollers = chain(item.el.parentElement)
      for (const s of scrollers) {
        if (!this.baseline.has(s)) this.baseline.set(s, {left: s.scrollLeft, top: s.scrollTop})
      }
      this.geometry.set(id, {
        rect: {left: r.left, top: r.top, right: r.right, bottom: r.bottom},
        scrollers,
      })
    }
  }

  private rectOf(id: string): Rect | null {
    const g = this.geometry.get(id)
    if (!g) return null
    let dx = 0
    let dy = 0
    for (const s of g.scrollers) {
      const b = this.baseline.get(s)
      if (!b) continue
      dx += s.scrollLeft - b.left
      dy += s.scrollTop - b.top
    }
    return {
      left: g.rect.left - dx,
      right: g.rect.right - dx,
      top: g.rect.top - dy,
      bottom: g.rect.bottom - dy,
    }
  }

  /** Where the dragged item would land at (x, y): the innermost zone that
   *  accepts it, and the index from the pick-up geometry, with hysteresis
   *  against the current index. */
  private locate(
    itemId: string,
    x: number,
    y: number,
  ): {target: DragDropTarget | null; refused: DragDropRefusal | null} {
    const payload = this.payload(itemId)
    const d = this.drag
    if (!payload || !d) return {target: null, refused: null}
    let refused: DragDropRefusal | null = null
    const seen = new Set<string>()
    const zoneByEl = new Map<Element, string>()
    for (const [id, z] of this.zones) if (z.el) zoneByEl.set(z.el, id)
    for (const el of document.elementsFromPoint(x, y)) {
      const zoneId = zoneByEl.get(el)
      if (zoneId === undefined || seen.has(zoneId)) continue
      seen.add(zoneId)
      const zone = this.zones.get(zoneId)!
      const verdict = verdictOf(zone.accepts?.(payload))
      if (!verdict.ok) {
        if (verdict.reason !== undefined && !refused)
          refused = {zone: zoneId, reason: verdict.reason}
        continue
      }
      const horizontal = zone.orientation === 'horizontal'
      const pos = horizontal ? x : y
      const prev = d.over && d.over.zone === zoneId ? d.over.index : null
      const others = d.order.get(zoneId) ?? []
      let index = 0
      others.forEach((otherId, k) => {
        const r = this.rectOf(otherId)
        if (!r) return
        const mid = horizontal ? (r.left + r.right) / 2 : (r.top + r.bottom) / 2
        const bias = prev === null ? 0 : k < prev ? -HYSTERESIS_PX : HYSTERESIS_PX
        if (pos > mid + bias) index += 1
      })
      return {target: {zone: zoneId, index}, refused: null}
    }
    return {target: null, refused}
  }

  /** Point the drag at a new target/refusal; tells listeners only on change. */
  private retarget(target: DragDropTarget | null, refused: DragDropRefusal | null) {
    const d = this.drag
    if (!d) return
    if (sameTarget(d.over, target) && sameRefusal(d.refused, refused)) return
    const wasRefused = d.refused
    this.drag = {...d, over: target, refused}
    this.refusalText = refused?.reason ?? null
    this.paintGhost()
    this.emit()
    const payload = this.payload(d.id)
    if (payload) this.props.onDragOver?.({item: payload, target, refused, keyboard: d.keyboard})
    if (refused && !sameRefusal(wasRefused, refused)) {
      this.say({
        kind: 'refuse',
        item: this.labelOf(d.id),
        zone: this.zoneLabel(refused.zone),
        reason: refused.reason,
        keyboard: d.keyboard,
      })
    }
  }

  // -- ghost ------------------------------------------------------------------

  /** The ghost moves by its transform, written here, so a frame of pointer
   *  movement renders nothing. */
  paintGhost() {
    const el = this.ghostEl
    const s = this.session
    if (!el || !s) return
    el.style.transform = `translate3d(${this.pointer.x - s.offsetX}px, ${this.pointer.y - s.offsetY}px, 0)`
  }

  // -- auto-scroll --------------------------------------------------------------

  /** Scrolls the innermost scroller under the pointer whose edge band it is
   *  in and that can still move that way. True when something scrolled. */
  private autoScroll(x: number, y: number): boolean {
    const root = document.scrollingElement
    const chain: Element[] = []
    let el: Element | null = document.elementsFromPoint(x, y)[0] ?? null
    while (el && el !== document.body && el !== document.documentElement) {
      if (this.isScroller(el)) chain.push(el)
      el = el.parentElement
    }
    if (root) chain.push(root)
    const step = (dist: number) =>
      dist < EDGE_PX ? Math.ceil(MAX_STEP_PX * (1 - Math.max(dist, 0) / EDGE_PX)) : 0
    for (const s of chain) {
      const r: Rect =
        s === root
          ? {left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight}
          : s.getBoundingClientRect()
      const up = step(y - r.top)
      const down = step(r.bottom - y)
      const left = step(x - r.left)
      const right = step(r.right - x)
      const dy = up ? -up : down
      const dx = left ? -left : right
      const canY =
        dy < 0 ? s.scrollTop > 0 : dy > 0 ? s.scrollTop + s.clientHeight < s.scrollHeight : false
      const canX =
        dx < 0 ? s.scrollLeft > 0 : dx > 0 ? s.scrollLeft + s.clientWidth < s.scrollWidth : false
      if (canY || canX) {
        if (canY) s.scrollTop += dy
        if (canX) s.scrollLeft += dx
        return true
      }
    }
    return false
  }

  // -- pointer --------------------------------------------------------------

  private scheduleFrame() {
    if (this.frame !== null) return
    this.frame = requestAnimationFrame(this.tick)
  }

  private tick = () => {
    this.frame = null
    const s = this.session
    if (!s || !s.active) return
    const {x, y} = this.pointer
    this.paintGhost()
    const scrolled = this.autoScroll(x, y)
    const {target, refused} = this.locate(s.id, x, y)
    this.retarget(target, refused)
    if (scrolled) this.scheduleFrame()
  }

  private onScroll = () => {
    if (this.session?.active) this.scheduleFrame()
  }

  private activate(s: DragSession, x: number, y: number) {
    s.active = true
    this.pointer = {x, y}
    const item = this.items.get(s.id)
    this.drag = {
      id: s.id,
      keyboard: false,
      over: null,
      refused: null,
      order: this.captureOrder(s.id),
    }
    this.captureGeometry()
    this.ghost = {preview: item?.preview ?? null, width: s.width, height: s.height}
    this.refusalText = null
    document.addEventListener('scroll', this.onScroll, {capture: true, passive: true})
    this.emit()
    this.say({kind: 'pick', item: this.labelOf(s.id), keyboard: false})
    const {target, refused} = this.locate(s.id, x, y)
    this.retarget(target, refused)
  }

  begin(id: string, e: React.PointerEvent) {
    if (this.session || this.drag || e.button !== 0) return
    if (this.items.get(id)?.disabled) return
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
    this.session = s
    // Capture keeps the stream on the item if the pointer leaves the window;
    // the document listeners carry the drag either way, so a browser (or a
    // synthetic event) without an active pointer is not an error.
    try {
      source.setPointerCapture(e.pointerId)
    } catch (err) {
      if (!isPointerCaptureMiss(err)) throw err
    }
    if (e.pointerType === 'touch') {
      s.holdTimer = setTimeout(() => {
        s.holdTimer = null
        if (this.session === s && !s.active) this.activate(s, s.startX, s.startY)
      }, TOUCH_HOLD_MS)
    }
  }

  /** Ends a pointer drag. `commit` resolves the target from the release
   *  point; otherwise the drag is cancelled. The consumer's onDrop runs here,
   *  in the event handler, never inside a state updater. */
  private finishPointer(commit: {x: number; y: number} | null) {
    const s = this.session
    if (!s) return
    if (s.holdTimer) clearTimeout(s.holdTimer)
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = null
    this.session = null
    try {
      if (s.source.hasPointerCapture(s.pointerId)) s.source.releasePointerCapture(s.pointerId)
    } catch (err) {
      if (!isPointerCaptureMiss(err)) throw err
    }
    if (!s.active) return
    document.removeEventListener('scroll', this.onScroll, {capture: true})
    let target: DragDropTarget | null = null
    if (commit) {
      const found = this.locate(s.id, commit.x, commit.y)
      this.retarget(found.target, found.refused)
      target = this.drag?.over ?? null
    }
    const announcement = target ? this.placeAt(target) : null
    const payload = this.payload(s.id)
    this.drag = null
    this.ghost = null
    this.refusalText = null
    this.emit()
    if (target && payload && announcement) {
      this.props.onDrop({item: payload, target})
      this.say({kind: 'drop', item: this.labelOf(s.id), ...announcement, keyboard: false})
    } else {
      this.say({kind: 'cancel', item: this.labelOf(s.id), keyboard: false})
    }
  }

  // Move/up/cancel listen on the document: pointer capture keeps the events
  // flowing to the source element, but a single document listener survives
  // the item re-rendering under the pointer.
  attach() {
    const onMove = (e: PointerEvent) => {
      const s = this.session
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
            this.activate(s, s.startX, s.startY)
          } else {
            // Moved before the hold elapsed: a flick, not a drag.
            if (moved > MOVE_THRESHOLD_PX) this.finishPointer(null)
            return
          }
        } else {
          if (moved < MOVE_THRESHOLD_PX) return
          this.activate(s, e.clientX, e.clientY)
        }
      }
      this.pointer = {x: e.clientX, y: e.clientY}
      this.scheduleFrame()
    }
    const onUp = (e: PointerEvent) => {
      const s = this.session
      if (!s || e.pointerId !== s.pointerId) return
      // Resolve the target from the release point, not the last frame.
      this.pointer = {x: e.clientX, y: e.clientY}
      this.finishPointer(s.active ? {x: e.clientX, y: e.clientY} : null)
    }
    const onCancel = (e: PointerEvent) => {
      const s = this.session
      if (!s || e.pointerId !== s.pointerId) return
      this.finishPointer(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.session) this.finishPointer(null)
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
      document.removeEventListener('scroll', this.onScroll, {capture: true})
      if (this.frame !== null) cancelAnimationFrame(this.frame)
    }
  }

  // -- keyboard -------------------------------------------------------------

  focusHandle(id: string) {
    const zone = this.items.get(id)?.zone
    if (zone !== undefined && this.stops.get(zone) !== id) {
      this.stops.set(zone, id)
      this.emit()
    }
  }

  private pick(id: string) {
    const item = this.items.get(id)
    if (!item || item.disabled || !item.el) return
    const order = this.captureOrder(id)
    const index = (order.get(item.zone) ?? []).filter(
      (other) => domOrder(this.items.get(other)!.el!, item.el!) < 0,
    ).length
    this.drag = {id, keyboard: true, over: {zone: item.zone, index}, refused: null, order}
    this.emit()
    const target = this.drag.over!
    const payload = this.payload(id)
    if (payload) this.props.onDragOver?.({item: payload, target, refused: null, keyboard: true})
    this.say({kind: 'pick', item: item.label, ...this.placeAt(target), keyboard: true})
  }

  private moveWithin(delta: number) {
    const d = this.drag
    if (!d?.over) return
    const others = d.order.get(d.over.zone)?.length ?? 0
    const index = Math.min(Math.max(d.over.index + delta, 0), others)
    const target = {zone: d.over.zone, index}
    this.retarget(target, null)
    this.say({kind: 'move', item: this.labelOf(d.id), ...this.placeAt(target), keyboard: true})
  }

  private moveAcross(delta: number) {
    const d = this.drag
    const payload = d && this.payload(d.id)
    if (!d?.over || !payload) return
    const zones = this.zoneSequence()
    let refused: DragDropRefusal | null = null
    for (let j = zones.indexOf(d.over.zone) + delta; j >= 0 && j < zones.length; j += delta) {
      const zoneId = zones[j]
      const verdict = verdictOf(this.zones.get(zoneId)?.accepts?.(payload))
      if (!verdict.ok) {
        if (verdict.reason !== undefined && !refused)
          refused = {zone: zoneId, reason: verdict.reason}
        continue
      }
      const others = d.order.get(zoneId)?.length ?? 0
      const target = {zone: zoneId, index: Math.min(d.over.index, others)}
      this.retarget(target, null)
      this.say({kind: 'move', item: this.labelOf(d.id), ...this.placeAt(target), keyboard: true})
      return
    }
    if (refused) {
      // Nowhere to go that way; say why, and stay put.
      this.drag = {...d, refused}
      this.refusalText = refused.reason
      this.emit()
      this.say({
        kind: 'refuse',
        item: this.labelOf(d.id),
        zone: this.zoneLabel(refused.zone),
        reason: refused.reason,
        keyboard: true,
      })
    } else {
      this.say({kind: 'move', item: this.labelOf(d.id), ...this.placeAt(d.over), keyboard: true})
    }
  }

  private endKeyboard(commit: boolean) {
    const d = this.drag
    if (!d?.keyboard) return
    const target = commit ? d.over : null
    const announcement = target ? this.placeAt(target) : null
    const payload = this.payload(d.id)
    this.drag = null
    this.refusalText = null
    this.focusRequest = d.id
    if (target) this.stops.set(target.zone, d.id)
    this.emit()
    if (target && payload && announcement) {
      this.props.onDrop({item: payload, target})
      this.say({kind: 'drop', item: this.labelOf(d.id), ...announcement, keyboard: true})
    } else {
      this.say({kind: 'cancel', item: this.labelOf(d.id), keyboard: true})
    }
  }

  /** Blur while picked (Tab away, a click elsewhere) cancels. */
  blurHandle(id: string) {
    if (this.drag?.keyboard && this.drag.id === id) this.endKeyboard(false)
  }

  private moveFocus(id: string, key: string): boolean {
    const zone = this.items.get(id)?.zone
    if (zone === undefined) return false
    const inZone = this.handlesIn(zone)
    const i = inZone.indexOf(id)
    let next: string | undefined
    if (key === 'ArrowUp') next = inZone[i - 1]
    else if (key === 'ArrowDown') next = inZone[i + 1]
    else if (key === 'Home') next = inZone[0]
    else if (key === 'End') next = inZone[inZone.length - 1]
    else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      const zones = this.zoneSequence().filter((z) => z === zone || this.handlesIn(z).length > 0)
      const other = zones[zones.indexOf(zone) + (key === 'ArrowRight' ? 1 : -1)]
      if (other !== undefined) {
        const there = this.handlesIn(other)
        next = there[Math.min(Math.max(i, 0), there.length - 1)]
      }
    } else return false
    if (next) this.handles.get(next)?.focus()
    return true
  }

  keyDown(id: string, e: KeyLike) {
    const d = this.drag
    if (d?.keyboard && d.id === id) {
      switch (e.key) {
        case 'ArrowUp':
          this.moveWithin(-1)
          break
        case 'ArrowDown':
          this.moveWithin(1)
          break
        case 'ArrowLeft':
          this.moveAcross(-1)
          break
        case 'ArrowRight':
          this.moveAcross(1)
          break
        case ' ':
        case 'Enter':
          this.endKeyboard(true)
          break
        case 'Escape':
          this.endKeyboard(false)
          break
        case 'Tab':
          this.endKeyboard(false)
          return
        default:
          return
      }
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (d || this.session) return
    if (e.key === ' ') {
      e.preventDefault()
      this.pick(id)
      return
    }
    if (this.moveFocus(id, e.key)) e.preventDefault()
  }
}

// ---------------------------------------------------------------------------
// Contexts and selectors
// ---------------------------------------------------------------------------

interface RootContextValue {
  readonly engine: Engine
  readonly instructionsId: string
}

const RootContext = createContext<RootContextValue | null>(null)

const useRoot = (part: string): RootContextValue => {
  const ctx = useContext(RootContext)
  if (!ctx) throw new Error(`DragDrop.${part} must be used within DragDrop.Root`)
  return ctx
}

function useSelect<R>(engine: Engine | null | undefined, select: (e: Engine) => R, fallback: R): R {
  const get = () => (engine ? select(engine) : fallback)
  return useSyncExternalStore(engine ? engine.subscribe : noopSubscribe, get, get)
}
const noopSubscribe = () => () => {}

interface ZoneContextValue {
  readonly id: string
  readonly list: boolean
}
const ZoneContext = createContext<ZoneContextValue | null>(null)

interface ItemContextValue {
  readonly id: string
  readonly zone: string
  readonly label: string
}
const ItemContext = createContext<ItemContextValue | null>(null)

/** True inside the ghost: its copy of the preview may hold Zones, Items and
 *  Handles, which must stay inert there — never registered, never focusable. */
const GhostContext = createContext(false)

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface DragDropRootProps<T = unknown> {
  /** Called when an item is released over a zone that accepts it (or dropped
   *  with Space/Enter). Reordering inside the item's own zone arrives here
   *  too, with the new index. */
  onDrop: (event: DragDropEvent<T>) => void
  /** Called whenever the target under the drag changes — a new zone or
   *  index, nothing, or a refusal. */
  onDragOver?: (event: DragDropOverEvent<T>) => void
  /** Supplies every live-region string (pick, move, drop, cancel, refuse),
   *  e.g. from the app's message catalog. Defaults to English. */
  announce?: (event: DragDropAnnouncement) => string
  /** What marks the insertion point in a zone while dragging; a Zone's own
   *  renderPlaceholder wins. Without one, only the zone lights up. */
  renderPlaceholder?: DragDropRenderPlaceholder
  /** Read by screen readers on a focused Handle. */
  instructions?: string
  children: ReactNode
}

const DEFAULT_INSTRUCTIONS = 'Press Space to pick up. Arrow keys move, Space drops, Escape cancels.'

function Root<T = unknown>({
  onDrop,
  onDragOver,
  announce,
  renderPlaceholder,
  instructions = DEFAULT_INSTRUCTIONS,
  children,
}: DragDropRootProps<T>) {
  const [engine] = useState(() => new Engine())
  const instructionsId = useId()

  useLayoutEffect(() => {
    engine.props = {
      onDrop: onDrop as LatestProps['onDrop'],
      onDragOver: onDragOver as LatestProps['onDragOver'],
      announce,
      renderPlaceholder,
    }
  })

  useEffect(() => engine.attach(), [engine])

  const value = useMemo<RootContextValue>(
    () => ({engine, instructionsId}),
    [engine, instructionsId],
  )

  return (
    <RootContext.Provider value={value}>
      {children}
      <Ghost engine={engine} />
      <LiveRegion engine={engine} />
      <Instructions engine={engine} id={instructionsId} text={instructions} />
    </RootContext.Provider>
  )
}

function LiveRegion({engine}: {engine: Engine}) {
  const text = useSelect(engine, (e) => e.announcement, '')
  return (
    <html.div role="status" aria-live="polite" aria-atomic style={visuallyHidden.base}>
      {text}
    </html.div>
  )
}

/** The handles' description; rendered only while a Handle exists, so a
 *  pointer-only board carries no stray text. */
function Instructions({engine, id, text}: {engine: Engine; id: string; text: string}) {
  const any = useSelect(engine, (e) => e.handles.size > 0, false)
  if (!any) return null
  return (
    <html.div id={id} style={visuallyHidden.base}>
      {text}
    </html.div>
  )
}

function Ghost({engine}: {engine: Engine}) {
  const ghost = useSelect(engine, (e) => e.ghost, null)
  const refusal = useSelect(engine, (e) => (e.ghost ? e.refusalText : null), null)
  const ref = useRef<HTMLElement | null>(null)
  // The ghost renders in the ThemeProvider mount: inline, a Dialog's
  // transformed, overflow-clipped panel would clip and offset it.
  const mount = usePortalMount()

  useLayoutEffect(() => {
    engine.ghostEl = ref.current
    engine.paintGhost()
    return () => {
      engine.ghostEl = null
    }
  }, [engine, ghost])

  if (!ghost) return null
  const node = (
    <html.div
      ref={ref as never}
      aria-hidden
      style={[styles.ghost, styles.ghostSize(ghost.width, ghost.height)]}
    >
      <html.div style={styles.ghostTilt}>
        <GhostContext.Provider value>{ghost.preview}</GhostContext.Provider>
      </html.div>
      {refusal !== null && <html.div style={styles.refusal}>{refusal}</html.div>}
    </html.div>
  )
  return mount ? createPortal(node, mount) : node
}

function Placeholder({engine, zone, index}: {engine: Engine; zone: string; index: number}) {
  const record = engine.zones.get(zone)
  const render = record?.renderPlaceholder ?? engine.props.renderPlaceholder
  const ref = useRef<HTMLElement | null>(null)
  // A keyboard move keeps the insertion point in view.
  useEffect(() => {
    if (engine.drag?.keyboard) ref.current?.scrollIntoView?.({block: 'nearest', inline: 'nearest'})
  }, [engine, zone, index])
  if (!render) return null
  return (
    <html.div ref={ref as never} aria-hidden style={styles.placeholder}>
      {render({zone, index, label: record?.label ?? zone})}
    </html.div>
  )
}

// ---------------------------------------------------------------------------
// Zone
// ---------------------------------------------------------------------------

export interface DragDropZoneProps<T = unknown> {
  id: string
  /** Read to screen readers when an item moves or drops here; the list's
   *  accessible name with `list`. */
  label: string
  /** Which axis items flow along; decides how the insertion index is read
   *  from the pointer. */
  orientation?: 'horizontal' | 'vertical'
  /** Take the item (`true`), let it pass to an outer zone (`false`), or
   *  refuse it with a reason that is shown and announced
   *  (`{ok: false, reason}`). Omitted: every item is taken. */
  accepts?: (item: DragDropItemData<T>) => DragDropVerdict
  /** Keyboard order across zones (Left/Right); zones without one follow, in
   *  DOM order. */
  order?: number
  /** Marks the insertion point in this zone; overrides the Root's. */
  renderPlaceholder?: DragDropRenderPlaceholder
  /** Render the zone as a labelled list (`role="list"`) laid out along
   *  `orientation`, its Items as list items. Put the Items directly in it. */
  list?: boolean
  /** Gap between the Items of a `list` zone. */
  gap?: SpacingToken
  /** Stretch to fill the parent (a Timeline bar, a card) instead of sizing
   *  to the content. */
  fill?: boolean
  children: ReactNode
}

const gapMap = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  ms: styles.gapMs,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
  xxl: styles.gapXxl,
  xxxl: styles.gapXxxl,
} as const satisfies Record<SpacingToken, unknown>

function Zone<T = unknown>({
  id,
  label,
  orientation = 'horizontal',
  accepts,
  order,
  renderPlaceholder,
  list = false,
  gap = 'sm',
  fill = false,
  children,
}: DragDropZoneProps<T>) {
  const {engine} = useRoot('Zone')
  const inGhost = useContext(GhostContext)
  const ref = useRef<HTMLDivElement>(null)
  const [record] = useState<ZoneRecord>(() => ({el: null, orientation, label}))

  // The record is read at drag time, so the latest props land on it after
  // every render without re-registering.
  useEffect(() => {
    record.orientation = orientation
    record.label = label
    record.accepts = accepts as ZoneRecord['accepts']
    record.order = order
    record.renderPlaceholder = renderPlaceholder
  })

  useEffect(() => {
    if (isNative || inGhost) return
    record.el = ref.current
    return engine.registerZone(id, record)
  }, [engine, id, record, inGhost])

  const dragging = useSelect(engine, (e) => e.drag !== null, false)
  const over = useSelect(engine, (e) => e.drag?.over?.zone === id, false)
  const refused = useSelect(engine, (e) => e.drag?.refused?.zone === id, false)
  const placeholderAtEnd = useSelect(
    engine,
    (e) => {
      const d = e.drag
      if (!d?.over || d.over.zone !== id) return -1
      const n = d.order.get(id)?.length ?? 0
      return d.over.index >= n ? d.over.index : -1
    },
    -1,
  )
  const zoneContext = useMemo(() => ({id, list}), [id, list])

  return (
    <ZoneContext.Provider value={zoneContext}>
      <html.div
        ref={ref}
        role={list ? 'list' : undefined}
        aria-label={list ? label : undefined}
        style={[
          styles.zone,
          list && (orientation === 'vertical' ? styles.listVertical : styles.listHorizontal),
          list && gapMap[gap],
          fill && styles.fill,
          dragging && styles.zoneReady,
          over && styles.zoneOver,
          refused && styles.zoneRefused,
        ]}
      >
        {children}
        {placeholderAtEnd >= 0 && (
          <Placeholder engine={engine} zone={id} index={placeholderAtEnd} />
        )}
      </html.div>
    </ZoneContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export interface DragDropItemProps<T = unknown> {
  id: string
  /** The zone this item currently lives in. */
  zone: string
  /** Read to screen readers when picked up or dropped; a Handle's default
   *  accessible name. */
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
  const {engine} = useRoot('Item')
  const zoneCtx = useContext(ZoneContext)
  const inGhost = useContext(GhostContext)
  const ref = useRef<HTMLDivElement>(null)
  const [record] = useState<ItemRecord>(() => ({
    el: null,
    zone,
    label,
    data,
    preview: null,
    disabled,
  }))

  // Registration depends on the id only; what changes from render to render
  // (data, the preview, the children) is copied onto the record instead.
  useEffect(() => {
    record.zone = zone
    record.label = label
    record.data = data
    record.preview = preview ?? children
    record.disabled = disabled
  })

  useEffect(() => {
    if (isNative || inGhost) return
    record.el = ref.current
    return engine.registerItem(id, record)
  }, [engine, id, record, inGhost])

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
      engine.begin(id, e)
    },
    [engine, disabled, id],
  )

  const lifted = useSelect(engine, (e) => e.drag?.id === id, false)
  const placeholderBefore = useSelect(
    engine,
    (e) => {
      const d = e.drag
      if (!d?.over || d.over.zone !== zone) return -1
      return d.order.get(zone)?.[d.over.index] === id ? d.over.index : -1
    },
    -1,
  )
  const itemContext = useMemo(() => ({id, zone, label}), [id, zone, label])

  if (isNative) return <>{children}</>

  return (
    <ItemContext.Provider value={itemContext}>
      {placeholderBefore >= 0 && (
        <Placeholder engine={engine} zone={zone} index={placeholderBefore} />
      )}
      <html.div
        ref={ref}
        role={zoneCtx?.list && zoneCtx.id === zone ? 'listitem' : undefined}
        onPointerDown={onPointerDown}
        style={[styles.item, disabled && styles.itemDisabled, lifted && styles.itemLifted]}
      >
        {children}
      </html.div>
    </ItemContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Handle
// ---------------------------------------------------------------------------

export interface DragDropHandleProps {
  /** Defaults to the Item's label. */
  'aria-label'?: string
  /** What the handle shows: a grip, or the item's whole face. Keep other
   *  controls out of it — a handle is one widget. */
  children: ReactNode
}

/**
 * The keyboard path into an Item: one focusable widget (`role="button"`) per
 * item, a roving tab stop per zone. Space picks the item up, the arrow keys
 * move it, Space or Enter drops it, Escape cancels.
 */
function Handle({'aria-label': ariaLabel, children}: DragDropHandleProps) {
  const {engine, instructionsId} = useRoot('Handle')
  const item = useContext(ItemContext)
  const inGhost = useContext(GhostContext)
  if (!item && !inGhost) throw new Error('DragDrop.Handle must be used within DragDrop.Item')
  const ref = useRef<HTMLDivElement>(null)
  const id = item?.id ?? ''
  const zone = item?.zone ?? ''
  const label = item?.label ?? ''

  useEffect(() => {
    const el = ref.current
    if (!el || isNative || inGhost) return
    return engine.registerHandle(id, el)
  }, [engine, id, zone, inGhost])

  const tabStop = useSelect(engine, (e) => e.tabStop(zone) === id, false)
  const picked = useSelect(engine, (e) => e.drag?.keyboard === true && e.drag.id === id, false)
  const wantsFocus = useSelect(engine, (e) => e.focusRequest === id, false)

  useEffect(() => {
    if (!wantsFocus) return
    engine.focusRequest = null
    ref.current?.focus()
  }, [engine, wantsFocus])

  if (isNative || inGhost) return <>{children}</>

  return (
    <html.div
      ref={ref}
      role="button"
      tabIndex={tabStop || picked ? 0 : -1}
      aria-label={ariaLabel ?? label}
      aria-describedby={instructionsId}
      onKeyDown={(e: unknown) => engine.keyDown(id, e as KeyLike)}
      onFocus={() => engine.focusHandle(id)}
      onBlur={() => engine.blurHandle(id)}
      style={[styles.handle, picked && styles.handlePicked]}
    >
      {children}
    </html.div>
  )
}

/** Current drag, for consumers that render their own placeholder or ghost. */
export function useDragDrop(): {
  readonly dragging: string | null
  readonly over: DragDropTarget | null
  readonly refused: DragDropRefusal | null
  readonly keyboard: boolean
} {
  const engine = useContext(RootContext)?.engine
  const dragging = useSelect(engine, (e) => e.drag?.id ?? null, null)
  const over = useSelect(engine, (e) => e.drag?.over ?? null, null)
  const refused = useSelect(engine, (e) => e.drag?.refused ?? null, null)
  const keyboard = useSelect(engine, (e) => e.drag?.keyboard ?? false, false)
  return {dragging, over, refused, keyboard}
}

export const DragDrop = {Root, Zone, Item, Handle}
