// Pure date arithmetic behind Time: no React, no react-strict-dom, so the
// unit project tests it in Node.

export interface RelativeOptions {
  /**
   * The instant to measure from. Required: read the clock once where the data
   * is loaded (a route loader) and pass the same value to the server and the
   * client render, so both produce the same text. Never `Date.now()` during a
   * render — the client would hydrate a different string.
   */
  now: Date | number
  /** BCP 47 locale(s) for the words ("3 days ago", "il y a 3 jours"). */
  locale: string | readonly string[]
  /**
   * `auto` (default) says "yesterday" / "tomorrow" / "now" where the locale has
   * a word for it; `always` keeps the number ("1 day ago").
   */
  numeric?: 'auto' | 'always'
}

type Step = readonly [Intl.RelativeTimeFormatUnit, number]

// Each unit is used while |difference| stays below the next one. Months and
// years are average lengths: a relative label is a rounded reading, the
// exact instant goes in the dateTime attribute.
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30.436875 * DAY
const YEAR = 365.2425 * DAY

const STEPS: readonly Step[] = [
  ['second', SECOND],
  ['minute', MINUTE],
  ['hour', HOUR],
  ['day', DAY],
  ['week', WEEK],
  ['month', MONTH],
  ['year', YEAR],
]

const LIMITS: Record<Intl.RelativeTimeFormatUnit, number> = {
  second: MINUTE,
  seconds: MINUTE,
  minute: HOUR,
  minutes: HOUR,
  hour: DAY,
  hours: DAY,
  day: WEEK,
  days: WEEK,
  week: MONTH,
  weeks: MONTH,
  month: YEAR,
  months: YEAR,
  quarter: Infinity,
  quarters: Infinity,
  year: Infinity,
  years: Infinity,
}

function toTime(value: Date | number | string): number {
  return typeof value === 'number' ? value : new Date(value).getTime()
}

/**
 * How far `date` is from `now`, in words, in the caller's locale:
 * `relative(lastCommit, {now, locale: 'en'})` → "3 days ago". Built on
 * `Intl.RelativeTimeFormat`; the largest unit that keeps the count at least 1
 * is used, rounded to the nearest whole unit.
 *
 * An unparseable date throws a `RangeError` (as `Intl` does): check the data
 * before rendering it.
 */
export function relative(date: Date | number | string, options: RelativeOptions): string {
  const {now, locale, numeric = 'auto'} = options
  const target = toTime(date)
  const from = toTime(now)
  if (!Number.isFinite(target) || !Number.isFinite(from)) {
    throw new RangeError(`relative: invalid date ${String(date)}`)
  }
  const diff = target - from
  const [unit, size] =
    STEPS.find(([unit]) => Math.abs(diff) < LIMITS[unit]) ?? STEPS[STEPS.length - 1]
  // `+ 0` turns a -0 into 0, so "now" is not "0 seconds ago" in `always` mode.
  const value = Math.round(diff / size) + 0
  return new Intl.RelativeTimeFormat(locale as string | string[], {numeric}).format(value, unit)
}
