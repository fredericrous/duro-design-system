import type {ReactNode} from 'react'

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
}
