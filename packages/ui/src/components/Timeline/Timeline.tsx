import {createContext, useContext, useMemo, type ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {DragDrop, type DragDropItemData, type DragDropVerdict} from '../DragDrop/DragDrop'
import {styles} from './styles.css'

// ---------------------------------------------------------------------------
// Timeline — rows of date bars against a date axis: milestones, releases,
// sprints. Dates are calendar days ('YYYY-MM-DD', read as UTC) so a bar
// never shifts with the viewer's time zone.
//
// A bar is a toggle button (select it) with a progress fill, and can be a
// DragDrop.Zone target (`dropZone`) inside a DragDrop.Root. Its two edges are
// sliders whose value text is a date: Left/Right move a day, PageUp/PageDown
// a week, Home/End to the limit. They are keyboard-only — there is no
// pointer drag of an edge.
// ---------------------------------------------------------------------------

/** A calendar day, 'YYYY-MM-DD'. */
export type TimelineDate = string

const DAY_MS = 86_400_000

const dayOf = (date: TimelineDate): number => Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS)
const dateOf = (day: number): TimelineDate => new Date(day * DAY_MS).toISOString().slice(0, 10)

interface TimelineContextValue {
  readonly first: number
  readonly days: number
  readonly today: number | null
  readonly todayLabel: string
  readonly formatDate: (date: TimelineDate) => string
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

const useTimeline = (part: string) => {
  const ctx = useContext(TimelineContext)
  if (!ctx) throw new Error(`Timeline.${part} must be used within Timeline.Root`)
  return ctx
}

/** Percent of the axis from its first day to `day`. */
const at = (ctx: TimelineContextValue, day: number) => ((day - ctx.first) / ctx.days) * 100

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface TimelineRootProps {
  /** First day on the axis. */
  start: TimelineDate
  /** Last day on the axis (included). */
  end: TimelineDate
  /** Draws the today marker when inside the range. */
  today?: TimelineDate
  /** The timeline's accessible name. */
  'aria-label': string
  /** Text above the row labels, e.g. "Milestones". */
  heading?: ReactNode
  /** The today marker's text. */
  todayLabel?: string
  /** BCP 47 locale for the default date format. */
  locale?: string
  /** Formats a day for the axis and the edge sliders' value text. */
  formatDate?: (date: TimelineDate) => string
  children: ReactNode
}

function Root({
  start,
  end,
  today,
  'aria-label': ariaLabel,
  heading,
  todayLabel = 'Today',
  locale,
  formatDate,
  children,
}: TimelineRootProps) {
  const ctx = useMemo<TimelineContextValue>(() => {
    const first = dayOf(start)
    const days = Math.max(dayOf(end) - first + 1, 1)
    const t = today === undefined ? null : dayOf(today)
    return {
      first,
      days,
      today: t !== null && t >= first && t < first + days ? t : null,
      todayLabel,
      formatDate:
        formatDate ??
        ((date) =>
          new Date(`${date}T00:00:00Z`).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            timeZone: 'UTC',
          })),
    }
  }, [start, end, today, todayLabel, locale, formatDate])

  // Daily ticks for up to three weeks, weekly beyond.
  const step = ctx.days > 21 ? 7 : 1
  const ticks: number[] = []
  for (let d = ctx.first; d < ctx.first + ctx.days; d += step) ticks.push(d)

  return (
    <TimelineContext.Provider value={ctx}>
      <html.div role="group" aria-label={ariaLabel} style={styles.root}>
        <html.div style={styles.heading}>{heading}</html.div>
        <html.div aria-hidden style={styles.axis}>
          {ticks.map((d) => (
            <html.span key={d} style={[styles.tick, styles.left(at(ctx, d))]}>
              {ctx.formatDate(dateOf(d))}
            </html.span>
          ))}
          {ctx.today !== null && (
            <html.span style={[styles.todayLabel, styles.left(at(ctx, ctx.today + 0.5))]}>
              {todayLabel}
            </html.span>
          )}
        </html.div>
        {children}
      </html.div>
    </TimelineContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

export interface TimelineRowProps {
  /** The row's name, shown in the label column. */
  label: string
  /** A second line under the label, e.g. "4 of 7 done". */
  description?: ReactNode
  children?: ReactNode
}

function Row({label, description, children}: TimelineRowProps) {
  const ctx = useTimeline('Row')
  return (
    <>
      <html.div style={styles.label}>
        <html.span style={styles.labelText}>{label}</html.span>
        {description !== undefined && (
          <html.span style={styles.labelDescription}>{description}</html.span>
        )}
      </html.div>
      <html.div role="group" aria-label={label} style={styles.track}>
        {ctx.today !== null && (
          <html.div aria-hidden style={[styles.today, styles.left(at(ctx, ctx.today + 0.5))]} />
        )}
        {children}
      </html.div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Bar
// ---------------------------------------------------------------------------

export interface TimelineBarDropZone<T = unknown> {
  /** The DragDrop zone id; drops arrive in the Root's onDrop with it. */
  id: string
  /** Read to screen readers when an item moves or drops here. */
  label: string
  accepts?: (item: DragDropItemData<T>) => DragDropVerdict
}

export interface TimelineBarProps<T = unknown> {
  start: TimelineDate
  end: TimelineDate
  /** The bar's accessible name. */
  label: string
  /** Done fraction, 0–1, drawn as a fill from the start edge. */
  progress?: number
  /** `planned` draws a dashed outline; `done` the success tone. */
  tone?: 'default' | 'planned' | 'done'
  /** Makes the bar a toggle button (aria-pressed). */
  selected?: boolean
  onSelect?: () => void
  /** Adds the start-edge slider. */
  onStartChange?: (date: TimelineDate) => void
  /** Adds the end-edge slider. */
  onEndChange?: (date: TimelineDate) => void
  /** Names of the edge sliders; default "<label>, start" / "<label>, end". */
  startLabel?: string
  endLabel?: string
  /** Makes the bar a DragDrop.Zone (needs a DragDrop.Root above). */
  dropZone?: TimelineBarDropZone<T>
  /** Text inside the bar, e.g. "4/7". */
  children?: ReactNode
}

const toneStyle = {
  default: null,
  planned: styles.barPlanned,
  done: styles.barDone,
} as const

function Bar<T = unknown>({
  start,
  end,
  label,
  progress,
  tone = 'default',
  selected,
  onSelect,
  onStartChange,
  onEndChange,
  startLabel,
  endLabel,
  dropZone,
  children,
}: TimelineBarProps<T>) {
  const ctx = useTimeline('Bar')
  const s = dayOf(start)
  const e = dayOf(end)
  const left = at(ctx, s)
  const width = ((e - s + 1) / ctx.days) * 100
  const last = ctx.first + ctx.days - 1

  const face = (
    <>
      <html.button
        type="button"
        aria-label={label}
        aria-pressed={selected}
        onClick={onSelect}
        style={[styles.face, toneStyle[tone], selected === true && styles.faceSelected]}
      >
        {progress !== undefined && progress > 0 && (
          <html.span
            aria-hidden
            style={[
              styles.fill,
              tone === 'done' && styles.fillDone,
              styles.width(Math.min(Math.max(progress, 0), 1) * 100),
            ]}
          />
        )}
        {children !== undefined && <html.span style={styles.barText}>{children}</html.span>}
      </html.button>
      {onStartChange && (
        <EdgeSlider
          edge="start"
          label={startLabel ?? `${label}, start`}
          day={s}
          min={ctx.first}
          max={e}
          onChange={onStartChange}
        />
      )}
      {onEndChange && (
        <EdgeSlider
          edge="end"
          label={endLabel ?? `${label}, end`}
          day={e}
          min={s}
          max={last}
          onChange={onEndChange}
        />
      )}
    </>
  )

  return (
    <html.div style={[styles.bar, styles.left(left), styles.width(width)]}>
      {dropZone ? (
        <DragDrop.Zone<T> id={dropZone.id} label={dropZone.label} accepts={dropZone.accepts} fill>
          {face}
        </DragDrop.Zone>
      ) : (
        face
      )}
    </html.div>
  )
}

function EdgeSlider({
  edge,
  label,
  day,
  min,
  max,
  onChange,
}: {
  edge: 'start' | 'end'
  label: string
  day: number
  min: number
  max: number
  onChange: (date: TimelineDate) => void
}) {
  const ctx = useTimeline('Bar')
  const onKeyDown = (event: unknown) => {
    const e = event as {key: string; preventDefault(): void}
    const by: Record<string, number> = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -7,
      PageUp: 7,
    }
    let next: number
    if (e.key in by) next = day + by[e.key]
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    else return
    e.preventDefault()
    next = Math.min(Math.max(next, min), max)
    if (next !== day) onChange(dateOf(next))
  }
  return (
    <html.div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={min - ctx.first}
      aria-valuemax={max - ctx.first}
      aria-valuenow={day - ctx.first}
      aria-valuetext={ctx.formatDate(dateOf(day))}
      onKeyDown={onKeyDown}
      style={[styles.edge, edge === 'start' ? styles.edgeStart : styles.edgeEnd]}
    />
  )
}

export const Timeline = {Root, Row, Bar}
