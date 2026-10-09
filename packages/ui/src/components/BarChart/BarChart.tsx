import {html} from 'react-strict-dom'
import {visuallyHidden} from '../../styles/visually-hidden.css'
import {niceScale} from './scale'
import {styles} from './styles.css'

// ---------------------------------------------------------------------------
// BarChart — stacked bars, vertical (one column per datum) or row (one bar
// per datum). Series are named in a visible legend, not by colour alone
// (WCAG 1.4.1); segment fills are solid tone tokens that hold 3:1 against the
// card (1.4.11). The drawing is role="img" with the aria-label; the data
// table sits BESIDE it, never inside it (children of an img are
// presentational, so a table in there would be hidden from assistive tech).
// ---------------------------------------------------------------------------

export type BarChartTone = 'success' | 'error' | 'warning' | 'info' | 'muted'

export interface BarChartSeries {
  key: string
  label: string
  tone: BarChartTone
}

export interface BarChartDatum {
  label: string
  values: Record<string, number>
  /** No data for this entry: drawn as a gap labelled "no report". */
  missing?: boolean
}

export interface BarChartProps {
  series: BarChartSeries[]
  data: BarChartDatum[]
  /** Defaults to vertical. */
  orientation?: 'vertical' | 'row'
  /** Show every nth axis label (vertical); defaults to 1. */
  labelEvery?: number
  /** 'last' prints the last bar's numbers; defaults to 'none'. */
  emphasis?: 'last' | 'none'
  /** The accessible name of the drawing. */
  'aria-label': string
  /** Header of the data table's first column (what each bar is: "Day", "Queue"); without it that corner is an empty cell. */
  categoryLabel?: string
}

const toneStyle = {
  success: styles.success,
  error: styles.error,
  warning: styles.warning,
  info: styles.info,
  muted: styles.muted,
} as const

const NO_REPORT = 'no report'

function valueOf(datum: BarChartDatum, key: string): number {
  const value = datum.values[key]
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function totalOf(datum: BarChartDatum, series: BarChartSeries[]): number {
  return series.reduce((sum, s) => sum + valueOf(datum, s.key), 0)
}

function numbersOf(datum: BarChartDatum, series: BarChartSeries[]): string {
  return series.map((s) => String(datum.values[s.key] ?? 0)).join(' / ')
}

export function BarChart({
  series,
  data,
  orientation = 'vertical',
  labelEvery = 1,
  emphasis = 'none',
  'aria-label': ariaLabel,
  categoryLabel,
}: BarChartProps) {
  const max = data.reduce((m, d) => (d.missing ? m : Math.max(m, totalOf(d, series))), 0)
  const scale = niceScale(max)
  const every = Math.max(1, Math.floor(labelEvery))
  const lastIndex = data.length - 1

  const legend = (
    <html.div style={styles.legend}>
      {series.map((s) => (
        <html.span key={s.key} style={styles.legendItem}>
          <html.span style={[styles.swatch, toneStyle[s.tone]]} />
          <html.span style={styles.text}>{s.label}</html.span>
        </html.span>
      ))}
    </html.div>
  )

  // An ARIA table (react-strict-dom has no table elements), as a sibling of
  // the role="img" drawing, clipped off screen.
  const table = (
    <html.div
      role="table"
      aria-label={`${ariaLabel}, data`}
      style={[visuallyHidden.base, visuallyHidden.text]}
    >
      <html.div role="rowgroup">
        <html.div role="row">
          {categoryLabel ? (
            <html.span role="columnheader">{categoryLabel}</html.span>
          ) : (
            <html.span role="cell" />
          )}
          {series.map((s) => (
            <html.span key={s.key} role="columnheader">
              {s.label}
            </html.span>
          ))}
        </html.div>
      </html.div>
      <html.div role="rowgroup">
        {data.map((d, i) => (
          <html.div key={`${i}-${d.label}`} role="row">
            <html.span role="rowheader">{d.label}</html.span>
            {series.map((s) => (
              <html.span key={s.key} role="cell">
                {d.missing ? NO_REPORT : String(d.values[s.key] ?? 0)}
              </html.span>
            ))}
          </html.div>
        ))}
      </html.div>
    </html.div>
  )

  const drawing =
    orientation === 'row' ? (
      <html.div role="img" aria-label={ariaLabel} style={styles.rows}>
        {data.map((d, i) => {
          const showNumbers = emphasis === 'last' && i === lastIndex
          return (
            <html.div key={`${i}-${d.label}`} style={styles.row}>
              <html.span style={[styles.text, styles.rowLabel]}>{d.label}</html.span>
              <html.div style={styles.rowTrack}>
                {d.missing ? (
                  <html.span style={styles.text}>{NO_REPORT}</html.span>
                ) : (
                  series.map((s) => {
                    const v = valueOf(d, s.key)
                    return v > 0 ? (
                      <html.div
                        key={s.key}
                        style={[
                          styles.rowSegment,
                          toneStyle[s.tone],
                          styles.rowSegmentAt((v / scale.top) * 100),
                        ]}
                      />
                    ) : null
                  })
                )}
              </html.div>
              <html.span style={[styles.text, styles.rowValue, showNumbers && styles.textStrong]}>
                {d.missing ? '' : showNumbers ? numbersOf(d, series) : String(totalOf(d, series))}
              </html.span>
            </html.div>
          )
        })}
      </html.div>
    ) : (
      <html.div role="img" aria-label={ariaLabel} style={styles.root}>
        <html.div style={styles.plot}>
          {scale.gridlines.map((g) => (
            <html.div key={g} style={[styles.gridline, styles.gridlineAt((g / scale.top) * 100)]}>
              <html.span style={[styles.text, styles.gridLabel]}>{String(g)}</html.span>
            </html.div>
          ))}
          <html.div style={styles.bars}>
            {data.map((d, i) => {
              const emphasised = emphasis === 'last' && i === lastIndex
              return (
                <html.div key={`${i}-${d.label}`} style={styles.slot}>
                  {emphasised && !d.missing ? (
                    <html.span style={[styles.text, styles.textStrong]}>
                      {numbersOf(d, series)}
                    </html.span>
                  ) : null}
                  {d.missing ? (
                    <html.div style={styles.gap}>
                      <html.span style={styles.text}>{NO_REPORT}</html.span>
                    </html.div>
                  ) : (
                    <html.div
                      style={[styles.stack, styles.stackAt((totalOf(d, series) / scale.top) * 100)]}
                    >
                      {series.map((s) => {
                        const total = totalOf(d, series)
                        const v = valueOf(d, s.key)
                        return v > 0 ? (
                          <html.div
                            key={s.key}
                            style={[
                              styles.segment,
                              toneStyle[s.tone],
                              styles.segmentAt((v / total) * 100),
                            ]}
                          />
                        ) : null
                      })}
                    </html.div>
                  )}
                </html.div>
              )
            })}
          </html.div>
        </html.div>
        <html.div style={styles.axis}>
          {data.map((d, i) => (
            <html.div key={`${i}-${d.label}`} style={styles.axisCell}>
              {i % every === 0 ? (
                <html.span style={[styles.text, styles.axisLabel]}>{d.label}</html.span>
              ) : null}
            </html.div>
          ))}
        </html.div>
      </html.div>
    )

  return (
    <html.div style={styles.root}>
      {legend}
      {drawing}
      {table}
    </html.div>
  )
}
