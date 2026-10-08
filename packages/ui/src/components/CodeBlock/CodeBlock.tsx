import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {Button} from '../Button/Button'
import {LiveRegion} from '../LiveRegion/LiveRegion'
import {typePresets} from '@duro-app/tokens/tokens/type-presets.css'
import {styles} from './styles.css'

interface CodeBlockProps {
  /**
   * The code: text, or the `<code>` element a Markdown renderer produced
   * (highlighted spans included). What is copied is its text content.
   */
  children: ReactNode
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

/**
 * CodeBlock — a block of code with a copy button: a `pre` that scrolls
 * sideways when a line is long (and is then focusable, so a keyboard can
 * scroll it), and a Button that copies its text and
 * confirms ("Copied") on the button and through a polite LiveRegion. Inside
 * `Prose`, pass it as the Markdown renderer's `pre`.
 */
export function CodeBlock({
  children,
  copyLabel,
  copiedLabel,
  copiedDuration = 2000,
  onCopyError,
}: CodeBlockProps) {
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
      await navigator.clipboard.writeText(preRef.current?.textContent ?? '')
    } catch (error) {
      onCopyError?.(error)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setCopied(true)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setCopied(false)
    }, copiedDuration)
  }, [copiedDuration, onCopyError])

  return (
    <html.div style={styles.root}>
      <html.pre
        ref={preRef}
        tabIndex={scrollable ? 0 : undefined}
        style={[typePresets.code, styles.pre]}
      >
        {children}
      </html.pre>
      <html.div style={styles.copy}>
        <Button variant="secondary" size="small" onClick={() => void copy()}>
          {copied ? copiedLabel : copyLabel}
        </Button>
      </html.div>
      <LiveRegion visuallyHidden>{copied ? copiedLabel : ''}</LiveRegion>
    </html.div>
  )
}
