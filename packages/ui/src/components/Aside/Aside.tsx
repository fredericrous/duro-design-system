import type {ReactNode, Ref} from 'react'
import {html} from 'react-strict-dom'
import type {SpacingToken} from '@duro-app/tokens/keys'
import {styles} from './styles.css'

interface AsideProps {
  /** Names the landmark ("Page outline"); required, from your text catalog. */
  'aria-label': string
  /**
   * The gap kept above the aside while it is stuck, and below it when it is
   * taller than the viewport. Default `lg`.
   */
  offset?: SpacingToken
  /** The `aside` element. */
  ref?: Ref<HTMLElement>
  children: ReactNode
}

const offsetMap = {
  xs: styles.offsetXs,
  sm: styles.offsetSm,
  ms: styles.offsetMs,
  md: styles.offsetMd,
  lg: styles.offsetLg,
  xl: styles.offsetXl,
  xxl: styles.offsetXxl,
  xxxl: styles.offsetXxxl,
} as const satisfies Record<SpacingToken, unknown>

/**
 * Aside — content beside the main reading column (a table of contents,
 * related pages): a labelled `aside` landmark that sticks within the viewport
 * while the page scrolls and scrolls on its own when it is taller than the
 * viewport. Put it in the second track of `Grid layout="content-aside"`.
 */
export function Aside({'aria-label': ariaLabel, offset = 'lg', ref, children}: AsideProps) {
  return (
    <html.aside ref={ref} aria-label={ariaLabel} style={[styles.root, offsetMap[offset]]}>
      {children}
    </html.aside>
  )
}
