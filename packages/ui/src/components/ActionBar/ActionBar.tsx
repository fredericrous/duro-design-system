import {useEffect, useCallback, type ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {useActionBarStack} from './ActionBarProvider'
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
  /** Whether the bar can be dismissed. When false, the close button is hidden. @default true */
  dismissible?: boolean
  /** Action buttons to display. */
  children: ReactNode
}

function ActionBarContent({
  selectedItemCount,
  selectedLabel,
  isEmphasized = false,
  onClearSelection,
  dismissible = true,
  children,
}: ActionBarProps) {
  const countStr = selectedItemCount === 'all' ? 'All' : `${selectedItemCount}`
  const label = selectedLabel ? selectedLabel(countStr) : `${countStr} selected`

  return (
    <html.div
      role="toolbar"
      aria-label={label}
      style={[styles.overlay, isEmphasized && styles.overlayEmphasized]}
    >
      <html.span style={[styles.selectedCount, isEmphasized && styles.selectedCountEmphasized]}>
        {label}
      </html.span>
      <html.div style={[styles.separator, isEmphasized && styles.separatorEmphasized]} />
      <html.div style={styles.actions}>{children}</html.div>
      {dismissible && (
        <html.button
          type="button"
          aria-label="Clear selection"
          onClick={onClearSelection}
          style={[styles.closeButton, isEmphasized && styles.closeButtonEmphasized]}
        >
          <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M1 1l8 8M9 1l-8 8"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </svg>
        </html.button>
      )}
    </html.div>
  )
}

function ActionBarInner(props: ActionBarProps) {
  const {selectedItemCount} = props
  const stack = useActionBarStack()
  const isActive = selectedItemCount !== 0

  const renderBar = useCallback(() => <ActionBarContent {...props} />, [props])

  useEffect(() => {
    if (!stack.managed) return
    if (isActive) {
      stack.register(renderBar)
    } else {
      stack.unregister()
    }
    return () => stack.unregister()
  }, [stack, isActive, renderBar])

  // If no provider, fall back to standalone rendering
  if (!stack.managed) {
    if (!isActive) return null
    return <ActionBarContent {...props} />
  }

  // Managed by provider — rendering happens there
  return null
}

export const ActionBar = ActionBarInner
