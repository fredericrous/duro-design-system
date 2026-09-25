import {type ReactNode, Children, createContext, isValidElement, useContext, useId} from 'react'
import {html} from 'react-strict-dom'
import type {SpacingToken} from '@duro-app/tokens/keys'
import {styles} from './styles.css'

export type FieldsetGap = Exclude<SpacingToken, 'xxl' | 'xxxl'>

const gapMap = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  ms: styles.gapMs,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
} as const satisfies Record<FieldsetGap, unknown>

// --- Root ---
interface RootProps {
  /** Disables all form controls within the fieldset */
  disabled?: boolean
  /** Gap between child elements */
  gap?: FieldsetGap
  children: ReactNode
}

// the Legend's id, so the group can name itself after it
const LegendIdContext = createContext<string | undefined>(undefined)

function Root({disabled = false, gap = 'md', children}: RootProps) {
  const legendId = useId()
  let hasLegend = false
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Legend) hasLegend = true
  })
  return (
    <LegendIdContext.Provider value={legendId}>
      <html.div
        role="group"
        aria-labelledby={hasLegend ? legendId : undefined}
        aria-disabled={disabled || undefined}
        style={[styles.root, gapMap[gap], disabled && styles.disabled]}
      >
        {children}
      </html.div>
    </LegendIdContext.Provider>
  )
}

// --- Legend ---
interface LegendProps {
  children: ReactNode
}

/** Names the group: the Root points `aria-labelledby` at it. */
function Legend({children}: LegendProps) {
  const id = useContext(LegendIdContext)
  return (
    <html.span id={id} style={styles.legend}>
      {children}
    </html.span>
  )
}

export const Fieldset = {
  Root,
  Legend,
}
