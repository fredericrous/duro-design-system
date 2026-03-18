import type {ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import {useOverlayContainer} from '../ThemeProvider/ThemeProvider'
import {styles} from './styles.css'

export interface ActionBarProps {
  /** Number of selected items, or 'all'. Hidden when 0. */
  selectedItemCount: number | 'all'
  /** Label for the selection count. Receives the count string. */
  selectedLabel?: (count: string) => string
  /** Whether to use emphasized (accent) styling. */
  isEmphasized?: boolean
  /** Called when the clear/close button is pressed. */
  onClearSelection: () => void
  /** Action buttons to display. */
  children: ReactNode
}

function ActionBarInner({
  selectedItemCount,
  selectedLabel,
  isEmphasized = false,
  onClearSelection,
  children,
}: ActionBarProps) {
  const container = useOverlayContainer()

  if (selectedItemCount === 0) return null

  const countStr = selectedItemCount === 'all' ? 'All' : `${selectedItemCount}`
  const label = selectedLabel
    ? selectedLabel(countStr)
    : `${countStr} selected`

  const bar = (
    <html.div
      role="toolbar"
      aria-label={label}
      style={[styles.overlay, isEmphasized && styles.overlayEmphasized]}
    >
      <html.span
        style={[
          styles.selectedCount,
          isEmphasized && styles.selectedCountEmphasized,
        ]}
      >
        {label}
      </html.span>
      <html.div
        style={[
          styles.separator,
          isEmphasized && styles.separatorEmphasized,
        ]}
      />
      <html.div style={styles.actions}>{children}</html.div>
      <html.button
        type="button"
        aria-label="Clear selection"
        onClick={onClearSelection}
        style={[
          styles.closeButton,
          isEmphasized && styles.closeButtonEmphasized,
        ]}
      >
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      </html.button>
    </html.div>
  )

  if (container) {
    return createPortal(bar, container)
  }

  return bar
}

export const ActionBar = ActionBarInner
