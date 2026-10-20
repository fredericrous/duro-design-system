import {useCallback, useEffect, useRef, useState} from 'react'
import {html} from 'react-strict-dom'
import {Button} from '../Button/Button'
import {LiveRegion} from '../LiveRegion/LiveRegion'
import {typePresets} from '@duro-app/tokens/tokens/type-presets.css'
import {styles} from './styles.css'
import type {CodeBlockProps} from './types'
import {DiffLines} from './DiffLines'
import {DiffRows} from './DiffRows'
import {textOf} from './diffRoles'

export type {CodeBlockProps} from './types'

/**
 * CodeBlock — a block of code with a copy button: a `pre` that scrolls
 * sideways when a line is long (and is then focusable, so a keyboard can
 * scroll it), and a Button that copies its text and
 * confirms ("Copied") on the button and through a polite LiveRegion. Inside
 * `Prose`, pass it as the Markdown renderer's `pre`.
 */
export function CodeBlock({
  children,
  language,
  copyLabel,
  copiedLabel,
  copiedDuration = 2000,
  onCopyError,
  lineAction,
  renderAfterLine,
}: CodeBlockProps) {
  // Lines that carry an action or content under them are rows, not text in a pre.
  const asRows = language === 'diff' && (lineAction !== undefined || renderAfterLine !== undefined)
  const preRef = useRef<HTMLPreElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [copied, setCopied] = useState(false)
  // A block that scrolls sideways joins the tab order, so a keyboard can
  // scroll it too; one that fits stays out of it.
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const pre = preRef.current
    if (!pre || typeof ResizeObserver === 'undefined') return
    const measure = () => setScrollable(pre.scrollWidth > pre.clientWidth)
    const observer = new ResizeObserver(measure)
    observer.observe(pre)
    measure()
    return () => observer.disconnect()
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const copy = useCallback(async () => {
    try {
      // Rows hold buttons and comments: what is copied is still the diff text.
      await navigator.clipboard.writeText(
        asRows ? textOf(children) : (preRef.current?.textContent ?? ''),
      )
    } catch (error) {
      // Never dropped: without a handler the failure still reaches the console.
      if (onCopyError) onCopyError(error)
      else console.error('CodeBlock: copying to the clipboard failed', error)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setCopied(true)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setCopied(false)
    }, copiedDuration)
  }, [asRows, children, copiedDuration, onCopyError])

  return (
    <html.div style={styles.root}>
      <html.div style={styles.bar}>
        <Button variant="secondary" size="small" onClick={() => void copy()}>
          {copied ? copiedLabel : copyLabel}
        </Button>
      </html.div>
      {asRows ? (
        <html.div data-language={language} style={[typePresets.code, styles.rows]}>
          <DiffRows
            text={textOf(children)}
            lineAction={lineAction}
            renderAfterLine={renderAfterLine}
          />
        </html.div>
      ) : (
        <html.pre
          ref={preRef}
          tabIndex={scrollable ? 0 : undefined}
          data-language={language}
          style={[typePresets.code, styles.pre]}
        >
          {language === 'diff' ? <DiffLines text={textOf(children)} /> : children}
        </html.pre>
      )}
      <LiveRegion visuallyHidden>{copied ? copiedLabel : ''}</LiveRegion>
    </html.div>
  )
}
