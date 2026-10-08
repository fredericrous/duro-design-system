import type {ReactNode} from 'react'

interface TimeProps {
  /**
   * The instant, machine-readable: a `Date` (written as its ISO string) or an
   * ISO 8601 string, which is passed through unchanged.
   */
  dateTime: Date | string
  /**
   * The exact date and time, shown on hover ("8 October 2026, 14:03 UTC"),
   * formatted by you in the reader's locale.
   */
  title?: string
  /** What the reader sees: a relative label from `relative()`, or a date. */
  children: ReactNode
}

/**
 * Time — a date or time in running text as a `<time>` element: the visible
 * text is yours (often `relative(date, {now, locale})`), the exact instant
 * goes in `dateTime` for machines and `title` for people.
 *
 * Web only. A raw `<time>`: react-strict-dom has no `html.time`, and the
 * element carries no style of its own (it inherits the text around it).
 */
export function Time({dateTime, title, children}: TimeProps) {
  const iso = typeof dateTime === 'string' ? dateTime : dateTime.toISOString()
  return (
    <time dateTime={iso} title={title}>
      {children}
    </time>
  )
}
