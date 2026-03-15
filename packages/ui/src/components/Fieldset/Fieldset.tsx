import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type FieldsetGap = 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl'

const gapMap = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  ms: styles.gapMs,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
} as const

// --- Root ---
interface RootProps {
  /** Disables all form controls within the fieldset */
  disabled?: boolean
  /** Gap between child elements */
  gap?: FieldsetGap
  children: ReactNode
}

function Root({disabled = false, gap = 'md', children}: RootProps) {
  return (
    <html.div
      role="group"
      aria-disabled={disabled || undefined}
      style={[styles.root, gapMap[gap], disabled && styles.disabled]}
    >
      {children}
    </html.div>
  )
}

// --- Legend ---
interface LegendProps {
  children: ReactNode
}

function Legend({children}: LegendProps) {
  return <html.span style={styles.legend}>{children}</html.span>
}

export const Fieldset = {
  Root,
  Legend,
}
