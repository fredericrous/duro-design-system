import {type ReactNode, useCallback, useMemo} from 'react'
import {html} from 'react-strict-dom'
import type {SpacingToken} from '@duro-app/tokens/keys'
import {useOrderedRegistry} from '../../shared/useOrderedRegistry'
import {ButtonGroupContext, type ButtonGroupContextValue} from './ButtonGroupContext'
import {styles} from './styles.css'

export type ButtonGroupGap = Extract<SpacingToken, 'xs' | 'sm' | 'md'>

export interface ButtonGroupProps {
  children: ReactNode
  /** Layout direction. Default: 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Alignment within container. Default: 'start' */
  align?: 'start' | 'end' | 'center'
  /** Disable all buttons in group */
  disabled?: boolean
  /** Gap between buttons. Default: 'sm' (ignored when `attached`) */
  gap?: ButtonGroupGap
  /**
   * One joined control: no gap, shared borders, square inner corners. Holds
   * Buttons, Toggles and the Select, Menu and Popover triggers, in any mix.
   */
  attached?: boolean
  /** Names the group for assistive tech (a toolbar segment: "Text style"). */
  'aria-label'?: string
}

const gapMap = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
} as const satisfies Record<ButtonGroupGap, unknown>

const horizontalAlignMap = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
} as const

const verticalAlignMap = {
  start: styles.verticalAlignStart,
  center: styles.verticalAlignCenter,
  end: styles.verticalAlignEnd,
} as const

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  align = 'start',
  disabled = false,
  gap = 'sm',
  attached = false,
  'aria-label': ariaLabel,
}: ButtonGroupProps) {
  const isVertical = orientation === 'vertical'
  const alignStyle = isVertical ? verticalAlignMap[align] : horizontalAlignMap[align]
  const {order, register} = useOrderedRegistry()

  const positionOf = useCallback<ButtonGroupContextValue['positionOf']>(
    (id) => {
      const i = order.findIndex((entry) => entry.id === id)
      if (i < 0) return 'middle'
      if (order.length === 1) return 'only'
      if (i === 0) return 'first'
      return i === order.length - 1 ? 'last' : 'middle'
    },
    [order],
  )
  const ctx = useMemo<ButtonGroupContextValue>(
    () => ({orientation, register, positionOf}),
    [orientation, register, positionOf],
  )

  return (
    // A non-attached group still resets the context, so a plain group nested
    // in an attached one lays out on its own.
    <ButtonGroupContext.Provider value={attached ? ctx : null}>
      <html.div
        role="group"
        aria-label={ariaLabel}
        style={[
          styles.base,
          isVertical ? styles.vertical : styles.horizontal,
          alignStyle,
          attached ? (isVertical ? styles.attachedVertical : styles.attached) : gapMap[gap],
          disabled && styles.disabled,
        ]}
      >
        {children}
      </html.div>
    </ButtonGroupContext.Provider>
  )
}
