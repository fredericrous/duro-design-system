import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type PageShellMaxWidth = 'sm' | 'md' | 'lg' | 'full'
export type PageShellPadding = 'sm' | 'md' | 'lg'

interface PageShellProps {
  /** Max-width preset: sm (600), md (800), lg (1200), full (none). Default: 'lg' */
  maxWidth?: PageShellMaxWidth
  /** Horizontal padding preset. Default: 'md' (24px) */
  padding?: PageShellPadding
  /** Header element rendered above the main content with same constraints */
  header?: ReactNode
  children: ReactNode
}

const maxWidthMap = {
  sm: styles.maxSm,
  md: styles.maxMd,
  lg: styles.maxLg,
  full: null,
} as const

const paddingMap = {
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
} as const

export function PageShell({maxWidth = 'lg', padding = 'md', header, children}: PageShellProps) {
  const mw = maxWidthMap[maxWidth]
  const pad = paddingMap[padding]

  return (
    <html.div style={styles.root}>
      {header != null && (
        <html.header style={[styles.container, styles.maxLg, pad, styles.headerPadding]}>
          {header}
        </html.header>
      )}
      <html.main style={[styles.container, mw, pad, styles.mainPadding]}>{children}</html.main>
    </html.div>
  )
}
