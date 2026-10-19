import {Fragment} from 'react'
import {html} from 'react-strict-dom'
import {splitDiffLines, type DiffLineRole} from './diffRoles'
import {styles} from './styles.css'

const roleStyle = {
  added: styles.added,
  removed: styles.removed,
  hunk: styles.hunk,
  context: undefined,
} as const satisfies Record<DiffLineRole, unknown>

/**
 * The lines of a unified diff, each tagged with its role (`data-diff-line`)
 * and coloured from the success, error and info subtle tokens. The `+`/`-`
 * characters stay in the text, so colour is never the only signal.
 */
export function DiffLines({text}: {text: string}) {
  return (
    <Fragment>
      {splitDiffLines(text).map((line, index) => (
        <html.span
          key={index}
          data-diff-line={line.role}
          style={[styles.line, roleStyle[line.role]]}
        >
          {line.text}
        </html.span>
      ))}
    </Fragment>
  )
}
