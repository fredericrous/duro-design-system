import type {ReactNode} from 'react'
import type {DiffLineInfo} from './diffRoles'

export type {DiffLineInfo} from './diffRoles'

/** An action offered on diff lines (comment on a line, link to it). */
export interface CodeBlockLineAction {
  /** The button's accessible name for a line ("Comment on line 12"), from your text catalog. */
  label: (line: DiffLineInfo) => string
  onAction: (line: DiffLineInfo) => void
  /** Which lines offer it. Default: every line inside a hunk (one with a line number). */
  available?: (line: DiffLineInfo) => boolean
}

export interface CodeBlockProps {
  /**
   * The code: text, or the `<code>` element a Markdown renderer produced
   * (highlighted spans included). What is copied is its text content.
   */
  children: ReactNode
  /**
   * The code's language ("diff", "ts"), exposed as `data-language` on the
   * `pre`. `"diff"` also gives each added (`+`), removed (`-`) and hunk (`@@`)
   * line its own colour; what is copied stays the raw text. Diff rendering
   * works on the text content, so highlighted spans inside `children` are
   * flattened to plain text. The language is a data attribute only: it is not
   * announced to assistive technology.
   */
  language?: string
  /** The copy button's label ("Copy"), from your text catalog. */
  copyLabel: string
  /**
   * The label while the copy is confirmed ("Copied"), also announced to
   * screen readers.
   */
  copiedLabel: string
  /** How long the confirmation stays, in milliseconds. Default 2000. */
  copiedDuration?: number
  /** Called when the clipboard refuses the write (an insecure context, a denied permission). */
  onCopyError?: (error: unknown) => void
  /**
   * With `language="diff"`: a button in a gutter beside each line it is
   * available on. The gutter is one tab stop; Up and Down move between its
   * buttons.
   */
  lineAction?: CodeBlockLineAction
  /**
   * With `language="diff"`: content shown under a line, full width (a comment
   * thread, an editor). Return null for lines with nothing under them. What
   * is copied stays the diff text.
   */
  renderAfterLine?: (line: DiffLineInfo) => ReactNode
}
