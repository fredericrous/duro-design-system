import {
  Fragment,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import {html} from 'react-strict-dom'
import {numberDiffLines, splitDiffLines, type DiffLineInfo, type DiffLineRole} from './diffRoles'
import {styles} from './styles.css'
import type {CodeBlockLineAction} from './types'

const roleStyle = {
  added: styles.added,
  removed: styles.removed,
  hunk: styles.hunk,
  context: undefined,
} as const satisfies Record<DiffLineRole, unknown>

const inHunk = (line: DiffLineInfo) => line.oldLine !== null || line.newLine !== null

/**
 * A diff as rows rather than one `pre`, for when lines carry an action or
 * content under them (a pre holds text only). Each row is a gutter and the
 * line; content after a line spans the row. The gutter is one tab stop: the
 * active line's button takes Tab, Up and Down move between the buttons.
 */
export function DiffRows({
  text,
  lineAction,
  renderAfterLine,
}: {
  text: string
  lineAction?: CodeBlockLineAction
  renderAfterLine?: (line: DiffLineInfo) => ReactNode
}) {
  const lines = useMemo(() => numberDiffLines(splitDiffLines(text)), [text])
  const available = lineAction?.available ?? inHunk
  const actionable = useMemo(
    () => (lineAction ? lines.filter((line) => available(line)).map((line) => line.index) : []),
    [available, lineAction, lines],
  )
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const active =
    activeIndex !== null && actionable.includes(activeIndex) ? activeIndex : (actionable[0] ?? null)
  // Structural, so the native build (no DOM lib) types it too; focus exists only on the web.
  const buttons = useRef(new Map<number, {focus?: () => void}>())

  const move = (from: number, step: 1 | -1) => {
    const position = actionable.indexOf(from) + step
    const next = actionable[position]
    if (next === undefined) return
    setActiveIndex(next)
    buttons.current.get(next)?.focus?.()
  }
  const onKeyDown = (line: DiffLineInfo) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    move(line.index, event.key === 'ArrowDown' ? 1 : -1)
  }

  return (
    <Fragment>
      {lines.map((line) => {
        const after = renderAfterLine?.(line)
        const offered = lineAction !== undefined && actionable.includes(line.index)
        return (
          <Fragment key={line.index}>
            <html.div data-diff-line={line.role} style={[styles.row, roleStyle[line.role]]}>
              {lineAction ? (
                <html.span style={styles.gutter}>
                  {offered ? (
                    <html.button
                      type="button"
                      ref={(node: {focus?: () => void} | null) => {
                        if (node) buttons.current.set(line.index, node)
                        else buttons.current.delete(line.index)
                      }}
                      aria-label={lineAction.label(line)}
                      tabIndex={line.index === active ? 0 : -1}
                      onFocus={() => setActiveIndex(line.index)}
                      onKeyDown={onKeyDown(line) as ComponentProps<typeof html.button>['onKeyDown']}
                      onClick={() => lineAction.onAction(line)}
                      style={styles.lineAction}
                    >
                      +
                    </html.button>
                  ) : null}
                </html.span>
              ) : null}
              <html.span style={styles.rowText}>{line.text}</html.span>
            </html.div>
            {after ? <html.div style={styles.after}>{after}</html.div> : null}
          </Fragment>
        )
      })}
    </Fragment>
  )
}
