import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {visuallyHidden as hidden} from '../../styles/visually-hidden.css'

export type LiveRegionPoliteness = 'polite' | 'assertive'

interface LiveRegionProps {
  /**
   * What to announce. Change it to announce; leave it empty when there is
   * nothing to say — never unmount the region to clear it.
   */
  children?: ReactNode
  /**
   * `polite` (default) waits for the screen reader to finish (`role="status"`):
   * "Copied", "3 results". `assertive` interrupts (`role="alert"`): only for
   * what the person must hear now, such as an error that blocks them.
   */
  politeness?: LiveRegionPoliteness
  /** Keeps the region off screen and in the accessibility tree. Default false. */
  visuallyHidden?: boolean
  id?: string
}

/**
 * LiveRegion — tells assistive tech about a change that has no focus move to
 * go with it ("Link copied", "Answer ready"). A screen reader only announces
 * a change to a region that was already in the page, so render it from the
 * start (empty) and change its content; a region mounted together with its
 * message is often not read at all.
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  visuallyHidden = false,
  id,
}: LiveRegionProps) {
  return (
    <html.div
      id={id}
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic={true}
      style={visuallyHidden ? [hidden.base, hidden.text] : null}
    >
      {children}
    </html.div>
  )
}
